const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company, PreChange, PreChangeFee} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    const { feeProject_id, preChange } = req.body;
    if (!feeProject_id || !preChange) { response(res, 400, "데이터 없음"); return; }

    let feeProject = await FeeProject.findOne({ where: { id: feeProject_id } });
    if (!feeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

    let check = await PreChange.findOne({ where: { feeProject_id } });
    if (check) { response(res, 400, "이미 데이터가 존재합니다."); return; }

    let resPreChange = await PreChange.create({
        sum: preChange.sum, vat: preChange.vat, totalCost: preChange.totalCost,
    });
    await feeProject.setPreChange(resPreChange);

    await asyncForEach(preChange.preChangeFee, async (cf) => {
        let preChangeFee = await PreChangeFee.create({
            division: cf.division, num: cf.num, basicCost: cf.basicCost,
            addCost: cf.addCost, sum: cf.sum,
        });
        await resPreChange.addPreChangeFee(preChangeFee);
    });

    resPreChange = await PreChange.findOne({
        where: { id: resPreChange.id },
        attributes: ['id', 'totalCost']
    });
    let payLoad = { preChange: resPreChange };
    response(res, 201, "수수료 데이터 생성 완료", payLoad);
});

// 수정 - 수정시 기존 데이터 삭제
router.put('/:preChange_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { preChange_id } = req.params;
        if (!preChange_id) { response(res, 400, "params값 없음"); return; }

        let preChange = await PreChange.findOne({ where: { id: preChange_id } });
        if (!preChange) { response(res, 404, "수수료 데이터가 존재하지 않습니다."); return; }
   
        // 데이터 초기화
        await PreChange.destroy({ where: { id: preChange_id } });
        response(res, 200, "수수료 데이터가 초기화(삭제) 되었습니다.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;