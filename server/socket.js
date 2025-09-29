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
                'http://30.10.38.51:5173', // Replace with your computer's IP

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
            console.log(`${socket.username} attempting to join room: ${roomId}`);

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
                console.log(`${socket.username} was in room ${socket.currentRoomId}, notifying others of disconnect`);

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

    });

    return io;
}