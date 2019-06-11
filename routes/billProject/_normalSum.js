const express = require('express');

// 모델 import
const { BillProject, Load, User, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 부모 분전반 생성 
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }

        // sangType => 0: 3상4선, 1: 1상2선
        const { group_id, name, sangType } = req.body;

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!group_id) { response(res, 400, "데이터 없음 없음"); return; }
        // 입력값 체크
        if (!name || (name=="")) { response(res, 400, "값을 입력해 주세요."); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }
        
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 중복 로그인 체크
        if(!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        // 계산서 권한 체크
        if (!(await billAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        // 그룹 존재여부 체크
        const group = await Load.findOne({ where: { id: group_id } });
        if (!group) { response(res, 404, "그룹이 존재하지 않습니다."); }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: group.billProject_id } });
        if (!billProject) { response(res, 404, "계산서가 존재하지 않습니다."); }

        // 권한 체크
        if (billProject.user_id != user.id) { 
            response(res, 401, "권한 없음");
            return;
        }

        // 상구분 변수 초기화
        let sangSang = 0;
        let sangDiv = "";
        // 상구분 셋팅
        if (sangType == 0) { // Case1 => 3상4선 
            sangSang = 3;
            sangDiv = 4;
        } else { // Case2 => 1상2선
            sangSang = 1;
            sangDiv = 2;
        }

        // 최초등록된 부하 체크 (전동기부하, 전압값-380V)
        const firstMotorLoad = await Load.findAll({ 
            limit: 1, 
            where: { group_id: group_id, type: 2 },
            order: [['createdAt', 'ASC']]
        });
        // 전동기부하가 등록된 그룹일 경우
        // 최초 등록된 전동기부하의 전압(volt)이 380이어야 등록 가능
        if ((firstMotorLoad.length == 0) || (firstMotorLoad[0].volt == 380)) {
            const normalSum = await Load.create({ 
                name, type: 3, sangSang, sangDiv
            });
            await group.addNormalSum(normalSum);
            await billProject.addLoad(normalSum);

            let payLoad = { normalSum_id: normalSum.id, sangSang, sangDiv }
            response(res, 201, "부모 분전반이 생성되었습니다.", )
        } else {
            response(res, 400, "분전반 등록 불가 - 최초 등록한 전동기 부하 전압이 380V일 때만 가능합니다.");
        }         
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;