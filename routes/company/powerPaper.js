const express = require('express');
const moment = require("moment");

// 모델 import
const { User, Address, UserAuth, PowerPaper, PowerPaperElement, Company } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 기록표 목록
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

        // 목록 불러오기
        const powerPapers = await PowerPaper.findAll({ where: { company_id }, attributes: ['id', 'checkDate'] });
        let payLoad = { powerPapers };
        response(res, 200, "기록표 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
}); 

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { company_id, powerPaper } = req.body;

        // 데이터 체크
        if (!company_id) { response(res, 400, "데이터 없음"); return; }
        if (!powerPaper) { response(res, 400, "데이터 없음"); return; }

        // 업체 체크
        let comp = await Company.findOne({ where: { id: company_id } });
        if (!comp) { response(res, 404, "업체가 존재하지 않습니다."); return; }

        // 권한체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (comp.user_id != user.id) { response(res, 401, "권한 없음"); return; }

        let resPowerPaper = await PowerPaper.create({
            compName: comp.name, checkDate: moment(Date.now()).format('YYYY-MM-DD'),
            manager: user.name,
            userCompName: user.company,
            userCompTel: user.companyTel,
            userCompFax: user.fax,

            opinion: powerPaper.opinion,
        });
        await comp.addPowerPaper(resPowerPaper);

        await asyncForEach(powerPaper.elements, async (e) => {
            let element = await PowerPaperElement.create({
                section: e.section, maxKw: e.maxKw, powerLate: e.powerLate,
                vVolt1: e.vVolt1, vThd1: e.vThd1, vVolt2: e.vVolt2, vThd2: e.vThd2, vVolt3: e.vVolt3, vThd3: e.vThd3,
                aAmpe1: e.aAmpe1, aAmpe2: e.aAmpe2, aAmpe3: e.aAmpe3,
                aUnbalance: e.aUnbalance, aThd1: e.aThd1, aThd2: e.aThd2, aThd3: e.aThd3, result: e.result,
            });
            await resPowerPaper.addPowerPaperElement(element);
        });

        resPowerPaper = await PowerPaper.findOne({ 
            where: { id: resPowerPaper.id },
            include: [
                { model: PowerPaperElement }
            ]
        });
        let payLoad = { powerPaper: resPowerPaper };
        response(res, 201, "기록표 생성 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 복사
router.post('/:powerPaper_id/copy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params

        // params값 체크
        if (!powerPaper_id) { response(res, 400, "데이터 없음"); return; }
        // 기록표 존재여부 체크
        let powerPaper = await PowerPaper.findOne({ where: { id: powerPaper_id } });
        if (!powerPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }
        const comp = await Company.findOne({ where: { id: powerPaper.company_id} });
        
        // 기록표 복사
        await PowerPaper.findOne({ where: { id: powerPaper_id }, raw: true })
            .then(async data => {  
                // powerPaper 복사
                await delete data.id // id값 제거
                const copyPaper = await PowerPaper.create(data); // 데이터 복사
                await comp.addPowerPaper(copyPaper);

                // powerPaperElement 복사
                let elements = await PowerPaperElement.findAll({
                    where: { powerPaper_id }, raw: true,
                })
                await asyncForEach(elements, async (e) => {
                    await delete e.id;
                    let copy = await PowerPaperElement.create(e);
                    await copyPaper.addPowerPaperElement(copy);
                });

                let resPowerPaper = await PowerPaper.findOne({
                    where: { id: copyPaper.id },
                    include: [
                        { model: PowerPaperElement }
                    ]
                });
                let payLoad = { powerPaper: resPowerPaper };
                response(res, 201, "기록표가 복사되었습니다.", payLoad);
            })
            .catch(err => { 
                response(res, 404, "기록표가 존재하지 않습니다.");
            });
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세페이지
router.get('/:powerPaper_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params

        // params값 체크
        if (!powerPaper_id) { response(res, 400, "데이터 없음"); return; }

        // 기록표 존재여부 체크
        let powerPaper = await PowerPaper.findOne({ 
            where: { id: powerPaper_id },
            include: [
                { model: PowerPaperElement }
            ]
        });
        if (!powerPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { powerPaper };
        response(res, 200, "기록표 상세 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정페이지
router.get('/:powerPaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper_id } = req.params

        // params값 체크
        if (!powerPaper_id) { response(res, 400, "데이터 없음"); return; }

        // 기록표 존재여부 체크
        let powerPaper = await PowerPaper.findOne({ 
            where: { id: powerPaper_id },
            include: [
                { model: PowerPaperElement }
            ]
        });
        if (!powerPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }

        let payLoad = { powerPaper };
        response(res, 200, "기록표 수정 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:powerPaper_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { powerPaper } = req.body
        const { powerPaper_id } = req.params
        // 데이터 체크
        if (!powerPaper) { response(res, 400, "데이터 없음"); return; }
        // params값 체크
        if (!powerPaper_id) { response(res, 400, "데이터 없음"); return; }

        let resPowerPaper = await PowerPaper.findOne({ where: { id: powerPaper_id } });
        if (!resPowerPaper) { response(res, 404, "기록표가 존재하지 않습니다."); return; }
        
        // powerPaper 업데이트
        await PowerPaper.update(
            { opinion: powerPaper.opinion },
            { where: { id: powerPaper_id } }
        );

        
        
        // powerPaperElement 삭제 및 재생성
        await PowerPaperElement.destroy({ where: { powerPaper_id } });
        await asyncForEach(powerPaper.elements, async (e) => {
            let element = await PowerPaperElement.create(
                {
                    section: e.section, maxKw: e.maxKw, powerLate: e.powerLate,
                    vVolt1: e.vVolt1, vThd1: e.vThd1, vVolt2: e.vVolt2, vThd2: e.vThd2, vVolt3: e.vVolt3, vThd3: e.vThd3,
                    aAmpe1: e.aAmpe1, aAmpe2: e.aAmpe2, aAmpe3: e.aAmpe3,
                    aUnbalance: e.aUnbalance, aThd1: e.aThd1, aThd2: e.aThd2, aThd3: e.aThd3, result: e.result,
                }
            );
            await resPowerPaper.addPowerPaperElement(element);
        });

        resPowerPaper = await RayPaper.findOne({ 
            where: { id: powerPaper_id },
            include: [
                { model: PowerPaperElement }
            ]
        });
        let payLoad = { powerPaper: resPowerPaper };
        response(res, 200, "기록표 수정 완료", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/destroy', verifyToken, verifyDuplicateLogin,  async (req, res, next) => {
    try {
        const { powerPaper_ids } = req.body;
        // 데이터 체크
        if( !powerPaper_ids ) { response(res, 400, "데이터 없음"); return; }

        await asyncForEach(powerPaper_ids, async (id) => {
            await PowerPaper.destroy({ where: { id } });
        });
        response(res, 200, "삭제 완료");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// pdf 변환

module.exports = router;