import express from "express";
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js'
import cookieParser from 'cookie-parser';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use('/api/auth',authRouter);
app.use('/api/users',userRouter);

export default app;