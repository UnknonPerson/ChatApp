import { register, login, getProfile, refreshAccessToken, logout } from '../controllers/auth.controller.js';
import express from 'express';
import { protect } from '../middlewares/auth.middleware.js'

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile',protect, getProfile);
router.post('/refresh', refreshAccessToken);
router.post('/logout',protect, logout);


export default router;