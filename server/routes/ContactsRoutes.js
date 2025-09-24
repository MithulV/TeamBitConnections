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
import { analyzeContactNetwork } from "../controllers/NetworkControllers.js";
import {
  GetFilteredContacts,
  GetFilterOptions,
} from "../controllers/FilterControllers.js";

import { verifyToken, authorizeRoles } from "../middlewares/AuthMiddleware.js";

// User routes - Allow all authenticated users
router.get(
  "/contacts/filter/",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  GetFilteredContacts
);
router.get(
  "/contacts/:userId",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  GetContacts
);
router.post(
  "/create-contact",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  CreateContact
);
router.post(
  "/upload-contact/",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  upload.single("image"),
  UploadImage
);
router.get(
  "/get-contact-images/:userId",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  GetPicturesByUserId
);
router.get(
  "/search-contact",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  SearchContacts
);
router.post(
  "/add-event-existing-contact/:contactId/:userId",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  AddEventToExistingContact
);
router.put(
  "/update-contacts-and-events/:id/:userId",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  UpdateContactAndEvents
);
router.delete(
  "/delete-image/:id",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  DeleteImage
);
router.get(
  "/get-assignment/:userId",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  getAssignmentsForUser
);

// Middleman routes - For verification and management tasks
router.get(
  "/get-unverified-contacts/",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  GetUnVerifiedContacts
);
router.get(
  "/get-unverified-images/",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  GetUnVerifiedImages
);
router.get(
  "/get-contacts-by-category/",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  GetContactsByCategory
);
router.put(
  "/update-contact/:contact_id",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  UpdateContact
);
router.delete(
  "/delete-contact/:contactId",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  DeleteContact
);
router.delete(
  "/verified-contact-delete/:contactId",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  DeleteVerifiedContact
);
router.post(
  "/verify-image/:id",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  VerifyImages
);
router.post(
  "/assign/",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  createAssignment
);
router.get(
  "/get-assigned-to/:userId",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  getAssignedByUser
);
router.delete(
  "/delete-assignment/:assignmentId",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  revokeAssignment
);
router.get(
  "/get-filter-options",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  GetFilterOptions
);

// Admin routes - Admin only
router.get(
  "/get-all-contact/",
  verifyToken,
  authorizeRoles("admin"),
  GetAllContact
);
router.post(
  "/create-contact-by-admin",
  verifyToken,
  authorizeRoles("admin"),
  UpdateContact
);
router.post(
  "/import-csv",
  verifyToken,
  authorizeRoles("admin"),
  uploadCSV,
  ImportContactsFromCSV
);
router.post("/user/ping/:id", verifyToken, updateUserPing); // No role restriction for ping
router.get(
  "/users/online",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  getOnlineUsers
);
router.get(
  "/analyze-contact-network",
  verifyToken,
  authorizeRoles("admin"),
  analyzeContactNetwork
);

// Task routes - Admin and middleman access
router.get(
  "/get-tasks/",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  GetTasks
);
router.put(
  "/complete-task/:id",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  CompleteTask
);
router.post("/create-task", verifyToken, authorizeRoles("admin"), CreateTask);

// History routes - Admin and middleman access
router.get(
  "/get-modification-history/:id",
  verifyToken,
  authorizeRoles("admin", "cata", "catb", "catc"),
  getContactModificationHistory
);
router.get(
  "/get-all-modification-history/",
  verifyToken,
  authorizeRoles("admin"),
  getAllContactModificationHistory
);

// Referral routes - User level access
router.post(
  "/send-referral",
  verifyToken,
  authorizeRoles("user", "admin", "cata", "catb", "catc"),
  sendReferralInvitation
);
router.get("/validate-referral/:token", validateReferralLink); // Public route - no auth needed
router.post("/complete-registration", completeRegistration); // Public route - no auth needed
router.post(
  "/invalidate-invitation",
  verifyToken,
  authorizeRoles("admin"),
  invalidateInvitation
);
router.post("/invitation-heartbeat", invitationHeartbeat); // Public route - no auth needed

startOnlineStatusTask();

export default router;
