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

### Real-time Features
- **Socket.IO Real-time Communication**
  - JWT-based socket authentication
  - Room-based message broadcasting
  - Live user join/leave notifications
  - Real-time participant management
- **Real-time Chat System**
  - Instant messaging within rooms
  - Message persistence to MongoDB
  - Real-time message delivery to all room members
  - Message normalization and display
- **User Activity**
  - Live connection status indicators
  - Room join/leave notifications
  - Clean console logging for debugging

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
- Socket.IO for real-time communication
- HTTP server integration with Socket.IO

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
│   │   ├── Editor.jsx
│   │   ├── CodeEditor.jsx
│   │   └── LanguageSelector.jsx
│   ├── components/
│   │   ├── ChatBox.jsx
│   │   └── Profile.jsx
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
├── routes/
│   ├── authRoutes.js
│   ├── roomRoutes.js
│   └── messageRoutes.js
├── socket.js (Socket.IO configuration)
└── server.js
```

## API Documentation

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/signup
Content-Type: application/json
```
**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Response:** 201 Created
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json
```
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:** 200 OK
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "message": "Login Successful"
  }
}
```

### Room Endpoints

#### Create Room
```http
POST /api/room/create
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "string",
  "isPrivate": "boolean",
  "joinCode": "string"
}
```
**Response:** 201 Created
```json
{
  "message": "Room Created Successfully",
  "room": "roomId"
}
```

#### Join Room
```http
POST /api/room/join
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "roomId": "string",
  "joinCode": "string"
}
```
**Response:** 200 OK
```json
{
  "message": "Joined Room Successfully"
}
```

### Message Endpoints

#### Send Message
```http
POST /api/chat/sendMessage
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "roomId": "string",
  "text": "string"
}
```
**Response:** 201 Created
```json
{
  "message": "Message Sent successfully",
  "data": {
    "roomId": "string",
    "userId": "string",
    "text": "string"
  }
}
```

#### Get Messages
```http
GET /api/chat/getMessage/:roomId
Authorization: Bearer <token>
```
**Response:** 200 OK
```json
{
  "messages": [
    {
      "userId": {
        "username": "string",
        "email": "string"
      },
      "text": "string",
      "createdAt": "date"
    }
  ]
}
```

### Session Endpoints

#### Get Session
```http
GET /api/session/:roomId
Authorization: Bearer <token>
```
**Response:** 200 OK
```json
{
  "roomId": "string",
  "content": "string",
  "language": "string",
  "updatedBy": "string",
  "updatedAt": "date"
}
```

#### Update Session
```http
PUT /api/session/:roomId
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "content": "string",
  "language": "string"
}
```
**Response:** 200 OK
```json
{
  "roomId": "string",
  "content": "string",
  "language": "string",
  "updatedBy": "string",
  "updatedAt": "date"
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```
**Response:** 200 OK
```json
{
  "username": "string",
  "email": "string"
}
```

## Socket.IO Real-time Communication

### Connection & Authentication
```javascript
// Client connection with JWT authentication
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('authToken') }
});
```

### Socket Events

#### Client → Server Events

**Join Room**
```javascript
socket.emit('join-room', roomId);
```

**Send Message**
```javascript
socket.emit('send-message', {
  roomId: 'string',
  text: 'string'
});
```

#### Server → Client Events

**User Joined Room**
```javascript
socket.on('user-joined-room', (data) => {
  // data: { userId, username, message, timestamp }
});
```

**New Message**
```javascript
socket.on('new-message', (messageData) => {
  // messageData: { _id, text, sender: { _id, username }, createdAt }
});
```

**User Left Room**
```javascript
socket.on('user-left-room', (data) => {
  // data: { userId, username, message }
});
```

### Socket Architecture
- **Authentication**: JWT token verification on socket connection
- **Room Management**: Users join specific room channels for targeted messaging
- **Message Broadcasting**: Real-time message delivery to all room members
- **Database Integration**: Messages saved to MongoDB before broadcasting
- **Error Handling**: Socket error events for connection issues

### Current Implementation Status
- ✅ Socket.IO server setup with HTTP integration
- ✅ JWT authentication middleware for socket connections
- ✅ Room joining and user notifications
- ✅ Real-time chat messaging with MongoDB persistence
- ✅ Message normalization and display
- 🔄 WebRTC video calling (planned)
- 🔄 Code editor synchronization (planned)

### Error Responses

All endpoints may return the following error responses:

- **400 Bad Request:** When required fields are missing or invalid
- **401 Unauthorized:** When authentication token is missing or invalid
- **403 Forbidden:** When user doesn't have permission to access a resource
- **404 Not Found:** When requested resource doesn't exist
- **500 Server Error:** When an unexpected error occurs on the server

## Socket.IO Real-time Events

### Client → Server Events

#### Join Room
```javascript
socket.emit('join-room', roomId)
```
**Description:** Joins a room and notifies other participants
**Parameters:**
- `roomId`: String - The room identifier

### Server → Client Events

#### User Joined Room
```javascript
socket.on('user-joined-room', (data) => {
  // Handle user join notification
})
```
**Event Data:**
```json
{
  "userId": "string",
  "username": "string", 
  "message": "string"
}
```

#### Connection Events
```javascript
// Connection successful
socket.on('connect', () => {
  console.log('Connected to server');
});

// Connection error
socket.on('connect_error', (error) => {
  console.log('Connection failed:', error.message);
});

// Disconnected
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### Authentication
Socket connections require JWT authentication:
```javascript
const socket = io('http://localhost:3000', {
  auth: { 
    token: 'jwt_token_here' 
  }
});
```

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
- ✅ **User Authentication System**
  - JWT-based authentication with secure login/signup
  - Protected routes and middleware
- ✅ **Room Management**
  - Create/join rooms with unique codes
  - Real-time participant management
- ✅ **Socket.IO Real-time Communication**
  - Server setup with HTTP integration
  - JWT authentication for socket connections
  - Room-based message broadcasting
- ✅ **Real-time Chat System**
  - Instant messaging within rooms
  - Message persistence to MongoDB
  - Real-time message delivery to all room members
- ✅ **Code Editor Integration**
  - Monaco Editor (VS Code engine)
  - Multiple language support
  - Syntax highlighting
- ✅ **User Activity Notifications**
  - Live join/leave notifications
  - Connection status indicators
- 🔄 **Real-time Code Synchronization** (planned)
- 🔄 **WebRTC Video Calling** (planned)

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
PORT=3000
```

4. Install additional client dependencies
```bash
cd client
npm install socket.io-client
```

5. Run the application
```bash
# Frontend (runs on http://localhost:5173)
cd client
npm run dev

# Backend (runs on http://localhost:3000)
cd server
npm start
```

## Real-time Communication Flow

### Socket.IO Workflow
1. **Authentication**: User logs in via HTTP → Receives JWT token
2. **Room Entry**: User navigates to workspace → Socket connects with JWT
3. **Room Joining**: Socket emits `join-room` event with room ID
4. **Notifications**: Other users in room receive `user-joined-room` event
5. **UI Updates**: Toast notifications show user activity in real-time

### Example Flow
```
User A joins room → Socket connection → No notification (first user)
User B joins same room → Socket connection → User A sees "User B joined" toast
User C joins same room → Socket connection → Both A & B see "User C joined" toast
```

### Console Logging
The application includes comprehensive console logging for debugging:
- 🏠 Component lifecycle events
- 🔐 Authentication attempts  
- ✅ Successful connections
- 📍 Room joining events
- 📢 Broadcast notifications
- 🔌 Disconnection events

## Security Features
- JWT token authentication for HTTP and Socket.IO
- Password hashing with bcryptjs
- Protected API routes
- Socket authentication middleware
- Role-based access control
- Secure room joining mechanism

## Contributors
- [Abhishek]

## License
MIT License

---

This project is part of a collaborative coding platform initiative to make pair programming and code sharing more accessible and efficient.