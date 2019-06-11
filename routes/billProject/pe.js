const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, BankPE_High, MainPE_High, PE_Low } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

// /bill/pe
const router = express.Router();

// 수전설비 생성 - 고압수전
router.post('/high/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject_id, peHigh } = req.body

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!billProject_id) { response(res, 400, "데이터 없음"); return; }
        // 입력값 체크
        if (!peHigh || (peHigh == [])) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 존재여부 체크
        let billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서가 존재하지 않습니다."); return; }
        // 접근 권한 체크
        if (billProject.user_id != user.id) { response(res, 401, "권한 없음"); }

        // 전체 수전설비 생성
        const mainPE = await MainPE_High.create({
            assSangAmpe: peHigh.assSangAmpe, assJiracAmpe: peHigh.assJiracAmpe,
            firstAmpe: peHigh.firstAmpe, 
            firstCT125: peHigh.firstCT125, firstCT15: peHigh.firstCT15,
            mofCT: peHigh.mofCT, mofMangi: peHigh.mofMangi,
            pfTrans: peHigh.pfTrans, pfNonTrans: peHigh.pfNonTrans,
        });
        await billProject.setMainPE_High(mainPE);

        // 뱅크부 수전설비 생성
        await asyncForEach(peHigh.bank, async (bank) => {
            let bankPE = await BankPE_High.create({
                pfTrans: bank.pfTrans, pfNonTrans: bank.pfNonTrans,
                secAmpe: bank.secAmpe, secCT125: bank.secCT125, secCT15: bank.secCT15,
                secBreakerCal: bank.secBreakerCal, secBreakerAT: bank.secBreakerAT,
            });
            let reBank = await Load.findOne({ where: { id: bank.bank_id, type: 0 } });
            await reBank.setBankPE_High(bankPE);
        });

        let payLoad = { peHigh }
        response(res, 201, "성공임?", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수전설비 생성 - 저압수전
router.post('/low/create', verifyToken, async (req, res, next) => {
    try {
        const { billProject_id, peLow } = req.body;
        console.log(2);
        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!billProject_id) { response(res, 400, "데이터 없음"); return; }
        // 입력값 체크
        if (!peLow || (peLow == [])) { response(res, 400, "값을 입력해 주세요."); return; }
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) { response(res, 404, "사용자가 존재하지 않습니다."); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id }, include: [{ model: UserAuth }] });
        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) { response(res, 400, "중복 로그인"); return; }
        // 계산서 권한 체크
        if (!(await billAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 계산서 존재여부 체크
        let billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서가 존재하지 않습니다."); return; }
        // 접근 권한 체크
        if (billProject.user_id != user.id) { response(res, 401, "권한 없음"); }

        // 전체 수전설비 생성
        const mainPE = await PE_Low.create({
            meterCapa: peLow.meterCapa, meterCTCapa: peLow.meterCTCapa,
            meterCase: peLow.meterCase,
            firstAmpe: peLow.firstAmpe,
            firstCT125: peLow.firstCT125, firstCT15: peLow.firstCT15,
            secBreakerCal: peLow.secBreakerCal, secBreakerAT: peLow.secBreakerAT,
        });
        await billProject.setPE_Low(mainPE);

        let payLoad = { peLow };
        response(res, 201, "수전설비 저압용 생성성공?", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;