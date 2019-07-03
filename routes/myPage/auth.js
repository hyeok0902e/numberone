const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

// 모델 import
const { User, UserPick, UserAuth, Address } = require('../../models'); // address 추가 필요

// 커스텀 미들웨어
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { response } = require('../middlewares/response');
const { uploadImg_profile } = require('../middlewares/uploadImg');

const router = express.Router();

// 프로필 사진 업로드 - S3
router.post('/imgUpload', uploadImg_profile.single('image'), (req, res) => {
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

// 수정 페이지
router.get('/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { id: req.decoded.user_id },
            attributes: {
                exclude: ['password', 'uuid', 'fbUID', 'fbFCM', 'marketAuth', 'marketAuthPeriod', 'productAuth', 'productAuthPeriod'],
            },
            include: [
                { 
                    model: UserPick,
                },
                {
                    model: Address,
                }
            ] 
        })

        let payLoad = { user };
        response(res, 200, "회원정보 수정 페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { editUser } = req.body;
        if (!editUser) { response(res, 400, "데이터 없음"); }

        let user = await User.findOne({ where: { id: req.decoded.user_id } });

        await User.update(
            {   
                // 이름, 생일, 성, 휴대폰, 직종 / birth는 수정 필요
                name: editUser.info.name, birth: Date.now(), gender: editUser.info.gender, phone: editUser.info.phone, task: editUser.info.task, 
                // 회사명, 회사번호, 팩스, 프로필사진
                company: editUser.info.company, companyTel: editUser.info.companyTel, fax: editUser.info.fax, profile: editUser.info.profile, 
            },
            { where: { id: req.decoded.user_id } }
        )
        
        let userPicks = await UserPick.findAll({ where: { id: req.decoded.user_id } });
        // 기존 UserPick 삭제 후 재생성
        await asyncForEach(userPicks, async (up) => {
            // await UserPick.destroy({ where: { id: up.id } });
            await up.destroy();
        })
        await asyncForEach(editUser.info.userPicks, async (up) => {
            let userPick = await UserPick.create({ name: up });
            await user.addUserPick(userPick);
        });

        // 주소 정보 업데이트
        await Address.update(
            { 
                jibunAddr: editUser.address.jibunAddr, roadFullAddr: editUser.address.roadFullAddr, 
                roadAddrPart1: editUser.address.roadAddrPart1, roadAddrPart2: editUser.address.roadAddrPart2,
                engAddr: editUser.address.engAddr, zipNo: editUser.address.zipNo, 
                siNm: editUser.address.siNm, sggNm: editUser.address.sggNm, 
                emdNm: editUser.address.emdNm, liNm: editUser.address.liNm, rn: editUser.address.rn,
                lnbrMnnm: editUser.address.lnbrMnnm, lnbrSlno: editUser.address.lnbrSlno, 
                detail: editUser.address.detail
            },
            { where: { id: req.decoded.user_id } }
        );
        
        user = await User.findOne({
            where: { id: req.decoded.user_id },
            attributes: {
                exclude: ['password', 'uuid', 'fbUID', 'fbFCM', 'marketAuth', 'marketAuthPeriod', 'productAuth', 'productAuthPeriod'],
            },
            include: [
                { 
                    model: UserPick,
                },
                {
                    model: Address,
                }
            ] 
        });

        let payLoad = { user }
        response(res, 200, "회원정보 수정 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 회원 탈퇴
router.delete('/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        await User.destroy({ where: { id: req.decoded.user_id } });
        response(res, 200, "회원정보를 삭제하였습니다. 로그아웃 시켜주세요.");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;