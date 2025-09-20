import React from 'react';
import { Link } from 'react-router-dom';

const Room = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle room creation
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
          <Link to="#" className="hover:text-[var(--primary-color)] transition-colors">Dashboard</Link>
          <Link to="#" className="hover:text-[var(--primary-color)] transition-colors">Projects</Link>
          <Link to="#" className="text-[var(--primary-color)] font-semibold">Rooms</Link>
          <Link to="#" className="hover:text-[var(--primary-color)] transition-colors">Settings</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="relative">
            <span className="material-symbols-outlined text-gray-500 hover:text-gray-800 transition-colors">notifications</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCJ6qfLxUn-IJAcVFSG8dRRYBZzFGeM-XgRgYC4EkaHmjJaZufe0D-6ZMNirC-x-BrAjbH6_yNcg8-rGw9nqZI0Zz1u1ah-BdXa-CjIHyUJ3n96UDJlmrSNR819r7mqPFw_Xoe9dOodfI6PgxmuBXcDKAvvvjiAWDc18LFFmFgvTDQPdZjHMd_voY88Xti7ENiPBDsymL1GpfHTdOoWwe5EmYZAF8mhlI_YQI2XrpGEfVE7Y6U3IvZ_yL8gebxZcvA7EuHcYCjZuZE")`
            }}
          ></div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center py-12 px-4 gradient-bg">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-100/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Rooms</h2>
              <p className="mt-2 text-sm text-gray-500">Create a new room or join an existing one to start collaborating.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="sr-only" htmlFor="room-name">Room Name / Code</label>
                <input
                  className="form-input w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition duration-200"
                  id="room-name"
                  name="room-name"
                  placeholder="Enter Room Name or Code"
                  required
                  type="text"
                />
              </div>
              
              <div>
                <label className="sr-only" htmlFor="password">Password</label>
                <input
                  className="form-input w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] focus:ring-opacity-50 transition duration-200"
                  id="password"
                  name="password"
                  placeholder="Password (optional)"
                  type="password"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm btn-primary transition-all duration-200 transform hover:scale-105"
                  type="submit"
                >
                  Create Room
                </button>
                <button 
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm btn-secondary transition-all duration-200 transform hover:scale-105"
                  type="button"
                >
                  Join Room
                </button>
              </div>
            </form>
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
    </div>
  );
};

export default Room;