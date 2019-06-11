const express = require('express');

// 모델 import
const { BillProject, Load, User, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 일반부하(분전반) 생성
router.post('/create', verifyToken, async (req, res, next) => {
    try {
        const { 
            normalSum_id,
            name, output, sangSang, sangDiv,
            volt, powerLate, impowerLate, efficiency, demandLate,
            taskWay, using,
            ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
        } = req.body

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        // 데이터 체크
        if (!normalSum_id) { response(res, 400, "데이터 없음"); return; }

        // 입력값 체크
        if (!name || !sangSang || !sangDiv || !output || !volt || !ampeRealA 
            || !ampeRealB || !pisangValA || !pisangValB) { 
            response(res, 400, "값을 제대로 입력해 주세요."); 
        }

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

        // 부모 분전반 존재여부 체크
        const normalSum = await Load.findOne({ where: { id: normalSum_id, type: 3 } });
        if (!normalSum) { response(res, 404, "부모 분전반이 존재하지 않습니다."); return; }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: normalSum.billProject_id } });
        if( !billProject) { response(res, 404, "계산서가 존재하지 않습니다."); return; }

        // 권한 체크
        if (billProject.user_id != user.id) {
            response(res, 401, "권한 없음");
            return;
        }

        // 일반부하(분전반) 생성
        const normalLoad = await Load.create({ 
            type: 4, name, output, sangSang, sangDiv,
            volt, powerLate, impowerLate, efficiency, demandLate,
            taskWay, using,
            ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
        });
        // 부하 관계 추가
        await normalSum.addNormalLoad(normalLoad);
        await billProject.addLoad(normalLoad);

        let payLoad = { normalLoad };
        response(res, 201, "분전반이 생성되었습니다.", payLoad);    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 일반부하(분전반) 생성
router.post('/createEnd', verifyToken, async(req, res, next) => {
    try {
        const { 
            normalSum_id,
            name, output, sangSang, sangDiv,
            volt, powerLate, impowerLate, efficiency, demandLate,
            taskWay, using,
            ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
        } = req.body

        // 로그인 체크
        if (!req.decoded.user_id) { response(res, 400, "로그인이 필요합니다."); return; }

        // 데이터 체크
        if (!normalSum_id) { response(res, 400, "데이터 없음"); return; }

        // 입력값 체크
        if (!name || !sangSang || !sangDiv || !output || !volt || !ampeRealA 
            || !ampeRealB || !pisangValA || !pisangValB) { 
            response(res, 400, "값을 제대로 입력해 주세요."); 
        }

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

        // 부모 분전반 존재여부 체크
        let normalSum = await Load.findOne({ where: { id: normalSum_id, type: 3 } });
        if (!normalSum) { response(res, 404, "부모 분전반이 존재하지 않습니다."); return; }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: normalSum.billProject_id } });
        if( !billProject) { response(res, 404, "계산서가 존재하지 않습니다."); return; }

        // 권한 체크
        if (billProject.user_id != user.id) {
            response(res, 401, "권한 없음");
            return;
        }

        // 일반부하(분전반) 생성
        const normalLoad = await Load.create({ 
            type: 4, name, output, sangSang, sangDiv,
            volt, powerLate, impowerLate, efficiency, demandLate,
            taskWay, using,
            ampeA, ampeRealA,  ampeB, ampeRealB, pisangValA, pisangValB 
        });
        // 부하 관계 추가
        await normalSum.addNormalLoad(normalLoad);
        await billProject.addLoad(normalLoad);


        //////////////////////////
        // 부모 분전반 데이터 업데이트 //
        //////////////////////////

        const normalLoads = await normalSum.getNormalLoad();

        // 1차 업데이트 변수 초기화
        let sumOutput = 0;
        let reVolt = 0;
        let rePowerLate = 0;
        let reImpowerLate = 0;
        let reEfficiency = 0;
        let reDemandLate = 0;

        for (i = 0; i < normalLoads.length; i++) {
            // 전압 업데이트
            if (reVolt < normalLoads[i]['volt']) {
                reVolt = normalLoads[i].volt;
            }
            // 나머지 값 업데이트
            sumOutput += normalLoads[i].output;
            rePowerLate += normalLoads[i].powerLate;
            reImpowerLate += normalLoads[i].impowerLate;
            reEfficiency += normalLoads[i].efficiency;
            reDemandLate += normalLoads[i].demandLate;
        }
        // 값 없데이트
        rePowerLate = rePowerLate / normalLoads.length;
        reImpowerLate = reImpowerLate / normalLoads.length;
        reEfficiency = reEfficiency / normalLoads.length;
        reDemandLate = reDemandLate / normalLoads.length;

        // 전압 업데이트 2  => 1상2상일 땐 220V
        if (normalSum.sangSang == 1) { reVolt = 220; }
        
        //// 1차 업데이트 - 출력, 피상분a, 전압, 역률, 개선역률, 효율, 수용률, 기동방식 ////
        await Load.update(
            { 
                volt: reVolt, output: sumOutput,
                powerLate: rePowerLate, impowerLate: reImpowerLate, 
                efficiency: reEfficiency, demandLate: reDemandLate,
                taskWay: "일반부하"
            },
            { where : { id: normalSum_id } }
        ) 
        
        normalSum = await Load.findOne({ where: { id: normalSum_id, type: 3 } });
       
        // 2차 업데이트 변수 초기화
        let reAmpeA = 0;
        let reAmpeRealA = 0;
        let reAmpeB = 0;
        let reAmpeRealB = 0;
        let rePisangValA = 0;
        let rePisangValB = 0;
        let reUsing = 0;

        // 상용/예비에 따라 realAmpe 값이 달라짐
        if (normalSum.using == true) { reUsing = 1 }

        // 전류값 계산 - ampeA/B, ampeRealA/B
        let check = 0 ;
        if (normalSum.sangSang == 3) { // 3상일 때
            check = (Math.sqrt(3) * reVolt * rePowerLate * reEfficiency) * 1000;
            if (check != 0) {
                reAmpeA = sumOutput / (Math.sqrt(3) * reVolt * rePowerLate * reEfficiency) * 1000;
                reAmpeB = sumOutput / (Math.sqrt(3) * reVolt * reImpowerLate * reEfficiency) * 1000;
            } else {
                reAmpeA = 0;
                reAmpeB = 0;
            }
            check = (Math.sqrt(3) * reVolt * rePowerLate * reEfficiency) * 1000 * reUsing;
            if ( check != 0) {
                reAmpeRealA = sumOutput / (Math.sqrt(3) * reVolt * rePowerLate * reEfficiency) * 1000 * reUsing;
                reAmpeRealB = sumOutput / (Math.sqrt(3) * reVolt * reImpowerLate * reEfficiency) * 1000 * reUsing;
            } else {
                reAmpeRealA = 0;
                reAmpeRealB = 0;
            }    
        } else { // 1상일 때       
            check = (reVolt * rePowerLate * reEfficiency) * 1000;
            if (check != 0) {
                reAmpeA = sumOutput / (reVolt * rePowerLate * reEfficiency) * 1000;  
                reAmpeB = sumOutput / (reVolt * reImpowerLate * reEfficiency) * 1000; 
            } else {
                reAmpeA = 0;
                reAmpeB = 0;
            }
            check = (reVolt * rePowerLate * reEfficiency) * 1000 * reUsing;;
            if (check != 0) {
                reAmpeRealA = sumOutput / (reVolt * rePowerLate * reEfficiency) * 1000 * reUsing;
                reAmpeRealB = sumOutput / (reVolt * reImpowerLate * reEfficiency) * 1000 * reUsing;
            } else {
                reAmpeRealA = 0;
                reAmpeRealB = 0;
            }
        }

        // 피상값 계산 - 피상값a, 피상값b
        check = (reImpowerLate * reEfficiency) * reUsing;
        if (check != 0) {
            rePisangValA = sumOutput / (reImpowerLate * reEfficiency) * reUsing;
        } else {
            rePisangValA = 0;
        }
        check = (reImpowerLate * reEfficiency) * reDemandLate * reUsing;
        if (check != 0) {
            rePisangValB = sumOutput / (reImpowerLate * reEfficiency) * reDemandLate * reUsing;
        } else {
            rePisangValB = 0;
        }
         
        //// 2차 업데이트 - 전류 a~b 값, 피상값 ////
        await Load.update(
            { 
                ampeA: reAmpeA, ampeRealA: reAmpeRealA, ampeB: reAmpeB, ampeRealB: reAmpeRealB,
                pisangValA: rePisangValA, pisangValB: rePisangValB
            },
            { where : { id: normalSum_id } }
        )

        normalSum = await Load.findOne({ where: { id: normalSum_id, type: 3 } });

        // 뱅크 및 그룹 response
        const banks = await Load.findAll({ 
            where: { billProject_id: normalSum.billProject_id, type: 0 }, attributes: ['id', 'name'],
            include: [{ model: Load, as: 'Group', attributes: ['id', 'name'] }],
        });

        let payLoad = { banks };
        response(res, 200, "분전반 생성 및 부모 분전반 업데이트 성공", payLoad);
    } catch (err) { 
        console.log(err)
        response(res, 500, "서버 에러");
    }
});

router.get('/test', (req, res, next) => {
    console.log(Math.sqrt(3));
});

module.exports = router;