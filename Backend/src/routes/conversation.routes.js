import express from "express";
import { createConversation, getConversations } from "../controllers/conversation.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createConversation);
router.get("/", protect, getConversations);

export default router;