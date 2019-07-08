const express = require('express');
const bcrypt = require('bcrypt'); // 비밀번호 암호화 모듈
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

// 모델 import
const { 
    User, 
    BucketProduct, BucketProductOpt, 
    ProductEstimate,
    EstimateProduct, EstimateProductOpt,
} = require('../../models'); // address 추가 필요

// 커스텀 미들웨어
const { verifyToken, verifyDuplicateLogin, asyncForEach } = require('../middlewares/main');
const { response } = require('../middlewares/response');
const { uploadImg_profile } = require('../middlewares/uploadImg');

const router = express.Router();

// 장바구니 목록
router.get('/', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const bucketProducts = await BucketProduct.findAll({ 
            where: { user_id: req.decoded.user_id },
            include: [
                {
                    model: BucketProductOpt,
                    order: [['id', 'ASC']]
                }
            ] 
        });

        let payLoad = { bucketProducts }
        response(res, 200, "내 장바구니 목록", payLoad)
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 견적요청
router.post('/estimate', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimate } = req.body;
        if (!estimate) { response(res, 400, "데이터 없음"); return; }

        const user = await User.findOne({ where: { id: req.decoded.user_id } });

        const bucketProducts = await BucketProduct.findAll({ 
            where: { user_id: req.decoded.user_id },
            include: [
                {
                    model: BucketProductOpt,
                    order: [['id', 'ASC']]
                }
            ] 
        });
        if (!bucketProducts) { response(res, 404, "장바구니가 존재하지 않습니다."); return; }

        // 최초 견적서 생성
        let resEstimate = await ProductEstimate.create({
            name: estimate.name, address: estimate.address, 
            mobile: estimate.mobile, email: estimate.email,
        })
        await user.addProductEstimate(resEstimate);

        // 견적서 내부 제품 생성
        await asyncForEach(bucketProducts, async (bp) => {
            let estimateProduct = await EstimateProduct.create({
                name: bp.name, category: bp.category, product_id: bp.id,
            });
            await resEstimate.addEstimateProduct(estimateProduct);
            
            await asyncForEach(bp.BucketProductOpts, async (opt) => {
                let resOpt = await EstimateProductOpt.create({
                    name: opt.name, price: opt.price, 
                    num: opt.num, totalPrice: opt.totalPrice,
                });
                await estimateProduct.addEstimateProductOpt(resOpt);
            });
        });

        resEstimate = await ProductEstimate.findOne({
            where: { id: resEstimate.id },
            include: [
                {
                    model: EstimateProduct,
                    order: [['id', 'ASC']],
                    include: [
                        {
                            model: EstimateProductOpt,
                            order: [['id', 'ASC']]
                        }
                    ]
                }
            ]
        });

        let payLoad = { resEstimate };
        response(res, 201, "견적 요청 완료", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 견적목록
router.get('/estimate', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const estimates = await ProductEstimate.findAll({ 
            where: { user_id: req.decoded.user_id },
            order: [['id', 'DESC']]
        });
        let payLoad =  { estimates }
        response(res, 200, "내 견적 요청 목록", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

// 견적 상세
router.get('/estimate/:estimate_id/show', verifyToken, verifyDuplicateLogin, async (req, res, next) => {
    try {
        const { estimate_id } = req.params;
        if (!estimate_id) { response(res, 400, "params값 없음"); return; }

        const estimate = await ProductEstimate.findOne({ 
            where : { id: estimate_id },
            include: [
                {
                    model: EstimateProduct,
                    order: [['id', 'ASC']],
                    include: [
                        {
                            model: EstimateProductOpt,
                            order: [['id', 'ASC']],
                        }
                    ]
                }
            ]
        });
        let payLoad = { estimate };
        response(res, 200, "견적 요청 상세", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러");
    }
});

module.exports = router;