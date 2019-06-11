const express = require('express');

// 모델 import
const { User, Address, UserAuth, BillProject, Load, WireCase } = require('../../models'); 

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { exUser, verifyToken, verifyUid } = require('../middlewares/main');
const { billAuth } = require('../middlewares/userAuth');

const router = express.Router();

module.exports = router;