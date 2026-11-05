
import { verifyAccessToken } from "../utils/token.js";

export const protect = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decodedToken = verifyAccessToken(token);

        req.user = decodedToken;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

// export const protect = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authentication required"
//             });
//         }

//         const token = authHeader.split(" ")[1];

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid authorization header"
//             });
//         }

//         const decodedToken = verifyAccessToken(token);

//         req.user = decodedToken;

//         next();

//     } catch (error) {
//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token"
//         });
//     }
// };
