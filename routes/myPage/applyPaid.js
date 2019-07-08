const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const axios = require('axios');

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
            user.name + "(" + user.email + ") 님이 신청한 유료회원 신청을 하였습니다. 신청등급은 "
            + "[" + levelTxt + "] 입니다."
            
        // 문자메세지 전송 구현
        await axios.post(
            'https://api-sens.ncloud.com/v1/sms/services/ncp:sms:kr:256360784020:numberone/messages',
            {
                "type":"LMS",
                "contentType":"COMM",
                "countryCode":"82",
                "from":"01090075064",
                "to": ["01090075064"],
                "content": message
            },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'x-ncp-auth-key': 'aknAO0c9oVle5No8A4yC',
                    'X-NCP-service-secret': 'b063dccf18b7426fa692b3405d93481d',         
                }
            }
        ).then((res) => {
            console.log(res);
            response(res, 200, "신청 완료")
        }).catch((err) => {
            console.log(err);
            response(res, 400, "문자 메세지 전송오류");
        });
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
}); 

module.exports = router;