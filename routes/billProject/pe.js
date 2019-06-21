const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, BankPE_High, MainPE_High, PE_Low, Transformer } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/pe
const router = express.Router();

// 수전설비 생성 - 고압수전
router.post('/high/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject} = req.body

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
        // 고압수전 체크
        if (billProject.voltType != 0) { response(res, 400, "전압타입이 맞지 않습니다."); return; }

        const reBillProject = await BillProject.findOne({ where: { id: billProject.id } });

        // 이미 수전설비가 설정되었는지 체크
        let check = await reBillProject.getMainPE_High();
        if (check) { response(res, 400, "이미 수전설비가 설정되어 있습니다."); return; }

        // 전체 수전설비 생성
        const mainPE = await MainPE_High.create({
            assSangAmpe: billProject.mainPe.assSangAmpe, assJiracAmpe: billProject.mainPe.assJiracAmpe,
            firstAmpe: billProject.mainPe.firstAmpe, 
            firstCT125: billProject.mainPe.firstCT125, firstCT15: billProject.mainPe.firstCT15,
            mofCT: billProject.mainPe.mofCT, mofMangi: billProject.mainPe.mofMangi,
            pfTrans: billProject.mainPe.pfTrans, pfNonTrans: billProject.mainPe.pfNonTrans,
        });
        await reBillProject.setMainPE_High(mainPE);

        // 뱅크부 수전설비 생성
        await asyncForEach(billProject.Loads, async (bank) => {
            let reBank = await Load.findOne({ where: { id: bank.id, type: 0 } });

            // 이미 수전설비가 설정되었는지 체크
            let check = await reBank.getBankPE_High();
            if (check) { response(res, 400, "이미 수전설비가 설정되어 있습니다."); return; }
            
            let bankPE = await BankPE_High.create({
                pfTrans: bank.bankPe.pfTrans, pfNonTrans: bank.bankPe.pfNonTrans,
                secAmpe: bank.bankPe.secAmpe, secCT125: bank.bankPe.secCT125, secCT15: bank.bankPe.secCT15,
                secBreakerCal: bank.bankPe.secBreakerCal, secBreakerAT: bank.bankPe.secBreakerAT,
            });
            await reBank.setBankPE_High(bankPE);
        });

        const resBillProject = await BillProject.findOne({ 
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name'],
            include: [
                { 
                    model: Load,
                    order: [['id', 'ASC']],
                    where: { type: 0 },
                    attributes: ['id', 'type', 'name', 'thisType'],
                    include: [
                        { 
                            model: Transformer, 
                            attributes: ['userVal'],
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
                                    order: [['id', 'ASC']],
                                    foreignKey: 'groupMotor_id',
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'powerLate', 'impowerLate']
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    order: [['id', 'ASC']],
                                    foreignKey: 'groupNormal_id',
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'powerLate', 'impowerLate']
                                }
                            ]
                        },
                    ]
                },     
            ]
        })

        let payLoad = { billProject: resBillProject };
        response(res, 201, "수전전압(고압) 생성 성공!", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수전설비 생성 - 저압수전
router.post('/low/create', verifyToken, async (req, res, next) => {
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

        let reBillProject = await BillProject.findOne({ where: { id: billProject.id } });
 
        // 이미 수전설비가 설정되었는지 체크
        let check = await reBillProject.getPE_Low();
        if (check) { response(res, 400, "이미 수전설비가 설정되어 있습니다."); return; }
        
        // 전체 수전설비 생성
        const mainPE = await PE_Low.create({
            meterCapa: billProject.peLow.meterCapa, meterCTCapa: billProject.peLow.meterCTCapa,
            meterCase: billProject.peLow.meterCase,
            firstAmpe: billProject.peLow.firstAmpe,
            firstCT125: billProject.peLow.firstCT125, firstCT15: billProject.peLow.firstCT15,
            secBreakerCal: billProject.peLow.secBreakerCal, secBreakerAT: billProject.peLow.secBreakerAT,
        });
        await reBillProject.setPE_Low(mainPE);
        // 데이터 준비 => 콘덴서(고압/저압)
        
        const resBillProject = await BillProject.findOne({
            where: { id: billProject.id },
            attributes: ['id', 'voltType', 'name'],
            include: [
                {
                    model: Load,
                    where: { type: 0 },
                    order: [['id', 'ASC']],
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
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'powerLate', 'impowerLate']
                                },
                                {
                                    model: Load,
                                    as: 'NormalSum',
                                    foreignKey: 'groupNormal_id',
                                    order: [['id', 'ASC']],
                                    attributes: ['id', 'type', 'name', 'thisType', 'output', 'volt', 'powerLate', 'impowerLate']
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        let payLoad = { billProject: resBillProject };
        response(res, 201, "수전설비(저압) 생성 성공!", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;