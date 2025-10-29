import express from 'express';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDb from './config/db.js';
import { setupSocket } from './socket.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import passport from './config/passport.js';
import session from 'express-session';

const app = express();
const server = http.createServer(app);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
}))
app.use(passport.initialize());
app.use(passport.session());

// Setup Socket.IO
const io = setupSocket(server);

connectDb();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const port = process.env.PORT || 3000;
const corsOption = {
    origin: [
        "https://code-collab-2cj6-e9mi3e6qy-abhis-projects-82b05815.vercel.app",
        'http://localhost:5173',
        "https://code-collab-three-smoky.vercel.app", // production
        "https://code-collab-git-main-abhis-projects-82b05815.vercel.app", // optional preview
        "https://code-collab-90z00scxa-abhis-projects-82b05815.vercel.app",

        'https://praiseworthy-unlarge-jerry.ngrok-free.dev',
    ],
    credentials: true,
}
app.use(cors(corsOption));

app.get('/', (req, res) => {
    res.send("server is running")
})


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/session', sessionRoutes);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export { io };
