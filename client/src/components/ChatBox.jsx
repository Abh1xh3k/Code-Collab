import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from 'socket.io-client'

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null);


  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // Object to store multiple remote streams
  const [peerConnections, setPeerConnections] = useState({}); // Object to store multiple peer connections


  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({}); // Object to store multiple remote video refs

  const token = localStorage.getItem("authToken") || "";
  const roomId = localStorage.getItem("currentRoomId") || null;
  const userId = localStorage.getItem("userId") || null;
  const currentUsername = localStorage.getItem("username") || "You";

  const containerRef = useRef(null);

  const ScrollbarStyles = () => (
    <style>{`
      .chat-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(156,163,175,1) rgba(243,244,246,1);
      }
      .chat-scroll::-webkit-scrollbar { 
        width: 12px; 
      }
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
      .chat-scroll:focus {
        outline: none;
      }
      .auto-grow { min-height: 40px; max-height: 160px; overflow-y: auto; }
    `}</style>
  );
  useEffect(() => {
    if (!roomId || !token) return;
    console.log(`Socket connecting to room: ${roomId}`);

    const socketInstance = io("http://localhost:5000", {
      auth: { token }
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('join-room', roomId);
      console.log(`Joined room: ${roomId}`);

      initializevideo();
    });


    socketInstance.on('new-message', (messageData) => {
      const normalizedMessage = normalizeMessage(messageData);
      if (normalizedMessage) {
        setMessages(prev => [...prev, normalizedMessage]);
      }
    });


    socketInstance.on('user-ready-for-video', (data) => {
      console.log(`🎥 User ${data.username} is ready for video in room ${data.roomId}`);
      console.log('Current peer connections:', Object.keys(peerConnections));
      createOfferForUser(data.userId, data.username);
    });

    socketInstance.on('video-call-offer', (data) => {
      console.log(`📞 Received video offer from ${data.callerName}`);
      console.log('Offer data:', data);
      handleVideoOffer(data);
    });

    socketInstance.on('video-call-answer', (data) => {
      console.log(`Received video answer from ${data.answererName}`);
      handleVideoAnswer(data);
    });

    socketInstance.on('ice-candidate', (data) => {
      console.log(`Received ICE candidate from user ${data.senderId}`);

      handleIceCandidate(data);
    });

    socketInstance.on('user-video-disconnected', (data) => {
      console.log(`User ${data.username} video disconnected`);
      cleanupUserVideo(data.userId);
    });

    const createOfferForUser = async (userId, username) => {
      try {
        console.log(`creating video offer for user : ${username}`)

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.vcom:1932' }]
        });

        if (localStream) {
          localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
          });
        }

        peerConnection.ontrack = (event) => {
          console.log(`📺 Received remote stream from ${username}`, event.streams[0]);
          const remoteStream = event.streams[0];

          setRemoteStreams(prev => ({
            ...prev,
            [userId]: remoteStream
          }));

          console.log(`Updated remote streams:`, Object.keys(remoteStreams));

          if (remoteVideoRefs.current[userId]) {
            remoteVideoRefs.current[userId].srcObject = remoteStream;
            console.log(`Set remote video for ${username}`);
          } else {
            console.log(`No video ref found for ${username}`);
          }
        };

        peerConnection.onicecandidate = (event) => {
          if (event.candidate && socket) {
            console.log(`sending  ICE candidate to ${username}`);
            socket.emit(`ice-candiate`, {
              candidate: event.candidate,
              roomId: roomId
            });
          }
        };
        setPeerConnections(prev => ({
          ...prev,
          [userId]: peerConnection
        }));
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        if (socket) {
          socket.emit('video-call-offer', {
            offer: offer,
            roomId: roomId
          });
        }
        console.log(`Video offer sent to ${username}`);

      }
      catch (err) {
        console.error(`Error creating offer for ${username}:`, err);
      }
    }

    const handleVideoOffer = async (data) => {
      try {
        console.log(`Handling video offer from ${data.callerName} (ID: ${data.callerId})`);

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        await peerConnection.setRemoteDescription(data.offer);
        console.log(`Set remote description from ${data.callerName}`);

        if (localStream) {
          localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
          });
          console.log(`Added local stream to connection with ${data.callerName}`);
        }

        peerConnection.ontrack = (event) => {
          console.log(`📺 Received remote stream from ${data.callerName}`, event.streams[0]);
          const remoteStream = event.streams[0];

          setRemoteStreams(prev => ({
            ...prev,
            [data.callerId]: remoteStream
          }));

          console.log(`Updated remote streams for ${data.callerName}`);

          if (remoteVideoRefs.current[data.callerId]) {
            remoteVideoRefs.current[data.callerId].srcObject = remoteStream;
            console.log(`Set remote video for ${data.callerName}`);
          } else {
            console.log(`No video ref found for ${data.callerName}`);
          }
        };


        peerConnection.onicecandidate = (event) => {
          if (event.candidate && socket) {
            console.log(`Sending ICE candidate to ${data.callerName}`);
            socket.emit('ice-candidate', {
              candidate: event.candidate,
              roomId: roomId
            });
          }
        };

        // Store this connection in our state
        setPeerConnections(prev => ({
          ...prev,
          [data.callerId]: peerConnection
        }));

        // Create our answer (our technical specs in response)
        const answer = await peerConnection.createAnswer();
        console.log(`Created answer for ${data.callerName}`);

        // Set this answer as our "local description"
        await peerConnection.setLocalDescription(answer);

        // Send the answer back to the caller through socket
        if (socket) {
          socket.emit('video-call-answer', {
            answer: answer,
            roomId: roomId,
            targetUserId: data.callerId
          });
        }

        console.log(`Video answer sent to ${data.callerName}`);

      } catch (error) {
        console.error(`Error handling offer from ${data.callerName}:`, error);
      }
    }

    const handleVideoAnswer = async (data) => {
      try {
        console.log(`handling video answer from ${data.answererName}`)

        const peerConnection = peerConnections[data.answererId];

        if (peerConnection) {
          await peerConnection.setRemoteDescription(data.answer);
          console.log(`video connection established with ${data.answererName}`);
        }
        else {
          console.error(`No peer connection found for user ${data.answererId}`);
        }
      } catch (error) {
        console.error(`Error handling answer from ${data.answererName}:`, error);
      }
    }

    const handleIceCandidate = async (data) => {
      try {
        console.log(`Adding received ICE candidate from user ${data.senderId}`);
        const peerConnection = peerConnections[data.senderId];

        if (peerConnection && data.candidate) {
          await peerConnection.addIceCandidate(data.candidate);
          console.log(`Ice candidate added for user${data.senderId}`);
        }
        else {
          console.error(`No peer connection found for user ${data.senderId} or candidate is null`);
        }

      }
      catch (err) {
        console.error(`Error adding received ICE candidate:`, err);
      }
    }
    const cleanupUserVideo = (userId) => {
      try {
        console.log(`Cleaning up video for user ${userId}`);
        if (peerConnections[userId]) {
          peerConnections[userId].close();
          console.log(`Closed peer connection for user ${userId}`);
        }
        setPeerConnections(prev => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });

        setRemoteStreams(prev=>{
          const newStreams = { ...prev };
          delete newStreams[userId];
          return newStreams;
        })
        if (remoteVideoRefs.current[userId]) {
          delete remoteVideoRefs.current[userId];
        }
      }
      catch (err) {
        console.error(`Error cleaning up video for user ${userId}:`, err);
      }
    }


    setSocket(socketInstance);

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      socketInstance.disconnect();
    }

  }, [roomId]);

  const normalizeMessage = (raw) => {
    if (!raw) return null;
    if (raw._id && raw.text && raw.sender) {
      return {
        _id: String(raw._id),
        text: String(raw.text),
        sender: {
          _id: String(raw.sender._id ?? raw.sender.id ?? raw.sender),
          username:
            raw.sender.username ??
            raw.sender.name ??
            (String(raw.sender._id ?? raw.sender) === String(userId) ? currentUsername : "Unknown User"),
          avatar: raw.sender.avatar ?? null,
        },
        createdAt: raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? new Date().toISOString(),
      };
    }
    const senderRaw = raw.userId ?? raw.user ?? raw.sender ?? null;
    let sender = { _id: "unknown", username: "Unknown User", avatar: null };

    if (senderRaw) {
      if (typeof senderRaw === "object") {
        sender = {
          _id: String(senderRaw._id ?? senderRaw.id ?? "unknown"),
          username:
            senderRaw.username ??
            senderRaw.name ??
            (String(senderRaw._id ?? senderRaw.id) === String(userId) ? currentUsername : "Unknown User"),
          avatar: senderRaw.avatar ?? null,
        };
      } else {
        sender = {
          _id: String(senderRaw),
          username: String(senderRaw) === String(userId) ? currentUsername : "Unknown User",
          avatar: null,
        };
      }
    } else if (raw.username) {
      sender = {
        _id: String(raw.userId ?? "unknown"),
        username: raw.username,
        avatar: raw.avatar ?? null,
      };
    } else {
      const alt = raw.from ?? raw.author ?? null;
      if (alt) {
        if (typeof alt === "object") {
          sender = {
            _id: String(alt._id ?? alt.id ?? "unknown"),
            username: alt.username ?? alt.name ?? "Unknown User",
            avatar: alt.avatar ?? null,
          };
        } else {
          sender = { _id: String(alt), username: String(alt) === String(userId) ? currentUsername : "Unknown User", avatar: null };
        }
      }
    }

    return {
      _id: String(raw._id ?? raw.id ?? `local-${Date.now()}-${Math.random()}`),
      text: String(raw.text ?? raw.body ?? raw.message ?? ""),
      sender,
      createdAt: raw.createdAt ?? raw.created_at ?? raw.updatedAt ?? new Date().toISOString(),
    };
  };

  const initializevideo = async () => {
    try {
      console.log('initializing video...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Got local stream', stream);
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
          console.log('Local video started playing');
        } catch (playError) {
          console.log('Video autoplay failed:', playError);
        }
      }

      setIsVideoEnabled(true);

      console.log('Video initialized successfully');

    }
    catch (err) {
      console.error('Error accessing media devices.', err);
      setError('unable to access camera and microphone');
      setIsVideoEnabled(false);
    }
  };


  // Auto-scroll chat messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle local video stream updates
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('Setting video stream to local video element');
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => {
        console.log('Video play failed:', err);
      });
    }
  }, [localStream]);


  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }
    let cancelled = false;

    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/getMessage/${roomId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });


        let rawList = [];
        if (Array.isArray(res.data)) rawList = res.data;
        else if (Array.isArray(res.data.messages)) rawList = res.data.messages;
        else if (Array.isArray(res.data.data)) rawList = res.data.data;
        else {

          const arr = Object.values(res.data || {}).find((v) => Array.isArray(v));
          if (arr) rawList = arr;
        }

        const normalized = rawList
          .map(normalizeMessage)
          .filter(Boolean)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (!cancelled) setMessages(normalized);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Unable to load messages.");
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMessages();
    return () => {
      cancelled = true;
    };

  }, [roomId]);


  const handleSendMessage = async () => {
    if (!roomId || !socket) return;
    const trimmed = message.trim();
    if (!trimmed) return;

    console.log(`📤 Sending message`);
    setSending(true);
    setError("");

    try {
      socket.emit('send-message', {
        roomId,
        text: trimmed
      });

      setMessage("");
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (msg) => {
    if (!msg) return null;

    // Debug logging - check what we're getting
    console.log('DEBUG - Raw message data:', {
      msgId: msg._id,
      text: msg.text,
      senderData: msg.sender,
      currentUserId: userId,
      currentUsername: currentUsername
    });

    // Try multiple methods to determine if this is current user's message
    const senderId = msg.sender?._id || msg.sender?.id;
    const senderUsername = msg.sender?.username;


    let isCurrentUser = false;
    if (senderId && userId) {
      isCurrentUser = String(senderId) === String(userId);
      console.log('Method 1 (ID):', { senderId, userId, match: isCurrentUser });
    }


    if (!isCurrentUser && senderUsername && currentUsername && currentUsername !== "You") {
      isCurrentUser = senderUsername === currentUsername;
      console.log('Method 2 (Username):', { senderUsername, currentUsername, match: isCurrentUser });
    }



    console.log('FINAL DECISION:', { isCurrentUser, text: msg.text });

    if (isCurrentUser) {

      return (
        <div key={msg._id} className="flex justify-end mb-4">
          <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 mb-1 px-2">You</span>
              <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md">
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 mt-1 px-2">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <img
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              src={msg.sender?.avatar || "/default-avatar.png"}
              alt="You"
            />
          </div>
        </div>
      );
    } else {

      return (
        <div key={msg._id} className="flex justify-start mb-4">
          <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
            <img
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              src={msg.sender?.avatar || "/default-avatar.png"}
              alt={msg.sender?.username || "User"}
            />
            <div className="flex flex-col items-start">
              <span className="text-xs text-gray-500 mb-1 px-2">
                {msg.sender?.username || "Unknown User"}
              </span>
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md">
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 mt-1 px-2">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  if (!roomId) {
    return (
      <aside className="w-full min-h-full border-l border-solid border-gray-200 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-500">No room selected. Open or create a room to start chatting.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full min-h-full border-l border-solid border-gray-200 flex flex-col">
      <ScrollbarStyles />

      <div className="flex flex-col flex-1">

        {/* Video Call Area - Functional WebRTC Video */}
        <div className="relative h-60 border-b border-gray-200 bg-black flex-shrink-0 overflow-hidden">
          {/* Local Video (Your Video) - Main Display */}
          {isVideoEnabled && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-800">
              <div className="text-center text-white">
                <span className="material-symbols-outlined text-4xl mb-2 block">videocam_off</span>
                <p className="text-sm">Camera Off</p>
              </div>
            </div>
          )}
          
          {/* Remote Videos (Other Users) - Picture-in-Picture */}
          {Object.entries(remoteStreams).map(([userId, stream]) => (
            <video
              key={userId}
              ref={el => {
                if (el) {
                  remoteVideoRefs.current[userId] = el;
                  el.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              className="absolute top-3 right-3 w-28 h-20 object-cover border-2 border-white rounded-lg shadow-lg bg-gray-900"
            />
          ))}
          
          {/* Video Controls */}
          <div className="absolute bottom-3 left-3 flex space-x-2">
            <button
              onClick={() => {
                if (localStream) {
                  const videoTrack = localStream.getVideoTracks()[0];
                  if (videoTrack) {
                    videoTrack.enabled = !videoTrack.enabled;
                    setIsVideoEnabled(videoTrack.enabled);
                  }
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isVideoEnabled 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {isVideoEnabled ? 'videocam_off' : 'videocam'}
              </span>
            </button>
            
            <button
              onClick={() => {
                if (localStream) {
                  const audioTrack = localStream.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                  }
                }
              }}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-lg">mic</span>
            </button>
          </div>
          
          {/* Room Info */}
          <div className="absolute top-3 left-3">
            <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              Room: {roomId}
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                Object.keys(peerConnections).length > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-white text-xs">
                {Object.keys(peerConnections).length} connected
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 bg-gray-50"></div>

        <h2 className="text-lg font-semibold px-5 py-3 border-b border-gray-200 flex-shrink-0">Chat</h2>

        <div
          ref={containerRef}
          className="chat-scroll flex-1 overflow-y-auto overflow-x-hidden p-4"
          style={{
            background: "linear-gradient(180deg,#f8fafc 0%, #ffffff 100%)",
            maxHeight: "calc(100vh - 320px)",
            minHeight: "300px"
          }}
        >
          {loading && <p className="text-sm text-gray-400">Loading messages...</p>}
          {!loading && messages.length === 0 && <p className="text-sm text-gray-400">No messages yet. Say hello 👋</p>}
          {Array.isArray(messages) && messages.map((m) => renderMessage(m))}
        </div>
      </div>

      <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200">
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <div className="relative">
          <textarea
            rows={1}
            className="auto-grow w-full rounded-xl border border-gray-300 bg-white pr-12 text-sm py-2 px-4 outline-none focus:border-gray-400 focus:ring-0 transition-colors duration-200 resize-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-[var(--primary-color)]"
            onClick={handleSendMessage}
            disabled={sending}
            title={sending ? "Sending..." : "Send"}
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ChatBox;