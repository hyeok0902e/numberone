const express = require('express');

// 모델 import
const { User, Address,UserAuth } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();



module.exports = router;