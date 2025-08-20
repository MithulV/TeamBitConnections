import express from "express";
import { CreateContact, GetContacts, UpdateContact, DeleteContact } from "../controllers/ContactControllers.js";
import { upload, UploadImage } from "../controllers/PhotoControllers.js";

const router = express.Router();
router.post("/create-contact", CreateContact);
router.get("/contacts", GetContacts);
router.put("/update-contact/:id", UpdateContact);
router.delete("/delete-contact/:id", DeleteContact);
router.post("/upload-contact/", upload.single('image'), UploadImage);

export default router;
