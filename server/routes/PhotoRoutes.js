import express from 'express';
import verifyToken from '../middlewares/AuthMiddleware';
const router = express.Router();

// Photo upload routes (public)
router.post('/upload',  upload.single('photo'), uploadPhoto);

export default router;
