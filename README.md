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
- **WebRTC Video Calling**
  - Automatic video calls on room join
  - Peer-to-peer video streaming
  - Multiple user support in single room
  - Video controls (camera on/off, mute/unmute)
  - Picture-in-picture display for remote users
  - Connection status indicators
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
- Socket.IO Client for real-time communication
- WebRTC for peer-to-peer video calling

### Backend
- Node.js with Express
- MongoDB for database
- Mongoose for ODM
- JWT for authentication
- Socket.IO for real-time communication
- HTTP server integration with Socket.IO
- WebRTC signaling server

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

**WebRTC Video Calling Events**
```javascript
// Send video call offer
socket.emit('video-call-offer', {
  offer: RTCSessionDescription,
  roomId: 'string'
});

// Send video call answer
socket.emit('video-call-answer', {
  answer: RTCSessionDescription,
  roomId: 'string',
  targetUserId: 'string'
});

// Send ICE candidate
socket.emit('ice-candidate', {
  candidate: RTCIceCandidate,
  roomId: 'string'
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

**WebRTC Video Events**
```javascript
// New user ready for video
socket.on('user-ready-for-video', (data) => {
  // data: { userId, username, roomId }
});

// Received video call offer
socket.on('video-call-offer', (data) => {
  // data: { offer, callerId, callerName, roomId }
});

// Received video call answer
socket.on('video-call-answer', (data) => {
  // data: { answer, answererId, answererName, roomId, targetUserId }
});

// Received ICE candidate
socket.on('ice-candidate', (data) => {
  // data: { candidate, senderId, roomId }
});

// User video disconnected
socket.on('user-video-disconnected', (data) => {
  // data: { userId, username, roomId }
});
```

### Socket Architecture
- **Authentication**: JWT token verification on socket connection
- **Room Management**: Users join specific room channels for targeted messaging
- **Message Broadcasting**: Real-time message delivery to all room members
- **Database Integration**: Messages saved to MongoDB before broadcasting
- **WebRTC Signaling**: Server acts as signaling relay for WebRTC connections
- **Video Connection Management**: Automatic video setup and cleanup
- **Error Handling**: Socket error events for connection issues

### Current Implementation Status
- ✅ Socket.IO server setup with HTTP integration
- ✅ JWT authentication middleware for socket connections
- ✅ Room joining and user notifications
- ✅ Real-time chat messaging with MongoDB persistence
- ✅ Message normalization and display
- ✅ **WebRTC video calling with automatic room-based video**
  - ✅ Automatic video initialization on room join
  - ✅ Peer-to-peer video streaming
  - ✅ Multiple user support (group video calls)
  - ✅ WebRTC signaling through Socket.IO
  - ✅ ICE candidate exchange for NAT traversal
  - ✅ Video controls (camera/microphone toggle)
  - ✅ Connection status indicators
  - ✅ Automatic cleanup on user disconnect
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
- ✅ **WebRTC Video Calling System**
  - Automatic video calls on room join/leave
  - Peer-to-peer video streaming via WebRTC
  - Multi-user video support (group calls)
  - Camera and microphone controls
  - Picture-in-picture remote video display
  - WebRTC signaling through Socket.IO
  - ICE candidate exchange for NAT traversal
  - Connection status indicators
  - Automatic video cleanup on disconnect
- ✅ **Code Editor Integration**
  - Monaco Editor (VS Code engine)
  - Multiple language support
  - Syntax highlighting
- ✅ **User Activity Notifications**
  - Live join/leave notifications
  - Connection status indicators
- 🔄 **Real-time Code Synchronization** (planned)

## Future Enhancements
1. Real-time code synchronization
2. Code execution environment
3. Multiple file support
4. Version control integration
5. Screen sharing in video calls
6. Recording video calls
7. Code snippets library
8. Custom themes and settings
9. Mobile app development
10. TURN server integration for better connectivity

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
# WebRTC is built into modern browsers - no additional packages needed
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

### WebRTC Video Call Flow
1. **User A** joins room → Camera initializes → No video connection (first user)
2. **User B** joins same room → Camera initializes → Server emits `user-ready-for-video`
3. **User A** receives notification → Creates WebRTC offer → Sends via Socket.IO
4. **User B** receives offer → Creates WebRTC answer → Sends back via Socket.IO
5. **Both users** exchange ICE candidates → Direct P2P connection established
6. **Video streams** flow directly between users (bypassing server)
7. **User leaves** → Server emits `user-video-disconnected` → Connections cleaned up

### Example Flow
```
User A joins room → Socket + Camera → Video ready (no connection yet)
User B joins same room → Socket + Camera → WebRTC offer/answer exchange
Both users connected → Direct video streaming (P2P)
User C joins → Creates connections with both A & B
User A leaves → B & C maintain their connection
```

## WebRTC Architecture

### Signaling Server (Socket.IO)
The server acts as a **signaling relay** for WebRTC connections:
- **Does NOT handle video data** - only setup messages
- Forwards offers, answers, and ICE candidates between users
- Manages room-based video connection setup
- Handles automatic video initialization and cleanup

### Client-Side WebRTC
Each client maintains:
- **Local Stream**: User's camera/microphone feed
- **Peer Connections**: One RTCPeerConnection per remote user
- **Remote Streams**: Video/audio from other users
- **ICE Candidates**: Network routing options for connection

### Video Call Features
- **Automatic Start**: Video calls begin when joining a room
- **Multiple Users**: Support for group video calls (N-to-N connections)
- **Camera Controls**: Toggle camera on/off
- **Microphone Controls**: Mute/unmute audio
- **Picture-in-Picture**: Remote users shown in small windows
- **Connection Status**: Real-time connection indicators
- **Responsive UI**: Adapts to different screen sizes

### Browser Compatibility
- **Chrome**: Full WebRTC support
- **Firefox**: Full WebRTC support  
- **Safari**: WebRTC support (iOS 11+)
- **Edge**: Full WebRTC support
- **Mobile**: Supported on modern mobile browsers

### Console Logging
The application includes comprehensive console logging for debugging:
- 🏠 Component lifecycle events
- 🔐 Authentication attempts  
- ✅ Successful connections
- 📍 Room joining events
- 📢 Broadcast notifications
- 🔌 Disconnection events

## Documentation

### Technical Guides
- **`webrtc_implementation_guide.md`**: Comprehensive 88-page guide covering every aspect of the WebRTC implementation
  - Complete function documentation
  - Data flow diagrams
  - Payload structures
  - Error handling
  - Testing scenarios
- **`socket_workflow.md`**: Socket.IO function flow diagrams and workflow documentation

### API Documentation
All API endpoints are documented above with request/response examples.

### WebRTC Documentation
Detailed WebRTC implementation with:
- Step-by-step connection flow
- Client and server function explanations
- Real-world debugging scenarios
- Performance considerations

## Security Features
- JWT token authentication for HTTP and Socket.IO
- Password hashing with bcryptjs
- Protected API routes
- Socket authentication middleware
- Role-based access control
- Secure room joining mechanism
- WebRTC peer-to-peer encryption (built-in)
- STUN server for NAT traversal

## Contributors
- [Abhishek]

## License
MIT License

---

This project is part of a collaborative coding platform initiative to make pair programming and code sharing more accessible and efficient.