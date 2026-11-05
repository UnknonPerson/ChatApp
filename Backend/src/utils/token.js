import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        }
    );
};

export const generateRefreshToken = (userId) => {
    
};

export const verifyAccessToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};