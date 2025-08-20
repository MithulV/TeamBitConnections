import multer from "multer";
import path from "path";
import db from "../src/config/db.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

export const upload = multer({ storage: storage });

export const UploadImage = async (req, res) => {
    try {
        const rows = await db`INSERT INTO photos (created_by, file_path) VALUES (${req.body.user_id}, ${req.file.path})`;
        return res.status(200).json({ success: true, file: req.file, body: req.body, rows });
    } catch (err) {
        console.log(err)
        return res.json({ success: false, error: `Error in database error: ${err}` });
    }
};
