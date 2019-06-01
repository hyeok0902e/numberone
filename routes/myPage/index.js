const express = require('express');

// 모델 import
const { User, Address } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();



module.exports = router;