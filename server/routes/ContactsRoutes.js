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
import { GetTasks, CompleteTask,CreateTask } from "../controllers/TaskControllers.js";
import { createTask } from "node-cron";
import verifyToken from '../middlewares/AuthMiddleware.js'
const router = express.Router();
router.get("/contacts/filter/",verifyToken, GetFilteredContacts);
router.get("/contacts/:userId",verifyToken, GetContacts);
router.get("/get-unverified-contacts/",verifyToken, GetUnVerifiedContacts);
router.get("/get-unverified-images/",verifyToken, GetUnVerifiedImages);
router.get("/get-contacts-by-category/",verifyToken, GetContactsByCategory);
router.get("/search-contact",verifyToken, SearchContacts);
router.post("/create-contact",verifyToken, CreateContact);
router.post("/upload-contact/", upload.single("image"),verifyToken, UploadImage);
router.get("/get-contact-images/:userId",verifyToken, GetPicturesByUserId);
router.put("/update-contact/:contact_id",verifyToken, UpdateContact);
router.delete("/delete-contact/:id",verifyToken, DeleteContact);
router.post("/add-event-existing-contact/:contactId",verifyToken, AddEventToExistingContact);
router.put("/update-contacts-and-events/:id",verifyToken, UpdateContactAndEvents);
router.delete("/delete-image/:id",verifyToken, DeleteImage);
router.post("/verify-image/:id",verifyToken, VerifyImages);
router.post("/assign/",verifyToken, createAssignment);
router.get("/get-assignment/:userId",verifyToken, getAssignmentsForUser);
router.get("/get-assigned-to/:userId",verifyToken, getAssignedByUser);
router.get("/get-assignment-by-event/:eventId",verifyToken, getAssignmentForEvent);
router.delete("/delete-assignment/:assignmentId",verifyToken, revokeAssignment);
router.get("/get-tasks/",verifyToken, GetTasks);
router.put("/complete-task/:id",verifyToken, CompleteTask);
router.get("/get-filter-options",verifyToken, GetFilterOptions);
router.post("/create-task",verifyToken, CreateTask);
export default router;
