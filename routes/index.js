const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const { User, UserPick, Attendance } = require('../models'); // address 추가 필요

const router = express.Router();

router.get('/', (req, res, next) => {
    const { val } = req.body;
    if (val == 'hyeoke') {
        return res.status(200).json({
            resultCode: 200,
            resultMessage: {
                title: '성공',
                message: '테스트 입니다.',
            },
            payLoad: {
                key1: 'text',
                key2: 'text2',
            }
        });
    }
});

router.post('/create', async (req, res, next) => {
    const { 
        email, password, // 이메일, 비밀번호
        fbUID, fbFCM, // Firebase UID & FCM Token
        name, birth, gender, phone, task, // 이름, 생일, 성, 휴대폰, 직종
        company, companyTel, fax, profile, // 회사명, 회사번호, 팩스, 프로필사진
        level, // 회원등급
        productAuth, productAuthPeriod, // 제품등록 권한 & 기간
        marketAuth, marketAuthPeriod // 시세정보등록 권한 & 기간
    } = req.body;
    console.log(req.body);

    try {
        // test code
  
            const hash = await bcrypt.hash(password, 12); // 비밀번호 암호화
            
            // User 생성
            const user = await User.create({
                email, password: hash, // 이메일, 비밀번호
                fbUID, fbFCM, // Firebase UID & FCM Token
                name, birth: Date.now(), gender, phone, task, // 이름, 생일, 성, 휴대폰, 직종
                company, companyTel, fax, profile, // 회사명, 회사번호, 팩스, 프로필사진
                level, // 회원등급
                productAuth, productAuthPeriod, // 제품등록 권한 & 기간
                marketAuth, marketAuthPeriod // 시세정보등록 권한 & 기간
            }) 

            res.status(201).json({
                resultCode: 201,
                resultMessage: {
                    title: "작성됨",
                    message: "성공적으로 요청되었으며 서버가 새 리소스를 작성했습니다."
                },
                payLoad: {
                    user
                },
            });
    
    } catch (err) {
        res.status(400).json({
            resultCode: 400,
            resultMessage: {
                title: "잘못된 요청",
                message: "서버가 요청의 구문을 인식하지 못했습니다."
            },
            payLoad: {},
        });
    }
});

router.post('/attendance', (req, res, next) => {

});


module.exports = router;