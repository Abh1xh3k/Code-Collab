import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_BASE_URL, SOCKET_URL } from '../Constants';
import getWebRTCConfig from '../utils/webrtcConfig';

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionCount, setConnectionCount] = useState(0);
  const [localVideoReady, setLocalVideoReady] = useState(false);

 
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const peerConnectionsRef = useRef({});
  const pendingIceCandidatesRef = useRef({});
  const containerRef = useRef(null);

  const token = localStorage.getItem("authToken") || "";
  const roomId = localStorage.getItem("currentRoomId") || null;
  const userId = localStorage.getItem("userId") || null;
  const currentUsername = localStorage.getItem("username") || "You";

  const ScrollbarStyles = () => (
    <style>{`
      .chat-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(156,163,175,1) rgba(243,244,246,1);
      }
      .chat-scroll::-webkit-scrollbar { width: 12px; }
      .chat-scroll::-webkit-scrollbar-track { 
        background: rgba(243,244,246,1); 
        border-radius: 10px; 
        margin: 4px 0;
      }
      .chat-scroll::-webkit-scrollbar-thumb { 
        background: rgba(156,163,175,1); 
        border-radius: 10px; 
        border: 2px solid rgba(243,244,246,1);
      }
      .chat-scroll::-webkit-scrollbar-thumb:hover { 
        background: rgba(120,130,150,1); 
      }
      .auto-grow { min-height: 40px; max-height: 160px; overflow-y: auto; }
    `}</style>
  );

  // Effect to handle local video element whenever isVideoEnabled changes
  useEffect(() => {
    if (isVideoEnabled && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(err => {
        console.warn('Local video play failed:', err);
      });
      console.log('Local video reattached and playing');
    }
  }, [isVideoEnabled]);

  useEffect(() => {
    if (!roomId || !token || !userId) {
      console.log('Missing required data:', { roomId: !!roomId, token: !!token, userId: !!userId });
      return;
    }

    let mounted = true;

    const initializeMedia = async () => {
      try {
        console.log('Protocol:', location.protocol);
        console.log('Hostname:', location.hostname);


        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('WebRTC not supported. Please use HTTPS or localhost.');
        }

        if (!window.RTCPeerConnection) {
          throw new Error('RTCPeerConnection not supported in this browser.');
        }

        console.log('Requesting media access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });

        if (!mounted) {
          console.log('Component unmounted, stopping tracks');
          stream.getTracks().forEach(track => track.stop());
          return null;
        }

        console.log('Media access granted!');
        console.log('Video tracks:', stream.getVideoTracks().length);
        console.log('Audio tracks:', stream.getAudioTracks().length);

        localStreamRef.current = stream;
        setLocalVideoReady(true);


        const attachLocalVideo = () => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            console.log('Local video srcObject set');


            localVideoRef.current.play().catch(err => {
              console.warn('Local video autoplay failed:', err);
            });
          } else {
            console.warn('Local video ref not available yet, retrying...');
            setTimeout(attachLocalVideo, 100);
          }
        };

        setTimeout(attachLocalVideo, 100);

        return stream;
      } catch (err) {
        console.error('Media access error:', err);
        let errorMessage = 'Unable to access camera/microphone';

        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone access denied. Please allow permissions and reload.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera/microphone found on this device.';
        } else if (err.message.includes('WebRTC') || err.message.includes('HTTPS')) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        return null;
      }
    };

    const createPeerConnection = (targetUserId, targetUsername) => {
      console.log(`Creating peer connection for ${targetUsername} (${targetUserId})`);

      if (!window.RTCPeerConnection) {
        console.error('RTCPeerConnection not supported');
        return null;
      }

      if (peerConnectionsRef.current[targetUserId]) {
        console.log(`Peer connection already exists for ${targetUsername}, closing old one`);
        peerConnectionsRef.current[targetUserId].close();
      }

      const pc = new RTCPeerConnection(getWebRTCConfig());

      const localStream = localStreamRef.current;
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
          console.log(`Added ${track.kind} track for ${targetUsername}`);
        });
      } else {
        console.error('No local stream available when creating peer connection');
      }

      pc.ontrack = (event) => {
        console.log(`Received remote ${event.track.kind} track from ${targetUsername}`);
        const remoteStream = event.streams[0];

        setRemoteStreams(prev => {
          const updated = { ...prev, [targetUserId]: remoteStream };
          console.log('Remote streams updated:', Object.keys(updated));
          return updated;
        });


        setTimeout(() => {
          const videoEl = remoteVideoRefs.current[targetUserId];
          if (videoEl && videoEl.srcObject !== remoteStream) {
            videoEl.srcObject = remoteStream;
            videoEl.play().catch(err => console.warn('Remote video play failed:', err));
            console.log(`Remote video element set for ${targetUsername}`);
          }
        }, 100);
      };


      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log(`📤 Sending ICE candidate to ${targetUsername}:`, {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address,
            port: event.candidate.port
          });
          socketRef.current.emit('ice-candidate', {
            candidate: event.candidate,
            targetUserId,
            roomId
          });
        } else if (!event.candidate) {
          console.log(`🏁 ICE gathering completed for ${targetUsername}`);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`Connection state for ${targetUsername}:`, pc.connectionState);
        setConnectionCount(Object.keys(peerConnectionsRef.current).length);

        if (pc.connectionState === 'connected') {
          console.log(`✅ Successfully connected to ${targetUsername}`);
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          console.log(`❌ Connection ${pc.connectionState} for ${targetUsername}`);
          setTimeout(() => cleanupPeerConnection(targetUserId), 1000);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${targetUsername}:`, pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log(`🔗 ICE connection established with ${targetUsername}`);
        } else if (pc.iceConnectionState === 'failed') {
          console.error(`🚫 ICE connection failed with ${targetUsername} - TURN server might be needed`);
          console.error('Check chrome://webrtc-internals/ for detailed connection info');
          setError(`Video connection failed with ${targetUsername}. This may be due to network restrictions.`);
          
          // Try ICE restart as fallback
          console.log(`🔄 Attempting ICE restart for ${targetUsername}...`);
          try {
            pc.restartIce();
          } catch (err) {
            console.warn('ICE restart failed:', err);
          }
        } else if (pc.iceConnectionState === 'disconnected') {
          console.warn(`⚠️ ICE connection disconnected with ${targetUsername}`);
        }
      };

      pc.onicegatheringstatechange = () => {
        console.log(`ICE gathering state for ${targetUsername}:`, pc.iceGatheringState);
      };

      pc.onicecandidateerror = (event) => {
        console.error(`❌ ICE candidate error for ${targetUsername}:`, {
          errorCode: event.errorCode,
          errorText: event.errorText,
          url: event.url
        });
      };

      peerConnectionsRef.current[targetUserId] = pc;
      setConnectionCount(Object.keys(peerConnectionsRef.current).length);

      return pc;
    };

    const createOffer = async (targetUserId, targetUsername) => {
      try {
        console.log(`Creating offer for ${targetUsername}`);

        const pc = createPeerConnection(targetUserId, targetUsername);
        if (!pc) {
          console.error('Failed to create peer connection');
          return;
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('Local description set (offer)');

        if (socketRef.current) {
          socketRef.current.emit('video-call-offer', {
            offer,
            roomId,
            targetUserId
          });
          console.log(`Offer sent to ${targetUsername}`);
        }
      } catch (err) {
        console.error(`Error creating offer for ${targetUsername}:`, err);
      }
    };
    const handleOffer = async (data) => {
      try {
        console.log(`Handling offer from ${data.callerName}`);

        const pc = createPeerConnection(data.callerId, data.callerName);
        if (!pc) {
          console.error('Failed to create peer connection');
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log('Remote description set (offer)');

        if (pendingIceCandidatesRef.current[data.callerId]) {
          console.log(`Processing ${pendingIceCandidatesRef.current[data.callerId].length} pending candidates for ${data.callerName}`);
          for (const candidateData of pendingIceCandidatesRef.current[data.callerId]) {
            try {
              const candidate = new RTCIceCandidate(candidateData);
              await pc.addIceCandidate(candidate);
              console.log(`Added queued ICE candidate for ${data.callerName}`);
            } catch (err) {
              console.warn('Error adding queued candidate:', err);
            }
          }
          delete pendingIceCandidatesRef.current[data.callerId];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('Local description set (answer)');

        if (socketRef.current) {
          socketRef.current.emit('video-call-answer', {
            answer,
            roomId,
            targetUserId: data.callerId
          });
          console.log(`Answer sent to ${data.callerName}`);
        }
      } catch (err) {
        console.error(`Error handling offer from ${data.callerName}:`, err);
      }
    };

    const handleAnswer = async (data) => {
      try {


        const pc = peerConnectionsRef.current[data.answererId];
        if (!pc) {
          console.error(`No peer connection found for ${data.answererName}`);
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
 

        // Process pending ICE candidates
        if (pendingIceCandidatesRef.current[data.answererId]) {
          console.log(`Processing ${pendingIceCandidatesRef.current[data.answererId].length} pending ICE candidates for ${data.answererName}`);
          for (const candidateData of pendingIceCandidatesRef.current[data.answererId]) {
            try {
              const candidate = new RTCIceCandidate(candidateData);
              await pc.addIceCandidate(candidate);
              console.log(`Added queued ICE candidate for ${data.answererName}`);
            } catch (err) {
              console.warn('Error adding queued candidate:', err);
            }
          }
          delete pendingIceCandidatesRef.current[data.answererId];
        }
      } catch (err) {
        console.error(`Error handling answer from ${data.answererName}:`, err);
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        console.log(`Received ICE candidate from ${data.senderId}`);
        const pc = peerConnectionsRef.current[data.senderId];

        if (!pc) {
          console.log(`No peer connection for ${data.senderId}, storing candidate for later`);
          if (!pendingIceCandidatesRef.current[data.senderId]) {
            pendingIceCandidatesRef.current[data.senderId] = [];
          }
          pendingIceCandidatesRef.current[data.senderId].push(data.candidate);
          return;
        }

        if (!pc.remoteDescription) {
          console.log(`No remote description yet, storing candidate for ${data.senderId}`);
          if (!pendingIceCandidatesRef.current[data.senderId]) {
            pendingIceCandidatesRef.current[data.senderId] = [];
          }
          pendingIceCandidatesRef.current[data.senderId].push(data.candidate);
          return;
        }

        // Add the ICE candidate
        const candidate = new RTCIceCandidate(data.candidate);
        await pc.addIceCandidate(candidate);
        console.log(`Successfully added ICE candidate from ${data.senderId}`);
        
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
        // Don't fail the entire connection for a single bad candidate
        console.log('Continuing despite ICE candidate error...');
      }
    };

    const cleanupPeerConnection = (targetUserId) => {

      if (peerConnectionsRef.current[targetUserId]) {
        peerConnectionsRef.current[targetUserId].close();
        delete peerConnectionsRef.current[targetUserId];
      }

      setRemoteStreams(prev => {
        const updated = { ...prev };
        delete updated[targetUserId];
        return updated;
      });

      if (remoteVideoRefs.current[targetUserId]) {
        delete remoteVideoRefs.current[targetUserId];
      }

      if (pendingIceCandidatesRef.current[targetUserId]) {
        delete pendingIceCandidatesRef.current[targetUserId];
      }

      setConnectionCount(Object.keys(peerConnectionsRef.current).length);
    };

    const connectSocket = async () => {
      const stream = await initializeMedia();
      if (!stream || !mounted) {
        console.log('Failed to initialize media or component unmounted');
        return;
      }

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
      
        socket.emit('join-room', roomId);

        setTimeout(() => {
          socket.emit('user-ready-for-video', {
            userId,
            username: currentUsername,
            roomId
          });
        }, 1000);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError('Failed to connect to server');
      });

      socket.on('new-message', (messageData) => {
        const normalized = normalizeMessage(messageData);
        if (normalized) {
          setMessages(prev => [...prev, normalized]);
        }
      });

      socket.on('user-ready-for-video', (data) => {
        console.log(`User ${data.username} (${data.userId}) is ready`);
        if (data.userId !== userId) {
          createOffer(data.userId, data.username);
        }
      });

      socket.on('video-call-offer', handleOffer);
      socket.on('video-call-answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);
      socket.on('user-video-disconnected', (data) => cleanupPeerConnection(data.userId));

      socket.on('user-joined-room', (data) => {
        toast.success(data.message, { duration: 4000, position: 'top-right', icon: '👋' });
      });

      socket.on('user-left-room', (data) => {
        toast(data.message, { duration: 3000, position: 'top-right', icon: '👋' });
      });
    };

    connectSocket();

    return () => {
      mounted = false;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
         
        });
      }

      Object.entries(peerConnectionsRef.current).forEach(([id, pc]) => {
        pc.close();
      
      });
      peerConnectionsRef.current = {};

      if (socketRef.current) {
        socketRef.current.disconnect();
    
      }
    };
  }, [roomId, token, userId]);

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Normalize message
  const normalizeMessage = (raw) => {
    if (!raw) return null;

    const senderId = raw.sender?._id || raw.sender?.id || raw.userId || raw.user;
    const senderUsername = raw.sender?.username || raw.username ||
      (String(senderId) === String(userId) ? currentUsername : "Unknown User");

    return {
      _id: String(raw._id || raw.id || `msg-${Date.now()}-${Math.random()}`),
      text: String(raw.text || raw.body || raw.message || ""),
      sender: {
        _id: String(senderId || "unknown"),
        username: senderUsername,
        avatar: raw.sender?.avatar || raw.avatar || null,
      },
      createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    };
  };

  // Fetch messages
  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const fetchMessages = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`${API_BASE_URL}/chat/getMessage/${roomId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });

        let rawList = Array.isArray(res.data) ? res.data :
          Array.isArray(res.data.messages) ? res.data.messages :
            Array.isArray(res.data.data) ? res.data.data : [];

        const normalized = rawList
          .map(normalizeMessage)
          .filter(Boolean)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (!cancelled) setMessages(normalized);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [roomId, token]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || !socketRef.current) return;

    setSending(true);
    socketRef.current.emit('send-message', { roomId, text: trimmed });
    setMessage("");
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render message
  const renderMessage = (msg) => {
    if (!msg) return null;
    const isCurrentUser = String(msg.sender._id) === String(userId);

    return (
      <div key={msg._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <img
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            src={msg.sender.avatar || "/default-avatar.png"}
            alt={msg.sender.username}
          />
          <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1 px-2">
              {isCurrentUser ? 'You' : msg.sender.username}
            </span>
            <div className={`px-4 py-2 rounded-2xl ${isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-200 text-gray-900 rounded-bl-md'
              }`}>
              {msg.text}
            </div>
            <span className="text-xs text-gray-400 mt-1 px-2">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!roomId) {
    return (
      <aside className="w-full min-h-full border-l border-gray-200 flex items-center justify-center p-8">
        <p className="text-gray-500">No room selected. Open or create a room to start chatting.</p>
      </aside>
    );
  }

  return (
    <aside className="w-full min-h-full border-l border-gray-200 flex flex-col">
      <ScrollbarStyles />

      {/* Video Section */}
      <div className="relative h-60 bg-black flex-shrink-0">
        {/* Remote Videos */}
        {Object.entries(remoteStreams).map(([uid, stream], index) => (
          <video
            key={uid}
            ref={el => { if (el) remoteVideoRefs.current[uid] = el; }}
            autoPlay
            playsInline
            className={index === 0 ? "w-full h-full object-cover" : "absolute top-3 w-28 h-20 object-cover border-2 border-white rounded-lg"}
            style={index > 0 ? { right: `${3 + index * 120}px` } : {}}
          />
        ))}

        {Object.keys(remoteStreams).length === 0 && (
          <div className="flex items-center justify-center w-full h-full bg-gray-800">
            <div className="text-center text-white">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm">Waiting for others...</p>
            </div>
          </div>
        )}

        {/* Local Video */}
        {isVideoEnabled && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute top-3 right-3 w-28 h-20 object-cover border-2 border-white rounded-lg"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {!isVideoEnabled && (
          <div className="absolute top-3 right-3 w-28 h-20 bg-gray-900 border-2 border-white rounded-lg flex items-center justify-center">
            <span className="text-white text-3xl">📷</span>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            onClick={toggleVideo}
            className={`px-3 py-2 rounded-lg font-medium transition ${isVideoEnabled ? 'bg-white text-gray-800' : 'bg-red-500 text-white'
              }`}
          >
            {isVideoEnabled ? '📹' : '📷'}
          </button>

          <button
            onClick={toggleAudio}
            className={`px-3 py-2 rounded-lg font-medium transition ${isAudioEnabled ? 'bg-white text-gray-800' : 'bg-red-500 text-white'
              }`}
          >
            {isAudioEnabled ? '🎤' : '🔇'}
          </button>
        </div>

        {/* Room Info */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Room: {roomId}
        </div>

        {/* Status */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded">
          <div className={`w-2 h-2 rounded-full ${connectionCount > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-white text-xs">{connectionCount} connected</span>
        </div>
      </div>

      {/* Chat Section */}
      <h2 className="text-lg font-semibold px-5 py-3 border-b border-gray-200">Chat</h2>

      <div
        ref={containerRef}
        className="chat-scroll flex-1 overflow-y-auto p-4"
        style={{
          background: "linear-gradient(180deg,#f8fafc 0%, #ffffff 100%)",
          maxHeight: "calc(100vh - 320px)",
          minHeight: "300px"
        }}
      >
        {loading && <p className="text-sm text-gray-400">Loading...</p>}
        {!loading && messages.length === 0 && <p className="text-sm text-gray-400">No messages yet 👋</p>}
        {messages.map(renderMessage)}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <div className="relative">
          <textarea
            rows={1}
            className="auto-grow w-full rounded-xl border border-gray-300 pr-12 py-2 px-4 outline-none focus:border-gray-400 resize-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-gray-500 hover:text-blue-500"
            onClick={handleSendMessage}
            disabled={sending}
          >
            ➤
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatBox;