const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { feeAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 프로젝트 목록
router.get('/', async (req, res, next) => {
    try {
        const { user_id } = req.query;
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        const feeProjects = await FeeProject.findAll({ 
            where: { user_id: user.id },
            include: [{ model: Company, attributes: ['name'] }],
        });

        if (feeProjects.length == 0) { response(res, 404, "목록 없음"); return; }

        let payLoad = { feeProjects };
        response(res, 200, "프로젝트 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수수료 프로젝트 생성 페이지
router.get('/create', async (req, res, next) => {
    try {
        const { user_id } = req.query;
  
        // 로크인 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
  
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 수수료계산 권한 체크
        if (!(await feeAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        // 업체 목록 불러오기
        const companies = await Company.findAll({ 
            where: { user_id: user.id }, 
            attributes: ['id', 'name'] 
        });
        if (!companies) { response(res, 404, "업체 목록 없음"); return; }

        let payLoad = { companies };
        response(res, 200, "업체 목록", payLoad); 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수수료 프로젝트 생성
router.post('/create', async (req, res, next) => {
    try {
        const { user_id, name, company_id } = req.body;

        // 로크인 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        // 입력갑 체크
        if (!company_id || !name) { response(res, 400, "입력값 없음"); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) { response(res, 404, "업체 없음"); return; }

        // 수수료계산 권한 체크
        if (!(await feeAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        const feeProject = await FeeProject.create({ name });
        await company.addFeeProject(feeProject);
        await user.addFeeProject(feeProject);

        let payLoad = { feeProject };
        response(res, 201, "수수 프로젝트 생성", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});




module.exports = router;