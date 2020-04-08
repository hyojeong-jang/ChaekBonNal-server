const AWS = require('aws-sdk');
// const multer  = require('multer');
// const multerS3 = require('multer-s3');
// const path = require('path');

const s3 = new AWS.S3({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

// const s3Upload = multer({
//     storage: multerS3({
//       s3: s3,
//       bucket: 'chaekbonnal',
//       acl: 'public-read',
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       key: function (req, file, cb) {
//         let extension = path.extname(file.originalname);
//         cb(null, uuid() + Date.now().toString() + extension)
//     }
//     })
// });

module.exports = s3
