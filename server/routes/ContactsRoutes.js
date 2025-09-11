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
  GetFilterOptions,
  GetAllContact,
  getContactModificationHistory,
  getAllContactModificationHistory,
} from "../controllers/ContactControllers.js";

// Import online status functions
import {
  updateUserPing,
  getOnlineUsers,
  startOnlineStatusTask
} from "../controllers/OnlineController.js";

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
import { GetTasks, CompleteTask, CreateTask } from "../controllers/TaskControllers.js";
import { createTask } from "node-cron";
import { ImportContactsFromCSV, uploadCSV } from "../controllers/CsvImportControllers.js";
import verifyToken from "../middlewares/AuthMiddleware.js";
import { getModificationHistory } from "../controllers/ModificationHistoryControllers.js";
import {
  sendReferralInvitation, validateReferralLink, completeRegistration, invalidateInvitation, invitationHeartbeat
} from '../controllers/referralControllers.js';
const router = express.Router();
import { analyzeContactNetwork } from "../controllers/aiNetworkControllers.js";
// Existing routes
router.get("/get-all-contact/", GetAllContact);
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
router.post("/create-contact-by-admin", UpdateContact);
router.delete("/delete-contact/:contactId", DeleteContact);
router.post("/add-event-existing-contact/:contactId/:userId", AddEventToExistingContact);
router.put("/update-contacts-and-events/:id/:userId", UpdateContactAndEvents);
router.delete("/delete-image/:id", DeleteImage);
router.post("/verify-image/:id", VerifyImages);
router.post("/assign/", createAssignment);
router.get("/get-assignment/:userId", getAssignmentsForUser);
router.get("/get-assigned-to/:userId", getAssignedByUser);
router.get("/get-assignment-by-event/:eventId", getAssignmentForEvent);
router.delete("/delete-assignment/:assignmentId", revokeAssignment);
router.get("/get-tasks/", GetTasks);
router.put("/complete-task/:id", CompleteTask);
router.get("/get-filter-options", GetFilterOptions);
router.post("/create-task", CreateTask);
router.get("/searchContacts", SearchContacts)
router.get("/get-modification-history/:id", getContactModificationHistory)
router.get("/get-all-modification-history/", getAllContactModificationHistory)

//csv file upload
router.post('/import-csv', uploadCSV, ImportContactsFromCSV);

router.post("/user/ping/:id", updateUserPing);
router.get("/users/online", getOnlineUsers);


router.post('/send-referral', sendReferralInvitation);
router.get('/validate-referral/:token', validateReferralLink);
router.post('/complete-registration', completeRegistration);
router.post('/invalidate-invitation', invalidateInvitation);
router.post('/invitation-heartbeat', invitationHeartbeat);

//ai
router.get('/analyze-contact-network', analyzeContactNetwork);

// Start the background task when routes are loaded
startOnlineStatusTask();

export default router;
