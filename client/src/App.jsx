import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import WorkspaceEditor from "./workspace/Editor";
import Room from "./room/Room";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/editor" element={<WorkspaceEditor />} />
        <Route path="/room" element={<Room />} /> {/* Fixed Router to Route */}
      </Routes>
    </Router>
  );
}

export default App;


