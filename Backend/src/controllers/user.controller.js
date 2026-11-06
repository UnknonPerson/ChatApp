import User from '../models/user.model.js'
import mongoose from 'mongoose';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must contain at least 2 characters"
            });
        }

        const users = await User.find({
            username: {
                $regex: query.trim(),
                $options: "i"
            },
            _id: { $ne: req.user.userId }
        })
        .select("_id username profilePicture")
        .limit(10);

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Search users error:", error);

        return res.status(500).json({
            success: false,
            message: "Unexpected server error"
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        // Find user
        const user = await User.findById(userId)
            .select("_id username profilePicture");

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User found",
            user
        });

    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};