
const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company, PreUsage, PrePowerFee, PreReceptFee, PreWireFee} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { feeProject_id, preUsage } = req.body;
        if (!feeProject_id || !preUsage) { response(res, 400, "데이터 없음"); return; }

        let feeProject = await FeeProject.findOne({ where: { id: feeProject_id } });
        if (!feeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

        let check = await PreUsage.findOne({ where: { feeProject_id } });
        if (check) { response(res, 400, "이미 데이터가 존재합니다."); return; }

        let a = preUsage;
        // 수수료 데이터 생성
        let resPreUsage = await PreUsage.create({
            sum: a.sum, addCost: a.addCost, vat: a.vat, totalCost: a.totalCost,
            offCheck: a.offCheck, reCheck: a.reCheck
        });
        await feeProject.setPreUsage(resPreUsage);
        // 수수료 데이터 생성 - preReceptFee
        let b = preUsage.preReceptFee;
        let preReceptFee = await PreReceptFee.create({
            checkType: b.checkType, voltType: b.voltType, 
            passiveKw: b.passiveKw, supplyKw: b.supplyKw,
            basicCost: b.basicCost, kwCost: b.kwCost, supplyCost: b.supplyCost,
            sum: b.sum,
        });
        await resPreUsage.setPreReceptFee(preReceptFee);
        // 수수료 데이터 생성 - preReceptFee
        await asyncForEach(preUsage.prePowerFee, async (pf) => {
            let prePowerFee = await PrePowerFee.create({
                checkType: pf.checkType, equipType: pf.equipType, voltType: pf.voltType,
                generateKw: pf.generateKw, basicCost: pf.basicCost, kwCost: pf.kwCost,
                sum: pf.sum,
            });
            await resPreUsage.addPrePowerFee(prePowerFee);
        });
        // 수수료 데이터 생성 - preWireFee
        await asyncForEach(preUsage.preWireFee, async (wf) => {
            let preWireFee = await PreWireFee.create({
                divison: wf.divison, num: wf.num, addCost: wf.addCost,
            })
            await resPreUsage.addPreWireFee(preWireFee);
        });

        resPreUsage = await PreUsage.findOne({
            where: { id: resPreUsage.id },
            attributes: ['id', 'totalCost']
        });
        let payLoad = { preUsage: resPreUsage };
        response(res, 201, "수수료 데이터 생성 완료", payLoad);
    } catch (err) {   
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 수정 - 수정시 기존 데이터 삭제
router.put('/:preUsage_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { preUsage_id } = req.params;
        if (!preUsage_id) { response(res, 400, "params값 없음"); return; }

        let preUsage = await PreUsage.findOne({ where: { id: preUsage_id } });
        if (!preUsage) { response(res, 404, "수수료 데이터가 존재하지 않습니다."); return; }
   
        // 데이터 초기화
        await PreUsage.destroy({ where: { id: preUsage_id } });
        response(res, 200, "수수료 데이터가 초기화(삭제) 되었습니다.");
    } catch {   
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;