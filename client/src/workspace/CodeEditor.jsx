import { useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS} from "../Constants";
import Output from "./Output";
import DoodleModal from '../components/DoodleModal';
import { executeCode } from "../api"; // Add missing import


const CodeEditor = () => {
  const editorRef = useRef();
  const outputRef = useRef();
  const outputSectionRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isDoodleOpen, setIsDoodleOpen] = useState(false);
  const [userInput, setUserInput] = useState(""); // Add missing state

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

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
        <LanguageSelector language={language} onSelect={onSelect} />
        <div className="flex gap-3">
          <button 
            onClick={handleRunCode}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-white font-medium shadow-lg hover:from-green-600 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform duration-200">play_arrow</span>
            <span className="text-sm font-semibold">Run Code</span>
          </button>
          <button 
            onClick={() => setIsDoodleOpen(true)}
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
          theme="vs-light"
          language={language}
          defaultValue={CODE_SNIPPETS[language]}
          onMount={onMount}
          value={value}
          onChange={(value) => setValue(value)}
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
          <Output ref={outputRef} editorRef={editorRef} language={language} />
        </div>
      </div>
      
      <DoodleModal 
        isOpen={isDoodleOpen}
        onClose={() => setIsDoodleOpen(false)}
      />
    </div>
  );
};

export default CodeEditor;
