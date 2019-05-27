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
                await user.addLoad(bank);
                
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

router.get('/test', (req, res, next) => {
    console.log(Date.now());
})
module.exports = router;