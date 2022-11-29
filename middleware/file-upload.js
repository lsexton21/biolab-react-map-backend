const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const HttpError = require("./http-error");
const { v4: uuidv4 } = require("uuid");

const AWS = require("aws-sdk");
const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  },
});

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limit: 500000,
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKETEER_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid
      ? null
      : new HttpError(
          "Please upload a correct image format(.jpeg, .jpg, or .png)",
          200
        );
    cb(error, isValid);
  },
});

module.exports = fileUpload;
