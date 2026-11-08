import User from '../models/user.model.js'
import Conversation from '../models/conversation.model.js'
import mongoose from 'mongoose';
import Message from "../models/message.model.js";


export const createConversation = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.userId;

        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver ID"
            });
        }

        if (new mongoose.Types.ObjectId(receiverId).equals(senderId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot create a conversation with yourself"
            });
        }
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        const existingConversation = await Conversation.findOne({
            participants: {
                $all: [senderId, receiverId]
            },
            $expr: {
                $eq: [{ $size: "$participants" }, 2]
            }
        });

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                message: "Conversation already exists",
                conversation: existingConversation
            });
        }

        const newConversation = await Conversation.create({
            participants: [senderId, receiverId]
        });

        return res.status(201).json({
            success: true,
            message: "Conversation created successfully",
            conversation: newConversation
        });
    } catch (error) {
        console.error("Create conversation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create conversation"
        });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversations = await Conversation.find({
            participants: userId
        })
            .populate("participants", "username profilePicture")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations
        });

    } catch (error) {
        console.error("Get conversations error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversations"
        });
    }
};

