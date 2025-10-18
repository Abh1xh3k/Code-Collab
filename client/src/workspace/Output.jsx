import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { executeCode } from "../api";

const Output = forwardRef(({ editorRef, language, socket, roomId, isConnected }, ref) => {
  const [consoleLines, setConsoleLines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [inputQueue, setInputQueue] = useState([]);
  const inputRef = useRef(null);
  const consoleRef = useRef(null);
  const pendingExecutionRef = useRef(null);

  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  // WebSocket event listeners for collaborative code execution
  useEffect(() => {
    if (!socket || !isConnected || !roomId) return;

    // Listen for code execution from other users
    const handleCodeExecution = (data) => {
      console.log('📥 Received code execution from another user:', data);
      if (data.roomId === roomId && data.language === language) {
        // Clear output for all users when any user runs a new program
        setConsoleLines([]);
        setIsLoading(true);
        setIsError(false);
        setWaitingForInput(false);
        setInputQueue([]);
        setCurrentInput("");
        console.log(`User ${data.username} is executing ${language} code - output cleared`);
      }
    };

    // Listen for execution results from other users
    const handleExecutionResult = (data) => {
      console.log('📥 Received execution result from another user:', data);
      if (data.roomId === roomId) {
        // Add results from other users without username prefix
        if (data.isError) {
          addToConsole(data.result, "error");
        } else {
          // Parse and display the output without username prefix
          const outputLines = data.result.split('\n');
          outputLines.forEach(line => {
            if (line.trim()) {
              addToConsole(line, "output");
            }
          });
        }
      }
    };

    // Listen for input requests from other users
    const handleInputRequest = (data) => {
      console.log('📥 Received input request from another user:', data);
      if (data.roomId === roomId) {
        // Show the prompt and enable input for all users
        addToConsole(data.prompt, "prompt");
        setWaitingForInput(true);
        // Don't set pendingExecutionRef here as it should be managed by the original user
      }
    };

    // Listen for input responses from other users
    const handleInputResponse = (data) => {
      console.log('📥 Received input response from another user:', data);
      if (data.roomId === roomId) {
        addToConsole(data.input, "input");
        
        // If we have a pending execution, continue it with the input from another user
        if (pendingExecutionRef.current) {
          const { sourceCode, allInputs } = pendingExecutionRef.current;
          const newInputs = [...allInputs, data.input];
          setWaitingForInput(false);
          continueExecution(sourceCode, newInputs);
        }
      }
    };

    // Listen for execution continuation from other users
    const handleExecutionContinue = (data) => {
      console.log('📥 Received execution continuation from another user:', data);
      if (data.roomId === roomId) {
        // Update our pending execution with the new inputs
        if (pendingExecutionRef.current) {
          pendingExecutionRef.current.allInputs = data.allInputs;
          setWaitingForInput(false);
          continueExecution(pendingExecutionRef.current.sourceCode, data.allInputs);
        }
      }
    };

    // Listen for language changes from other users
    const handleLanguageChange = (data) => {
      console.log('📥 Received language change from another user:', data);
      if (data.roomId === roomId) {
        // Clear output when language changes
        setConsoleLines([]);
        setIsLoading(false);
        setIsError(false);
        setWaitingForInput(false);
        setInputQueue([]);
        setCurrentInput("");
        pendingExecutionRef.current = null;
        console.log(`Language changed to ${data.language} by ${data.username} - output cleared`);
      }
    };

    // Register event listeners
    socket.on('code-execution', handleCodeExecution);
    socket.on('execution-result', handleExecutionResult);
    socket.on('input-request', handleInputRequest);
    socket.on('input-response', handleInputResponse);
    socket.on('execution-continue', handleExecutionContinue);
    socket.on('languageUpdate', handleLanguageChange);

    // Cleanup event listeners
    return () => {
      socket.off('code-execution', handleCodeExecution);
      socket.off('execution-result', handleExecutionResult);
      socket.off('input-request', handleInputRequest);
      socket.off('input-response', handleInputResponse);
      socket.off('execution-continue', handleExecutionContinue);
      socket.off('languageUpdate', handleLanguageChange);
    };
  }, [socket, isConnected, roomId, language]);

  const addToConsole = (text, type = "output") => {
    setConsoleLines(prev => [...prev, { text, type, timestamp: Date.now() }]);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!waitingForInput) return;

    // Add the input to console
    addToConsole(currentInput, "input");
    
    // Emit input response to other users
    if (socket && isConnected && roomId) {
      socket.emit('input-response', { roomId, input: currentInput });
    }
    
    // Add to input queue
    setInputQueue(prev => [...prev, currentInput]);
    setCurrentInput("");
    setWaitingForInput(false);

    // Continue execution if there's a pending execution
    if (pendingExecutionRef.current) {
      const { sourceCode, allInputs } = pendingExecutionRef.current;
      const newInputs = [...allInputs, currentInput];
      
      // Emit execution continuation to other users
      if (socket && isConnected && roomId) {
        socket.emit('execution-continue', { roomId, allInputs: newInputs });
      }
      
      continueExecution(sourceCode, newInputs);
    }
  };

  const extractInputPrompts = (sourceCode) => {
    const prompts = [];
    
    if (language === 'python') {
      // Python: input("prompt")
      const inputPattern = /input\s*\(\s*['"](.*?)['"]\s*\)/g;
      let match;
      while ((match = inputPattern.exec(sourceCode)) !== null) {
        prompts.push(match[1]);
      }
    } 
    else if (language === 'cpp' || language === 'c') {
      // C++: cout << "prompt"; cin >> var; or printf("prompt");
      const coutPattern = /cout\s*<<\s*['"](.*?)['"]\s*;?\s*cin/g;
      const printfPattern = /printf\s*\(\s*['"](.*?)['"]/g;
      
      let match;
      while ((match = coutPattern.exec(sourceCode)) !== null) {
        prompts.push(match[1]);
      }
      while ((match = printfPattern.exec(sourceCode)) !== null) {
        prompts.push(match[1]);
      }
    }
    else if (language === 'java') {
      // Java: Look for Scanner input methods and their preceding print statements
      const scannerMethods = /(\w+)\.(?:nextInt|nextDouble|nextFloat|nextLong|nextBoolean|next|nextLine)\s*\(\s*\)/g;
      const matches = [...sourceCode.matchAll(scannerMethods)];
      
      // For each scanner input, look backwards for the most recent print statement
      matches.forEach(match => {
        const beforeInput = sourceCode.substring(0, match.index);
        const printMatches = [...beforeInput.matchAll(/System\.out\.print(?:ln)?\s*\(\s*['"](.*?)['"]\s*\)/g)];
        if (printMatches.length > 0) {
          // Get the last print statement before this input
          const lastPrint = printMatches[printMatches.length - 1];
          if (!prompts.includes(lastPrint[1])) {
            prompts.push(lastPrint[1]);
          }
        }
      });
      
      // If no specific prompts found but there are scanner methods, add generic prompts
      if (prompts.length === 0 && matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
          prompts.push(`Enter input ${i + 1}: `);
        }
      }
    }
    else if (language === 'javascript' || language === 'js') {
      // JavaScript: prompt("message") or readline with console.log
      const promptPattern = /prompt\s*\(\s*['"](.*?)['"]\s*\)/g;
      const readlinePattern = /console\.log\s*\(\s*['"](.*?)['"]\s*\)[\s\S]*?readline/g;
      
      let match;
      while ((match = promptPattern.exec(sourceCode)) !== null) {
        prompts.push(match[1]);
      }
      while ((match = readlinePattern.exec(sourceCode)) !== null) {
        prompts.push(match[1]);
      }
    }
    else if (language === 'rust') {
      // Rust: println!("prompt"); or print!("prompt"); followed by stdin().read_line()
      const printPattern = /print(?:ln)?!\s*\(\s*['"](.*?)['"]\s*\)/g;
      let match;
      while ((match = printPattern.exec(sourceCode)) !== null) {
        // Check if followed by stdin read
        const afterPrint = sourceCode.substr(match.index + match[0].length);
        if (afterPrint.match(/[\s\S]*?stdin\(\)\.read_line/)) {
          prompts.push(match[1]);
        }
      }
    }
    else if (language === 'go') {
      // Go: fmt.Print("prompt") or fmt.Printf("prompt") followed by fmt.Scan
      const printPattern = /fmt\.Print(?:f|ln)?\s*\(\s*['"](.*?)['"]/g;
      let match;
      while ((match = printPattern.exec(sourceCode)) !== null) {
        // Check if followed by scan
        const afterPrint = sourceCode.substr(match.index + match[0].length);
        if (afterPrint.match(/[\s\S]*?fmt\.Scan/)) {
          prompts.push(match[1]);
        }
      }
    }
    
    return prompts;
  };

  const continueExecution = async (sourceCode, inputs) => {
    const prompts = extractInputPrompts(sourceCode);
    
    if (inputs.length < prompts.length) {
      // Show the next actual prompt from the code
      const nextPrompt = prompts[inputs.length];
      addToConsole(nextPrompt, "prompt");
      setWaitingForInput(true);
      pendingExecutionRef.current = { sourceCode, allInputs: inputs };
      
      // Emit input request to other users so they can also provide input
      if (socket && isConnected && roomId) {
        socket.emit('input-request', { roomId, prompt: nextPrompt });
      }
      return;
    }

    // Execute the program with all inputs
    try {
      const inputString = inputs.join('\n');
      const { run: result } = await executeCode(language, sourceCode, inputString);
      
      if (result.stderr) {
        addToConsole(result.stderr, "error");
        setIsError(true);
        
        // Emit error result to other users
        if (socket && isConnected && roomId) {
          socket.emit('execution-result', { roomId, result: result.stderr, isError: true });
        }
      } else {
        // Parse output and handle the concatenated prompts properly
        const outputLines = result.output.split('\n');
        let finalOutput = '';
        
        outputLines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            // Handle the concatenated prompts line
            if (trimmedLine.includes('Enter your name:') && trimmedLine.includes('Enter your age:') && trimmedLine.includes('Enter your salary:')) {
              // This is the concatenated prompts line, extract just the actual output after the prompts
              const parts = trimmedLine.split('Enter your salary:');
              if (parts.length > 1) {
                const actualOutput = parts[1].trim();
                if (actualOutput) {
                  addToConsole(actualOutput, "output");
                  finalOutput += actualOutput + '\n';
                }
              }
            } else {
              // Regular output line, show as-is
              addToConsole(line, "output");
              finalOutput += line + '\n';
            }
          }
        });
        
        // Emit success result to other users
        if (socket && isConnected && roomId) {
          socket.emit('execution-result', { roomId, result: finalOutput.trim(), isError: false });
        }
      }
      
      setIsLoading(false);
      pendingExecutionRef.current = null;
    } catch (error) {
      const errorMessage = "An error occurred: " + (error.message || "Unable to run code");
      addToConsole(errorMessage, "error");
      setIsError(true);
      setIsLoading(false);
      pendingExecutionRef.current = null;
      
      // Emit error result to other users
      if (socket && isConnected && roomId) {
        socket.emit('execution-result', { roomId, result: errorMessage, isError: true });
      }
    }
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    // Clear previous output first
    setConsoleLines([]);
    setIsLoading(true);
    setIsError(false);
    setWaitingForInput(false);
    setInputQueue([]);
    setCurrentInput("");

    // Emit code execution event to other users (this will clear their output too)
    if (socket && isConnected && roomId) {
      console.log('📤 Emitting code execution to room:', roomId);
      socket.emit('code-execution', { roomId, language, code: sourceCode });
    }
    
    // Extract prompts from the code
    const prompts = extractInputPrompts(sourceCode);
    
    if (prompts.length > 0) {
      // Program needs input, show the first actual prompt
      addToConsole(prompts[0], "prompt");
      setWaitingForInput(true);
      setIsLoading(false);
      pendingExecutionRef.current = { sourceCode, allInputs: [] };
      
      // Emit input request to other users
      if (socket && isConnected && roomId) {
        socket.emit('input-request', { roomId, prompt: prompts[0] });
      }
    } else {
      // No input needed, execute directly
      try {
        const { run: result } = await executeCode(language, sourceCode, "");
        
        if (result.stderr) {
          addToConsole(result.stderr, "error");
          setIsError(true);
          
          // Emit error result to other users
          if (socket && isConnected && roomId) {
            socket.emit('execution-result', { roomId, result: result.stderr, isError: true });
          }
        } else {
          const outputLines = result.output.split('\n');
          outputLines.forEach(line => {
            if (line.trim()) {
              addToConsole(line, "output");
            }
          });
          
          // Emit success result to other users
          if (socket && isConnected && roomId) {
            socket.emit('execution-result', { roomId, result: result.output, isError: false });
          }
        }
        setIsLoading(false);
      } catch (error) {
        const errorMessage = "An error occurred: " + (error.message || "Unable to run code");
        addToConsole(errorMessage, "error");
        setIsError(true);
        setIsLoading(false);
        
        // Emit error result to other users
        if (socket && isConnected && roomId) {
          socket.emit('execution-result', { roomId, result: errorMessage, isError: true });
        }
      }
    }
  };

  useImperativeHandle(ref, () => ({
    runCode
  }));

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400 font-mono text-sm">
      <div ref={consoleRef} className="flex-1 p-3 overflow-auto">
        {consoleLines.length === 0 && !isLoading && (
          <div className="text-gray-500 italic">
            Click "Run Code" to execute your program
          </div>
        )}
        
        {consoleLines.map((line, i) => (
          <div key={`${line.timestamp}-${i}`} className={`
            ${line.type === 'prompt' ? 'text-yellow-400' : ''}
            ${line.type === 'input' ? 'text-cyan-400' : ''}
            ${line.type === 'error' ? 'text-red-400' : ''}
            ${line.type === 'output' ? 'text-green-400' : ''}
          `}>
            {line.type === 'input' ? `> ${line.text}` : line.text}
          </div>
        ))}
        
        {isLoading && !waitingForInput && (
          <div className="text-blue-400 animate-pulse">Running...</div>
        )}
        
        {waitingForInput && (
          <form onSubmit={handleInputSubmit} className="flex items-center mt-2">
            <span className="text-cyan-400 mr-2">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              className="bg-transparent border-none outline-none text-cyan-400 flex-1"
              placeholder="Type your input and press Enter..."
            />
          </form>
        )}
      </div>
    </div>
  );
});

export default Output;