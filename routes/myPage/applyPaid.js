const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

// 모델 import
const { User, UserPick, UserAuth, Address } = require('../../models'); // address 추가 필요

// 커스텀 미들웨어
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { response } = require('../middlewares/response');

const router = express.Router();

router.post('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { type } = req.body;
        if (!type) { response(res, 400, "데이터 없음"); return; }

        let levelTxt = "";
        switch (type) {
            case 0:
                levelTxt = "무료회원"
                break;
            case 1:
                levelTxt = "개인회원1"
                break;
            case 2:
                levelTxt = "개인회원2"
                break;
            case 3:
                levelTxt = "개인회원3"
                break;
            case 4:
                levelTxt = "개인회원4"
                break;
            case 5:
                levelTxt = "기업회원"
                break;
            case 7:
                levelTxt = "장터등록회원"
                break;
            case 7:
                levelTxt = "시세등록회원"
                break;
            default: // 등급이 존재하지 않는경우
                response(res, 400, "알 수 없는 등급입니다.");
        }
        let user = User.findOne({ where: { id: req.decoded.user_id } });
        let message = 
            user.name + "(" + user.email + ") 님이 신청한 유료회원 등급은 "
            + "[" + levelTxt + "] 입니다."
            
        // SMS 전송 구현하기
        //
        //
        //
        //
        //
        //

        
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
}); 

module.exports = router;