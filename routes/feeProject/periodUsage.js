const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company, PeriodPowerFee, PeriodReceptFee, PeriodUsage, PeriodWireFee} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { feeProject_id, periodUsage } = req.body;
        if (!feeProject_id || !periodUsage) { response(res, 400, "데이터 없음"); return; }

        let feeProject = await FeeProject.findOne({ where: { id: feeProject_id } });
        if (!feeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

        let check = await PeriodUsage.findOne({ where: { feeProject_id } });
        if (check) { response(res, 400, "이미 데이터가 존재합니다."); return; }

        let a = periodUsage;
        // 수수료 데이터 생성
        let resPeriodUsage = await PeriodUsage.create({
            sum: a.sum, vat: a.vat, totalCost: a.totalCost,
            offCheck: a.offCheck, reCheck: a.reCheck
        });
        await feeProject.setPeriodUsage(resPeriodUsage);
        // 수수료 데이터 생성 - periodReceptFee
        let b = periodUsage.periodReceptFee;
        let periodReceptFee = await PeriodReceptFee.create({
            checkType: b.checkType, voltType: b.voltType, 
            passiveKw: b.passiveKw, reCheck: b.reCheck,
            basicCost: b.basicCost, kwCost: b.kwCost,
            sum: b.sum,
        });
        await resPeriodUsage.setPeriodReceptFee(periodReceptFee);
        // 수수료 데이터 생성 - preReceptFee
        await asyncForEach(periodUsage.periodPowerFee, async (pf) => {
            let periodPowerFee = await PeriodPowerFee.create({
                checkType: pf.checkType, equipType: pf.equipType, voltType: pf.voltType,
                generateKw: pf.generateKw, basicCost: pf.basicCost, kwCost: pf.kwCost,
                sum: pf.sum,
            });
            await resPeriodUsage.addPeriodPowerFee(periodPowerFee);
        });
        // 수수료 데이터 생성 - preWireFee
        await asyncForEach(periodUsage.periodWireFee, async (wf) => {
            let periodWireFee = await PeriodWireFee.create({
                divison: wf.divison, num: wf.num, addCost: wf.addCost,
            })
            await resPeriodUsage.addPeriodWireFee(periodWireFee);
        });

        resPeriodUsage = await PeriodUsage.findOne({
            where: { id: resPeriodUsage.id },
            attributes: ['id', 'totalCost']
        });
        let payLoad = { periodUsage: resPeriodUsage };
        response(res, 201, "수수료 데이터 생성 완료", payLoad);
    } catch (err) {   
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 수정 - 수정시 기존 데이터 삭제
router.put('/:periodUsage_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { periodUsage_id } = req.params;
        if (!periodUsage_id) { response(res, 400, "params값 없음"); return; }

        let periodUsage = await PeriodUsage.findOne({ where: { id: periodUsage_id } });
        if (!periodUsage) { response(res, 404, "수수료 데이터가 존재하지 않습니다."); return; }
   
        // 데이터 초기화
        await PeriodUsage.destroy({ where: { id: periodUsage_id } });
        response(res, 200, "수수료 데이터가 초기화(삭제) 되었습니다.");
    } catch {   
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;