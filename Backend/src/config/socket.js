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



        socket.on("mark_messages_read", async ({ conversationId, messageIds }) => {
            try {
                // Validate conversation ID
                if (
                    typeof conversationId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(conversationId)
                ) return;

                // Validate message IDs
                if (
                    !Array.isArray(messageIds) ||
                    messageIds.length === 0 ||
                    messageIds.length > 100 ||
                    !messageIds.every(id =>
                        typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id)
                    )
                ) return;

                // User must have joined this conversation
                if (!socket.rooms.has(conversationId)) return;

                // Verify conversation membership
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId
                });

                if (!conversation) return;

                const ids = [...new Set(messageIds)];
                const readAt = new Date();

                // Mark only the selected incoming messages as read
                await Message.updateMany(
                    {
                        _id: { $in: ids },
                        conversation: conversationId,
                        sender: { $ne: socket.userId },
                        receipts: {
                            $elemMatch: {
                                user: socket.userId,
                                readAt: null
                            }
                        }
                    },
                    {
                        $set: {
                            "receipts.$[receipt].readAt": readAt
                        }
                    },
                    {
                        arrayFilters: [
                            {
                                "receipt.user": socket.userId,
                                "receipt.readAt": null
                            }
                        ]
                    }
                );

                // Find exactly the messages updated by this operation
                const updatedMessages = await Message.find({
                    _id: { $in: ids },
                    conversation: conversationId,
                    sender: { $ne: socket.userId },
                    receipts: {
                        $elemMatch: {
                            user: socket.userId,
                            readAt
                        }
                    }
                }).select("_id");

                if (updatedMessages.length === 0) return;

                // Notify other participants in this conversation
                socket.to(conversationId).emit("messages_read", {
                    conversationId,
                    userId: socket.userId,
                    messageIds: updatedMessages.map(msg => msg._id),
                    readAt
                });

            } catch (error) {
                console.error("Mark messages read error:", error);
            }
        });



        socket.on("message_delivered", async (messageId) => {
            try {
                if (
                    typeof messageId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(messageId)
                ) {
                    return;
                }

                const message = await Message.findOneAndUpdate(
                    {
                        _id: messageId,
                        receipts: {
                            $elemMatch: {
                                user: socket.userId,
                                deliveredAt: null,
                            },
                        },
                    },
                    {
                        $set: {
                            "receipts.$.deliveredAt": new Date(),
                        },
                    },
                    {
                        new: true,
                    }
                );

                if (!message) return;

                // Notify the sender
                io.to(message.conversation.toString())
                    .emit("message_status_updated", {
                        messageId: message._id,
                        userId: socket.userId,
                        status: "delivered",
                        deliveredAt: message.receipts.find(
                            (receipt) =>
                                receipt.user.equals(socket.userId)
                        ).deliveredAt,
                    });

            } catch (error) {
                console.error("Delivery acknowledgment error:", error);
            }
        });



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




        socket.on("send_message", async (data, callback) => {
            const respond = (result) => {
                if (typeof callback === "function") {
                    callback(result);
                }
            };

            try {
                const { conversationId, content } = data || {};

                if (
                    typeof conversationId !== "string" ||
                    !/^[0-9a-fA-F]{24}$/.test(conversationId)
                ) {
                    return respond({
                        success: false,
                        message: "Invalid conversation ID",
                    });
                }

                if (typeof content !== "string" || !content.trim()) {
                    return respond({
                        success: false,
                        message: "Message content is required",
                    });
                }

                const conversation = await Conversation.findById(conversationId);

                if (!conversation) {
                    return respond({
                        success: false,
                        message: "Conversation not found",
                    });
                }

                const isParticipant = conversation.participants.some(
                    (participant) => participant.equals(socket.userId)
                );

                if (!isParticipant) {
                    return respond({
                        success: false,
                        message: "You are not allowed to send messages here",
                    });
                }

                const receipts = conversation.participants
                    .filter((participant) => !participant.equals(socket.userId))
                    .map((participant) => ({
                        user: participant,
                        deliveredAt: null,
                        readAt: null,
                    }));

                const newMessage = await Message.create({
                    conversation: conversationId,
                    sender: socket.userId,
                    content: content.trim(),
                    messageType: "text",
                    receipts,
                });

                conversation.lastMessage = newMessage._id;
                await conversation.save();

                await newMessage.populate(
                    "sender",
                    "username profilePicture"
                );

                io.to(conversationId).emit("new_message", newMessage);

                // Confirm successful persistence to the sender
                respond({
                    success: true,
                    message: "Message sent successfully",
                    data: newMessage,
                });

            } catch (error) {
                console.error("Send message error:", error);

                respond({
                    success: false,
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
