
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import conversationRouter from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.route.js";

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/messages", messageRoutes);

export default app;
