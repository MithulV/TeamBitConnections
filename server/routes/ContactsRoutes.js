import express from "express";
import {
    CreateContact,
    GetContacts,
    UpdateContact,
    DeleteContact,
    SearchContacts,
    AddEventToExistingContact,
    GetUnVerifiedContacts,
    UpdateContactAndEvents,
    GetContactsByCategory
} from "../controllers/ContactControllers.js";
import { upload, UploadImage, GetPicturesByUserId, GetUnVerifiedImages } from "../controllers/PhotoControllers.js";

const router = express.Router();
router.get("/contacts/:userId", GetContacts);
router.get("/get-unverified-contacts/", GetUnVerifiedContacts);
router.get("/get-unverified-images/", GetUnVerifiedImages);
router.get("/get-contacts-by-category/", GetContactsByCategory)
router.get("/search-contact", SearchContacts);
router.post("/create-contact", CreateContact);
router.post("/upload-contact/", upload.single("image"), UploadImage);
router.get("/get-contact-images/:userId", GetPicturesByUserId);
router.put("/update-contact/:contact_id", UpdateContact);
router.delete("/delete-contact/:id", DeleteContact);
router.post("/add-event-existing-contact/:contactId", AddEventToExistingContact);
router.put("/update-contacts-and-events/:id", UpdateContactAndEvents)

export default router;