const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const moment = require('moment'); // Data formating 모듈

// 모델 import
const { Sequelize, User, UserPick, Attendance, Load } = require('../models/'); // address 추가 필요

// 커스텀 미들웨어
const { response } = require('./middlewares/response');

const router = express.Router();

// for findAll using range
const Op = Sequelize.Op;

// Main(Home)
router.get('/', async (req, res, next) => {
    try {
        const { user_id } = req.query;

        // 금일 날짜
        const today = moment(Date.now()).format('YYYY-MM-DD');

        // 금일 출석 명단 
        const today_attendances = await Attendance.findAll({ 
            where: { date: { [Op.gt]: moment(`${today}`)._d, } },
            include: [{ model: User, attributes: ['id', 'name', 'gender', 'birth'] }],
            order: [['date', 'DESC'],],
        });

        if (user_id) {
            const user = await User.findOne({ 
                where: { id: user_id }, 
                attributes: ['id', 'name', 'gender', 'birth'],
            });

            // 일치하는 유저 정보가 없을 때
            if (!user) {
                let payLoad = { today_attendances };
                response(res, 404, "일치하는 유저 정보 없음", payLoad);  
                return;
            } 

            // 유저가 로그인 되었 있을 때
            let payLoad = { today_attendances, user };
            response(res, 200, "로그인 된 유저 있음", payLoad);
            return;
        }

        response(res, 200, "최초 접속");
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;