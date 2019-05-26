const express = require('express');

const { User, UserAuth, BillProject } = require('../../models');
const { response } = require('../middlewares/response'); // 미들웨어: response to front
const { exUser } = require('../middlewares/exUser'); // 미들웨어: user 존재여부 확인
const router = express.Router();

router.get('/', async (req, res, next) => { 
    try {
        const { user_id } = req.query; 
        if (!user_id) {
            response(res, 400, "로그인 필요");
            return;
        }

        if (await exUser(user_id)) {
            console.log(exUser(user_id));
            const billProjects = await BillProject.findAll({ 
                where: { user_id: user_id, }, 
                attributes: ['id', 'name', 'createdAt', 'voltType', 'loadSimplyCE', 'outputCE', 'elecConvertVal', 'user_id'], 
            });
            
            let payLoad = { billProjects };
            response(res, 200, '계산서 프로젝트 목록', payLoad);
        } else {
            response(res, 404, "유저가 존재하지 않습니다.");
        } 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }   
});

router.post('/create', async (req, res, next) => {
    try {
        const { name, voltType, user_id } = req.body;

        if (user_id) {
            const user = await User.findOne({ 
                where: { id: user_id },
                include: [{ model:UserAuth }], 
            });

            if (!user) {
                response(res, 404, "유저가 존재하지 않습니다.");
                return;
            }

            if (!name || !voltType) {
                response(res, 400, "정보를 제대로 입력해주세요.");
                return;
            }

            if ((user.level != 0) && (user.UserAuth.period > 0) && (user.UserAuth.billProject > 0)) {
                // 유저 정보 및 이용 권한이 있을 시, 계산서 프로젝트 생성
                let billProject = await BillProject.create({ 
                    name, 
                    voltType,
                });
                await user.addBillProject(billProject);

                // 유저 권한 업데이트: 계산서 프로젝트 등록 횟수 -1
                const userBillProjectAuth = user.UserAuth.billProject - 1;
                await UserAuth.update(
                    { billProject: userBillProjectAuth },
                    { where: { user_id: user_id } },
                );
                

                let payLoad = { billProject, user_id };
                response(res, 201, '계산서 프로젝트 생성', payLoad);
            } else {
                response(res, 400, "권한 없음");
            }
        } else {
            response(res, 400, "로그인된 사용자 없음");
        }    
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

router.get('/:billProject_id/edit', async (req, res, next) => {
    try {
        const { user_id } = req.body; // query로 변경할 것 
        const { billProject_id } = req.params;

        if (!user_id) {
            response(res, 400, '로그인 필요');
            return;
        }

        // exUser 미들웨어로 user 존재여부 확인
        if (await exUser(user_id)) {
            const billProject = await BillProject.findOne({ where: { id: billProject_id} });

            if (!billProject) {
                response(res, 404, '계산서 없음');
                return;
            }

            if (billProject.user_id == user_id) {
                let payLoad = { billProject };
                response(res, 200, '계산서 수정', payLoad);
            } else {
                response(res, 400, '해당 사용자의 계산서가 아닙니다.');
            }
        } else {
            response(res, 404, "유저가 존재하지 않습니다.");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, '서버 에러');
    }
    
});
module.exports = router;