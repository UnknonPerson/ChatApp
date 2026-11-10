
import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/token.js";
import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
import Message from "../models/message.model.js";

// Extract a specific cookie from the request header
const getCookieValue = (cookieHeader, name) => {
    const cookies = cookieHeader.split(";");

    for (const item of cookies) {
        const separatorIndex = item.indexOf("=");

        if (separatorIndex === -1) continue;

        const key = item.slice(0, separatorIndex).trim();
        const value = item.slice(separatorIndex + 1).trim();

        if (key === name) {
            try {
                return decodeURIComponent(value);
            } catch {
                return value;
            }
        }
    }

    return undefined;
};

// Track active socket connections for each user
const onlineUsers = new Map();

export const initializeSocket = (httpServer) => {

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true
        }
    });

    // Authenticate every incoming socket connection
    io.use((socket, next) => {
        try {
            const cookieHeader =
                socket.handshake.headers.cookie || "";

            const token = getCookieValue(
                cookieHeader,
                "accessToken"
            );

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = verifyAccessToken(token);

            socket.userId = decoded.userId;

            next();

        } catch (error) {
            console.error("Socket authentication failed:", error.message);
            next(new Error("Invalid or expired access token"));
        }
    });

    // Handle authenticated connections
    io.on("connection", (socket) => {

        console.log("Authenticated user connected:", socket.userId);
        console.log("Socket ID:", socket.id);


        // Register user connection
        const userId = socket.userId;

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        onlineUsers.get(userId).add(socket.id);

        // Notify everyone only when the user connects for the first time
        if (onlineUsers.get(userId).size === 1) {
            io.emit("user_online", { userId });
        }

        // Send the current online users to the newly connected socket
        socket.emit("online_users", [...onlineUsers.keys()]);

        console.log("Online users:", [...onlineUsers.keys()]);


        // Join a conversation room
        socket.on("join_conversation", async (conversationId) => {
            try {
                // Validate conversation ID
                if (
                    typeof conversationId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(conversationId)
                ) {
                    return socket.emit("socket_error", {
                        message: "Invalid conversation ID"
                    });
                }

                // Find conversation
                const conversation = await Conversation.findById(
                    conversationId
                );

                if (!conversation) {
                    return socket.emit("socket_error", {
                        message: "Conversation not found"
                    });
                }

                // Verify participant membership
                const isParticipant = conversation.participants.some(
                    (participant) =>
                        participant.equals(socket.userId)
                );

                if (!isParticipant) {
                    return socket.emit("socket_error", {
                        message: "You are not allowed to join this conversation"
                    });
                }

                // Join room only after authorization
                await socket.join(conversationId);

                console.log(
                    `User ${socket.userId} joined room ${conversationId}`
                );

                socket.emit("conversation_joined", {
                    conversationId,
                    message: "Successfully joined conversation"
                });

            } catch (error) {
                console.error("Join conversation error:", error);

                socket.emit("socket_error", {
                    message: "Failed to join conversation"
                });
            }
        });


        socket.on("send_message", async (data) => {
            try {
                const { conversationId, content } = data || {};

                // 1. Validate conversation ID
                if (
                    typeof conversationId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(conversationId)
                ) {
                    return socket.emit("socket_error", {
                        message: "Invalid conversation ID",
                    });
                }

                // 2. Validate message content
                if (
                    typeof content !== "string" ||
                    !content.trim()
                ) {
                    return socket.emit("socket_error", {
                        message: "Message content is required",
                    });
                }

                // 3. Find conversation
                const conversation = await Conversation.findById(
                    conversationId
                );

                if (!conversation) {
                    return socket.emit("socket_error", {
                        message: "Conversation not found",
                    });
                }

                // 4. Verify sender is a participant
                const isParticipant = conversation.participants.some(
                    (participant) => participant.equals(socket.userId)
                );

                if (!isParticipant) {
                    return socket.emit("socket_error", {
                        message: "You are not allowed to send messages here",
                    });
                }

                // 5. Save message in MongoDB
                const newMessage = await Message.create({
                    conversation: conversationId,
                    sender: socket.userId,
                    content: content.trim(),
                    messageType: "text",
                });

                // 6. Update conversation's last message
                conversation.lastMessage = newMessage._id;
                await conversation.save();

                // 7. Populate sender details
                await newMessage.populate(
                    "sender",
                    "username profilePicture"
                );

                // 8. Broadcast message to everyone in the room
                io.to(conversationId).emit("new_message", newMessage);

                console.log(
                    `Message sent by ${socket.userId} in ${conversationId}`
                );

            } catch (error) {
                console.error("Send message error:", error);

                socket.emit("socket_error", {
                    message: "Failed to send message",
                });
            }
        });


        // User starts typing
        socket.on("typing", async (conversationId) => {
            try {
                if (
                    typeof conversationId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(conversationId)
                ) {
                    return;
                }

                // Verify the socket has joined this room
                if (!socket.rooms.has(conversationId)) {
                    return;
                }

                // Verify current conversation membership
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId,
                });

                if (!conversation) return;

                // Notify other participants, not the sender
                socket.to(conversationId).emit("user_typing", {
                    conversationId,
                    userId: socket.userId,
                });

            } catch (error) {
                console.error("Typing event error:", error);
            }
        });


        // User stops typing
        socket.on("stop_typing", async (conversationId) => {
            try {
                if (
                    typeof conversationId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(conversationId)
                ) {
                    return;
                }

                if (!socket.rooms.has(conversationId)) {
                    return;
                }

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId,
                });

                if (!conversation) return;

                socket.to(conversationId).emit("user_stopped_typing", {
                    conversationId,
                    userId: socket.userId,
                });

            } catch (error) {
                console.error("Stop typing event error:", error);
            }
        });



        // Handle disconnection
        socket.on("disconnect", (reason) => {
            const userSockets = onlineUsers.get(userId);

            if (userSockets) {
                userSockets.delete(socket.id);

                // Mark offline only when the last socket disconnects
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);

                    io.emit("user_offline", {
                        userId,
                    });

                    console.log("User is now offline:", userId);
                }
            }

            console.log("User disconnected:", userId, reason);
        });

    });

    return io;
};
