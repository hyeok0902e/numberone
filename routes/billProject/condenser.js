const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Condenser, Transformer } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 콘덴서 생성  - 고압 수전시
router.post('/high/create', verifyToken, async (req, res, next) => {
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
        // 전압 체크
        if (billProject.voltType != 0) { response(res, 400, "전압타입이 맞지 않습니다."); eturn; }

        // 콘덴서 생성
        // 뱅크부
        await asyncForEach(billProject.Loads, async (bank) => {
            let reBank = await Load.findOne({ where: { id: bank.id } });
            let condenser = await Condenser.create({
                voltType: billProject.voltType,
                condenserCal: bank.condenserCal,
                condenserVal: bank.condenserVal,
                userVal: bank.userVal
            });  
            await reBank.setCondenser(condenser);

            await asyncForEach(bank.Group, async (group) => {
                // 전동기부하 
                await asyncForEach(group.MotorLoad, async (load) => {
                    let reCondenser = await Condenser.create({
                        voltType: billProject.voltType,
                        condenserCal: load.condenserCal,
                        condenserVal: load.condenserVal,
                        userVal: load.userVal
                    });
                    let reLoad = await Load.findOne({ where: { id: load.id } });
                    await reLoad.setCondenser(reCondenser);
                });
                // 일반부하(분전반) 
                await asyncForEach(group.NormalSum, async (load) => {
                    let reCondenser = await Condenser.create({
                        voltType: billProject.voltType,
                        condenserCal: load.condenserCal,
                        condenserVal: load.condenserVal,
                        userVal: load.userVal
                    });
                    let reLoad = await Load.findOne({ where: { id: load.id } });
                    await reLoad.setCondenser(reCondenser);
                });
            });
        });

        await BillProject.update(
            { step: "condenser" },
            { where: { id: billProject.id } }
        );
        // 다음 계산시 필요 데이터 
        let resBillProject = await BillProject.findOne({
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name', 'step'],
            include: [
                {
                    model: Load,
                    where: { type: 0 },
                    order: [['id', 'ASC']],
                    attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeB'],
                    include: [
                        {
                            model: Transformer,
                            attributes: ['userVal']
                        },
                        {
                            model: Load,
                            as: 'Group',
                            order: [['id', 'ASC']],
                            attributes: ['id', 'type', 'name', 'thisType', 'pisangValB', 'volt'],
                            include: [
                                {
                                    model: Load,
                                    as: 'MotorLoad',
                                    foreignKey: 'groupMotor_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'sangSang', 'sangDiv', 'volt', 'using', 'ampeB', 'demandLate', 'taskWay']
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'sangSang', 'sangDiv', 'volt', 'using', 'ampeB', 'demandLate', 'taskWay']
                                }
                            ]
                        }
                    ]
                }
            ]
        });     
        let payLoad = { billProject: resBillProject };
        response(res, 201, "콘덴서(고압) 생성 성공!", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 콘센서 생성 - 저압 수전시
router.post('/low/create', verifyToken, async (req, res, next) => {
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
        // 전압 체크
        if (billProject.voltType != 1) { response(res, 400, "전압타입이 맞지 않습니다."); eturn; }

        // 콘덴서 생성
        await asyncForEach(billProject.Loads, async (bank) => {
            await asyncForEach(bank.Group, async (group) => {
                await asyncForEach(group.MotorLoad, async (load) => {
                    let reLoad = await Load.findOne({ where: { id: load.id } });
            
                    // 이미 콘덴서 설정이 되어 있는지 체크
                    const check = await reLoad.getCondenser();
                    if (check) { response(res, 400, "이미 콘덴서 설정이 되어 있습니다."); return; }

                    let reCondenser = await Condenser.create({
                        voltType: billProject.voltType,
                        condenserCal: load.condenserCal,
                        condenserVal: load.condenserVal,
                        userVal: load.userVal
                    });    
                    await reLoad.setCondenser(reCondenser);
                });
                await asyncForEach(group.NormalSum, async (load) => {
                    let reLoad = await Load.findOne({ where: { id: load.id } });
            
                    // 이미 콘덴서 설정이 되어 있는지 체크
                    const check = await reLoad.getCondenser();
                    if (check) { response(res, 400, "이미 콘덴서 설정이 되어 있습니다."); return; }

                    let reCondenser = await Condenser.create({
                        voltType: billProject.voltType,
                        condenserCal: load.condenserCal,
                        condenserVal: load.condenserVal,
                        userVal: load.userVal
                    });    
                    await reLoad.setCondenser(reCondenser);
                });
            });    
        });
        
        await BillProject.update(
            { step: "condenser" },
            { where: { id: billProject.id } }
        );

        let resBillProject = await BillProject.findOne({
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name', 'step'],
            include: [
                {
                    model: Load,
                    where: { type: 0 },
                    order: [['id', 'ASC']],
                    attributes: ['id', 'type', 'name', 'thisType', 'sangSang', 'sangDiv', 'volt', 'ampeB'],
                    include: [
                        {
                            model: Transformer,
                            attributes: ['userVal']
                        },
                        {
                            model: Load,
                            as: 'Group',
                            order: [['id', 'ASC']],
                            attributes: ['id', 'type', 'name', 'thisType', 'pisangValB', 'volt'],
                            include: [
                                {
                                    model: Load,
                                    as: 'MotorLoad',
                                    foreignKey: 'groupMotor_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'sangSang', 'sangDiv', 'volt', 'using', 'ampeB', 'demandLate', 'taskWay']
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'sangSang', 'sangDiv', 'volt', 'using', 'ampeB', 'demandLate', 'taskWay']
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        let payLoad = { billProject: resBillProject };
        response(res, 201, "콘덴서(저압) 생성 성공!", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});
module.exports = router;