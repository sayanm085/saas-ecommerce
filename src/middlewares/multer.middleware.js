import multer from "multer";
import crypto from "crypto";


// Multer configuration for file upload    

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })


    const upload = multer({ storage: storage })

    export default upload;