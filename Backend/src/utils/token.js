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
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
};

export const verifyAccessToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};

export const verifyRefreshToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return decoded;
}

//This Decoded variable will contain 
// {
//     userId: "12345",
//     iat: 1793894400,
//     exp: 1794499200
// }