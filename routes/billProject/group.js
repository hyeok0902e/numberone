const express = require('express');

// 모델 import
const { User, Load, BillProject, UserAuth } = require('../../models');

// 커스텀 미들웨어
const { exUser, verifyToken } = require('../middlewares/main');
const { response } = require('../middlewares/response');
const { billAuth } = require('../middlewares/userAuth');

// http://[url]/bill/group
const router = express.Router();

router.post('/create', async (req, res, next) => {
    try {
        // load_id => bank_id, name => groupName
        const { user_id, bank_id, name } = req.body; 

        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!bank_id) { response(res, 400, "뱅크 없음"); return; }
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
        if (!(billAuth(user))) {
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
        if (billProject.user_id == user_id) {
            const group = await Load.create({ name, type: 1 }); // type: 1 => Group
            await bank.addGroup(group);
            await billProject.addLoad(group); // 중요 => BillProject에도 추가

            let payLoad = { groupName: group.name, group_id: group.id };
            response(res, 201, "그룹 생성", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }
   
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

router.put('/:group_id/edit', async (req, res, next) => {
    try {
        const { user_id, name } = req.body;
        const { group_id } = req.params;

        // 데이터 유효성 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!group_id) { response(res, 400, "그룹 정보 없음"); return; }
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
        
        // 그룹 존재여부 체크
        const group = await Load.findOne({ where: { id: group_id, type: 1 } });
        if (!group) { response(res, 404, "그룹 없음"); return; } 

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: group.billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }

        // 접근 권한 체크
        if (billProject.user_id == user.id) {
            await Load.update({ name: name }, { where: { id: group.id } })
            
            let payLoad = { groupName: name, group_id: group_id }
            response(res, 200, "수정 완료", payLoad);
        } else {
            response(res, 401, "권한 없음");
        }


    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

router.delete('/:group_id/delete', async (req, res, next) => {
    try {
        const { user_id } = req.body;
        const { group_id } = req.params;

        // 데이터 유효성 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!group_id) { response(res, 400, "그룹 정보 없음"); return; }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 그룹 존재여부 체크
        const group = await Load.findOne({ where: { id: group_id, type: 1 } });
        if (!group) { response(res, 404, "그룹 없음"); return; }
        
        // 계산서 권한 체크
        if (!(await billAuth(user))) {  
            response(res, 401, "권한 없음");
            return;
        }

        // 계산서 존재여부 체크
        const billProject = await BillProject.findOne({ where: { id: group.billProject_id } });
        if (!billProject) { response(res, 404, "계산서 없음"); return; }

        // 접근 권한 체크
        if (billProject.user_id == user.id) {
            await group.destroy();
            response(res, 200, "삭제 완료");
        } else {
            response(res, 401, "권한 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;