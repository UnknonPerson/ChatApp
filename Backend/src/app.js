import express from "express";
import authRouter from './routes/auth.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use('/api/auth',authRouter)

export default app;