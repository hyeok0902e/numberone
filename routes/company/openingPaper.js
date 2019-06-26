const express = require('express');
const moment = require("moment");

// 모델 import
const { User, Address, UserAuth, OpeningPaper, Company } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.body;
        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        // 권한 체크
        if(company.user_id != user.id) { response(res, 401, "권한 없음"); return; }

        const openingPapers = await OpeningPaper.findAll({ 
            where: { company_id: company.id },
            attributes: ['id', 'createdAt']
        });
       
        let payLoad = { openingPapers };
        response(res, 200, "전외선 열화상 기록표 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 생성페이지
router.get('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.body;
        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        // 업체 존재여부 체크
        const company = await Company.findOne({ where: { id: company_id } });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다."); return; }
        // 권한 체크
        if (company.user_id != user.id) { response(res, 401, "권한 없음"); }

        const addr = await Address.findOne({ where: { company_id } });

        let payLoad = {
            company: {
                name: company.name,
                tel: company.tel,
                address: addr.roadFullAddr,
            },
            user: {
                company: user.company,
            }
        }
        response(res, 200, "기록표 생성 페이지", payLoad);

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id, openingPaper } = req.body;

        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        if (!openingPaper) { response(res, 400, "데이터 없음"); return; }

        // 업체 체크
        let comp = await Company.findOne({ where: { id: company_id } });
        if (!comp) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 권한체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (comp.user_id != user.id) { response(res, 401, "권한 없음"); return; }
        let addr = await Address.findOne({ where: { company_id } });

        let resOpeningPaper = await OpeningPaper.create({
            compName: comp.name, compTel: comp.tel, compAddress: addr.roadFullAddr,
            userCompName: user.company,

            // 유저 입력
            receiver: openingPaper.receiver,
            reference: openingPaper.reference,
            openingDate: openingPaper.openingDate, open: openingPaper.open, put: openingPaper.put,
            safeManager: openingPaper.safeManager, managerMobile: openingPaper.managerMobile,
            ceo: openingPaper.ceo,
        });
        await comp.addOpeningPaper(resOpeningPaper);

        let payLoad = { openingPaper: resOpeningPaper };
        response(res, 201, "기록표 생성 완료", payLoad);

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사
router.post('/:openingPaper_id/copy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { openingPaper_id } = req.params;
        // params값 없음
        if (!openingPaper_id) { response(res, 400, "params값 없음"); return; }
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        // 기록표 존재여부 체크
        let openingPaper = await OpeningPaper.findOne({ where: { id: openingPaper_id } });
        if (!openingPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        const company = await Company.findOne({ where: { id: openingPaper.company_id} });
        // 기록표 복사
        await OpeningPaper.findOne({ where: { id: openingPaper_id }, raw: true })
            .then(async data => {  
                await delete data.id // id값 제거
                const copy = await OpeningPaper.create(data); // 데이터 복사
                await company.addOpeningPaper(copy);
                let payLoad = { openingPaper: copy };
                response(res, 201, "기록표가 복사되었습니다.", payLoad);
            })
            .catch(err => { 
                response(res, 404, "기록표를 찾을 수 없습니다.");
            });
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세페이지
router.get('/:openingPaper_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { openingPaper_id } = req.params

        // params값 체크
        if (!openingPaper_id) { response(res, 400, "데이터 없음"); return; }

        // 기록표 존재여부 체크
        let openingPaper = await OpeningPaper.findOne({ 
            where: { id: openingPaper_id },
        });
        if (!openingPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { openingPaper };
        response(res, 200, "기록표 상세 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정페이지
router.get('/:openingPaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { openingPaper_id } = req.params

        // params값 체크
        if (!openingPaper_id) { response(res, 400, "데이터 없음"); return; }

        // 기록표 존재여부 체크
        let openingPaper = await OpeningPaper.findOne({ 
            where: { id: openingPaper_id },
        });
        if (!openingPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { openingPaper };
        response(res, 200, "기록표 상세 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:openingPaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { openingPaper_id } = req.params;
        const { openingPaper } = req.body;

        // params값 체크
        if (!openingPaper_id) { response(res, 400, "params값 없음"); return; }
        // 데이터 체크
        if (!openingPaper) { response(res, 400, "데이터 없음"); return; }

        let resOpeningPaper = await OpeningPaper.findOne({ where: { id: openingPaper_id } });
        if (!resOpeningPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        console.log(1)
        await OpeningPaper.update(
            {
                // 유저 입력
                receiver: openingPaper.receiver,
                reference: openingPaper.reference,
                openingDate: openingPaper.openingDate, open: openingPaper.open, put: openingPaper.put,
                safeManager: openingPaper.safeManager, managerMobile: openingPaper.managerMobile,
                ceo: openingPaper.ceo,
            },
            { where: { id: openingPaper_id } }
        );
        console.log(2)
        resOpeningPaper = await OpeningPaper.findOne({ where: { id: openingPaper_id } });
        let payLoad = { openingPaper: resOpeningPaper };
        response(res, 200, "기록표 수정 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { openingPaper_ids } = req.body;
        // 데이터 없음
        if (!openingPaper_ids) { response(res, 400, "데이터 없음"); return; }

        await asyncForEach(openingPaper_ids, async (id) => {
            await OpeningPaper.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// pdf 변환


module.exports = router;