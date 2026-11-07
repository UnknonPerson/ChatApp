import express from 'express';
import { protect } from '../middlewares/auth.middleware.js'
import { searchUsers, getUserById, updateProfile, uploadProfilePicture } from '../controllers/user.controller.js'
import {  uploadProfilePictureMiddleware } from '../middlewares/upload.middleware.js'

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/:userId", protect, getUserById);
router.patch("/profile", protect, updateProfile);
router.post("/profile-picture", protect, uploadProfilePictureMiddleware, uploadProfilePicture);

export default router;