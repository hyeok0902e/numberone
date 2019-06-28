const express = require('express');

// 모델 import
const { 
    User, UserAuth, Statement,
    Process, ProcessDetail, ProcessDetailElement
} = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken , verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { verifyStatementAuth } = require('../middlewares/userAuth');

const router = express.Router();

// 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {   
        const user = await User.findOne({ where: { id: req.decoded.user_id } });
        const statments = await Statement.findAll({ 
            where: { user_id: user.id },
            attributes: ['id', 'name', 'lastCost', 'contractCost', 'public1', 'public2'],
            order: [['id', 'DESC']],             
        });

        payLoad = { statements }
        response(res, 200, "내역서 목록", statments);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 상세보기
router.get('/:statement_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {   
        const { statement_id } = req.params;
        if (!statement_id) { response(res, 400, "데이터 없음"); return; }
        const { statement } = await Statement.findOne({ where: { id: statement_id } });
        if (!statement) { response(res, 404, "내역서가 존재하지 않습니다."); return; }

        const resStatement = await statement.findOne({
            where: { id: statement_id },
            include: [
                {
                    model: Process,
                    include: [
                        { 
                            model: ProcessDetail,
                            include: [
                                {
                                    model: ProcessDetailElement,
                                }
                            ] 
                        }
                    ]
                }
            ]
        });
        let payLoad = { resStatement };
        response(res, 200, "내역서 상세 페이지", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    } 
});

// 생성
router.post('/create', verifyToken, verifyStatementAuth, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { statement } = req.body;
    } catch (err) {
        console.log(err);
        response(res, 500, "서버에러");
    }
});

// 수정 => 기존 데이터 삭제

module.exports = router;