const express = require('express');

// 모델 import
const { User, Address, UserAuth, Transformer } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 변압기(고압용만) 생성
router.post('/create', async (req, res, next) => {
    try {
        const { 
            user_id, bank_id,
            volt, output, impedance, taskWay, taskKva, taskCoef,
            impowerLate, taskPowerlate, voltDrop, excessLate,
            secP1, secQ1, secP2, secQ2, secPs, 
            firstVal, secVal, userval, voltDropVal,
        } = req.body;

        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!bank_id) { response(res, 400, "뱅크 없음"); return; }

        // 입력값 체크
        if (!firstVal || !secVal || !voltDropVal) {
            response(res, 400, "입력값 없음");
            return;
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
        if (!(billAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }

        // 뱅크 존재여부 체크
        const bank = await Load.findOne({ where: { id: bank_id, type: 0 } });
        if (!bank) { response(res, 404, "뱅크 없음"); return; }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: bank.billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }
        
        // 고압수전 체크
        if (billProject.voltType != 0) {
            response(res, 400, "변압기 등록 불가");
            return;
        }

        // 접근 권한 체크 
        if (billProject.user_id == user_id) {
            const transformer = await Transformer.create({ 
                volt, output, impedance, taskWay, taskKva, taskCoef,
                impowerLate, taskPowerlate, voltDrop, excessLate,
                secP1, secQ1, secP2, secQ2, secPs, 
                firstVal, secVal, userval, voltDropVal,
            });  
            await bank.addTransformer(transformer);
            
            let payLoad = { transformer };
            response(res, 201, "벼안기 생성", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;