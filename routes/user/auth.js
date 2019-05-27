const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈

// 모델 import
const { User, UserPick, Attendance } = require('../../models'); // address 추가 필요

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser } = require('../middlewares/exUser'); // user 존재여부 확인

const router = express.Router();

// 회원가입
router.post('/signUp', async (req, res, next) => {
    const { 
        email, password, password2, // 이메일, 비밀번호
        fbUID, fbFCM, // Firebase UID & FCM Token
        name, birth, gender, phone, task, // 이름, 생일, 성, 휴대폰, 직종
        company, companyTel, fax, profile, // 회사명, 회사번호, 팩스, 프로필사진
        level, productAuth, marketAuth, // 회원등급, 제품등록 권한, 시세정보등록 권한 
        userPicks, 
    } = req.body;

    try {
        if (email && password && password2 && name && birth && gender 
            && phone && task && company && companyTel 
            && level && productAuth && marketAuth) { // 반드시 입력받아야 하는 값들
            
            if (password != password2) {
                response(res, 400, "비밀번호가 일치하지 않습니다.");
                return;
            }

            // 관심목록 입력 여부 체크
            if ((!userPicks) || (userPicks == [])) {
                response(res, 400, '관심품목을 선택해 주세요.');
                return;
            } 

            // 주소를 입력하지 않았을 때 response 작성 필요!
            // if (!address) {
            //     response(res, 400, "주소를 입력해 주세요.");
            //     return;
            // }

            // 비밀번호 암호화
            const hash = await bcrypt.hash(password, 12); 
            
            // User 생성
            const user = await User.create({
                email, password: hash, // 이메일, 비밀번호
                fbUID, fbFCM, // Firebase UID & FCM Token
                name, birth: Date.now(), gender, phone, task, // 이름, 생일, 성, 휴대폰, 직종
                company, companyTel, fax, profile, // 회사명, 회사번호, 팩스, 프로필사진
                level, productAuth, marketAuth // 회원등급, 제품등록 권한, 시세정보등록 권한 
            }); 

            // UserPick 생성
            userPicks.forEach(async (up) => {
                let userPick = await UserPick.create({ name: up });
                await user.addUserPick(userPick);
            });
            
            // 주소 생성 코드 작성 필요!
            // const address = await Address.create({ });
            // await user.address(address)

            // 응답
            let payLoad = {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile,
                birth: user.birth,
                gender: user.gender,
                level: user.level,
                // address: address.roadFullAddr
            };
            response(res, 201, "회원가입 성공", payLoad);
        } else {
            response(res, 400, "정보를 제대로 입력해주세요.")
        }
    } catch (err) {
        console.log(err)
        response(res, 500, "서버 에러")
    }
});

// 이메일 중복체크
router.get('/doublCheckEmail', async (req, res, next) => {
    const { email } = req.query;
    
    try {
        const user = await User.findOne({ where: { email: email }});
        console.log(user);
        if (user) {
            response(res, 400, "이미 존재하는 이메일입니다.");
        } else {
            response(res, 200, "이메일 중복체크 완료");           
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
})

// 로그인
router.post('/signIn', async (req, res, next) => {
    try {     
        const { email, password } = req.body;

        if (email && password) {
            const user = await User.findOne({ where: { email: email } });
            
            // 이메일 존재 여부 체크
            if (!user) {
                response(res, 400, "존재하지 않는 계정입니다.");
                return;
            }

            // 비번 일치 여부 체크
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                let payLoad = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profile: user.profile,
                    birth: user.birth,
                    gender: user.gender,
                    level: user.level,
                };
                response(res, 200, "로그인 성공", payLoad);
            } else {
                response(res, 400, "비밀번호가 일치하지 않습니다.");
            }
        } else {
            response(res, 400, "아이디 또는 비번을 입력해 주세요.");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 로그아웃
router.get('/signOut', async (req, res) => {
    const { user_id } = req.query;

    try {
        // req 정보에 사용자가 없거나, user_id 값이 없을 때
        if (!user_id) {
            response(res, 400, '로그인된 사용자 없음');
            return;
        }
        
        // 유저 존재여부 체크 및 로그아웃       
        if (await exUser(user_id)) {
            let payLoad = { user_id }
            response(res, 200, "로그아웃 완료" , payLoad); 
        } else { // 유저정보가 올바르지 않을 때
            response(res, 404, "사용자가 존재하지 않습니다.");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;