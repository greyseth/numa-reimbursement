const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_requestimg_" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const arrayUpload = upload.array("images");

module.exports = { upload, arrayUpload };
