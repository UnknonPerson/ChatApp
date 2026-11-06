import express from 'express';
import { protect } from '../middlewares/auth.middleware.js'
import { searchUsers, getUserById } from '../controllers/user.controller.js'

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/:userId", protect, getUserById);

export default router;