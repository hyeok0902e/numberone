const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, WireCase } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/wireCase
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

        // 전선관 데이터 생성
        await asyncForEach(billProject.Loads, async (load) => {
            // 그룹
            await asyncForEach(load.Group, async (load) => {
                let reLoad = await Load.findOne({ where: { id: load.id } });
                let wireCase = await WireCase.create({
                    cType: load.cType, cThick: load.cThick, cSimsu: load.cSimsu,
                    cStrandNum: load.cStrandNum, cExternalDiameter: load.cExternalDiameter, cCrossSection: load.cCrossSection,
                    gwType: load.gwType, gwThick: load.gwThick, gwExternalDiameter: load.gwExternalDiameter, gwCrossSection: load.gwCrossSection,
                    sumCS: load.sumCS, permCS: load.permCS, needCS: load.needCS, wcInnerDiameter: load.wcInnerDiameter, wcVal: load.wcVal,
                })
                await reLoad.setWireCase(wireCase);

                // 전동기부하
                await asyncForEach(load.MotorLoad, async (load) => {
                    let reLoad = await Load.findOne({ where: { id: load.id } });
                    let wireCase = await WireCase.create({
                        cType: load.cType, cThick: load.cThick, cSimsu: load.cSimsu,
                        cStrandNum: load.cStrandNum, cExternalDiameter: load.cExternalDiameter, cCrossSection: load.cCrossSection,
                        gwType: load.gwType, gwThick: load.gwThick, gwExternalDiameter: load.gwExternalDiameter, gwCrossSection: load.gwCrossSection,
                        sumCS: load.sumCS, permCS: load.permCS, needCS: load.needCS, wcInnerDiameter: load.wcInnerDiameter, wcVal: load.wcVal,
                    })
                    await reLoad.setWireCase(wireCase);
                });
                // 일반부하(분전반)
                await asyncForEach(load.NormalSum, async (load) => {
                    let reLoad = await Load.findOne({ where: { id: load.id } });
                    let wireCase = await WireCase.create({
                        cType: load.cType, cThick: load.cThick, cSimsu: load.cSimsu,
                        cStrandNum: load.cStrandNum, cExternalDiameter: load.cExternalDiameter, cCrossSection: load.cCrossSection,
                        gwType: load.gwType, gwThick: load.gwThick, gwExternalDiameter: load.gwExternalDiameter, gwCrossSection: load.gwCrossSection,
                        sumCS: load.sumCS, permCS: load.permCS, needCS: load.needCS, wcInnerDiameter: load.wcInnerDiameter, wcVal: load.wcVal,
                    })
                    await reLoad.setWireCase(wireCase);
                });
            });
        });

        // 트레이 계산 데이터 준비
        let resBillProject = await BillProject.findOne({
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
                            attributes: ['id', 'type', 'name', 'thisType'],
                            include: [
                                {
                                    model: WireCase,
                                    attributes: [
                                        'cType', 'cThick', 'cSimsu', 'cStrandNum', 'cExternalDiameter', 'cCrossSection',
                                        'gwType', 'gwThick', 'gwExternalDiameter', 'gwCrossSection', 'sumCS'
                                    ]
                                },
                                {
                                    model: Load,
                                    as: 'MotorLoad',
                                    foreignKey: 'groupMotor_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType'],
                                    include: [
                                        {
                                            model: WireCase,
                                            attributes: [
                                                'cType', 'cThick', 'cSimsu', 'cStrandNum', 'cExternalDiameter', 'cCrossSection',
                                                'gwType', 'gwThick', 'gwExternalDiameter', 'gwCrossSection', 'sumCS'
                                            ]
                                        }
                                    ]
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType'],
                                    include: [
                                        {
                                            model: WireCase,
                                            attributes: [
                                                'cType', 'cThick', 'cSimsu', 'cStrandNum', 'cExternalDiameter', 'cCrossSection',
                                                'gwType', 'gwThick', 'gwExternalDiameter', 'gwCrossSection', 'sumCS'
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        let payLoad = { billProject: resBillProject };
        response(res, 201, "전선관 생성 성공 ^^", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;