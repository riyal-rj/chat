import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './db/db.config.js';
import userRoutes from './routes/user.routes.js'
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import morgan from 'morgan';


const app=express();

app.use(morgan("dev"));

app.use(express.json())

app.use(cookieParser())

app.use('/api/user',userRoutes);
app.use('/api/chats',chatRoutes);
app.use('/api/msg',messageRoutes)


connectDB();

export default app;