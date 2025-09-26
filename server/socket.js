import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import User from "./models/User.js";
import Message from'./models/Message.js';

export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        }
    });

    console.log(' Socket.IO server initialized');

    // Simple auth middleware
    io.use(async (socket, next) => {
        console.log('Socket authentication attempt...');
        try {
            const token = socket.handshake.auth.token;
            console.log('Token received:', token ? 'Yes' : 'No');
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            socket.userId = user._id.toString();
            socket.username = user.username;
            
            console.log(` Socket authenticated for user: ${socket.username} (ID: ${socket.userId})`);
            next();
        } catch (error) {
            console.log(' Socket authentication failed:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log(` ${socket.username} connected to socket (Socket ID: ${socket.id})`);

     
        socket.on('join-room', (roomId) => {
            console.log(`${socket.username} attempting to join room: ${roomId}`);
            
            socket.join(roomId);
            console.log(`${socket.username} successfully joined room: ${roomId}`);
            
          
            socket.to(roomId).emit('user-joined-room', {
                userId: socket.userId,
                username: socket.username,
                message: `${socket.username} joined the room`
            });
            
            console.log(`Broadcasted join notification to other users in room ${roomId}`);
        });

        socket.on('disconnect', () => {
            console.log(`${socket.username} disconnected from socket (Socket ID: ${socket.id})`);
            
          
            if (socket.currentRoomId) {
                console.log(`${socket.username} was in room ${socket.currentRoomId}, notifying others of disconnect`);
                
                socket.to(socket.currentRoomId).emit('user-left-room', {
                    userId: socket.userId,
                    username: socket.username,
                    message: `${socket.username} disconnected`
                });
                
                console.log(`Broadcasted disconnect notification to other users in room ${socket.currentRoomId}`);
            }
        });

        socket.on('send-message' ,async(data)=>{
            console.log(`📨 Message from ${socket.username} to room: ${data.roomId}`);
            try{
                const{roomId,text}=data;
                const message=await Message.create({
                    roomId,
                    userId:socket.userId,
                    text
                });

                const messageData={
                    _id:message._id,
                    text:message.text,
                    sender:{
                        _id:socket.userId,
                        username:socket.username,
                    },
                    createdAt:message.createdAt
                };

                io.to(roomId).emit('new-message',messageData);
            }catch(err){
                socket.emit('message-error',{error:'Failed to send message'})
            }
        });
    });

    return io;
}