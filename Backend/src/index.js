import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

connectDB()
    .then(() => {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Error starting the server:", error);
      process.exit(1);
    });