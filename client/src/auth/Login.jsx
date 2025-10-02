import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import toast, { Toaster } from 'react-hot-toast';
const Login = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', user, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });


      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      if (res.data.user && res.data.user.id) {
        localStorage.setItem('userId', res.data.user.id);
      }
      if (res.data.user && res.data.user.username) {
        localStorage.setItem('username', res.data.user.username);
      }
      toast.success('Successfully logged in! Redirecting...', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: 'white',
        },
        icon: '✅',
      });
      setTimeout(() => {
        navigate('/room');
      }, 1000);
    } catch (err) {
      console.log('Full error:', err);


      if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
        toast.error('Something went wrong. Please try again.');
      }
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Panel - Login Form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600 text-base sm:text-lg">Sign in to continue to your workspace</p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8 flex rounded-lg bg-gray-100 p-1">
              <button className="flex-1 rounded-md bg-black py-2.5 text-center text-sm font-semibold text-white transition-all duration-200">
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex-1 rounded-md py-2.5 text-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all duration-200"
              >
                Sign up
              </button>
            </div>

            {/* Google Sign In */}
            <button className="w-full mb-6 flex items-center justify-center gap-3 rounded-lg border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-sm text-gray-500 bg-white px-2">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all duration-200"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  type="text"
                  value={user.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all duration-200"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value={user.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2"
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={user.rememberMe}
                    onChange={handleInputChange}
                  />
                  <label className="ml-2 block text-sm text-gray-700" htmlFor="remember-me">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-sm text-black hover:underline font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                Sign in
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-semibold text-black hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Right Panel - Feature Showcase */}
        <div className="relative bg-black text-white p-8 sm:p-12 lg:p-16 flex items-center justify-center">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10 text-center max-w-lg">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Build amazing things together
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-12 leading-relaxed">
              The modern collaborative workspace for development teams who want to ship faster.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-semibold text-sm sm:text-base">Real-time Sync</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <p className="font-semibold text-sm sm:text-base">Team Collaboration</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <p className="font-semibold text-sm sm:text-base">Smart Analytics</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-semibold text-sm sm:text-base">Easy Setup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default Login;