import express from "express";
import {
    CreateContact,
    GetContacts,
    UpdateContact,
    DeleteContact,
    SearchContacts,
    AddEventToExistingContact,
} from "../controllers/ContactControllers.js";
import { upload, UploadImage, GetPicturesByUserId } from "../controllers/PhotoControllers.js";

const router = express.Router();
router.get("/contacts/:userId", GetContacts);
router.get("/search-contact", SearchContacts);
router.post("/create-contact", CreateContact);
router.post("/upload-contact/", upload.single("image"), UploadImage);
router.get("/get-contact-images/:userId", GetPicturesByUserId);
router.put("/update-contact/:id", UpdateContact);
router.delete("/delete-contact/:id", DeleteContact);
router.post("/add-event-existing-contact/:contactId", AddEventToExistingContact);

export default router;
