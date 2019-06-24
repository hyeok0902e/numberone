const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Breaker } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

router.post('/create', verifyToken, async (req, res, next) => {
    try {   
        const { billProject } = req.body;

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
  
        // 차단기 생성 => 고압시 & 저압시 같음
        // 뱅크부
        await asyncForEach(billProject.Loads, async (bank) => {
            const reBank = await Load.findOne({ where: { id: bank.id, type: 0 } });
            
            // 이미 차단기가 설정되었는지 체크
            let checkBreaker = await reBank.getBreaker();
            // if (checkBreaker) { response(res, 400, "이미 차단기가 설정되어 있습니다."); return; }

            let breaker = await Breaker.create({
                voltType: billProject.voltType, coef: bank.coef, permAmpe: bank.permAmpe, 
                breakerAmpeNormal: bank.breakerAmpeNormal, breakerAmpeMotor: bank.breakerAmpeMotor,
                breakerPermAmpe: bank.breakerPermAmpe, breakerVal: bank.breakerVal,
                userVal: bank.userVal
            });    
            // 치딘기 추가
            await reBank.setBreaker(breaker);

            // 그룹부
            await asyncForEach(bank.Group, async (group) => {
                let reGroup = await Load.findOne({ where: { id: group.id, type: 1 } });

                // 이미 차단기가 설정되었는지 체크
                let checkBreaker = await reGroup.getBreaker();
                // if (checkBreaker) { response(res, 400, "이미 차단기가 설정되어 있습니다."); return; }

                let breaker = await Breaker.create({
                    voltType: billProject.voltType, coef: group.coef, permAmpe: group.permAmpe, 
                    breakerAmpeNormal: group.breakerAmpeNormal, breakerAmpeMotor: group.breakerAmpeMotor,
                    breakerPermAmpe: group.breakerPermAmpe, breakerVal: group.breakerVal,
                    userVal: group.userVal
                });
                await reGroup.setBreaker(breaker);

                // 전동기부하
                await asyncForEach(group.MotorLoad, async (load) => {
                    let reLoad = await Load.findOne({ where: { id: load.id } });

                    // 이미 차단기가 설정되었는지 체크
                    let checkBreaker = await reLoad.getBreaker();
                    // if (checkBreaker) { response(res, 400, "이미 차단기가 설정되어 있습니다."); return; }

                    let breaker = await Breaker.create({
                        voltType: billProject.voltType, coef: load.coef, permAmpe: load.permAmpe, 
                        breakerAmpeNormal: load.breakerAmpeNormal, breakerAmpeMotor: load.breakerAmpeMotor,
                        breakerPermAmpe: load.breakerPermAmpe, breakerVal: load.breakerVal,
                        userVal: load.userVal
                    });

                    await reLoad.setBreaker(breaker);
                });
                // 일반부하(분전반)
                await asyncForEach(group.NormalSum, async (load) => {
                    let reLoad = await Load.findOne({ where: { id: load.id } });

                    // 이미 차단기가 설정되었는지 체크
                    let checkBreaker = await reLoad.getBreaker();
                    // if (checkBreaker) { response(res, 400, "이미 차단기가 설정되어 있습니다."); return; }

                    let breaker = await Breaker.create({
                        voltType: billProject.voltType, coef: load.coef, permAmpe: load.permAmpe, 
                        breakerAmpeNormal: load.breakerAmpeNormal, breakerAmpeMotor: load.breakerAmpeMotor,
                        breakerPermAmpe: load.breakerPermAmpe, breakerVal: load.breakerVal,
                        userVal: load.userVal
                    });

                    await reLoad.setBreaker(breaker);
                });
            });
        });

        // 데이터 준비
        let payLoad = {};
        if (billProject.voltType == 0) { // 고압수전시

            const resBillProject = await BillProject.findOne({ 
                where: { id: billProject.id },
                attributes: ['id', 'name', 'voltType'],
                include: [
                    {
                        model: Load,
                        order: [['id', 'ASC']],
                        where: { type: 0 },
                        attributes: ['id', 'type', 'name', 'thisType'],
                        include: [
                            {
                                model: Load,
                                as: 'Group',
                                order: [['id', 'ASC']],
                                attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeA', 'taskWay', 'ampeRealA'],
                                include: [
                                    {
                                        model: Breaker,
                                        attributes: ['breakerVal', 'coef', 'permAmpe']
                                    },
                                    {
                                        model: Load,
                                        as: 'MotorLoad',
                                        foreignKey: 'groupMotor_id',
                                        order: [['id', 'ASC']],
                                        attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeA', 'taskWay', 'ampeRealA'],
                                        include: [
                                            {
                                                model: Breaker,
                                                attributes: ['breakerVal', 'coef', 'permAmpe']
                                            },
                                        ]
                                    },
                                    {
                                        model: Load,
                                        as: 'NormalSum',
                                        foreignKey: 'groupNormal_id',
                                        order: [['id', 'ASC']],
                                        attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeA', 'taskWay', 'ampeRealA'],
                                        include: [
                                            {
                                                model: Breaker,
                                                attributes: ['breakerVal', 'coef', 'permAmpe']
                                            },
                                        ]
                                    }
                                ]
                            }
                        ]
                    }                    
                ] 
            });

            payLoad = { billProject: resBillProject };
        } else { // 저압수전시
            const resBillProject = await BillProject.findOne({
                where: { id: billProject.id },
                attributes: ['id', 'voltType', 'loadSimplyCE'],
                include: [
                    {
                        model: Load,
                        where: { type: 0 },
                        order: [['id', 'ASC']],
                        attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt'],
                        include: [
                            {
                                model: Breaker,
                                attributes: ['breakerVal', 'coef', 'permAmpe']
                            },
                            {
                                model: Load,
                                as: 'Group',
                                order: [['id', 'ASC']],
                                attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeA', 'taskWay', 'ampeRealA'],
                                include: [
                                    {
                                        model: Breaker,
                                        attributes: ['breakerVal', 'coef', 'permAmpe']
                                    },
                                    {
                                        model: Load,
                                        as: 'MotorLoad',
                                        foreignKey: 'groupMotor_id',
                                        order: [['id', 'ASC']],
                                        attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeA', 'taskWay', 'ampeRealA'],
                                        include: [
                                            {
                                                model: Breaker,
                                                attributes: ['breakerVal', 'coef', 'permAmpe']
                                            },
                                        ]
                                    },
                                    {
                                        model: Load,
                                        as: 'NormalSum',
                                        foreignKey: 'groupNormal_id',
                                        order: [['id', 'ASC']],
                                        attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeA', 'taskWay', 'ampeRealA'],
                                        include: [
                                            {
                                                model: Breaker,
                                                attributes: ['breakerVal', 'coef', 'permAmpe']
                                            },
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            payLoad = { billProject: resBillProject };
        }
        response(res, 201, "차단기 생성 성공!", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});


router.post('/test', async(req, res, next) => {
    const a = await Load.findOne({ where: { id: 1 } });
    const b = await a.getBreaker();
    console.log(b)
});
module.exports = router;