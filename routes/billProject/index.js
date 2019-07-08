const express = require('express');

// 모델 import
const { User, UserAuth, BillProject } = require('../../models');

// 커스텀 미들웨어
const { exUser, verifyToken, verifyUid } = require('../middlewares/main'); 
const { response } = require('../middlewares/response');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 계산서 목록
router.get('/', verifyToken, async (req, res, next) => { 
    try {
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { 
            response(res, 404, "유저가 존재하지 않습니다.");
            return;
        }
        
        const user = await User.findOne({ where: { id: req.decoded.user_id }});

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        const billProjects = await BillProject.findAll({ 
            where: { user_id: user.id, }, 
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
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { name, voltType } = req.body;
        
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 입력값 체크
        if (!name || (name=="")) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "유저가 존재하지 않습니다."); return; }
        
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 400, "권한 없음"); return; }
        
        const billProject = await BillProject.create({ name, voltType });   
        await user.addBillProject(billProject);
        
        // 유저 권한 업데이트
        const userBillProjectAuth = user.UserAuth.billProject - 1;
        await UserAuth.update(
            { billProject: userBillProjectAuth },
            { where: { user_id: user.id } },
        );        
        
        let payLoad = { billProject };
        response(res, 201, '계산서 프로젝트가 생성되었습니다.', payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;