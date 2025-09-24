import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDb from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';



const app = express();
connectDb();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const port= process.env.PORT || 3000;
const corsOption={
    origin:'http://localhost:5173',
    credentials:true,
}
app.use(cors(corsOption));

app.get('/',(req,res)=>{
    res.send("server is running")
})
app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/user', userRoutes);

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})