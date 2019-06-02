const express = require('express');

// 모델 import
const { BillProject, Load, User, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 일반부하(분전반) 생성
router.post('/create', async (req, res, next) => {
    try {
        const { 
            user_id, group_id,
            name, output, sangSang, sangDiv,
            volt, powerLate, impowerLate, efficiency, demandLate,
            taskWay, using,
            ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
        } = req.body

        // 로그인 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }

        if (!group_id) { response(res, 400, "그룹 없음"); return; }

        // 입력값 체크
        if (!name || !sangSang || !output || !volt || !ampeRealA 
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
        if (billProject.user_id != user.id) {
            response(res, 401, "권한 없음");
            return;
        }

        // 최초등록된 부하 체크 (전동기부하, 전압값-380V)
        const firstLoad = await Load.findAll({ 
            limit: 1, 
            where: { group_id: group.id, type: 2 },
            order: [['createdAt', 'ASC']]
        });
        // 전동기부하가 등록된 그룹일 경우
        // 최초 등록된 전동기부하의 전압(volt)이 380이어야 등록 가능
        if ((firstLoad.length == 0) || (firstLoad[0].volt == 380)) {
            // 일반부하(분전반) 생성
            const normalLoad = await Load.create({ 
                type: 3, name, output, sangSang, sangDiv,
                volt, powerLate, impowerLate, efficiency, demandLate,
                taskWay, using,
                ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
            });
            // 부하 관계 추가
            await group.addMotorLoad(normalLoad);
            await billProject.addLoad(normalLoad);

            let payLoad = { normalLoad };
            response(res, 201, "전동기 부하 생성", payLoad);  
        } else {
            response(res, 400, "일반부하(분전반) 추가 불가")
        }
              
     
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;