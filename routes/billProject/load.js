const express = require('express');
const moment = require('moment');
const Op = require('Sequelize').Op;

// 모델 import
const { User, UserAuth, BillProject, Load } = require('../../models');

// 커스텀 미들웨어
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main'); 
const { response } = require('../middlewares/response');
const { billAuth } = require('../middlewares/userAuth');

// http://[url]/bill/load
const router = express.Router();

// 뱅크-그룹-부하 생성
router.post('/create', verifyToken, async(req, res, next) => {
    try {
        const { billProjectName, voltType, bank } = req.body;

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인 필요"); return; }
        // 입력값 체크
        console.log(1)
        if (!bank || !billProjectName) { response(res, 400, "값을 입력해 주세요."); return; }
        console.log(2)
        if (bank == []) { response(res, 400, "값을 입력해 주세요."); return; }
        console.log(3)
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 생성
        const newBillProject = await BillProject.create({ voltType, name: billProjectName, step: 0 })

        // 부하 생성
        // 뱅크부
        await asyncForEach(bank, async (bank) =>{
            let reBank = await Load.create({
                type: 0, name: bank.name, thisType: bank.thistype,
                output: bank.output, hPower: bank.hPower, pisangValA: bank.pisangValA,
                pole: bank.pole, sangSang: bank.sangSang, sangDiv: bank.sangDiv,
                volt: bank.volt, powerLate: bank.powerLate, impowerLate: bank.impowerLate,
                efficiency: bank.efficiency, demandLate: bank.demandLate, 
                taskWay: bank.taskWay, using: bank.using, ampeA: bank.ampeA,
                ampeRealA: bank.ampeRealA, ampeB: bank.ampeB, ampeRealB: bank.ampeRealB,
                pisangValB: bank.pisangValB, 
            }); 
            await newBillProject.addLoad(reBank);
            
            // 그룹 데이터 체크
            if (bank.group) {
                await asyncForEach(bank.group, async (group) => {
                    // 그룹 생성
                    let reGroup = await Load.create({
                        type: 1, name: group.name, thisType: group.thistype,
                        output: group.output, hPower: group.hPower, pisangValA: group.pisangValA,
                        pole: group.pole, sangSang: group.sangSang, sangDiv: group.sangDiv,
                        volt: group.volt, powerLate: group.powerLate, impowerLate: group.impowerLate,
                        efficiency: group.efficiency, demandLate: group.demandLate, 
                        taskWay: group.taskWay, using: group.using, ampeA: group.ampeA,
                        ampeRealA: group.ampeRealA, ampeB: group.ampeB, ampeRealB: group.ampeRealB,
                        pisangValB: group.pisangValB, 
                    });
                    // 관계 설정
                    await newBillProject.addLoad(reGroup);
                    await reBank.addGroup(reGroup);

                    // 전동기 부하 데이터 체크
                    if (group.motorLoad) {
                        await asyncForEach(group.motorLoad, async (motorLoad) => {
                            // 전동기 부하 생성
                            let reMotorLoad = await Load.create({
                                type: 2, name: motorLoad.name, thisType: motorLoad.thistype,
                                output: motorLoad.output, hPower: motorLoad.hPower, pisangValA: motorLoad.pisangValA,
                                pole: motorLoad.pole, sangSang: motorLoad.sangSang, sangDiv: motorLoad.sangDiv,
                                volt: motorLoad.volt, powerLate: motorLoad.powerLate, impowerLate: motorLoad.impowerLate,
                                efficiency: motorLoad.efficiency, demandLate: motorLoad.demandLate, 
                                taskWay: motorLoad.taskWay, using: motorLoad.using, ampeA: motorLoad.ampeA,
                                ampeRealA: motorLoad.ampeRealA, ampeB: motorLoad.ampeB, ampeRealB: motorLoad.ampeRealB,
                                pisangValB: motorLoad.pisangValB, 
                            });
                            // 관계 설정
                            await newBillProject.addLoad(reMotorLoad);
                            await reGroup.addMotorLoad(reMotorLoad);
                        });
                    }
                    
                    // 부모 분전반 데이터 체크
                    if (group.normalSum) {
                        await asyncForEach(group.normalSum, async (normalSum) => {
                            // 부모 분전반 생성
                            let reNormalSum = await Load.create({
                                type: 3, name: normalSum.name, thisType: normalSum.thistype,
                                output: normalSum.output, hPower: normalSum.hPower, pisangValA: normalSum.pisangValA,
                                pole: normalSum.pole, sangSang: normalSum.sangSang, sangDiv: normalSum.sangDiv,
                                volt: normalSum.volt, powerLate: normalSum.powerLate, impowerLate: normalSum.impowerLate,
                                efficiency: normalSum.efficiency, demandLate: normalSum.demandLate, 
                                taskWay: normalSum.taskWay, using: normalSum.using, ampeA: normalSum.ampeA,
                                ampeRealA: normalSum.ampeRealA, ampeB: normalSum.ampeB, ampeRealB: normalSum.ampeRealB,
                                pisangValB: normalSum.pisangValB, 
                            });
                            // 관계 설정
                            await newBillProject.addLoad(reNormalSum);
                            await reGroup.addNormalSum(reNormalSum);

                            // 자식 분전반 데이터 체크
                            if (normalSum.normalLoad) {
                                await asyncForEach(normalSum.normalLoad, async (normalLoad) => {
                                    // 자식 분전반 생성
                                    let reNormalLoad = await Load.create({
                                        type: 4, name: normalLoad.name, thisType: normalLoad.thistype,
                                        output: normalLoad.output, hPower: normalLoad.hPower, pisangValA: normalLoad.pisangValA,
                                        pole: normalLoad.pole, sangSang: normalLoad.sangSang, sangDiv: normalLoad.sangDiv,
                                        volt: normalLoad.volt, powerLate: normalLoad.powerLate, impowerLate: normalLoad.impowerLate,
                                        efficiency: normalLoad.efficiency, demandLate: normalLoad.demandLate, 
                                        taskWay: normalLoad.taskWay, using: normalLoad.using, ampeA: normalLoad.ampeA,
                                        ampeRealA: normalLoad.ampeRealA, ampeB: normalLoad.ampeB, ampeRealB: normalLoad.ampeRealB,
                                        pisangValB: normalLoad.pisangValB, 
                                    });
                                    // 관계 설정
                                    await newBillProject.addLoad(reNormalLoad);
                                    await reNormalSum.addNormalLoad(reNormalLoad);
                                });
                            }
                        });
                    }
                });
            }
        });

        // 계산서 스텝 업데이트
        await BillProject.update(
            { step: "load" },
            { where: { id: newBillProject.id } }  
        );

        let payLoad = {}
        if (newBillProject.voltType == 0) { // 고압일 경우 => 변압기 계산
            let billProject = await BillProject.findOne({
                where: { id: newBillProject.id },
                attributes: ['id', 'voltType', 'name', 'step'],
                include: [
                    {
                        // 뱅크
                        model: Load,
                        order: [['id', 'ASC']],
                        where: { type: 0 },
                        attributes: ['id', 'type', 'name', 'thisType', 'output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                        include: [
                            { 
                                // 그룹
                                model: Load, 
                                as: 'Group',
                                foreignKey: 'bank_id',
                                order: [['id', 'ASC']],
                                attributes: ['id', 'type', 'name', 'thisType', 'output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                                include: [
                                    { 
                                        // 전동기부하
                                        model: Load, 
                                        as: 'MotorLoad', 
                                        foreignKey: 'groupMotor_id', 
                                        order: [['id', 'ASC']], 
                                        attributes: ['id', 'type', 'name', 'thisType', 'output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                                    },
                                    { 
                                        // 일반부하(분전반)
                                        model: Load, 
                                        as: 'NormalSum', 
                                        foreignKey: 'groupNormal_id', 
                                        order: [['id', 'ASC']], 
                                        attributes: ['id', 'type', 'name', 'thisType', 'output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                                    },
                                ],
                            }
                        ]
                    },
                ]     
            });
            payLoad = { billProject }
        } else { // 저압일 경우 => 계약전력 계산
            let billProject = await BillProject.findOne({
                where: { id: newBillProject.id },
                attributes: ['id', 'voltType', 'name'],
                include: [
                    {
                        model: Load,
                        where: { type: { [Op.or]: [2, 3] } },
                        order: [['id', 'ASC']],
                        attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'using' ],
                    }
                ]
            })
            payLoad = { billProject }
        }

        response(res, 201, "부하 데이터 생성 성공", payLoad);
        return;
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;