const express = require('express');
const moment = require('moment');

// 모델 import
const { User, UserAuth, BillProject, Load } = require('../../models');

// 커스텀 미들웨어
const { exUser, verifyToken } = require('../middlewares/main'); 
const { response } = require('../middlewares/response');
const { billAuth } = require('../middlewares/userAuth');

// http://[url]/bill/bank
const router = express.Router();

// 뱅크 생성
router.post('/create', async (req, res, next) => {
    try {
        const { user_id, billProject_id, name } = req.body;

        // user_id 혹은 billProject_id가 없을 때
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!billProject_id) { response(res, 400, "계산서 없음"); return; }
        if (!name || (name=="")) { response(res, 400, "입력값 없음"); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }
            
        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 계산서 권한 체크
        if (!(await billAuth(user))) {  
            response(res, 401, "권한 없음");
            return;
        }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }

        // 접근 권한 체크 
        if (billProject.user_id = user.id) {
            const bank = await Load.create({ type: 0, name }); // type: 0 => Bank
            await billProject.addLoad(bank);
            
            let payLoad = { bankName: bank.name, bank_id: bank.id };
            response(res, 201, "뱅크 생성", payLoad);
        } else {
            response(res, 401, "권한 없음"); 
        } 
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 뱅크 이름 수정
router.put('/:bank_id/edit', async (req, res, next) => {
    try {
        // load_id => bank_id, name => bankName
        const { user_id, name } = req.body;
        const { bank_id } = req.params;

        // 데이터 유효성 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!bank_id) { response(res, 400, "뱅크 정보 없음"); return; }
        if (!name || (name=="")) { response(res, 400, "입력값 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 계산서 권한 체크
        if (!(await billAuth(user))) {  
            response(res, 401, "권한 없음");
            return;
        }

        // 뱅크 존재여부 체크
        const bank = await Load.findOne({ where: { id: bank_id, type: 0 } });
        if (!bank) { response(res, 404, "뱅크 없음"); return; } 

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: bank.billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }

        // 접근 권한 체크 
        if (billProject.user_id == user.id) {
            await Load.update({ name: name }, { where: { id: bank.id } });
            
            let payLoad = { bankName: name, bank_id: bank_id }
            response(res, 200, "수정 완료", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

router.delete('/:bank_id/delete', async (req, res, next) => {
    try {
        const { user_id } = req.body;
        const { bank_id } = req.params;

        // 데이터 유효성 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!bank_id) { response(res, 400, "뱅크 정보 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 계산서 권한 체크
        if (!(await billAuth(user))) {  
            response(res, 401, "권한 없음");
            return;
        }

        // 뱅크 존재여부 체크
        const bank = await Load.findOne({ where: { id: bank_id, type: 0 } });
        if (!bank) { response(res, 404, "뱅크 없음"); return; } 
        
        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: bank.billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }

        // 접근 권한 체크 
        if (billProject.user_id == user.id) {
            await bank.destroy();
            response(res, 200, "삭제 완료");
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});
module.exports = router;