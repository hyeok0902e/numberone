const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

// 모델 import
const { User, Announcement } = require('../../models'); // address 추가 필요

// 커스텀 미들웨어
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { response } = require('../middlewares/response');

const router = express.Router();

// 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const notices = await Announcement.findAll({
            order: [['id', 'DESC']],
        });

        let payLoad = { notices };
        response(res, 200, "공지 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세 페이지
router.get('/:announcement_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { announcement_id } = req.params;
        if (!announcement_id) { response(res, 400, "params값 없음"); return; }

        const announcement = await Announcement.findOne({ where: { id: announcement_id } });
        if (!announcement) { response(res, 404, "공지글이 존재하지 않습니다."); return; }

        let payLoad = { announcement };
        response(res, 200, "공지사항 상세페이지", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;