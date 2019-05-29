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