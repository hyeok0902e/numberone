const express = require('express');
const moment = require("moment");

// 모델 import
const { User, Address, UserAuth, Company, EstimatePaper, EstimatePaperElement } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id } = req.body;
        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        // 데이터 체크
        if (!company_id) { console.log(res, 400, "데이터 없음") }

        const company = await Company.findOne({ where: { id: company_id} });
        if (!company) { response(res, 404, "업체가 존재하지 않습니다.") }
        // 권한 체크
        if (company.user_id != user.id) { response(res, 401, "권한 없음"); return; }

        // 목록 
        const estimatePapers = await EstimatePaper.findAll({ 
            where: { company_id },
            attributes: ['id', 'launchDate'] 
        });
        let payLoad = { estimatePapers };
        response(res, 200, "기록표 목록", payLoad);
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

        let payLoad = {
            company: {
                name: company.name,
            },
            user: {
                company: user.company,
                name: user.name,
                tel: user.phone,
                fax: user.fax,
                email: user.email
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
        const { company_id, estimatePaper } = req.body;

        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        if (!estimatePaper) { response(res, 400, "데이터 없음"); return; }

        // 업체 체크
        let comp = await Company.findOne({ where: { id: company_id } });
        if (!comp) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 권한체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (comp.user_id != user.id) { response(res, 401, "권한 없음"); return; }

        let resEstimatePaper = await EstimatePaper.create({
            launchDate: moment(Date.now()).format('YYYY-MM-DD'),
            // 수신자 정보
            receiver: comp.name,
            receiverName: estimatePaper.receiverName,
            receiverTel: estimatePaper.receiverTel,
            receiverFax: estimatePaper.receiverFax,
            receiverEmail: estimatePaper.receiverEmail,
            
            // 발신자 정보
            sender: user.company,
            senderName: user.name,
            senderTel: user.phone,
            senderFax: user.fax,
            senderEamil: user.email,

            // 견적 내용
            totalCost: estimatePaper.totalCost,
            vat: estimatePaper.vat,
            lastCost: estimatePaper.lastCost,
            opinion: estimatePaper.opinion,
        });
        await comp.addEstimatePaper(resEstimatePaper);

        await asyncForEach(estimatePaper.elements, async (e) => {
            let element = await EstimatePaperElement.create({
                name: e.name, standard: e.standard, quantity: e.quantity,
                unitcost: e.unitcost, sumCost: e.sumCost,
            });
            await resEstimatePaper.addEstimatePaperElement(element);
        });

        resEstimatePaper = await EstimatePaper.findOne({ 
            where: { id: resEstimatePaper.id },
            include: [
                { model: EstimatePaperElement }
            ]
        });
        let payLoad = { estimatePaper: resEstimatePaper };
        response(res, 201, "기록표 생성 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사
router.post('/:estimatePaper_id/copy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimatePaper_id } = req.params

        // params값 체크
        if (!estimatePaper_id) { response(res, 400, "데이터 없음"); return; }
        // 기록표 존재여부 체크
        let estimatePaper = await EstimatePaper.findOne({ where: { id: estimatePaper_id } });
        if (!estimatePaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        const comp = await Company.findOne({ where: { id: estimatePaper.company_id} });
        
        // 기록표 복사
        await EstimatePaper.findOne({ where: { id: estimatePaper_id }, raw: true })
            .then(async data => {  
                // estimatePaper 복사
                await delete data.id // id값 제거
                let copyPaper = await EstimatePaper.create(data); // 데이터 복사
                await comp.addEstimatePaper(copyPaper);

                // estimatePaperElement 복사
                let elements = await EstimatePaperElement.findAll({
                    where: { estimatePaper_id }, raw: true
                })
                await asyncForEach(elements, async (e) => {
                    await delete e.id;
                    let copy = await EstimatePaperElement.create(e);
                    await copyPaper.addEstimatePaperElement(copy);
                });
    
                // 응답
                let resEstimatePaper = await EstimatePaper.findOne({
                    where: { id: copyPaper.id },
                    include: [
                        { model: EstimatePaperElement }
                    ]
                });
                let payLoad = { EstimatePaper: resEstimatePaper };
                response(res, 201, "기록표가 복사되었습니다.", payLoad);
            })
            .catch(err => { 
                console.log(err)
                response(res, 404, "기록표가 존재하지 않습니다.");
            });
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상페이지
router.get('/:estimatePaper_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimatePaper_id } = req.params

        // params값 체크
        if (!estimatePaper_id) { response(res, 400, "데이터 없음"); return; }

        // 기록표 존재여부 체크
        let estimatePaper = await EstimatePaper.findOne({ 
            where: { id: estimatePaper_id },
            include: [
                { model: EstimatePaperElement }
            ]
        });
        if (!estimatePaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { estimatePaper };
        response(res, 200, "기록표 상세 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정페이지
router.get('/:estimatePaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimatePaper_id } = req.params

        // params값 체크
        if (!estimatePaper_id) { response(res, 400, "데이터 없음"); return; }

        // 기록표 존재여부 체크
        let estimatePaper = await EstimatePaper.findOne({ 
            where: { id: estimatePaper_id },
            include: [
                { model: EstimatePaperElement }
            ]
        });
        if (!estimatePaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { estimatePaper };
        response(res, 200, "기록표 수정 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:estimatePaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimatePaper } = req.body
        const { estimatePaper_id } = req.params
        // 데이터 체크
        if (!estimatePaper) { response(res, 400, "데이터 없음"); return; }
        // params값 체크
        if (!estimatePaper_id) { response(res, 400, "데이터 없음"); return; }

        let resEstimatePaper = await EstimatePaper.findOne({ where: { id: estimatePaper_id } });
        if (!resEstimatePaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        // estimatePaper 업데이트
        await EstimatePaper.update(
            {  
                // 수신자 정보
                receiverName: estimatePaper.receiverName,
                receiverTel: estimatePaper.receiverTel,
                receiverFax: estimatePaper.receiverFax,
                receiverEmail: estimatePaper.receiverEmail,
                
                // 발신자 정보

                // 견적 내용
                totalCost: estimatePaper.totalCost,
                vat: estimatePaper.vat,
                lastCost: estimatePaper.lastCost,
                opinion: estimatePaper.opinion,
            },
            { where: { id: estimatePaper_id } }
        );

        resEstimatePaper = await EstimatePaper.findOne({ where: { id: estimatePaper_id } });
        
        // estimatePaper 삭제 및 재생성
        await EstimatePaperElement.destroy({ where: { estimatePaper_id } });
        await asyncForEach(estimatePaper.elements, async (e) => {
            let element = await EstimatePaperElement.create(
                {
                    name: e.name, standard: e.standard, quantity: e.quantity,
                    unitcost: e.unitcost, sumCost: e.sumCost,
                }
            );
            await resEstimatePaper.addEstimatePaperElement(element);
        });

        resEstimatePaper = await EstimatePaper.findOne({ 
            where: { id: estimatePaper_id },
            include: [
                { model: EstimatePaperElement }
            ]
        });
        let payLoad = { estimatePaper: resEstimatePaper };
        response(res, 200, "기록표 수정 완료", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimatePaper_ids } = req.body;
        // 데이터 체크
        if( !estimatePaper_ids ) { response(res, 400, "데이터 없음"); return; }

        await asyncForEach(estimatePaper_ids, async (id) => {
            await EstimatePaper.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// pdf 변환

module.exports = router;