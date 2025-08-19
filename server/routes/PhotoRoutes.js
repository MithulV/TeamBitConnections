import express from 'express';
import {
  upload,
  uploadPhoto,
  uploadMultiplePhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  servePhoto
} from '../controllers/PhotoControllers.js';

const router = express.Router();

// Photo upload routes (public)
router.post('/upload', upload.single('photo'), uploadPhoto);
router.post('/upload-multiple', upload.array('photos', 10), uploadMultiplePhotos); // Max 10 photos

// Photo retrieval routes (public)
router.get('/user/:userId?', getUserPhotos);
router.get('/:id', getPhotoById);
router.get('/serve/:filename', servePhoto);

// Photo management routes (public for now)
router.put('/:id', updatePhoto);
router.delete('/:id', deletePhoto);

export default router;
