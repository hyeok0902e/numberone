const express = require('express');

// 모델 import
const { User, Company, SafeManageFee, UserAuth, Address } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyDuplicateLogin } = require('../middlewares/main');
const { compAuth, verifyCompAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 업체 목록 - 권한 체크 X
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        // 업체 목록 가져오기
        const companies = await Company.findAll({
            where: { user_id: user.id },
            attributes: ['name'],
            // 기획서상 업체목록에서 용량 => 수전, 발전, 태양광 용량의 합 => Front에서 처리
            include: [{ model: SafeManageFee, attributes: ['passiveKw', 'generatekw', 'sunKw'] }],
        });
        // 업체목록 존재여부 체크
        if (!companies) { response(res, 404, "목록이 존재하지 않습니다."); return; }

        let payLoad = { companies };
        response(res, 200, "업체 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 상세보기
router.get('/:company_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.params;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // params값 체크
        if (!company_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });
        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        // 권한 체크
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
router.post('/create', verifyToken, verifyDuplicateLogin, verifyCompAuth, async (req, res, next) => {
    try {
        const { newCompany } = req.body; 

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 입력값 체크
        if (!newCompany || (!newCompany.info || (newCompany.info == [])) ) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        // 업체 생성
        let company = await Company.create({ 
            name: newCompany.info.name, key: newCompany.info.key, mobile: newCompany.info.mobile, 
            tel: newCompany.info.tel, fax: newCompany.info.fax, email: newCompany.info.email, 
            memo: newCompany.info.memo, 
        });
        await user.addCompany(company);
        // SafeManageFee 생성 - Company와 1:1 관계
        let smf = newCompany.safeManageFee
        const safeManageFee = await SafeManageFee.create({
            businessType: smf.businessType, voltType: smf.voltType, 
            passiveKw: smf.passiveKw, generateKw: smf.generateKw, sunKw: smf.sunKw, 
            sum: smf.sum, fee: smf.fee, weight: smf.weight, checking: smf.checking,
        })
        await company.setSafeManageFee(safeManageFee); // 1:1 관계 시 set 사용

        // 주소 생성
        let addr = newCompany.address
        const address = await Address.create({ 
            jibunAddr: addr.jibunAddr, 
            roadFullAddr: addr.roadFullAddr, roadAddrPart1: addr.roadAddrPart1, roadAddrPart2: addr.roadAddrPart2, 
            engAddr: addr.engAddr, zipNo: addr.zipNo, siNm: addr.siNm, sggNm: addr.sggNm, 
            emdNm: addr.emdNm, liNm: addr.liNm, rn: addr.rn, 
            lnbrMnnm: addr.lnbrMnnm, lnbrSlno: addr.lnbrSlno, detail: addr.detail,
        })
        await company.setAddress(address);

        // 유저 권한 업데이트
        const compManage = user.UserAuth.compManage - 1;
        await UserAuth.update(
            { compManage },
            { where: { user_id: user.id } },
        );    

        let resCompany = await Company.findOne({ 
            where: { id: company.id },
            include: [
                { model: Address },
                { model: SafeManageFee }
            ]
         })
        let payLoad = { company: resCompany };
        response(res, 201, "등록을 완료하였습니다.", payLoad); 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 편집 페이지 이동
router.get('/:company_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.params;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // params값 체크
        if (!company_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        if (company.user_id != user.id) { response(res, 401, "서버 에러"); return; }
        
        let resCompany = await Company.findOne({ 
            where: { id: company_id },
            include: [
                { model: Address },
                { model: SafeManageFee }
            ]
         });
        let payLoad = { company: resCompany };

        response(res, 200, "업체 수정 페이지", payLoad);
      
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 편집 
router.put('/:company_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { reCompany } = req.body; 
        const { company_id } = req.params;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 입력값 존재여부 체크
        if (!reCompany) { response(res, 400, "입력값 없음"); return; }
        // params값 체크
        if (!company_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });   
        // 업체 존재여부 체크
        let company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체가 존재 하지 않습니다."); return; }
        // 권한 체크
        if (company.user_id != user.id) { response(res, 401, "권한 없음"); return; }
        
        let info = reCompany.info;
        // 업체정보 업데이트
        await Company.update(
            { name: info.name, key: info.key, mobile: info.mobile, tel:info.tel, fax: info.fax, email: info.email, memo: info.memo },
            { where: { id: company.id} }
        );
        company = await Company.findOne({ where: { id: company_id }});

        let smf = reCompany.safeManageFee
        await SafeManageFee.update(
            { 
                businessType: smf.businessType, voltType: smf.voltType, 
                passiveKw: smf.passiveKw, generateKw: smf.generateKw, sunKw: smf.sunKw, 
                sum: smf.sum, fee: smf.fee, weight: smf.weight, checking: smf.checking, 
            },
            { where: { company_id } }
        );

        let addr = reCompany.address
        // 주소 업데이트
        await Address.update(
            { 
                jibunAddr: addr.jibunAddr, 
                roadFullAddr: addr.roadFullAddr, roadAddrPart1: addr.roadAddrPart1, roadAddrPart2: addr.roadAddrPart2, 
                engAddr: addr.engAddr, 
                zipNo: addr.zipNo, siNm: addr.siNm, sggNm: addr.sggNm, emdNm: addr.emdNm, 
                liNm: addr.liNm, rn: addr.rn, lnbrMnnm: addr.lnbrMnnm, lnbrSlno: addr.lnbrSlno, detail: addr.detail,
            }, 
            { where: { company_id } }
        );
        let resCompany = await Company.findOne({ 
            where: { id: company_id },
            include: [
                { model: Address },
                { model: SafeManageFee }
            ]
         });
        let payLoad = { company: resCompany };
        response(res, 200, "수정을 완료하였습니다.", payLoad);
    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 업체 삭제
router.delete('/:company_id/delete', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.params;
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // params값 체크
        if (!company_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });
        // 업체 등록 권한 체크
        if (!(await compAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 업체 존재여부 체크
        let company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

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
router.get('/:company_id/memo', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {

        const { company_id } = req.params;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }

        // params값 체크
        if (!company_id) { response(res, 400, "params값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        const user = await User.findOne({ where: { id: req.decoded.user_id } });


        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

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

// 메모 편집
router.put('/:company_id/memo', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { memo } = req.query;
        const { company_id } = req.params;

        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        // 입력값 체크
        if (!memo) { memo = ""; }
        // params값 체크
        if (!company_id) { response(res, 400, "params값 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id }});
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 권한 체크
        if (company.user_id == user.id) {
            await Company.update({ memo }, { where: { id: company_id } });

            let payLoad = { memo, company_id };
            response(res, 200, "수정을 완료하였습니다.", payLoad);
        } else {
            response(res, 401, '권한 없음');
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;