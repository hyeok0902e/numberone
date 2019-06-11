const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const moment = require('moment'); // Data formating 모듈

// 모델 import
const { Sequelize, User, UserPick, Attendance, Load } = require('../models/'); // address 추가 필요

// 커스텀 미들웨어
const { response } = require('./middlewares/response');
const { exUser, verifyToken, verifyUid } = require('./middlewares/main');

const router = express.Router();

// for findAll using range
const Op = Sequelize.Op;

// Main(Home) - 로그인 되어있을 시 금일 출석데이터 가져오기
router.get('/', verifyToken, async (req, res, next) => {
    try {
        // 로그인 체크
        if (!req.decoded) { responser(res, 400, "로그인이 필요합니다."); return; }

        // 유저 존재여부 체크
        if (!(await exUser(req.decoded.user_id))) {
            response(res, 404, "사용자가 존재하지 않습니다.");
            return;
        }

        const user = await User.findOne({ 
            where: { id: req.decoded.user_id }, 
            attributes: ['id', 'email', 'name', 'gender', 'birth', 'uuid'] 
        });

        // 중복 로그인 체크
        if (!(await verifyUid(req.decoded.uuid, user.uuid))) {
            response(res, 400, "중복 로그인"); 
            return;
        }

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
            response(res, 200, "출석체크가 되어 있습니다.", payLoad);
        } else {
            let payLoad = { today_attendances, user, todayAttd: 0 };
            response(res, 200, "출석체크가 되어 있지 않습니다.", payLoad);
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;