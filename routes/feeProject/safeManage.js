const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company, SafeManage } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

// 생성
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    const { feeProject_id, safeManage } = req.body;
    if (!feeProject_id || !safeManage) { response(res, 400, "데이터 없음"); return; }

    let feeProject = await FeeProject.findOne({ where: { id: feeProject_id } });
    if (!feeProject) { response(res, 404, "프로젝트가 존재하지 않습니다."); return; }

    let check = await SafeManage.findOne({ where: { feeProject_id } });
    if (check) { response(res, 400, "이미 데이터가 존재합니다."); return; }

    let a = safeManage;
    let resSafeManage = await SafeManage.create({
        businessType: a.businessType, voltType: a.voltType,
        passiveKw: a.passiveKw, generateKw: a.generateKw, sunKw: a.sunKw,
        sum: a.sum, fee: a.fee, weight: a.weight, checking: a.checking,
    });

    await feeProject.setSafeManage(resSafeManage);
    resSafeManage = await SafeManage.findOne({
        where: { id: resSafeManage.id },
        attributes: ['id', 'fee']
    });
    let payLoad = { safeManage: resSafeManage };
    response(res, 201, "수수료 데이터 생성 완료", payLoad);
});

// 수정 - 수정시 기존 데이터 삭제
router.put('/:safeManage_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { safeManage_id } = req.params;
        if (!safeManage_id) { response(res, 400, "params값 없음"); return; }

        let safeManage = await SafeManage.findOne({ where: { id: safeManage_id } });
        if (!safeManage) { response(res, 404, "수수료 데이터가 존재하지 않습니다."); return; }
   
        // 데이터 초기화
        await SafeManage.destroy({ where: { id: safeManage_id } });
        response(res, 200, "수수료 데이터가 초기화(삭제) 되었습니다.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;