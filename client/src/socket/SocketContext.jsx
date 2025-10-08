import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [roomId, setRoomId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Use environment variable for production (ngrok) or fallback to localhost for development
            const socketUrl = import.meta.env.VITE_SOCKET_URL || 
                             (window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);
            console.log('🔗 Connecting to socket server:', socketUrl);
            console.log('🔧 Environment VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
            
            const newSocket = io(socketUrl, {
                auth: {
                    token: token
                }
            });

            newSocket.on('connect', () => {
                console.log('✅ Connected to server successfully');
                console.log('Socket ID:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('❌ Disconnected from server. Reason:', reason);
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Connection error:', error.message);
                console.error('Error details:', error);
                setIsConnected(false);
            });

            // Add authentication error handler
            newSocket.on('error', (error) => {
                console.error('❌ Socket error:', error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, []);


    const emitCodeChange = (roomId, content, language) => {
        if (socket && isConnected) {
            console.log('📤 Emitting code-change:', { roomId, contentLength: content?.length, language });
            socket.emit('code-change', { roomId, content, language });
        } else {
            console.log('❌ Cannot emit code-change - not connected:', { socket: !!socket, isConnected });
        }
    };

    const emitLanguageChange = (roomId, language) => {
        if (socket && isConnected) {
            console.log('📤 Emitting language-change:', { roomId, language });
            socket.emit('language-change', { roomId, language });
        } else {
            console.log('❌ Cannot emit language-change - not connected:', { socket: !!socket, isConnected });
        }
    };

    const emitCodeExecution = (roomId, language, code) => {
        if (socket && isConnected) {
            socket.emit('code-execution', { roomId, language, code });
        }
    };

    const emitExecutionResult = (roomId, result, isError) => {
        if (socket && isConnected) {
            socket.emit('execution-result', { roomId, result, isError });
        }
    };

    const emitInputRequest = (roomId, prompt) => {
        if (socket && isConnected) {
            socket.emit('input-request', { roomId, prompt });
        }
    };

    const emitInputResponse = (roomId, input) => {
        if (socket && isConnected) {
            socket.emit('input-response', { roomId, input });
        }
    };

    const joinCodingSession = (roomId) => {
        if (socket && isConnected) {
            console.log('📤 Joining coding session:', roomId);
            setRoomId(roomId);
            socket.emit('join-coding-session', roomId);
        } else {
            console.log('❌ Cannot join coding session - not connected:', { socket: !!socket, isConnected });
        }
    };

    const value = {
        socket,
        isConnected,
        roomId,
      
        emitCodeChange,
        emitLanguageChange,
        emitCodeExecution,
        emitExecutionResult,
        emitInputRequest,
        emitInputResponse,
        joinCodingSession
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};