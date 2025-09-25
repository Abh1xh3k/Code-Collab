import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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


  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);


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
    if (!roomId) {
      setError("No room selected.");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) return;

    setSending(true);
    setError("");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/chat/sendMessage`,
        { roomId, text: trimmed },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );


      let rawMsg = null;
      if (res.data && res.data.data) rawMsg = res.data.data;
      else if (res.data && (res.data._id || res.data.text || res.data.userId)) rawMsg = res.data;
      else if (Array.isArray(res.data)) rawMsg = res.data[res.data.length - 1];
      else {

        rawMsg = { _id: `local-${Date.now()}`, text: trimmed, userId: userId || "unknown", createdAt: new Date().toISOString() };
      }

      const normalized = normalizeMessage(rawMsg);
      setMessages((prev) => [...prev, normalized]);
      setMessage("");


      try {
        const refresh = await axios.get(`http://localhost:5000/api/chat/getMessage/${roomId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        let rawList = [];
        if (Array.isArray(refresh.data)) rawList = refresh.data;
        else if (Array.isArray(refresh.data.messages)) rawList = refresh.data.messages;
        else if (Array.isArray(refresh.data.data)) rawList = refresh.data.data;
        else {
          const arr = Object.values(refresh.data || {}).find((v) => Array.isArray(v));
          if (arr) rawList = arr;
        }
        const normalizedAll = rawList
          .map(normalizeMessage)
          .filter(Boolean)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(normalizedAll);
      } catch (refreshErr) {

        console.warn("Refresh after send failed:", refreshErr);
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message.");
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
   
        <div className="flex items-center justify-center h-40 border-b border-gray-200 bg-gray-100/50 flex-shrink-0">
          <div className="text-center text-gray-500">
            <span className="material-symbols-outlined text-3xl">videocam</span>
            <p className="text-sm mt-1">Video Call</p>
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
          {messages.map((m) => renderMessage(m))}
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