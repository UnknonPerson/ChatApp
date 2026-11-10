
import "dotenv/config";

import { createServer } from "node:http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";

// Create HTTP server using Express
const httpServer = createServer(app);

// Connect database first
connectDB()
    .then(() => {

        // Initialize Socket.IO
        initializeSocket(httpServer);

        const PORT = process.env.PORT || 5000;

        // Start HTTP + Socket.IO server
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch((error) => {
        console.error("Error starting server:", error);
        process.exit(1);
    });
