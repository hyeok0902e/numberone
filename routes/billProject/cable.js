const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Cable } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/cable
const router = express.Router();

// 케이블 계산기 생성
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

        // 데이터 생성 => 케이블
        // 뱅크부
        await asyncForEach(billProject.Loads, async (bank) => {
            if (billProject.voltType == 1) {
                let reBank = await Load.findOne({ where: { id: bank.id, type: 0 } });
                let cable = await Cable.create({
                    voltType: billProject.voltType, insulationWay: bank.insulationWay,
                    distance: bank.distance, workType: bank.workType, temp: bank.temp, tempVal: bank.tempVal,
                    multiCircuit: bank.multiCircuit, multiCircuitVal: bank.multiCircuitVal, lastVal: bank.lastVal,
                    cableThick: bank.cableThick, cablePermAmpe: bank.cablePermAmpe, cableVolt: bank.cableVolt, cableVoltPer: bank.cableVoltPer,
                    userThick: bank.userThick, userVolt: bank.userVolt, userVoltPer: bank.userVoltPer, groundWire: bank.groundWire,
                    cableThickL: bank.cableThickL, cableRef: bank.cableRef, lastValRef: bank.lastValRef
                });          
                await reBank.setCable(cable);
            }
            // 그룹부
            await asyncForEach(bank.Group, async (group) => {
                let reGroup = await Load.findOne({ where: { id: group.id, type: 1 } });
                let cable = await Cable.create({
                    voltType: billProject.voltType, insulationWay: group.insulationWay,
                    distance: group.distance, workType: group.workType, temp: group.temp, tempVal: group.tempVal,
                    multiCircuit: group.multiCircuit, multiCircuitVal: group.multiCircuitVal, lastVal: group.lastVal,
                    cableThick: group.cableThick, cablePermAmpe: group.cablePermAmpe, cableVolt: group.cableVolt, cableVoltPer: group.cableVoltPer,
                    userThick: group.userThick, userVolt: group.userVolt, userVoltPer: group.userVoltPer, groundWire: group.groundWire,
                    cableThickL: group.cableThickL, cableRef: group.cableRef, lastValRef: group.lastValRef
                });  
                await reGroup.setCable(cable);

                // 전동기부하부
                await asyncForEach(group.MotorLoad, async (motorLoad) => {
                    let reMotorLoad = await Load.findOne({ where: { id: motorLoad.id } });
                    let cable = await Cable.create({
                        voltType: billProject.voltType, insulationWay: motorLoad.insulationWay,
                        distance: motorLoad.distance, workType: motorLoad.workType, temp: motorLoad.temp, tempVal: motorLoad.tempVal,
                        multiCircuit: motorLoad.multiCircuit, multiCircuitVal: motorLoad.multiCircuitVal, lastVal: motorLoad.lastVal,
                        cableThick: motorLoad.cableThick, cablePermAmpe: motorLoad.cablePermAmpe, cableVolt: motorLoad.cableVolt, cableVoltPer: motorLoad.cableVoltPer,
                        userThick: motorLoad.userThick, userVolt: motorLoad.userVolt, userVoltPer: motorLoad.userVoltPer, groundWire: motorLoad.groundWire,
                        cableThickL: motorLoad.cableThickL, cableRef: motorLoad.cableRef, lastValRef: motorLoad.lastValRef
                    });   
                    await reMotorLoad.setCable(cable);
                });

                // 분전반
                await asyncForEach(group.NormalSum, async (normalSum) => {
                    let reNormalSum = await Load.findOne({ where: { id: normalSum.id } });
                    let cable = await Cable.create({
                        voltType: billProject.voltType, insulationWay: normalSum.insulationWay,
                        distance: normalSum.distance, workType: normalSum.workType, temp: normalSum.temp, tempVal: normalSum.tempVal,
                        multiCircuit: normalSum.multiCircuit, multiCircuitVal: normalSum.multiCircuitVal, lastVal: normalSum.lastVal,
                        cableThick: normalSum.cableThick, cablePermAmpe: normalSum.cablePermAmpe, cableVolt: normalSum.cableVolt, cableVoltPer: normalSum.cableVoltPer,
                        userThick: normalSum.userThick, userVolt: normalSum.userVolt, userVoltPer: normalSum.userVoltPer, groundWire: normalSum.groundWire,
                        cableThickL: normalSum.cableThickL, cableRef: normalSum.cableRef, lastValRef: normalSum.lastValRef
                    });   
                    await reNormalSum.setCable(cable);
                });
            });
        });

        // 전선관 계산 데이터 준비 - 고압/저압 구분 없음
        let resBillProject = await BillProject.findOne({ 
            where: { id: billProject.id, },
            attributes: ['id', 'name', 'voltType'],
            include: [
                {
                    model: Load,
                    order: [['id', 'ASC']],
                    where: { type: 0 },
                    attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv'],
                    include: [
                        {
                            model: Load,
                            as: 'Group',
                            order: [['id', 'ASC']],
                            attributes: ['id', 'type', 'name', 'thisType', 'taskWay'],
                            include: [
                                {
                                    model: Cable,
                                    attributes: ['cableThick']
                                },
                                {
                                    model: Load,
                                    as: 'MotorLoad',
                                    foreignKey: 'groupMotor_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'taskWay'],
                                    include: [
                                        {
                                            model: Cable,
                                            attributes: ['cableThick']
                                        },
                                    ]
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'taskWay'],
                                    include: [
                                        {
                                            model: Cable,
                                            attributes: ['cableThick']
                                        },
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        let payLoad = { billProject: resBillProject }; 
        response(res, 200, "케이블 데이터 성공!", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;