import express from'express';
import connectDb from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roomRoutes from './routes/roomRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

const app= express();
connectDb();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
const port= process.env.PORT || 3000;

app.get('/',(req,res)=>{
    res.send("server is running")
})
app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/chat', chatRoutes);

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})