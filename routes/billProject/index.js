const express = require('express');

// 모델 import
const { User, UserAuth, BillProject } = require('../../models');

// 커스텀 미들웨어
const { exUser, verifyToken } = require('../middlewares/main'); 
const { response } = require('../middlewares/response');
const { checkBillAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 계산서 목록
router.get('/', async (req, res, next) => { 
    try {
        const { user_id } = req.body; 
        if (!user_id) { response(res, 400, "로그인 필요"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) { 
            response(res, 404, "유저 없음");
            return;
        }
        
        const billProjects = await BillProject.findAll({ 
            where: { user_id: user_id, }, 
            attributes: ['id', 'name', 'createdAt', 'voltType', 'loadSimplyCE', 'outputCE', 'elecConvertVal', 'user_id'], 
        });
        
        let payLoad = { billProjects };
        response(res, 200, '계산서 프로젝트 목록', payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }   
});

// 계산서 프로젝트 생성
router.post('/create', async (req, res, next) => {
    try {
        const { name, voltType, user_id } = req.body;
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!name || !voltType || (name=="")) { response(res, 400, "입력값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) { 
            response(res, 404, "유저 없음");
            return;
        }
        
        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 계산서 권한 체크
        if (!(await checkBillAuth(user))) {
            response(res, 400, "권한 없음");
            return;
        }
        
        const billProject = await BillProject.create({ name, voltType });   
        await user.addBillProject(billProject);
        
        // 유저 권한 업데이트
        const userBillProjectAuth = user.UserAuth.billProject - 1;
        await UserAuth.update(
            { billProject: userBillProjectAuth },
            { where: { user_id: user.id } },
        );        
        
        let payLoad = { billProejct_id: billProject.id, billProjectName: billProject.name, voltType: billProject.voltType };
        response(res, 201, '계산서 프로젝트 생성', payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 계산서 수정페이지로 이동
router.get('/:billProject_id/edit', async (req, res, next) => {
    try {
        const { user_id } = req.query; // query로 변경할 것 
        const { billProject_id } = req.params;

        if (!user_id) { response(res, 400, '로그인 필요'); return; }
        if (!billProject_id) { response(res, 400, '계산서 없음'); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ where: { id: user_id } });

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: billProject_id, user_id: user.id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }

        // 권한 체크
        if (billProject.user_id == user_id) {
            let payLoad = { billProject };
            response(res, 200, '계산서 수정 페이지', payLoad);
        } else {
            response(res, 401, '권한 없음');
        }

    } catch (err) {
        console.log(err);
        response(res, 500, '서버 에러');
    }
});
module.exports = router;