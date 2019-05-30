const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const moment = require('moment'); // Data formating 모듈

// 모델 import
const { Sequelize, User, UserPick, Attendance, Load } = require('../models/'); // address 추가 필요

// 커스텀 미들웨어
const { response } = require('./middlewares/response');
const { exUser, verifyToken } = require('./middlewares/main');

const router = express.Router();

// for findAll using range
const Op = Sequelize.Op;

// Main(Home) - 로그인 되어있을 시 금일 출석데이터 가져오기
router.get('/', async (req, res, next) => {
    try {
        const { user_id } = req.query;

        // user_id가 null일때 => 최초 접속
        if (!user_id) { 
            response(res, 200, "로그인 안됨"); 
            return; 
        }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            attributes: ['id', 'email', 'name', 'gender', 'birth'] 
        });

        // 금일 날짜
        const today = await moment(Date.now()).format('YYYY-MM-DD');

        // 금일 출석 명단 
        const today_attendances = await Attendance.findAll({ 
            where: { date: { [Op.gt]: moment(`${today}`)._d, } },
            include: [{ model: User, attributes: ['id', 'name', 'gender', 'birth'] }],
            order: [['date', 'DESC'],],
        });

        // 유저의 금일 출석여부 체크
        const check = await Attendance.findOne({
            where: {
                user_id: user.id,
                date: { [Op.gt]: moment(`${today}`)._d, },
            },
        })

        // 유저가 로그인 되었 있을 때
        if (check) {     
            let payLoad = { today_attendances, user, todayAttd: 1 };
            response(res, 200, "로그인 된 유저 있음, 출석 O", payLoad);
        } else {
            let payLoad = { today_attendances, user, todayAttd: 0 };
            response(res, 200, "로그인 된 유저 있음, 출석 X", payLoad);
        }
        return;
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;