import Conversation from '../models/conversation.model.js'
import mongoose from 'mongoose';
import Message from "../models/message.model.js";


export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.user.userId;

        // 1. Validate conversation ID
        if (
            !conversationId ||
            !mongoose.Types.ObjectId.isValid(conversationId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID"
            });
        }

        // 2. Validate message content
        if (
            typeof content !== "string" ||
            !content.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Message content is required"
            });
        }

        // 3. Find the conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        // 4. Check whether the authenticated user is a participant
        const isParticipant = conversation.participants.some(
            participant => participant.equals(userId)
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this conversation"
            });
        }

        // 5. Create the message
        const newMessage = await Message.create({
            conversation: conversationId,
            sender: userId,
            content: content.trim(),
            messageType: "text"
        });

        // 6. Update the conversation's latest message
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        // 7. Return the response
        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        console.error("Send message error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
};


export const getMessages = async (req, res) => {
    try {
        // 1. Get conversation ID and authenticated user ID
        const { conversationId } = req.params;
        const userId = req.user.userId;

        // 2. Get pagination parameters
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            50,
            Math.max(1, parseInt(req.query.limit, 10) || 20)
        );

        // 3. Validate conversation ID
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID"
            });
        }

        // 4. Find conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        // 5. Verify user is a participant
        const isParticipant = conversation.participants.some(
            participant => participant.equals(userId)
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view these messages"
            });
        }

        // 6. Calculate pagination offset
        const skip = (page - 1) * limit;

        // 7. Fetch messages
        const messages = await Message.find({
            conversation: conversationId
        })
            .populate("sender", "username profilePicture")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit);

        // 8. Count total messages
        const totalMessages = await Message.countDocuments({
            conversation: conversationId
        });

        // 9. Reverse messages into chronological order
        messages.reverse();

        // 10. Return response
        return res.status(200).json({
            success: true,
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                limit,
                hasNextPage: page < Math.ceil(totalMessages / limit),
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        console.error("Get messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages"
        });
    }
};
