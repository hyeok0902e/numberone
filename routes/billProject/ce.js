const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Transformer, ContractElectricity } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/ce
const router = express.Router();

// 계약전력 생성
//고압
router.post('/high/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject } = req.body
        
        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!billProject) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }
        // 전압수전 체크
        if (billProject.voltType != 0) { response(res, 400, "전압수전이 올바르지 않습니다."); return; }

        // 부하(전동기 부하, 분전반) 테이블 업데이트 => 부하별 환산률, 환산값 계산
        await asyncForEach(billProject.Loads, async (load) => {
            await asyncForEach(load.Group, async (group) => {
                await asyncForEach(group.MotorLoad, async (load) => {
                    await Load.update(
                        { convertLate: load.convertLate, convertVal: load.convertVal },
                        { where: { id: load.id } }
                    );
                });
                await asyncForEach(group.NormalSum, async (load) => {
                    await Load.update(
                        { convertLate: load.convertLate, convertVal: load.convertVal },
                        { where: { id: load.id } }
                    );
                });
            });
        });
  
        // 계약 전력 테이블 생성
        await asyncForEach(billProject.ce, async (ce) => {
            let reCE = await ContractElectricity.create({
                div: ce.div, 
                convertLate: ce.convertLate, 
                convertVal: ce.convertVal,
                calculateVal: ce.calculateVal,
            })
            let reBillProject = await BillProject.findOne({ where: {id: billProject.id } });
            await reBillProject.addContractElectricity(reCE);
        });

        // 계산서 프로젝트 테이블 업데이트
        await BillProject.update(
            { elecConvertVal: billProject.ceSum, loadSimplyCE: billProject.loadSimplyCE, outputCE: billProject.outputCE },
            { where: { id: billProject.id } }
        )

        // 프로젝트에 전체 전압 저장 필요
        // 고압 수전일 때 => 계산서 전압은 22900 고정
        await BillProject.update(
            { volt: 22900 },
            { where: { id: billProject.id } }
        );

        // 고압 수전 일 때 payLoad
        let resBillProject = await BillProject.findOne({
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name', 'transformerKva', 'volt'],
            include: [{ 
                model: Load, 
                where: { type: 0 },
                order: [['id', 'ASC']],
                attributes: ['id', 'type', 'name', 'thisType', 'volt'],
                include: [{
                    model: Transformer,
                    attributes: ['userVal'],
                }] 
            }]
        });
        payLoad = { billProject: resBillProject };
        response(res, 201, "계약전력 생성 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});
//저압
router.post('/low/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject } = req.body
        
        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!billProject) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }
        // 전압수전 체크
        if (billProject.voltType != 1) { response(res, 400, "전압수전이 올바르지 않습니다."); return; }

        // 부하(전동기 부하, 분전반) 테이블 업데이트 => 부하별 환산률, 환산값 계산
        await asyncForEach(billProject.Loads, async (load) => {
            await Load.update(
                { convertLate: load.convertLate, convertVal: load.convertVal },
                { where: { id: load.id } }
            );
        });
        
        // 계약 전력 테이블 생성
        await asyncForEach(billProject.ce, async (ce) => {
            let reCE = await ContractElectricity.create({
                div: ce.div, 
                convertLate: ce.convertLate, 
                convertVal: ce.convertVal,
                calculateVal: ce.calculateVal,
            })
            let reBillProject = await BillProject.findOne({ where: {id: billProject.id } });
            await reBillProject.addContractElectricity(reCE);
        });
        
        // 계산서 프로젝트 테이블 업데이트
        await BillProject.update(
            { elecConvertVal: billProject.ceSum, loadSimplyCE: billProject.loadSimplyCE, outputCE: billProject.outputCE },
            { where: { id: billProject.id } }
        )

        // 계산 데이터 준비 => 수전설비
        let payLoad = { };

        // 프로젝트에 전체 전압 저장 필요
        // 저압 수전일 때 => 계산서 전압은 220 or 380
        const banks = await Load.findAll({ where: { billProject_id: billProject.id, type: 0 } });
        let volt = 0;
        await asyncForEach(banks, async (bank) => {
            if ((volt.bank == 380) || (volt.bank == 440)) { 
                volt = 380; 
            } else {
                volt = 220;
            }
        });
        await BillProject.update({ volt }, { where: { id: billProject.id }});
        // 저압 수전일 때 payLoad
        let resBillProject = await BillProject.findOne({
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name', 'loadSimplyCE', 'volt']
        });
        payLoad = { billProject: resBillProject }
     
        response(res, 201, "계약전력 생성 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;