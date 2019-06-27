const express = require('express');

// 모델 import
const { 
    User, UserAuth, FeeProject, Company,
    KepcoFee, PreUsage, PeriodUsage, PreChange, SafeManage,
} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 프로젝트 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        const feeProjects = await FeeProject.findAll({ 
            where: { user_id: user.id },
            attributes: ['id', 'name'],
            include: [
                { 
                    model: Company, 
                    attributes: ['id', 'name'] 
                }
            ],
        });
        let payLoad = { feeProjects };
        response(res, 200, "프로젝트 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 프로젝트 생성 페이지
router.get('/create', verifyToken, verifyFeeAuth, verifyDuplicateLogin, async (req, res, next) => {
    try {
 
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        // 업체 목록 불러오기
        const companies = await Company.findAll({ 
            where: { user_id: user.id }, 
            attributes: ['id', 'name'] 
        });
        if (!companies) { response(res, 404, "업체목록이 존재하지 않습니다."); return; }

        let payLoad = { companies };
        response(res, 200, "업체 목록", payLoad); 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 프로젝트 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { feeProject } = req.body;

        // 데이터 체크
        if (!feeProject) { response(res, 400, "데이터 없음"); return; }
    
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        const company = await Company.findOne({ where: { id: feeProject.company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        let resFeeProject = await FeeProject.create({ name: feeProject.name });
        await company.addFeeProject(resFeeProject);
        await user.addFeeProject(resFeeProject);

        resFeeProject = await FeeProject.findOne({ 
            where: { id: resFeeProject.id },
            attributes: ['id', 'name'],
            include: [
                {
                    model: Company,
                    where: { id: company.id },
                    attributes: ['id', 'name']
                }
            ]
        });

        // 유저권한 업데이트
        const userAuth = await UserAuth.findOne({ where: { user_id: user.id } });
        let count = 0;
        if (userAuth.feeProject > 0) {
            count = userAuth.feeProject - 1;
        } else {
            count = 0;
        }
        await UserAuth.update(
            { feeProject: count },
            { where: { user_id: user.id } }
        );

        let payLoad = { feeProject: resFeeProject };
        response(res, 201, "수수료 프로젝트가 생성되었습니다.", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:feeProject_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { feeProject_id } = req.params;
        if (!feeProject_id) { response(res, 400, "params값 없음"); return; }

        const feeProject = await FeeProject.findOne({ 
            where: { id: feeProject_id },
            attributes: ['id', 'name', 'company_id'],
            include: [
                {
                    model: KepcoFee,
                    attributes: ['id', 'totalCost']
                },
                {
                    model: PreUsage,
                    attributes: ['id', 'totalCost']
                },
                {
                    model: PeriodUsage,
                    attributes: ['id', 'totalCost']
                },
                {
                    model: PreChange,
                    attributes: ['id', 'totalCost']
                },
                {
                    model: SafeManage,
                    attributes: ['id', 'fee']
                }
            ] 
        });
        if (!feeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

        // 업체 목록 불러오기
        const comp = await Company.findOne({ where: { id: feeProject.company_id } });
        if (!comp) { response(res, 404, "업체정보가 존재하지 않습니다."); return; }

        let payLoad = { feeProject, company: comp };

        response(res, 200, "상세 페이지 정보 - 업체정보", payLoad); 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 이름 수정 페이지
router.get('/:feeProject_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { feeProject_id } = req.params;
        if (!feeProject_id) { response(res, 400, "params값 없음"); return; }

        const feeProject = await FeeProject.findOne({ 
            where: { id: feeProject_id },
            attributes: ['id', 'name'],
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                }
            ]
        });
        if (!feeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

        let payLoad = { feeProject }
        response(res, 200, "프로젝트 수정 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 이름 수정
router.put('/:feeProject_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {   
        const { name } = req.body;
        const { feeProject_id } = req.params
        if (!name || !feeProject_id) { response(res, 400, "params값 없음"); return; }

        let resFeeProject = await FeeProject.findOne({ where: { id: feeProject_id } });
        if (!resFeeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

        await FeeProject.update(
            { name },
            { where: { id: feeProject_id } }
        )

        resFeeProject = await FeeProject.findOne({ 
            where: { id: resFeeProject.id },
            attributes: ['id', 'name'],
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name'],
                }
            ]
        });

        let payLoad = { feeProject: resFeeProject };
        response(res, 200, "프로젝트 수정 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { feeProject_ids } = req.body;
        //데이터 체크
        if (!feeProject_ids) { response(res, 400, "데이터 없음"); }

        await asyncForEach(feeProject_ids, async (id) => {
            await FeeProject.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;