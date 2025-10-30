import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RoomCreatedModal from '../components/RoomCreatedModal';
import {API_BASE_URL} from '../Constants.js';
import axios from 'axios';
const Room = () => {

  const navigate = useNavigate();

  // Handle OAuth redirect tokens
  useEffect(() => {
  console.log(' Room.jsx: Component loaded, checking URL params...');
  console.log(' Current URL:', window.location.href);
  
  const urlParams = new URLSearchParams(window.location.search);
  console.log(' All URL params:', Object.fromEntries(urlParams));
  
  const token = urlParams.get('token');
  const userId = urlParams.get('userId');  
  const username = urlParams.get('username');
  
  console.log('🎯 Extracted values:', { token: token?.substring(0, 20) + '...', userId, username });
  
  if (token && userId && username) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    
    console.log('✅ OAuth tokens stored successfully!');
    
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    console.log('❌ Missing OAuth parameters:', { hasToken: !!token, hasUserId: !!userId, hasUsername: !!username });
  }
}, []);
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [showModal, setShowModal] = useState(false);
  const [createdRoomData, setCreatedRoomData] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user profile to get avatar
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.data && response.data.avatar) {
          setUserAvatar(response.data.avatar);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const [createData, setCreateData] = useState({
    name: '',
    isPrivate: true,
    joinCode: ''
  });

  const [joinData, setJoinData] = useState({
    roomId: '',
    joinCode: ''
  });

  const handleCreateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

  };

  const handleJoinInputChange = (e) => {
    const { name, value } = e.target;
    setJoinData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    // console.log('Create room data:', createData);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert('Please login first');
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/room/create`, createData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log('Room created:', res.data);

      // Store the current room ID for future operations
      localStorage.setItem('currentRoomId', res.data.room);

      // Show the modal with actual room data
      setCreatedRoomData({
        roomId: res.data.room,
        joinCode: createData.joinCode
      });
      setShowModal(true);

      // Reset form
      setCreateData({
        name: '',
        isPrivate: true,
        joinCode: ''
      });

    } catch (err) {
      console.log('Full error:', err);
      console.log('Error response:', err.response?.data);

      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        // Optionally redirect to login
        // navigate('/login');
      } else {
        alert('Failed to create room. Please try again.');
      }
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    console.log('Join room data:', joinData);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert('Please login first');
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/room/join`, joinData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log('Joined room:', res.data);

      // Store the current room ID for future operations
      localStorage.setItem('currentRoomId', joinData.roomId);

      alert('Successfully joined room!');
      navigate('/editor');

      // Reset form
      setJoinData({
        roomId: '',
        joinCode: ''
      });

    } catch (err) {
      console.log('Full error:', err);
      console.log('Error response:', err.response?.data);

      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else if (err.response?.status === 404) {
        alert('Room not found. Please check the Room ID.');
      } else if (err.response?.status === 403) {
        alert('Invalid join code. Please check the password.');
      } else {
        alert('Failed to join room. Please try again.');
      }
    }
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfileOption = () => {
    setShowProfileDropdown(false);
    navigate('/profile');
  };

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    try {
      // Clear server-side cookie
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear client-side localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentRoomId');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 px-10 py-4">
        <div className="flex items-center gap-3 text-gray-800">
          <div className="w-8 h-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="var(--primary-color)"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tighter">CodeCollab</h1>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">

        </nav>

        <div className="flex items-center gap-4">
          <button className="relative">
            <span className="material-symbols-outlined text-gray-500 hover:text-gray-800 transition-colors">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleProfileClick}
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 hover:ring-2 hover:ring-gray-300 transition-all duration-200 cursor-pointer"
              style={{
                backgroundImage: `url("${userAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ6qfLxUn-IJAcVFSG8dRRYBZzFGeM-XgRgYC4EkaHmjJaZufe0D-6ZMNirC-x-BrAjbH6_yNcg8-rGw9nqZI0Zz1u1ah-BdXa-CjIHyUJ3n96UDJlmrSNR819r7mqPFw_Xoe9dOodfI6PgxmuBXcDKAvvvjiAWDc18LFFmFgvTDQPdZjHMd_voY88Xti7ENiPBDsymL1GpfHTdOoWwe5EmYZAF8mhlI_YQI2XrpGEfVE7Y6U3IvZ_yL8gebxZcvA7EuHcYCjZuZE'}")`
              }}
            ></button>
            
          
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <button
                    onClick={handleProfileOption}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 mr-3">person</span>
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 mr-3">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center py-12 px-4 gradient-bg">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-100/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Rooms</h2>
              <p className="mt-2 text-sm text-gray-500">Create a new room or join an existing one to start collaborating.</p>
            </div>

            {/* Mode Toggle Buttons */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'create'
                  ? 'bg-white text-[var(--primary-color)] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'join'
                  ? 'bg-white text-[var(--primary-color)] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Join Room
              </button>
            </div>

            {/* Create Room Form */}
            {mode === 'create' && (
              <form className="space-y-6" onSubmit={handleCreateRoom}>
                <div>
                  <label className="sr-only" htmlFor="name">Room Name</label>
                  <input
                    className="form-input w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition duration-200"
                    id="name"
                    name="name"
                    placeholder="Enter Room Name"
                    required
                    type="text"
                    value={createData.name}
                    onChange={handleCreateInputChange}
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="joinCode">Join Code</label>
                  <input
                    className="form-input w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition duration-200"
                    id="joinCode"
                    name="joinCode"
                    placeholder="Set Join Code (Password)"
                    type="password"
                    required
                    value={createData.joinCode}
                    onChange={handleCreateInputChange}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={createData.isPrivate}
                    onChange={handleCreateInputChange}
                    className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    Make room private
                  </label>
                </div>

                <button
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm btn-primary transition-all duration-200 transform hover:scale-105"
                  type="submit"
                >
                  Create Room
                </button>
              </form>
            )}

            {/* Join Room Form */}
            {mode === 'join' && (
              <form className="space-y-6" onSubmit={handleJoinRoom}>
                <div>
                  <label className="sr-only" htmlFor="roomId">Room ID</label>
                  <input
                    className="form-input w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition duration-200"
                    id="roomId"
                    name="roomId"
                    placeholder="Enter Room ID"
                    required
                    type="text"
                    value={joinData.roomId}
                    onChange={handleJoinInputChange}
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="joinCode">Join Code</label>
                  <input
                    className="form-input w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition duration-200"
                    id="joinCode"
                    name="joinCode"
                    placeholder="Enter Join Code (Password)"
                    type="password"
                    required
                    value={joinData.joinCode}
                    onChange={handleJoinInputChange}
                  />
                </div>

                <button
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm btn-primary transition-all duration-200 transform hover:scale-105"
                  type="submit"
                >
                  Join Room
                </button>
              </form>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            By creating or joining a room, you agree to our{' '}
            <Link to="#" className="font-medium text-[var(--primary-color)] hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </main>
      <RoomCreatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        roomData={createdRoomData}
      />
    </div>
  );
};

export default Room;
