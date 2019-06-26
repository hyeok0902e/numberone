const express = require('express');

// 모델 import
const { User, UserAuth, FeeProject, Company, PreChange, PreChangeFee} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyFeeAuth } = require('../middlewares/userAuth');

// /fee
const router = express.Router();

module.exports = router;