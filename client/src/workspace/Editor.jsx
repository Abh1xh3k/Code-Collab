import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import DoodleModal from '../components/DoodleModal';
import { useNavigate } from 'react-router-dom';

const WorkspaceEditor = () => {
  const navigate=useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Welcome to Collaborative IDE\n\nfunction example() {\n  console.log("Hello, World!");\n}\n');
  const [isDoodleOpen, setIsDoodleOpen] = useState(false);

  // Handle editor initialization
  const handleEditorDidMount = (editor, monaco) => {
    // You can access the editor instance here
    editor.focus();
  };

  // Handle editor change
  const handleEditorChange = (value) => {
    setCode(value);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-4">
        <div className="flex items-center gap-3 text-gray-900">
          <div className="h-8 w-8 text-[var(--primary-color)]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="var(--primary-color)"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold">Code Collab</h1>
        </div>
        <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 text-gray-900 text-sm font-semibold hover:bg-gray-200">
          <span>Logout</span>
        </button>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select 
                className="form-select rounded-lg border-gray-300 bg-white text-gray-900 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-[var(--primary-color)] px-4 py-2 text-white hover:bg-purple-700">
                <span className="material-symbols-outlined">play_arrow</span>
                <span>Run</span>
              </button>
              <button 
                onClick={() => setIsDoodleOpen(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 transition-all duration-200
                  bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100
                  border border-purple-200 hover:border-purple-300 hover:shadow-md
                  transform hover:scale-105"
              >
                <span className="material-symbols-outlined text-purple-600">draw</span>
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Whiteboard
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme="vs-light"
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                wordWrap: 'on',
                padding: { top: 10 }
              }}
              loading={<div className="text-center p-4">Loading editor...</div>}
            />
          </div>
        </div>

        <aside className="w-[360px] border-l border-solid border-gray-200 flex flex-col gradient-bg">
          <h2 className="text-lg font-bold p-4 border-b border-gray-200">Chat</h2>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex items-start gap-3">
              <img alt="Sophia's avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJECaa-jKvoBlpzWiNRuzZezv751C830ny_qjrydpX5p4t3Li3MlcwE6Ft9T1qvyM0K2_boRSUBVQXUS-xT137uS-G4jeeHeXfJh3bRwxLV828YaI4G5F9NSJL0CjwOHhbbgW6YRiz1jrmwgzYfaBc7Pv8ENf_TWNqTtnANcn8yReQm4UNXQYlx_YdQ5iDPOJn9JCFil4rw_V5V0eo0edKNx1ZU7VVUS768Duy4mvOUmNOOhf-8bGuFM0W_rGfiNu0dz_ZaMXziXw"/>
              <div className="flex flex-col items-start">
                <p className="text-sm font-semibold text-gray-700">Sophia</p>
                <p className="mt-1 max-w-[280px] rounded-lg rounded-tl-none bg-white px-4 py-2 text-sm text-gray-800 shadow-sm">Hey, are you there?</p>
              </div>
            </div>
            {/* ... More chat messages ... */}
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200">
            <div className="relative">
              <input 
                className="form-input w-full rounded-lg border-gray-300 bg-white pr-12 text-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]" 
                placeholder="Type a message..." 
              />
              <button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-[var(--primary-color)]">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </aside>
      </main>
      <DoodleModal 
        isOpen={isDoodleOpen}
        onClose={() => setIsDoodleOpen(false)}
      />
    </div>
  );
};

export default WorkspaceEditor;