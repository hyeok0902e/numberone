const express = require('express');

// 모델 import
const { User, Company, SafeManageFee, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken } = require('../middlewares/main');
const { compAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 업체 목록 - 권한 체크 X
router.get('/', async (req, res, next) => {
    try {
        const { user_id } = req.query; 

        // 로그인 여부 체크
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

        // 업체 목록 가져오기
        const companies = await Company.findAll({
            where: { user_id: user.id },
            attributes: ['name'],
            // 기획서상 업체목록에서 용량 => 수전, 발전, 태양광 용량의 합 => Front에서 처리
            include: [{ model: SafeManageFee, attributes: ['passiveKw', 'generatekw', 'sunKw'] }],
        });

        // 업체목록 존재여부 체크
        if (!companies) { response(res, 404, "업체 목록 없음"); return; }
        
        let payLoad = { companies };
        response(res, 200, "업체 목록", payLoad);


    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 상세보기
router.get('/:company_id/show', async (req, res, next) => {
    try {
        const { user_id } = req.body; 
        const { company_id } = req.params;

        // 로그인 여부 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!company_id) { response(res, 400, "params값 없음"); return; }

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

        if (company.user_id == user.id) {
            const safeManageFee = await SafeManageFee.findOne({ where: { company_id } });
            let payLoad = { company, safeManageFee };
            response(res, 200, "업체 상세 정보", payLoad);
        } else {
            response(res, "401", "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 등록
router.post('/create', async (req, res, next) => {
    try {
        const { user_id, name, key, mobile, tel, fax, email, memo,
            businessType, voltType, passiveKw, generateKw, sunKw, 
            sum, fee, weight, checking } = req.body; 

        // 로그인 여부 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }

        // 입력값 체크
        if (!name || !key || !businessType || !voltType ) { 
            response(res, 400, "입력값 없음"); 
            return; 
        }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 업체 등록 권한 체크
        if (!(await compAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        let company = await Company.create({ name, key, mobile, tel, fax, email, memo });
        await user.addCompany(company);

        // SafeManageFee 모델 생성 - 유저와 1:1 관계
        const safeManageFee = await SafeManageFee.create({
            businessType, voltType, passiveKw, generateKw, sunKw, 
            sum, fee, weight, checking
        })
        await company.setSafeManageFee(safeManageFee);

        // 유저 권한 업데이트
        const compManage = user.UserAuth.compManage - 1;
        await UserAuth.update(
            { compManage },
            { where: { user_id: user.id } },
        );    

        let payLoad = { company, safeManageFee };
        response(res, 201, "업체 등록 완료", payLoad); 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 편집 페이지 이동
router.get('/:company_id/edit', async (req, res, next) => {
    try {
        const { user_id } = req.query;
        const { company_id } = req.params;

        // 로그인 체크
        if (!user_id) { response(res, 400, '로그인 필요'); return; }
        if (!company_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ where: { id: user_id } });

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체 없음"); return; }

        if (company.user_id == user.id) {
            const safeManageFee = await SafeManageFee.findOne({ where: { company_id: company.id } });
            let payLoad = { company, safeManageFee };

            response(res, 200, "업체 수정 페이지", payLoad);
        } else {
            response(res, 401, '권한 없음');
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 편집 
router.put('/:company_id/edit', async (req, res, next) => {
    try {
        const { user_id, name, key, mobile, tel, fax, email, memo,
            businessType, voltType, passiveKw, generateKw, sunKw, 
            sum, fee, weight, checking } = req.body; 
        const { company_id } = req.params;

        // 로그인 여부 체크
        if (!user_id) { response(res, 400, '로그인 필요'); return; }

        // 입력값 존재여부 체크
        if (!name || !key || !businessType || !voltType ) { 
            response(res, 400, "입력값 없음"); 
            return; 
        }
        if (!company_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ where: { id: user_id } });

        // 업체 존재여부 체크
        let company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체 없음"); return; }

        // 권한 체크
        if (company.user_id == user.id) {
            // 업체정보 업데이트
            await Company.update(
                { name, key, mobile, tel, fax, email, memo },
                { where: { id: company.id} }
            );
            company = await Company.findOne({ where: { id: company_id }});

            await SafeManageFee.update(
                { businessType, voltType, passiveKw, generateKw, sunKw, sum, fee, weight, checking },
                { where: { company_id } }
            );
            const safeManageFee = await SafeManageFee.findOne({ where: { company_id } });
            
            let payLoad = { company, safeManageFee };
            response(res, 200, "업체 수정 페이지", payLoad);
        } else {
            response(res, 401, '권한 없음');
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 삭제
router.delete('/:company_id/delete', async (req, res, next) => {
    try {
        const { user_id } = req.body;
        const { company_id } = req.params;

        // 로그인 체크
        if (!user_id) { response(res, 400, '로그인 필요'); return; }
        if (!company_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 업체 등록 권한 체크
        if (!(await compAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        // 업체 존재여부 체크
        let company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체 없음"); return; }

        // 권한 체크
        if (company.user_id == user.id) {
            await company.destroy();
            response(res, 200, "삭제 완료");
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 메모 편집 페이지 이동
router.get('/:company_id/memo', async (req, res, next) => {
    try {
        const { user_id } = req.query;
        const { company_id } = req.params;

        // 로그인 체크
        if (!user_id) { response(res, 400, '로그인 필요'); return; }
        if (!company_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ where: { id: user_id } });

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체 없음"); return; }

        // 권한 체크
        if (company.user_id == user.id) {
            let payLoad = { memo: company.memo, company_id };
            response(res, 200, "메모 편집 페이지", payLoad);
        } else {
            response(res, 401, '권한 없음');
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }    
});

router.put('/:company_id/memo', async (req, res, next) => {
    try {
        const { user_id, memo } = req.query;
        const { company_id } = req.params;

        // 로그인 체크
        if (!user_id) { response(res, 400, '로그인 필요'); return; }
        if (!memo) { memo = ""; }
        if (!company_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ where: { id: user_id } });

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체 없음"); return; }

        // 권한 체크
        if (company.user_id == user.id) {
            await Company.update({ memo }, { where: { id: company_id } });

            let payLoad = { memo, company_id };
            response(res, 200, "메모 편집 성공", payLoad);
        } else {
            response(res, 401, '권한 없음');
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;