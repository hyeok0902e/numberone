const express = require('express');

// 모델 import
const { User, UserAuth, Statement } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { statementAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 내역서 목록
router.get('/', async (req, res, next) => {
    try {   
        const { user_id } = req.query;

        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 내역서 목록 체크
        const statements = await Statement.findAll({ 
            where: { user_id: user.id }, 
            attributes: ['name', 'contractCost', 'public1', 'public2', 'lastCost'] 
        });
        if (statements.length == 0) { response(res, 404, "목록 없음"); return; } 

        let payLoad = { statementAuth };
        response(res, 200, "내역서 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;