const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company, KepcoFee} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { feeProject_id, kepcoFee } = req.body;
        // 데이터 체크
        if (!feeProject_id || !kepcoFee) { response(res, 400, "데이터 없음"); return }

        let resFeeProject = await FeeProject.findOne({ where: { id: feeProject_id } });
        if (!resFeeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

        // 이미 kepcoFee가 생성되어있는지 체크
        let check = await KepcoFee.findOne({ where: { feeProject_id } });
        if (check) { response(res, 400, "이미 데이터가 존재합니다."); return; }

        let reKepcoFee = await KepcoFee.create({
            supplyType: kepcoFee.supplyType, division: kepcoFee.division,
            voltType: kepcoFee.voltType, contractKw: kepcoFee.contractKw, 
            newDistance: kepcoFee.newDistance, addDistance: kepcoFee.addDistance,
            basicCost: kepcoFee.basicCost, distanceCost: kepcoFee.distanceCost,
            sum: kepcoFee.sum, vat: kepcoFee.vat, totalCost: kepcoFee.totalCost,
        })
        await resFeeProject.setKepcoFee(reKepcoFee);
        reKepcoFee = await KepcoFee.findOne({
            where: { id: reKepcoFee.id },
            attributes: ['id', 'totalCost']
        })
        let payLoad = { kepcoFee: reKepcoFee };
        response(res, 201, "수수료 데이터 생성 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정 - 수정시 기존 데이터 삭제
router.put('/:kepcoFee_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { kepcoFee_id } = req.params;
        if (!kepcoFee_id) { response(res, 400, "params값 없음"); return; }

        let kepcoFee = await KepcoFee.findOne({ where: { id: kepcoFee_id } });
        if (!kepcoFee) { response(res, 404, "수수료 데이터가 존재하지 않습니다."); return; }

        // 데이터 초기화
        await KepcoFee.destroy({ where: { id: kepcoFee_id } });
        response(res, 200, "수수료 데이터가 초기화(삭제) 되었습니다.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});
module.exports = router;