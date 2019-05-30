const express = require('express');
const moment = require('moment');

// 모델 import
const { User, Attendance, Sequelize } = require('../../models');

// 커스텀 미들웨어
const { exUser, verifyToken } = require('../middlewares/main');
const { response } = require('../middlewares/response');

// for findAll using range
const Op = Sequelize.Op;

const router = express.Router(); 

// 출석 체크
router.post('/', async (req, res, next) => {
    try { 
        const { user_id } = req.body;

        if (!user_id) { response(res, 400, "유저 없음"); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ where: { id: user_id }});

        // 금일 날짜
        const today = moment(Date.now()).format('YYYY-MM-DD');

        // 금일 출석 명단 
        let today_attendances = await Attendance.findAll({ 
            where: { date: { [Op.gt]: moment(`${today}`)._d, } },
            include: [{ model: User, attributes: ['id', 'email', 'name', 'gender', 'birth'] }],
            order: [['date', 'DESC'],],
        });

        // 유저의 금일 출석여부 체크
        const check = await Attendance.findOne({
            where: {
                user_id: user.id,
                date: { [Op.gt]: moment(`${today}`)._d, },
            },
        })

        if (!check) { // 출석이 안되어 있을 때
            const newAttd = await Attendance.create({ date: Date.now() })
            await user.addAttendance(newAttd);

            // 나를 포함한 금일 출석 명단 
            let today_attendances = await Attendance.findAll({ 
                where: { date: { [Op.gt]: moment(`${today}`)._d, } },
                include: [{ model: User, attributes: ['id', 'email', 'name', 'gender', 'birth'] }],
                order: [['date', 'DESC'],],
            });

            let payLoad = { today_attendances };
            console.log(today_attendances);
            response(res, 201, '출석체크 완료', payLoad); 
        } else  { 
            // 출석이 되어 있을 때
            let payLoad = { today_attendances };
            response(res, 400, '이미 출석함', payLoad);  
        }
  
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;