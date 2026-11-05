import User from "../models/user.models.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateAccessToken } from '../utils/token.js';

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }
        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (normalizedUsername.length < 3 || password.length < 8) {
            return res.status(400).json({
                message: "Username must be at least 3 characters and password at least 8 characters."
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists."
            });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        // 8. Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username or email already exists."
            });
        }
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "email and password required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "User Not Found" });
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Unauthorize/Wrong Password" });
        }

        const accessToken = generateAccessToken(user._id);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login Successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unexpected error happened"
        });
    }
};