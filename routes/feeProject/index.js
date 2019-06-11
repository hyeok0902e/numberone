const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { feeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 프로젝트 목록
router.get('/', verifyToken, async (req, res, next) => {
    try {
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        const feeProjects = await FeeProject.findAll({ 
            where: { user_id: user.id },
            include: [{ model: Company, attributes: ['name'] }],
        });

        if (feeProjects.length == 0) { response(res, 404, "목록이 존재하지 않습니다."); return; }

        let payLoad = { feeProjects };
        response(res, 200, "프로젝트 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수수료 프로젝트 생성 페이지
router.get('/create', verifyToken, async (req, res, next) => {
    try {
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

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
        if (!companies) { response(res, 404, "목록이 존재하지 않습니다."); return; }

        let payLoad = { companies };
        response(res, 200, "업체 목록", payLoad); 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수수료 프로젝트 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { name, company_id } = req.body;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 입력갑 체크
        if (!company_id || !name) { response(res, 400, "값을 입력해 주세요."); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 수수료계산 권한 체크
        if (!(await feeAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        const feeProject = await FeeProject.create({ name });
        await company.addFeeProject(feeProject);
        await user.addFeeProject(feeProject);

        let payLoad = { feeProject };
        response(res, 201, "수수료 프로젝트가 생성되었습니다.", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;