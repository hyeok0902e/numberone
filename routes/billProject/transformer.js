const express = require('express');
const Op = require('Sequelize').Op;

// 모델 import
const { User, Address, UserAuth, BillProject, Load, Transformer } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();
// 변압기 생성 페이지
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const { billProject_id } = req.body;
        // 데이터 체크
        if (!billProject_id) { response(res, 400, "데이터 없음"); return; }
        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "유저 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 존재여부 체크
        let billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }
        // 고압수전 체크
        if (billProject.voltType != 0) { response(res, 400, "변압기 등록 불가"); eturn; }

        const bank = await Load.findAll({
            where: { billProject_id, type: 0 },
            attributes: ['id', 'name']
        });
        let payLoad = { billProject_id, bank };
        response(res, 200, "변압기 등록 페이지 입니다.", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 변압기(고압용만) 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject } = req.body;

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 입력값 체크
        if (!billProject) { response(res, 400, "값은 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "유저 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }], });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(billAuth(user))) { response(res, 401, "권한 없음"); return; }    
        // 고압수전 체크
        if (billProject.voltType != 0) { response(res, 400, "변압기 등록 불가"); eturn; }
 

        let transformerKva = 0;
        // 변압기 생성
        await asyncForEach(billProject.Loads, async (transformer) => {
            let bank = await Load.findOne({ where: { id: transformer.id, type: 0 } });

            // 이미 변압기가 설정되었는지 체크
            let checkTransformer = await bank.getTransformer();
            // if (checkTransformer) { response(res, 400, "이미 변압기가 설정되어 있습니다."); return; }
            
            let reTransformer = await Transformer.create({
                volt: transformer.volt, output: transformer.output, impedance: transformer.impedance, 
                taskWay: transformer.taskWay, taskKva: transformer.taskKva, taskCoef: transformer.taskCoef,
                impowerLate: transformer.impowerLate, taskPowerlate: transformer.taskPowerlate, 
                voltDrop: transformer.voltDrop, excessLate: transformer.excessLate,
                secP1: transformer.secP1, secQ1: transformer.secQ1, 
                secP2: transformer.secP2, secQ2: transformer.secQ2, 
                secPs: transformer.secPs, 
                firstVal: transformer.firstVal, secVal: transformer.secVal, 
                userVal: transformer.userVal, voltDropVal: transformer.voltDropVal
            });
            transformerKva += transformer.userVal;
            await bank.setTransformer(reTransformer); // 1:1 관계

            // 차단기 계산 시 사용할 뱅크의 전류b` 값 계산 및 업데이트
            let bankAmpeB = transformer.userVal / (Math.sqrt(3) * bank.volt / 1000) * 1.2;
            if (bankAmpeB == Infinity) { bankAmpeB = 0; }
            if (transformer.userVal = 0) { bankAmpeB = 0; }
            await Load.update({ ampeB: bankAmpeB }, { where: { id: bank.id, type: 0 } });
        });
        
        // 프로젝트 DB에 변압기 전체 용량 저장
        await BillProject.update({ transformerKva, volt: 22900, step: "transformer" }, { where: { id: billProject.id } });

        // 데이터 준비 => 계약전력
        let resBillProject = await BillProject.findOne({
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name', 'step'],
            include: [
                {
                    model: Load,
                    where: { type: 0 },
                    order: [['id', 'ASC']],
                    attributes: ['id', 'type', 'name', 'thisType'],
                    include: [
                        {
                            model: Transformer,
                            attributes: ['userVal']
                        },
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
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'using' ],
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'using' ],              
                                },
                            ]
                        },
                    ]
                }
            ]
        });
        let payLoad = { billProject: resBillProject };

        response(res, 201, "변압기 데이터 생성 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;