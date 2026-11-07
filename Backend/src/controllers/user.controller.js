import User from '../models/user.model.js'
import mongoose from 'mongoose';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js'

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

export const updateProfile = async (req, res) => {
    try {
        // 1. Get authenticated user's ID
        const userId = req.user.userId;

        // 2. Get allowed fields
        const { username, profilePicture } = req.body;

        // 3. Build update object
        const updateData = {};

        if (username !== undefined) {
            const trimmedUsername = username.trim();

            if (trimmedUsername.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "Username must contain at least 3 characters"
                });
            }

            updateData.username = trimmedUsername;
        }

        if (profilePicture !== undefined) {
            updateData.profilePicture = profilePicture;
        }

        // 4. Prevent empty updates
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update"
            });
        }

        // 5. Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        ).select("_id username email profilePicture createdAt updatedAt");

        // 6. Check user existence
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 7. Return updated profile
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update profile error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Profile photo is missing"
            });
        }

        const result = await uploadToCloudinary(file.buffer);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                $set: {
                    profilePicture: result.secure_url,
                    profilePicturePublicId: result.public_id
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("_id username email profilePicture createdAt");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile picture upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture"
        });
    }
};