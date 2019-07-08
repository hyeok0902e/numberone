const express = require('express');

// 모델 import
const { User, Hiring, Seeking, Labor } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { verifyToken, asyncForEach, verifyDuplicateLogin } = require('../middlewares/main');
const { verifyIsAdmin } = require('../middlewares/adminAuth');


const router = express.Router();

//구인목록 조회
router.get('/hiring', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        const hirings = await Hiring.findAll({
            where: { type: 0 },
            attributes: ['id', 'company', 'startDate', 'endDate', 'isSelected'],
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']],
                    limit: 2,
                }
            ],
            order: [['id', 'DESC']]
        });
        let payLoad = { hirings };
        response(res, 200, "구인 목록", payLoad)
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구인 삭제
router.delete('/hiring/:hiring_id/destroy', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        await Hiring.destroy({ where: { id: hiring_id } });
        response(res, 200, "구인정보 삭제 완료")
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구인목록 상세
router.get('/hiring/:hiring_id/show', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        const { hiring_id } = req.params;
        if (!hiring_id) { response(res, 400, "params값 없음"); return; }

        let hiring = await Hiring.findOne({ 
            where: { id: hiring_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']],
                }
            ] 
        });
        if (!hiring) { response(res, 404, "구인정보가 존재하지 않습니다."); return; }
        let payLoad = { hiring }
        response(res, 200, "구인정보 상세 페이지", payLoad);
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

/////////////////////////// 구인 끝, 구직 시작 ////////////////////////////////

//구직목록 조회
router.get('/seeking', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        const seekings = await Seeking.findAll({
            where: { type: 0, },
            attributes: ['id', 'company', 'car', 'career', 'isSelected'],
            order: [['id', 'DESC']],   
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']], 
                    limit: 2,
                }
            ]
        });

        let payLoad = { seekings };
        response(res, 200, "구직 목록", payLoad)
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구직목록 삭제
router.delete('/seeking/:seeking_id/destroy', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }

        await Seeking.destroy({ where: { id: seeking_id } });
        response(res, 200, "구직정보 삭제 완료")
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})

//구직목록 상세
router.get('/seeking/:seeking_id/show', verifyToken, verifyDuplicateLogin, verifyIsAdmin, async (req, res, next)=>{
    try{
        const { seeking_id } = req.params;
        if (!seeking_id) { response(res, 400, "params값 없음"); return; }

        let seeking = await Seeking.findOne({ 
            where: { id: seeking_id },
            include: [
                {
                    model: Labor,
                    order: [['id', 'ASC']],
                }
            ] 
        });
        if (!seeking) { response(res, 404, "구직정보가 존재하지 않습니다."); return; }
        let payLoad = { seeking }
        response(res, 200, "구직정보 상세 페이지", payLoad);
    }catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }

})











module.exports = router;