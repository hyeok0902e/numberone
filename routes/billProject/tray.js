const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Tray } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/tray
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

        await asyncForEach(billProject.Loads, async (load) => {
            await asyncForEach(load.Group, async (load) => {
                let reLoad = await Load.findOne({ where: { id: load.id } });
                let tray = await Tray.create({
                    sum: load.sum, convertVal: load.convertVal, taryVal: load.taryVal,
                })
                await reLoad.setTray(tray);
            });
        });

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
                                    model: Load,
                                    as: 'MotorLoad',
                                    foreignKey: 'groupMotor_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'pisangValA', 'pisangValB', 'taskWay'],
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'pisangValA', 'pisangValB', 'taskWay'],
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        let payLoad = { billProject: resBillProject };
        response(res, 201, "트레이 데이터 생성 성공!", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;