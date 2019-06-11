const express = require('express');

// 모델 import
const { User, UserAuth, Statement } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { statementAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 내역서 목록
router.get('/', verifyToken, async (req, res, next) => {
    try {   
        // 로그인 체크
        if (!req.decoded.user_id) { responser(res, 400, "로그인이 필요합니다."); return; }
        
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
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        // 내역서 목록 체크
        const statements = await Statement.findAll({ 
            where: { user_id: user.id }, 
            attributes: ['name', 'contractCost', 'public1', 'public2', 'lastCost'] 
        });
        if (statements.length == 0) { response(res, 404, "목록이 존재하지 않습니다."); return; } 

        let payLoad = { statementAuth };
        response(res, 200, "내역서 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;