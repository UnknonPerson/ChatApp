import User from "../models/user.model.js";
import RefreshToken from '../models/refreshToken.model.js'
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { hashToken } from '../utils/hashToken.js'

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
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
        }

        const accessToken = generateAccessToken(user._id);

        const TokenRefresh = generateRefreshToken(user._id);

        const tokenHash = hashToken(TokenRefresh);

        await RefreshToken.create({
            user: user._id,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", TokenRefresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

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

export const refreshAccessToken = async (req, res) => {
    try {
        // 1. Read refresh token from cookie
        const incomingToken = req.cookies?.refreshToken;

        if (!incomingToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // 2. Verify refresh JWT
        let decoded;

        try {
            decoded = verifyRefreshToken(incomingToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        // 3. Hash incoming token
        const incomingHash = hashToken(incomingToken);

        // 4. Atomically revoke the old, active refresh-token record
        const now = new Date();

        const oldSession = await RefreshToken.findOneAndUpdate(
            {
                tokenHash: incomingHash,
                user: decoded.userId,
                revokedAt: null,
                expiresAt: { $gt: now }
            },
            {
                $set: { revokedAt: now }
            },
            {
                new: true
            }
        );

        if (!oldSession) {
            return res.status(401).json({
                success: false,
                message: "Refresh session is invalid, expired or revoked"
            });
        }

        // 5. Generate replacement tokens
        const userId = oldSession.user;

        const newAccessToken = generateAccessToken(userId);
        const newRefreshToken = generateRefreshToken(userId);

        // 6. Hash replacement refresh token
        const newTokenHash = hashToken(newRefreshToken);

        // 7. Save replacement refresh-token record
        await RefreshToken.create({
            user: userId,
            tokenHash: newTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // 8. Update cookies
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/"
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        // 9. Send response
        return res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully"
        });

    } catch (error) {
        console.error("Refresh token error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const logout = async (req, res) => {
    try {
        const incomingToken = req.cookies?.refreshToken;

        // Revoke only the current device's refresh-token session
        if (incomingToken) {
            const tokenHash = hashToken(incomingToken);

            await RefreshToken.updateOne(
                {
                    tokenHash,
                    revokedAt: null
                },
                {
                    $set: {
                        revokedAt: new Date()
                    }
                }
            );
        }

        // Clear authentication cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        };

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};