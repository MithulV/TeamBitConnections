import express from 'express';


const router = express.Router();

// Photo upload routes (public)
router.post('/upload', upload.single('photo'), uploadPhoto);

export default router;
