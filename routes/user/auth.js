const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

// 모델 import
const { User, UserPick, UserAuth, Address } = require('../../models'); // address 추가 필요

// 커스텀 미들웨어
const { exUser, verifyToken, verifyUid, asyncForEach } = require('../middlewares/main');
const { response } = require('../middlewares/response');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();


// 프로필 사진 업로드 - S3
router.post('/imgUpload', uploadImg.single('image'), (req, res) => {
    try {
        if (!req.file) {
            response(res, 400, "이미지가 첨부되지 않았습니다.");
        } else {
            let payLoad = { profileUrl: req.file.location };
            response(res, 201, "프로필 등록 성공", payLoad);
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});


// 토큰 재발급 
router.post('/token', async (req, res, next) => {
    try {   
        const { user_id, uuid } = req.body;

        // 데이터 유효성 체크
        if (!user_id) { response(res, 400, "로그인이 필요합니다."); return; }
        if (!uuid) { response(res, 400, "실패 - 사용자의 세션정보 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ where: { id: user_id } });

        // uuid 정보가 일치하면, 토큰 업데이트
        if (user.uuid == uuid) {
            // uuid 갱신
            const uuidNew = await uuidv4();
            // 사용자 uuid 값 업데이트
            await User.update({ uuid: uuidNew }, { where: { id: user_id } })

            // 토큰 갱신
            const token = await jwt.sign({
                user_id: user.id, 
                email: user.email,
                uuid: uuidNew,
            }, process.env.JWT_SECRET,{
                expiresIn: '30m',
                issuer: 'tlcompany',
            });

            let payLoad = { user_id, uuid: uuidNew, token }
            response(res, 200, "토큰 및 uuid를 업데이트 하였습니다.", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }  
});

// 회원가입
router.post('/signUp', async (req, res, next) => {
    // /* 사용자 정보 */
    // email, password, password2, // 이메일, 비밀번호
    // fbUID, fbFCM, // Firebase UID & FCM Token
    // name, birth, gender, phone, task, // 이름, 생일, 성, 휴대폰, 직종
    // company, companyTel, fax, profile, // 회사명, 회사번호, 팩스, 프로필사진
    // level, productAuth, marketAuth, // 회원등급, 제품등록 권한, 시세정보등록 권한 
    // userPicks, 

    // /* 사용자 주소 정보 */
    // jibunAddr, roadFullAddr, roadAddrPart1, roadAddrPart2,
    // engAddr, zipNo, siNm, sggNm, emdNm, liNm, rn, lnbrMnnm, lnbrSlno, detail,
    const { newUser } = req.body;

    try {
        // 데이터 체크
        if (!newUser) { response(res, 400, "서버 에러"); return; }
        // 비밀번호 체크
        if (newUser.info.password != newUser.info.password2) { response(res, 400, "비밀번호가 일치하지 않습니다."); return; }
        // 이메일 중복체크
        const exUser = await User.findOne({ where: { email: newUser.info.email } });
        if (exUser) { response(res, "400", "중복된 이메일 입니다."); return; }
        // 관심목록 입력 여부 체크
        if ((!newUser.info.userPicks) || (newUser.info.userPicks == [])) { response(res, 400, '관심품목을 선택해 주세요.'); return; } 

        // 주소 데이터 체크
        if (!newUser.address) { response(res, 400, "주소를 입력해 주세요."); return; }
        // 비밀번호 암호화
        const hash = await bcrypt.hash(newUser.info.password, 12); 
        // User 생성
        const user = await User.create({
            email: newUser.info.email, password: hash, // 이메일, 비밀번호
            fbUID: newUser.info.fbUID, fbFCM: newUser.info.fbFCM, // Firebase UID & FCM Token
            // 이름, 생일, 성, 휴대폰, 직종 / birth는 수정 필요
            name: newUser.info.name, birth: Date.now(), gender: newUser.info.gender, phone: newUser.info.phone, task: newUser.info.task, 
            // 회사명, 회사번호, 팩스, 프로필사진
            company: newUser.info.company, companyTel: newUser.info.companyTel, fax: newUser.info.fax, profile: newUser.info.profile, 
            // 회원등급, 제품등록 권한, 시세정보등록 권한
            // level, productAuth, marketAuth  
        }); 
        // UserPick 생성
        await asyncForEach(newUser.info.userPicks, async (up) => {
            let userPick = await UserPick.create({ name: up });
            await user.addUserPick(userPick);
        });
        // 권한 생성
        const userAuth = await UserAuth.create({ period: 0 });
        await user.setUserAuth(userAuth); // hasOne

        // 주소 생성 코드 작성 필요!
        const address = await Address.create({ 
            jibunAddr: newUser.address.jibunAddr, roadFullAddr: newUser.address.roadFullAddr, 
            roadAddrPart1: newUser.address.roadAddrPart1, roadAddrPart2: newUser.address.roadAddrPart2,
            engAddr: newUser.address.engAddr, zipNo: newUser.address.zipNo, 
            siNm: newUser.address.siNm, sggNm: newUser.address.sggNm, 
            emdNm: newUser.address.emdNm, liNm: newUser.address.liNm, rn: newUser.address.rn,
            lnbrMnnm: newUser.address.lnbrMnnm, lnbrSlno: newUser.address.lnbrSlno, 
            detail: newUser.address.detail
        });
        await user.setAddress(address)

        response(res, 201, "회원가입을 완료하였습니다.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 이메일 중복체크
router.get('/doublCheckEmail', async (req, res, next) => {  
    try {
        const { email } = req.query;

        const user = await User.findOne({ where: { email: email }});
        console.log(user);
        if (user) {
            response(res, 400, "이미 존재하는 이메일 입니다.");
        } else {
            response(res, 200, "사용 가능한 이메일 입니다.");           
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
            let user = await User.findOne({ where: { email: email } });
            
            // 이메일 존재 여부 체크
            if (!user) { response(res, 400, "잘못된 이메일 입니다."); return; }

            // 비번 일치 여부 체크
            const result = await bcrypt.compare(password, user.password);
            if (!result) { response(res, 400, "잘못된 비밀번호 입니다."); return; }

            // uuid 업데이트
            const uuidNew = await uuidv4();
            await User.update({ uuid: uuidNew }, { where: { id: user.id } });
            // 업데이트된 유저정보 다시 한 번 가져오기

            // 보안 이슈를 위한 jwt 토큰 생성
            const token = await jwt.sign({
                user_id: user.id, 
                email: user.email,
                uuid: uuidNew,
            }, process.env.JWT_SECRET,{
                expiresIn: '60m', // 나중에 30m으로 변경
                issuer: 'tlcompany',
            });
               
            user = await User.findOne({ where: { email: email } });

            let payLoad = {
                user_id: user.id,
                uuid: uuidNew,
                token, 
                name: user.name,
                email: user.email,
                profile: user.profile,
                birth: user.birth,
                gender: user.gender,
                level: user.level,   
            };
            response(res, 200, "로그인에 성공하였습니다.", payLoad);
     
        } else {
            response(res, 400, "값을 입력해 주세요.");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 로그아웃
router.get('/signOut', verifyToken, async (req, res, next) => {
    try {
        // 로그인 체크
        if (!req.decoded) { responser(res, 400, "로그인이 필요합니다."); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

        response(res, 200, "로그아웃 성공 - 세션에 저장된 사용자 정보 및 토큰 삭제");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;