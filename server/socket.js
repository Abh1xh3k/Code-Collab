import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import User from "./models/User.js";
import Message from './models/Message.js';

export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://172.20.10.4/:5173", // Replace with your computer's IP
                'http://30.10.38.51:5173',
                'https://praiseworthy-unlarge-jerry.ngrok-free.dev',
                'https://code-collab-three-smoky.vercel.app' ,// Your ngrok domain
            ],
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
    console.log(' Socket.IO server initialized');


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
           

            socket.join(roomId);
            socket.currentRoomId = roomId;
            console.log(`${socket.username} successfully joined room: ${roomId}`);

            socket.to(roomId).emit('user-joined-room', {
                userId: socket.userId,
                username: socket.username,
                message: `${socket.username} joined the room`
            });

            socket.to(roomId).emit('user-ready-for-video', {
                userId: socket.userId,
                username: socket.username,
                roomId: roomId
            });
        console.log(`Broadcasted join notification to other users in room ${roomId}`);
        });
        socket.on('disconnect', () => {
            console.log(`${socket.username} disconnected from socket (Socket ID: ${socket.id})`);


            if (socket.currentRoomId) {

                socket.to(socket.currentRoomId).emit('user-left-room', {
                    userId: socket.userId,
                    username: socket.username,
                    message: `${socket.username} disconnected`
                });

                socket.to(socket.currentRoomId).emit('user-video-disconnected', {
                    userId: socket.userId,
                    username: socket.username,
                    roomId: socket.currentRoomId
                });
                console.log(`Broadcasted disconnect notification to other users in room ${socket.currentRoomId}`);
            }
        });

        socket.on('send-message', async (data) => {
            console.log(`Message from ${socket.username} to room: ${data.roomId}`);
            try {
                const { roomId, text } = data;
                const message = await Message.create({
                    roomId,
                    userId: socket.userId,
                    text
                });
                const messageData = {
                    _id: message._id,
                    text: message.text,
                    sender: {
                        _id: socket.userId,
                        username: socket.username,
                    },
                    createdAt: message.createdAt
                };

                io.to(roomId).emit('new-message', messageData);
            } catch (err) {
                socket.emit('message-error', { error: 'Failed to send message' })
            }
        });

        socket.on('video-call-offer', (data) => {
            console.log(`Video call offer from ${socket.username} to room: ${data.roomId}`);

            socket.to(data.roomId).emit('video-call-offer', {
                offer: data.offer,
                callerId: socket.userId,
                callerName: socket.username,
                roomId: data.roomId
            });
        });

        socket.on('video-call-answer', (data) => {
            console.log(`Video call answer from ${socket.username} in room: ${data.roomId}`);

            socket.to(data.roomId).emit('video-call-answer', {
                answer: data.answer,
                answererId: socket.userId,
                answererName: socket.username,
                roomId: data.roomId,
                targetUserId: data.targetUserId
            });
        });

        socket.on('ice-candidate', (data) => {
            console.log(`ICE candidate from ${socket.username} in room: ${data.roomId}`);

            socket.to(data.roomId).emit('ice-candidate', {
                candidate: data.candidate,
                senderId: socket.userId,
                roomId: data.roomId
            });
        });

        socket.on('code-change',({roomId,code})=>{
            console.log("Code change received:", { roomId, codeLength: code?.length });
            socket.to(roomId).emit("codeUpdate",code);
        });

        socket.on('language-change', (data) => {
            console.log(`Language change from ${socket.username} in room: ${data.roomId} to ${data.language}`);
            socket.to(data.roomId).emit('languageUpdate', {
                language: data.language,
                code: data.code,
                userId: socket.userId,
                username: socket.username
            });
        });

        // Code execution WebSocket events
        socket.on('code-execution', (data) => {
            console.log(`Code execution from ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('code-execution', {
                roomId: data.roomId,
                language: data.language,
                code: data.code,
                userId: socket.userId,
                username: socket.username
            });
        });

        socket.on('execution-result', (data) => {
            console.log(`Execution result from ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('execution-result', {
                roomId: data.roomId,
                result: data.result,
                isError: data.isError,
                userId: socket.userId,
                username: socket.username
            });
        });

        socket.on('input-request', (data) => {
            console.log(`Input request from ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('input-request', {
                roomId: data.roomId,
                prompt: data.prompt,
                userId: socket.userId,
                username: socket.username
            });
        });

        socket.on('input-response', (data) => {
            console.log(`Input response from ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('input-response', {
                roomId: data.roomId,
                input: data.input,
                userId: socket.userId,
                username: socket.username
            });
        });

        socket.on('execution-continue', (data) => {
            console.log(`Execution continuation from ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('execution-continue', {
                roomId: data.roomId,
                allInputs: data.allInputs,
                userId: socket.userId,
                username: socket.username
            });
        });

        // Tldraw whiteboard collaboration - using snapshots
        socket.on('tldraw_snapshot', (data) => {
            console.log(`Tldraw snapshot from ${socket.username} in room: ${data.roomId}`);
            
            // Add user info to the message
            const messageWithUser = {
                ...data,
                userId: socket.userId,
                username: socket.username,
                timestamp: Date.now()
            };

            // Broadcast to other users in the same room
            socket.to(data.roomId).emit('tldraw_snapshot', messageWithUser);
        });

        // Whiteboard modal synchronization
        socket.on('open-whiteboard', (data) => {
            console.log(`Whiteboard opened by ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('open-whiteboard', {
                roomId: data.roomId,
                userId: socket.userId,
                username: socket.username
            });
        });

        socket.on('close-whiteboard', (data) => {
            console.log(`Whiteboard closed by ${socket.username} in room: ${data.roomId}`);
            socket.to(data.roomId).emit('close-whiteboard', {
                roomId: data.roomId,
                userId: socket.userId,
                username: socket.username
            });
        });
  
    });

    return io;
}