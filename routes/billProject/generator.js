const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Generator, MainPE_High, PE_Low} = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/generator/create
const router = express.Router();

router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject } = req.body;
        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!billProject) { response(res, 400, "데이터 없음"); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "유저 없음"); return; }
        
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(billAuth(user))) { response(res, 401, "권한 없음"); return; }

        let resBillProject = await BillProject.findOne({ where: { id: billProject.id } });
        // 발전기 데이터 생성
        await asyncForEach(billProject.Loads, async (load) =>{
            let reLoad = await Load.findOne({ where: { id: load.id} });
            let generator = await Generator.create({
                powerLate: load.powerLate, jeongSu: load.jeongSu, overload: load.overload,
                taskWay: load.taskWay, // model 수정했으므로 drop & migrate 필요
                taskKva: load.taskKva, taskCoef: load.taskCoef, taskPowerLate: load.taskPowerLate,
                voltDrop: load.voltDrop, excessLate: load.excessLate, 
                firstVal: load.firstVal, secVal: load.secVal, thirdVal: load.thirdVal,
                userKwVal: load.userKwVal, userKvaVal: load.userKvaVal,
            });
            await reLoad.setGenerator(generator);
            await resBillProject.addGenerator(generator);
        });
        
        await BillProject.update(
            { step: "generator" },
            { where: { id: billProject.id } }
        );
        resBillProject = await BillProject.findOne({ where: { id: billProject.id } });
        // 프로젝트 내역서 데이터 준비
        let thisBanks = await Load.findAll({ where: { billProject_id: billProject.id, type: 0 } });
        let thisGroups = await Load.findAll({ where: { billProject_id: billProject.id, type: 1 } });
        let oneLoad = await Load.findAll({ where: { thisType: 0, billProject_id: billProject.id } });
        let twoLoad = await Load.findAll({ where: { thisType: 1, billProject_id: billProject.id } });
        let threeLoad = await Load.findAll({ where: { thisType: 2, billProject_id: billProject.id } });
        let fourLoad = await Load.findAll({ where: { thisType: 3, billProject_id: billProject.id } });
        let load6600 = await Load.findAll({ where: { volt: 6600, billProject_id: billProject.id } });
        let load3300 = await Load.findAll({ where: { volt: 3300, billProject_id: billProject.id } });
        let load440 = await Load.findAll({ where: { volt: 440, billProject_id: billProject.id } });
        let load380 = await Load.findAll({ where: { volt: 380, billProject_id: billProject.id } });
        let load220 = await Load.findAll({ where: { volt: 220, billProject_id: billProject.id } });
        let check6600 = false;
        let check3300 = false;
        let check440 = false;
        let check380 = false;
        let check220 = false;
        if (load6600.length > 0) { check6600 = true; }
        if (load3300.length > 0) { check3300 = true; }
        if (load440.length > 0) { check440 = true; }
        if (load380.length > 0) { check380 = true; }
        if (load220.length > 0) { check220 = true; }

        // 발전설비 값 구하기 => 발전기 계산에서 제일 큰 용량
        let generatorKw = 0;
        let generatorKva = 0;
        let generators = await Generator.findAll({ where: { billProject_id: billProject.id } })
        await asyncForEach(generators, async (g) => {
            if (generatorKw < g.userKwVal) { generatorKw = g.userKwVal; }
            if (generatorKva < g.userKvaVal) { generatorKva = g.userKvaVal; }
        });
        // let loadGenerator = await Load.findAll({ where: { billProject_id: billProject.id, type: 1 } })

        // 계량기 값 가져오기
        let meterInfo1 = "";
        let meterInfo2 = "";
        if (billProject.voltType == 0) {
            let highPe = await MainPE_High.findOne({ where: { billProject_id: billProject.id } });
            meterInfo1 = highPe.mofCT;
            meterInfo2 = highPe.mofMagni;
        } else {
            let lowPe =  await PE_Low.findOne({ where: { billProject_id: billProject.id } });
            meterInfo1 = lowPe.meterCapa;
            meterInfo2 = lowPe.meterCTCapa; 
        }

        
        let payLoad = {
            billProject: {
                step: resBillProject.step,
                name: resBillProject.name,
                voltType: billProject.voltType,
                step: "generator",
                createdAt: resBillProject.createdAt,
                ce: resBillProject.loadSimplyCE,
                outputCE: resBillProject.outputCE,
                meterInfo1,
                meterInfo2,
                bankNum: thisBanks.length,
                groupNum: thisGroups.length,
                generatorKw,
                generatorKva,
                loadCount1: oneLoad.length,
                loadCount2: twoLoad.length,
                loadCount3: threeLoad.length,
                loadCount4: fourLoad.length,
                check6600,
                check3300,
                check440,
                check380,
                check220,
            }
        };

        response(res, 201, "발전기 데이터 생성 성공! 계산서 프로젝트가 종료되었습니다.", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});
module.exports = router;