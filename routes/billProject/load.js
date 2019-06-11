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
        const { billProject_id, bank } = req.body;

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인 필요"); return; }
        // 데이터 체크
        if (!billProject_id) { response(res, 400, "데이터 없음"); return; }
        // 입력값 체크
        if (!bank) { response(res, 400, "값을 입력해 주세요."); return; }
        if (bank == []) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }
        
        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서가 존재하지 않습니다."); return; }

        // 반드시 규칙을 지켜줘야 할 변수
        // type => 0: 뱅크(bank), 1: 그룹(group), 2: 전동기 부하(motorLoad), 3: 부모 분전반(normalSum), 4: 자식 분전반(normalLoad)
        
        // 접근 권한 체크
        if (billProject.user_id != user.id) { response(res, 401, "권한 없음"); }

        await asyncForEach(bank, async (bank) =>{
            let reBank = await Load.create({
                type: 0, name: bank.name,
                output: bank.output, hPower: bank.hPower, pisangValA: bank.pisangValA,
                pole: bank.pole, sangSang: bank.sangSang, sangDiv: bank.sangDiv,
                volt: bank.volt, powerLate: bank.powerLate, impowerLate: bank.impowerLate,
                efficiency: bank.efficiency, demandLate: bank.demandLate, 
                taskWay: bank.taskWay, using: bank.using, ampeA: bank.ampeA,
                ampeRealA: bank.ampeRealA, ampeB: bank.ampeB, ampeRealB: bank.ampeRealB,
                pisangValB: bank.pisangValB, 
            }); 
            await billProject.addLoad(reBank);
            
            // 그룹 데이터 체크
            if (bank.group) {
                await asyncForEach(bank.group, async (group) => {
                    // 그룹 생성
                    let reGroup = await Load.create({
                        type: 1, name: group.name,
                        output: group.output, hPower: group.hPower, pisangValA: group.pisangValA,
                        pole: group.pole, sangSang: group.sangSang, sangDiv: group.sangDiv,
                        volt: group.volt, powerLate: group.powerLate, impowerLate: group.impowerLate,
                        efficiency: group.efficiency, demandLate: group.demandLate, 
                        taskWay: group.taskWay, using: group.using, ampeA: group.ampeA,
                        ampeRealA: group.ampeRealA, ampeB: group.ampeB, ampeRealB: group.ampeRealB,
                        pisangValB: group.pisangValB, 
                    });
                    // 관계 설정
                    await billProject.addLoad(reGroup);
                    await reBank.addGroup(reGroup);

                    // 전동기 부하 데이터 체크
                    if (group.motorLoad) {
                        await asyncForEach(group.motorLoad, async (motorLoad) => {
                            // 전동기 부하 생성
                            let reMotorLoad = await Load.create({
                                type: 2, name: motorLoad.name,
                                output: motorLoad.output, hPower: motorLoad.hPower, pisangValA: motorLoad.pisangValA,
                                pole: motorLoad.pole, sangSang: motorLoad.sangSang, sangDiv: motorLoad.sangDiv,
                                volt: motorLoad.volt, powerLate: motorLoad.powerLate, impowerLate: motorLoad.impowerLate,
                                efficiency: motorLoad.efficiency, demandLate: motorLoad.demandLate, 
                                taskWay: motorLoad.taskWay, using: motorLoad.using, ampeA: motorLoad.ampeA,
                                ampeRealA: motorLoad.ampeRealA, ampeB: motorLoad.ampeB, ampeRealB: motorLoad.ampeRealB,
                                pisangValB: motorLoad.pisangValB, 
                            });
                            // 관계 설정
                            await billProject.addLoad(reMotorLoad);
                            await reGroup.addMotorLoad(reMotorLoad);
                        });
                    }
                    
                    // 부모 분전반 데이터 체크
                    if (group.normalSum) {
                        await asyncForEach(group.normalSum, async (normalSum) => {
                            // 부모 분전반 생성
                            let reNormalSum = await Load.create({
                                type: 3, name: normalSum.name,
                                output: normalSum.output, hPower: normalSum.hPower, pisangValA: normalSum.pisangValA,
                                pole: normalSum.pole, sangSang: normalSum.sangSang, sangDiv: normalSum.sangDiv,
                                volt: normalSum.volt, powerLate: normalSum.powerLate, impowerLate: normalSum.impowerLate,
                                efficiency: normalSum.efficiency, demandLate: normalSum.demandLate, 
                                taskWay: normalSum.taskWay, using: normalSum.using, ampeA: normalSum.ampeA,
                                ampeRealA: normalSum.ampeRealA, ampeB: normalSum.ampeB, ampeRealB: normalSum.ampeRealB,
                                pisangValB: normalSum.pisangValB, 
                            });
                            // 관계 설정
                            await billProject.addLoad(reNormalSum);
                            await reGroup.addNormalSum(reNormalSum);

                            // 자식 분전반 데이터 체크
                            if (normalSum.normalLoad) {
                                await asyncForEach(normalSum.normalLoad, async (normalLoad) => {
                                    // 자식 분전반 생성
                                    let reNormalLoad = await Load.create({
                                        type: 4, name: normalLoad.name,
                                        output: normalLoad.output, hPower: normalLoad.hPower, pisangValA: normalLoad.pisangValA,
                                        pole: normalLoad.pole, sangSang: normalLoad.sangSang, sangDiv: normalLoad.sangDiv,
                                        volt: normalLoad.volt, powerLate: normalLoad.powerLate, impowerLate: normalLoad.impowerLate,
                                        efficiency: normalLoad.efficiency, demandLate: normalLoad.demandLate, 
                                        taskWay: normalLoad.taskWay, using: normalLoad.using, ampeA: normalLoad.ampeA,
                                        ampeRealA: normalLoad.ampeRealA, ampeB: normalLoad.ampeB, ampeRealB: normalLoad.ampeRealB,
                                        pisangValB: normalLoad.pisangValB, 
                                    });
                                    // 관계 설정
                                    await billProject.addLoad(reNormalLoad);
                                    await reNormalSum.addNormalLoad(reNormalLoad);
                                });
                            }
                        });
                    }
                });
            }
        });

        let nextTF = true;
        // 프로젝트 전압수전 타입 체크
        if (billProject.voltType == 1) { nextTF = false; } 

        let payLoad = {}
        if (nextTF) { // 고압일 경우 변압기 계산
            const load = await Load.findAll({ 
                where: { billProject_id: billProject_id, type: 0 },
                order: [['id', 'ASC']],
                // 피상값a, 피상값b, 볼트, 기동방식, 개선역률
                attributes: ['id', 'output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                include: [{ 
                    model: Load, 
                    as: 'Group',
                    order: [['id', 'ASC']],
                    attributes: ['output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                    include: [
                        { 
                            model: Load, 
                            as: 'MotorLoad', 
                            foreignKey: 'groupMotor_id', 
                            order: [['id', 'ASC']], 
                            attributes: ['output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                        },
                        { 
                            model: Load, 
                            as: 'NormalSum', 
                            foreignKey: 'groupNormal_id', 
                            order: [['id', 'ASC']], 
                            attributes: ['output', 'pisangValA', 'pisangValB', 'volt', 'taskWay', 'impowerLate'],
                        },
                    ],
                }]
            });
            payLoad = { 
                billProject_id, 
                voltType: billProject.voltType, 
                bank: load 
            }
        } else { // 저압일 경우 계약전력 계산
            const load = await Load.findAll({ 
                where: { billProject_id: billProject_id, type: { [Op.or]: [2, 3] }, },
                order: [['id', 'ASC']],
                // 타입, 부하명, 출력, 볼트, 상용/예비
                attributes: ['type', 'id', 'name', 'output', 'volt', 'using' ],
            });
            payLoad = {
                billProject_id, 
                voltType: billProject.voltType,
                load
            }
        }

        response(res, 201, "부하 데이터 생성 성공", payLoad);
        return;
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;