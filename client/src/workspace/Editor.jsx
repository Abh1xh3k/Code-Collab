import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import ChatBox from '../components/ChatBox';
import LeaveRoomModal from '../components/LeaveRoomModal';
import axios from 'axios';
import {io} from 'socket.io-client'
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '../Constants';


const WorkspaceEditor = () => {
  const navigate = useNavigate();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [roomName, setRoomName] = useState('Loading...');

  
  const roomId = localStorage.getItem('currentRoomId');

  useEffect(() => {
    const fetchRoomDetails = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!roomId || !token) {
        setRoomName('Unknown Room');
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        console.log(`room data is ${res.data}`);
        setRoomName(res.data.room.name || 'Unnamed Room');
      } catch (err) {
        console.error('Error fetching room details:', err);
        setRoomName('Unknown Room');
      }
    };

    fetchRoomDetails();
  }, []);

  const handleLeaveRoom = async() => {
    const token = localStorage.getItem('authToken');
    
    console.log('Attempting to leave room:', roomId);
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    if (!roomId) {
      alert('No room ID found. Please join a room first.');
      return;
    }
    
    if (!token) {
      alert('No authentication token found. Please login again.');
      return;
    }
    
    try{
      const res = await axios.delete(`${API_BASE_URL}/room/leave/${roomId}`, {
        headers:{
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
      
      console.log('Leave room response:', res.data);
      
      if (res.status === 200) {
        localStorage.removeItem('currentRoomId');
        alert('Successfully left the room!');
        navigate('/room');
      }
      
    } catch(err) {
      console.error('Error leaving room:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (err.response?.status === 404) {
        alert('Room not found or you are not a member of this room.');
      } else {
        alert('Failed to leave room. Please try again.');
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-4 bg-white z-10 flex-shrink-0 sticky top-0">
        <div className="flex items-center gap-3 text-gray-900">
          <div className="h-8 w-8 text-[var(--primary-color)]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="var(--primary-color)"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold">Code Collab</h1>
        </div>
        
  
        <div className="flex-1 flex justify-center">
          <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Room: </span>
              <span className="text-sm font-bold text-[var(--primary-color)]">{roomName}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsLeaveModalOpen(true)}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 text-gray-900 text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors"
        >
          <span>Leave Room</span>
        </button>
      </header>

     <main className="flex flex-1 h-[calc(100vh-80px)]">
        <div className="flex-1 max-w-[calc(100%-400px)] overflow-y-auto">
          <CodeEditor roomid={roomId} />
        </div>

      
        <div className="w-[400px] flex-shrink-0 h-full overflow-y-auto">
          <ChatBox />
        </div>
      </main>
          

      <LeaveRoomModal 
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeaveRoom}
      />
      

      <Toaster />
    </div>
  );
};

export default WorkspaceEditor;
