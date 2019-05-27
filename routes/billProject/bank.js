const express = require('express');
const moment = require('moment');

// 모델 import
const { User, UserAuth, BillProject, Load } = require('../../models');

// 커스텀 미들웨어
const { exUser } = require('../middlewares/main'); 
const { response } = require('../middlewares/response');
const { checkBillAuth } = require('../middlewares/userAuth');

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { user_id, billProject_id, name } = req.body;

        // user_id 혹은 billProject_id가 없을 때
        if (!user_id) { response(res, 404, "로그인 필요"); return; }
        if (!billProject_id) { response(res, 404, "계산서 없음"); return; }
        if (!name) { response(res, 400, "이름을 입력하세요."); return; }
        
        if (await exUser(user_id)) {
            const user = await User.findOne({ 
                where: { id: user_id }, 
                include: [{ model: UserAuth }], 
            });

            if ((await checkBillAuth(user))) {
                const bank = await Load.create({ type: 0, name });
                const billProject = await BillProject.findOne({ where: { id: billProject_id } });
                await billProject.addLoad(bank);
                
                let payLoad = { name: bank.name };
                response(res, 201, "뱅크 생성", payLoad);
            } else {
                response(res, 401, "권한 없음");
                return;
            }
        } else {
            response(res, 404, "유저가 존재하지 않습니다.");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { user_id, load_id, name } = req.body;
        
        // 데이터 유효성 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!load_id) { response(res, 400, "뱅크 정보 없음"); return; }
        if (!name) { response(res, 400, "입력값 없음"); return; }

        if (await exUser(user_id)) {
            await Load.update({ name: name }, { where: { id: load_id } });
            const bank = await Load.findOne({ where: { id: load_id }});
            
            if (!bank) {
                response(res, 404, "뱅크 없음");
                return;
            }
            
            let payLoad = { name: bank.name }
            response(res, 200, "수정완료", payLoad);
        } else {
            response(res, 404, "유저가 존재하지 않습니다.");
        }

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;