import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import WorkspaceEditor from "./workspace/Editor";
import Room from "./room/Room";
import DoodleModal from "./components/DoodleModal";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";

function App() {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear localStorage on unauthorized
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentRoomId');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          // Redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/editor" element={
          <ProtectedRoute>
            <WorkspaceEditor />
          </ProtectedRoute>
        } />
        <Route path="/room" element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;


