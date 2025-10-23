import { useRef, useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, SOCKET_URL } from "../Constants";
import Output from "./Output";
import DoodleModal from '../components/DoodleModal';
import { io } from 'socket.io-client'; 


const CodeEditor = () => {
  const editorRef = useRef();
  const outputRef = useRef();
  const outputSectionRef = useRef();
  const socketRef = useRef();
  const [code, setcode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isDoodleOpen, setIsDoodleOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const roomId = localStorage.getItem('currentRoomId');
  const token = localStorage.getItem("authToken") || "";

  useEffect(() => {
    if (!token || !roomId) {
      console.log('Skipping socket init: missing token or roomId', { hasToken: !!token, hasRoomId: !!roomId });
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect_error:', err?.message || err);
    });

    socket.on('codeUpdate', (newCode) => {
      setcode(newCode);
    });

    socket.on('languageUpdate', (data) => {
      console.log('📥 Received language change:', data);
      setLanguage(data.language);
      setcode(data.code);
    });

    // Whiteboard synchronization
    socket.on('open-whiteboard', (data) => {
      console.log('📥 Received open whiteboard from:', data.username);
      setIsDoodleOpen(true);
    });

    socket.on('close-whiteboard', (data) => {
      console.log('📥 Received close whiteboard from:', data.username);
      setIsDoodleOpen(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, token]);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        // Use the correct Monaco Editor API to change language
        window.monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setcode(CODE_SNIPPETS[language]);
    
    // Emit language change to other users
    if (socketRef.current && isConnected && roomId) {
      console.log('📤 Sending language change to room:', roomId, language);
      socketRef.current.emit('language-change', { 
        roomId, 
        language, 
        code: CODE_SNIPPETS[language] 
      });
    }
  };
    const handleCodeChange = (newCode) => {;
      try{
        setcode(newCode);
        if (socketRef.current && isConnected && roomId) {
          console.log('📤 Sending code change to room:', roomId);
          socketRef.current.emit('code-change', { roomId, code: newCode });
        }
      }
      catch(error){
        console.error("Error in handleCodeChange:", error);
        socketRef.current.emit("message-error", { error: 'Socket error occurred' });
      }
    }

  const handleRunCode = async() => {
      if (outputRef.current) {
        outputRef.current.runCode();
      }
    
      setTimeout(() => {
        if (outputSectionRef.current) {
          outputSectionRef.current.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }, 100);
  };

  return (
    <div className="flex flex-col min-h-full p-6 space-y-4">
     
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <LanguageSelector language={language} onSelect={onSelect} />
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRunCode}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-white font-medium shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform duration-200">play_arrow</span>
            <span className="text-sm font-semibold">Run Code</span>
          </button>
          <button 
            onClick={() => {
              setIsDoodleOpen(true);
              // Notify other users that whiteboard is opening
              if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('open-whiteboard', { roomId });
              }
            }}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-white font-medium shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform duration-200">draw</span>
            <span className="text-sm font-semibold">Whiteboard</span>
          </button>
        </div>
      </div>

      
      <div className="h-[500px] rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
        <Editor
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            wordWrap: 'on',
            padding: { top: 10 }
          }}
          height="100%"
          theme="vs-dark"
          language={language}
          defaultValue={CODE_SNIPPETS[language]}
          onMount={onMount}
          value={code}
          onChange={handleCodeChange}
        />
      </div>

      <div ref={outputSectionRef} className="h-64 flex-shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Output</h3>
          <button className="text-gray-500 hover:text-gray-800 p-1 rounded-md">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
        <div className="p-4 h-52 overflow-auto">
          <Output 
            ref={outputRef} 
            editorRef={editorRef} 
            language={language} 
            socket={socketRef.current}
            roomId={roomId}
            isConnected={isConnected}
          />
        </div>
      </div>
      
      <DoodleModal 
        isOpen={isDoodleOpen}
        onClose={() => setIsDoodleOpen(false)}
        roomId={roomId}
        socketRef={socketRef}
      />
    </div>
  );
};

export default CodeEditor;
