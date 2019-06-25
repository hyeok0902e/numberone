const express = require('express');

// 모델 import
// const {  Material } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');


const router = express.Router();

router.post('/', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
       
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})











module.exports = router;