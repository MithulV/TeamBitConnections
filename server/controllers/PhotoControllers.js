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
        const rows =
            await db`INSERT INTO photos (created_by, file_path) VALUES (${req.body.user_id}, ${req.file.path})`;
        return res.status(200).json({ success: true, file: req.file, body: req.body, rows });
    } catch (err) {
        console.log(err);
        return res.json({ success: false, error: `Error in database error: ${err}` });
    }
};

export const GetPicturesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, error: "User ID is required." });
        }

        const pictures = await db`SELECT * FROM photos WHERE created_by = ${userId}`;

        if (!pictures || pictures.length === 0) {
            return res.status(404).json({ success: false, message: "No pictures found for this user." });
        }

        return res.status(200).json({ success: true, data: pictures });
    } catch (err) {
        console.error("Error fetching pictures:", err); // Use console.error for logging errors
        return res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
};

export const GetUnVerifiedImages = async (req, res) => {
    try {
        const pictures = await db`SELECT * FROM photos WHERE verified IS NULL OR verified = FALSE`;

        return res.status(200).json({ success: true, data: pictures });
    } catch (err) {
        console.error("Error fetching pictures:", err); // Use console.error for logging errors
        return res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
};

export const DeleteImage = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db`DELETE FROM photos WHERE id = ${id}`;

        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }
        return res.status(200).json({ success: true, message: "Image deleted successfully." });
    } catch (err) {
        console.error("Error deleting image:", err);
        return res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
};

export const VerifyImages = async (req, res) => {
    try {
        const { id } = req.params;
        const pictures = await db`UPDATE photos SET verified=TRUE WHERE id = ${id} RETURNING *`;

        if (!pictures || pictures.length === 0) {
            return res.status(404).json({ success: false, message: "No pictures found for this user." });
        }

        return res.status(200).json({ success: true, data: pictures });
    } catch (err) {
        console.error("Error fetching pictures:", err); // Use console.error for logging errors
        return res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
};
