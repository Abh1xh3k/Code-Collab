import { useState, forwardRef, useImperativeHandle } from "react";
import { executeCode } from "../api";

const Output = forwardRef(({ editorRef, language }, ref) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);
      setIsError(false);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      alert("An error occurred: " + (error.message || "Unable to run code"));
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    runCode
  }));

  return (
    <div className="h-full">
      <pre className={`text-base font-sans h-full ${isError ? 'text-red-600' : 'text-gray-800'}`}>
        {output ? (
          output.map((line, i) => (
            <div key={i}>
              {line || "\u00A0"}
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic">
            {isLoading ? "Running..." : "Click \"Run Code\" to see the output here"}
          </div>
        )}
      </pre>
    </div>
  );
});

export default Output;