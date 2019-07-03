const express = require('express');

// 모델 import
// const {  Material } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');


const router = express.Router();

//구인목록 조회
router.get('/hire', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})
//구인 삭제
router.delete('/hire/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구인목록 상세
router.get('/hire/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구직목록 조회
router.get('/seek', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구직목록 삭제
router.delete('/seek/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구직목록 상세
router.get('/seek/:id', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})











module.exports = router;