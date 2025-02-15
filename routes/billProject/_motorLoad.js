const express = require('express');

// 모델 import
const { BillProject, Load, User, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 전동기 부하 생성
router.post('/create', async (req, res, next) => {
    try {
        const { 
            user_id, group_id,
            name, output, hPower, pole,
            sangSang, sangDiv, volt, powerLate, impowerLate,
            efficiency, demandLate, taskWay, using,
            ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
        } = req.body

        // 로그인 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }

        if (!group_id) { response(res, 400, "그룹 없음"); return; }

        // 입력값 체크
        if (!name || !sangSang || !sangDiv || !ampeRealA || !output || !volt
            || !ampeRealB || !pisangValA || !pisangValB) { 
            response(res, 400, "입력값 없음"); 
        }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 계산서 권한 체크
        if (!(await billAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        const group = await Load.findOne({ where: { id: group_id, type: 1 } });
        if (!group) { response(res, 404, "그룹 없음"); return; }

        const billProject = await BillProject.findOne({ where: { id: group.billProject_id } });
        if( !BillProject) { response(res, 404, "프로젝트 없음"); return; }
        
        // 권한 체크
        if (billProject.user_id == user.id) {
            // 전동기 부하 생성
            const motorLoad = await Load.create({ 
                type: 2, name, output, hPower, pole,
                sangSang, sangDiv, volt, powerLate, impowerLate,
                efficiency, demandLate, taskWay, using,
                ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
            });
            // 부하 관계 추가
            await group.addMotorLoad(motorLoad);
            await billProject.addLoad(motorLoad);

            let payLoad = { motorLoad };
            response(res, 201, "전동기 부하 생성", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;