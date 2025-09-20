# Code-Collab: Collaborative IDE

## Overview
Code-Collab is a real-time collaborative integrated development environment (IDE) that allows multiple users to code together in the same workspace. The platform features live code synchronization, real-time chat, and secure room management.

## Features

### Authentication System
- Secure user registration and login
- JWT-based authentication
- Protected routes and middleware
- Local storage for token management

### Room Management
- Create private/public coding rooms
- Join rooms via unique codes
- Role-based access control (admin, editor, viewer)
- Real-time participant management

### Code Editor
- Monaco Editor integration (same as VS Code)
- Multiple language support
- Real-time code synchronization
- Syntax highlighting and autocompletion

### Real-time Chat
- In-room messaging system
- Real-time message updates
- User presence indicators
- Message history

## Technical Stack

### Frontend
- React.js with Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- Monaco Editor for code editing

### Backend
- Node.js with Express
- MongoDB for database
- Mongoose for ODM
- JWT for authentication
- Socket.IO for real-time features

## Project Structure

```tree
client/
├── src/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── room/
│   │   └── Room.jsx
│   ├── workspace/
│   │   └── Editor.jsx
│   └── App.jsx
server/
├── controllers/
│   ├── authController.js
│   ├── messageController.js
│   └── roomController.js
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Message.js
│   └── Session.js
├── middleware/
│   └── authMiddleware.js
└── routes/
    ├── authRoutes.js
    ├── roomRoutes.js
    └── messageRoutes.js
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/login` - User login

### Rooms
- POST `/api/room/create` - Create new room
- POST `/api/room/:roomId/join` - Join existing room
- GET `/api/room/:roomId` - Get room details

### Messages
- POST `/api/messages/:roomId` - Send message
- GET `/api/messages/:roomId` - Get room messages

## Models

### User
```javascript
{
  email: String,
  password: String (hashed),
  name: String
}
```

### Room
```javascript
{
  name: String,
  owner: ObjectId,
  participants: [{
    userId: ObjectId,
    role: String
  }],
  isPrivate: Boolean,
  joinCode: String
}
```

### Message
```javascript
{
  roomId: ObjectId,
  userId: ObjectId,
  text: String,
  createdAt: Date
}
```

## Current Status
- ✅ User authentication system
- ✅ Basic room creation and management
- ✅ Chat functionality
- ✅ Code editor integration
- 🔄 Real-time code synchronization (in progress)
- 🔄 User presence system (in progress)

## Future Enhancements
1. Code execution environment
2. Multiple file support
3. Version control integration
4. Voice/Video chat
5. Code snippets library
6. Custom themes and settings

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/Abh1xh3k/Code-Collab.git
```

2. Install dependencies
```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install
```

3. Set up environment variables
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. Run the application
```bash
# Frontend
npm run dev

# Backend
npm start
```

## Security Features
- JWT token authentication
- Password hashing
- Protected API routes
- Role-based access control
- Secure room joining mechanism

## Contributors
- [Abhishek]

## License
MIT License

---

This project is part of a collaborative coding platform initiative to make pair programming and code sharing more accessible and efficient.