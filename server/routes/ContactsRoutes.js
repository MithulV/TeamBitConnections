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
    GetContactsByCategory,
    GetFilteredContacts,
} from "../controllers/ContactControllers.js";

import {
    createAssignment,
    getAssignedByUser,
    getAssignmentForEvent,
    getAssignmentsForUser,
    revokeAssignment,
} from "../controllers/AssignmentControllers.js";

import {
    upload,
    UploadImage,
    GetPicturesByUserId,
    GetUnVerifiedImages,
    DeleteImage,
    VerifyImages,
} from "../controllers/PhotoControllers.js";

const router = express.Router();
router.get("/contacts/filter/", GetFilteredContacts);
router.get("/contacts/:userId", GetContacts);
router.get("/get-unverified-contacts/", GetUnVerifiedContacts);
router.get("/get-unverified-images/", GetUnVerifiedImages);
router.get("/get-contacts-by-category/", GetContactsByCategory);
router.get("/search-contact", SearchContacts);
router.post("/create-contact", CreateContact);
router.post("/upload-contact/", upload.single("image"), UploadImage);
router.get("/get-contact-images/:userId", GetPicturesByUserId);
router.put("/update-contact/:contact_id", UpdateContact);
router.delete("/delete-contact/:id", DeleteContact);
router.post("/add-event-existing-contact/:contactId", AddEventToExistingContact);
router.put("/update-contacts-and-events/:id", UpdateContactAndEvents);
router.delete("/delete-image/:id", DeleteImage);
router.post("/verify-image/:id", VerifyImages);
router.post("/assign/", createAssignment);
router.get("/get-assignment/:userId", getAssignmentsForUser);
router.get("/get-assigned-to/:userId", getAssignedByUser);
router.get("/get-assignment-by-event/:eventId", getAssignmentForEvent);
router.delete("/delete-assignment/:assignmentId", revokeAssignment);

export default router;
