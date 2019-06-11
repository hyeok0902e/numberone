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
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        // load[] => 부하(환산율, 환산값) 배열
        // ce[] => 계약전력 계산값 배열
        // ceSum => 계약전력 환산값 합계
        // loadSimplyCE => 부하집계에 의한 계약전력
        // outputCE => 설비용량에 의한 계약전력
        const { billProject_id, load, ce, ceSum, loadSimplyCE, outputCE  } = req.body;
        
        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!billProject_id) { response(res, 400, "데이터 없음"); return; }
        // 입력값 체크
        if (!ce || (ce == [])) { response(res, 400, "값을 입력해 주세요."); return; } 
        if (!load || (load == [])) { response(res, 400, "값을 입력해 주세요."); return; }
        if (!ceSum || !loadSimplyCE || !outputCE) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 존재여부 체크
        let billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서가 존재하지 않습니다."); return; }
        // 접근 권한 체크
        if (billProject.user_id != user.id) { response(res, 401, "권한 없음"); }

        // 부하(전동기 부하, 분전반) 테이블 업데이트 => 부하별 환산률, 환산값 계산
        await asyncForEach(load, async (load) => {
            await Load.update(
                { convertLate: load.convertLate, convertVal: load.convertVal },
                { where: { id: load.load_id } }
            );
        });
        
        // 계약 전력 테이블 생성
        await asyncForEach(ce, async (ce) => {
            let reCE = await ContractElectricity.create({
                div: ce.div, 
                convertLate: ce.convertLate, 
                convertVal: ce.convertVal,
                calculateVal: ce.calculateVal,
            })
            await billProject.addContractElectricity(reCE);
        });
        
        // 계산서 프로젝트 테이블 업데이트
        await BillProject.update(
            { elecConvertVal: ceSum, loadSimplyCE, outputCE },
            { where: { id: billProject_id } }
        )

        let payLoad = { };
        // 프로젝트에 전체 전압 저장 필요
        if (billProject.voltType == 0) { // 고압 수전일 때 => 계산서 전압은 22900 고정
            await BillProject.update(
                { volt: 22900 },
                { where: { id: billProject_id } }
            );
            
            // 고압 수전 일 때 payLoad
            billProject = await BillProject.findOne({
                where: { id: billProject_id },
                attributes: ['id', 'voltType' , 'transformerKva', 'volt'],
                include: [{ 
                    model: Load, 
                    where: { type: 0 },
                    attributes: ['id', 'volt'],
                    include: [{
                        model: Transformer,
                        attributes: ['userVal'],
                    }] 
                }]
            });
            payLoad = { billProject };
        } else { // 저압 수전일 때 => 계산서 전압은 220 or 380
            const banks = await Load.findAll({ where: { billProject_id, type: 0 } });
            let volt = 0;
            await asyncForEach(banks, async (bank) => {
                if ((volt.bank == 380) || (volt.bank == 440)) { 
                    volt = 380; 
                } else {
                    volt = 220;
                }
            });
            await BillProject.update({ volt }, { where: { id: billProject_id }});
            // 저압 수전일 때 payLoad
            billProject = await BillProject.findOne({
                where: { id: billProject_id },
                attributes: ['id', 'voltType', 'loadSimplyCE', 'volt']
            });
            payLoad = { billProject }
        }

        

        response(res, 201, "계약전력 생성 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;