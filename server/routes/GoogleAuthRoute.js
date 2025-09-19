import express from "express";
import { verifyGoogleToken } from "../controllers/auth/GoogleAuth.js";

const router = express.Router();

router.post("/google/verify", verifyGoogleToken);

export default router;
