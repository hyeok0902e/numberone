const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// 이미지 저장경로, 파일명 세팅
exports.uploadImg = multer({
    storage: multerS3({
        s3: s3,
        bucket: "numberone-s3-userinfo",
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file);
            console.log(cb);
            cb(null, file.originalname)
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 프로필
exports.uploadImg_profile = multer({
    storage: multerS3({
        s3: s3,
        bucket: "numberone-s3-userinfo/profile",
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file);
            console.log(cb);
            cb(null, file.originalname)
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 적외선열화상 기록표
exports.uploadImg_rayPaper = multer({
    storage: multerS3({
        s3: s3,
        bucket: "numberone-s3-userinfo/rayPaper",
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file);
            console.log(cb);
            cb(null, file.originalname)
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});


// 다큐먼트
exports.uploadDocument = multer({
    storage: multerS3({
        s3: s3,
        bucket: "numberone-s3-userinfo/documents",
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file);
            console.log(cb);
            cb(null, file.originalname)
        },
    }),
});


// 다큐먼트
exports.uploadProductImg = multer({
    storage: multerS3({
        s3: s3,
        bucket: "numberone-s3-userinfo/products",
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        key: (req, file, cb) => {
            console.log(file);
            console.log(cb);
            cb(null, file.originalname)
        },
    }),
});