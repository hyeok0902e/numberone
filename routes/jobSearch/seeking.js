const express = require('express');

// 모델 import
const { 
    User, UserAuth, Seeking, Hiring, Labor, Address
} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken , verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyJobSearchAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 묵록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:seeking_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 참여신청

// 구인 등록
router.post('/create', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정 페이지
router.get('/:seeking_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 수정
router.put('/:seeking_id/edit', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 삭제
router.delete('/:seeking_id/destroy', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;