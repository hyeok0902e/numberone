const express = require('express');
const moment = require('moment');

// 모델 import
const { User, Attendance, Sequelize } = require('../../models');

// 커스텀 미들웨어
const { verifyToken, verifyDuplicateLogin } = require('../middlewares/main');
const { response } = require('../middlewares/response');

// for findAll using range
const Op = Sequelize.Op;

const router = express.Router(); 

// 출석 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try { 
        const user = await User.findOne({ where: { id: req.decoded.user_id }});

        // 나의 출석 목록
        let today_attendances = await Attendance.findAll({ 
            where: { user_id: req.decoded.user_id }
        });
        
        let payLoad = { today_attendances };
        response(res, 200, '나의 출석체크 목록', payLoad);   
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 출석 체크
router.post('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try { 
        // 중복 로그인 체크
        const user = await User.findOne({ where: { id: req.decoded.user_id }});

        // 금일 날짜
        const today = moment(Date.now()).format('YYYY-MM-DD');

        // 나의 출석 목록
        let today_attendances = await Attendance.findAll({ 
            where: { user_id: req.decoded.user_id }
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

            today_attendances = await Attendance.findAll({ 
                where: { user_id: req.decoded.user_id }
            });

            let payLoad = { today_attendances };
            response(res, 201, '출석체크를 완료하였습니다.', payLoad); 
        } else  { 
            // 출석이 되어 있을 때
            let payLoad = { today_attendances };
            response(res, 200, '이미 출석체크가 되어 있습니다.', payLoad);  
        }
  
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;