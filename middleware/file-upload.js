/*const multer = require("multer");
const HttpError = require("./http-error");


const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limit: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
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
});*/

//connecting to AWS for file storage
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});
const { v4: uuidv4 } = require("uuid");

const fileUpload = (image) => {
  var params = {
    Key: `public/${uuidv4()}`,
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Body: image,
  };

  s3.putObject(params, function put(err, data) {
    if (err) {
      console.log(err, err.stack);
      return;
    } else {
      console.log(data);
    }

    delete params.Body;
    s3.getObject(params, function put(err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
      console.log(data.Body.toString());
    });
  });
};

module.exports = fileUpload;
