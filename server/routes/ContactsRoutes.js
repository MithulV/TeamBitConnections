import express from "express";
import {
  CreateContact,
  GetContacts,
  UpdateContact,
  DeleteContact,
  DeleteVerifiedContact,
  SearchContacts,
  AddEventToExistingContact,
  GetUnVerifiedContacts,
  UpdateContactAndEvents,
  GetContactsByCategory,
  GetAllContact,
} from "../controllers/ContactControllers.js";
// Import online status functions
import {
  updateUserPing,
  getOnlineUsers,
  startOnlineStatusTask,
} from "../controllers/OnlineController.js";
import {
  createAssignment,
  getAssignedByUser,
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
import {
  GetTasks,
  CompleteTask,
  CreateTask,
} from "../controllers/TaskControllers.js";
import {
  ImportContactsFromCSV,
  uploadCSV,
} from "../controllers/CsvImportControllers.js";
import verifyToken from "../middlewares/AuthMiddleware.js";
import {
  getAllContactModificationHistory,
  getContactModificationHistory,
  getModificationHistory,
} from "../controllers/ModificationHistoryControllers.js";
import {
  sendReferralInvitation,
  validateReferralLink,
  completeRegistration,
  invalidateInvitation,
  invitationHeartbeat,
} from "../controllers/referralControllers.js";
const router = express.Router();
import { analyzeContactNetwork } from "../controllers/aiNetworkControllers.js";
import {
  GetFilteredContacts,
  GetFilterOptions,
} from "../controllers/FilterControllers.js";



// User routes
router.get("/contacts/filter/", GetFilteredContacts);
router.get("/contacts/:userId", GetContacts);
router.post("/create-contact", CreateContact);
router.post("/upload-contact/", upload.single("image"), UploadImage);
router.get("/get-contact-images/:userId", GetPicturesByUserId);
router.get("/search-contact", SearchContacts);
router.post(
  "/add-event-existing-contact/:contactId/:userId",
  AddEventToExistingContact
);
router.put("/update-contacts-and-events/:id/:userId", UpdateContactAndEvents);
router.delete("/delete-image/:id", DeleteImage);
router.get("/get-assignment/:userId", getAssignmentsForUser);
// Middleman routes
router.get("/get-unverified-contacts/", GetUnVerifiedContacts);
router.get("/get-unverified-images/", GetUnVerifiedImages);
router.get("/get-contacts-by-category/", GetContactsByCategory);
router.put("/update-contact/:contact_id", UpdateContact);
router.delete("/delete-contact/:contactId", DeleteContact);
router.delete("/verified-contact-delete/:contactId", DeleteVerifiedContact);
router.post("/verify-image/:id", VerifyImages);
router.post("/assign/", createAssignment);
router.get("/get-assigned-to/:userId", getAssignedByUser);
router.delete("/delete-assignment/:assignmentId", revokeAssignment);
router.get("/get-filter-options", GetFilterOptions);

// Admin routes
router.get("/get-all-contact/", GetAllContact);
router.post("/create-contact-by-admin", UpdateContact);
router.post("/import-csv", uploadCSV, ImportContactsFromCSV);
router.post("/user/ping/:id", updateUserPing);
router.get("/users/online", getOnlineUsers);
router.get("/analyze-contact-network", analyzeContactNetwork);
// Task routes
router.get("/get-tasks/", GetTasks);
router.put("/complete-task/:id", CompleteTask);
router.post("/create-task", CreateTask);
// History routes
router.get("/get-modification-history/:id", getContactModificationHistory);
router.get("/get-all-modification-history/", getAllContactModificationHistory);
// Referral routes
router.post("/send-referral", sendReferralInvitation);
router.get("/validate-referral/:token", validateReferralLink);
router.post("/complete-registration", completeRegistration);
router.post("/invalidate-invitation", invalidateInvitation);
router.post("/invitation-heartbeat", invitationHeartbeat);

startOnlineStatusTask();

export default router;
