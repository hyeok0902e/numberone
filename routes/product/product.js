const express = require('express');

// 모델 import
const { User, UserAuth, Product, ProductOpt, ProductThumb } = require('../../models');

// 커스텀 미들웨어
const { response } = require('../middlewares/response');
const { productSeeAuth } = require('../middlewares/userAuth');
const { exUser, verifyToken } = require('../middlewares/main');
const { uploadImg } = require('../middlewares/uploadImg');

const router = express.Router();

// 장터 목록 가져오기
router.get('/', async (req, res, next) => {
    try {   
        const { user_id } = req.body; // query로 바꿔줄 것!
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        
        // 유저 존재여부 체크
        if (!(await exUser(user_id))) {
            response(res, 404, "유저 없음");
            return;
        }

        const user = await User.findOne({ 
            where: { id: user_id }, 
            include: [{ model: UserAuth }], 
        });

        // 장터 이용(보기) 권한 체크
        if (!(await productSeeAuth(user))) {
            response(res, 401, "권한 없음");
            return;
        }
        
        // 제품 목록(옵션, 사진 포함) 가져오기
        const products = await Product.findAll({ 
            include: [
                { model: ProductOpt }, 
                { model: ProductThumb }
            ] 
        });

        if (products.length > 0) {
            let payLoad = { products };
            response(res, 200, "장터 목록", payLoad);
        } else {
            response(res, 404, "장터 목록 없음");
        }
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 제품 사진 등록
router.post('/imgUpload', uploadImg.single('image'), (req, res) => {
    try {
        console.log("req.file: ", req.file); 

        let payLoad = { profileUrl: req.file.location };
        response(res, 201, "제품 사진 등록 성공", payLoad);
    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")``
    }
});

// 제품 등록
router.post('/create', async (req, res, next) => {
    try {
        const { user_id, name, category, quantity, optNames, prices, urls } 
            = req.body;

        // 입력값 체크
        if (!user_id) { response(res, 400, "로그인 필요"); return; }
        if (!name || !category || !optNames || !prices || !urls) { 
            response(res, 400, "입력값 없음"); 
            return; 
        }

        // 유저 존재여부 체크
        if (!(await exUser(user_id))) { 
            response(res, 404, "유저 없음"); 
            return; 
        }      
        
        const user = await User.findOne({ where: { id: user_id }, include: [{ model: UserAuth }], });

        // 장터 이용(보기) 권한 체크
        if (!(await productSeeAuth(user))) { response(res, 401, "권한 없음"); return; }

        // 제품 생성
        let product = await Product.create({ name, category, quantity });
        await user.addProduct(product);
        
        // ProductOpt 생성
        var num = 0
        if (optNames) {   
            for (i = 0; i < optNames.length; i++) {
                const productOpt = await ProductOpt.create({ name: optNames[i], price: prices[i] })
                    .then(async productOpt => { await product.addProductOpt(productOpt); })
                    .catch(async err => { 
                        console.log(err);
                        response(res, 400, "에러: 제품 옵션 생성 실패");
                    });
                    console.log("1")
            } 
            
        }
        
        // ProductThumb 생성
        if (urls) {
            for (i = 0; i < urls.length; i++) {
                const productThumb = await ProductThumb.create({ url: urls[i] })
                    .then(async productThumb => { await product.addProductThumb(productThumb); })
                    .catch(async err => { 
                        console.log(err);
                        response(res, 400, "에러: 제품 썸네일 생성 실패");
                    });
                    console.log("2")
            } 
        }
        
        // 제품(옵션, 썸네일 포함) 가져오기
        product = await Product.findOne({
            where: { id: product.id },
            include: [
                { model: ProductOpt }, 
                { model: ProductThumb }
            ] 
        });
        
        let payLoad = { product: product };
        response(res, 201, "제품 등록됨", payLoad);

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 제품 편집 페이지 이동
router.get('/:product_id/edit', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 제품 편집
router.put('/:product_id/edit', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

// 제품 삭제
router.delete('/:product_id/delete', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err);
        response(res, 500, "서버 에러")
    }
});

module.exports = router;