
import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        deliveredAt: {
            type: Date,
            default: null
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        _id: false
    }
);

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            trim: true,
            default: ""
        },

        messageType: {
            type: String,
            enum: ["text", "image", "file"],
            default: "text"
        },

        // Delivery and read status for each recipient
        receipts: {
            type: [receiptSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

messageSchema.index({
    conversation: 1,
    createdAt: -1,
    _id: -1
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
