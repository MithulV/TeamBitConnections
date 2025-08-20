import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

export const upload = multer({ storage: storage });

// app.post("/upload", upload.single("image"), (req, res) => {
//   console.log(req.file); // contains file path, size, etc.
//   res.json({ success: true, file: req.file });
// });

export const UploadImage = (req, res) => {
    return res.status(200).json({ success: true, file: req.file });
};