import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();

  // Form state management
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Sending data:', user);
    try {
      const res = await axios.post("/api/auth/signup", user, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log('Success:', res.data);

      navigate('/login');
    } catch (err) {
      console.log('Full error:', err);
      console.log('Error response:', err.response?.data);
      console.log('Error status:', err.response?.status);

      // Set error message for user to see
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center font-manrope">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-white p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
            <p className="mt-2 text-gray-500">Join us to start coding collaboratively.</p>
          </div>
          <div className="mb-6 flex">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 rounded-l-lg bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-200">Login</button>
            <button className="flex-1 rounded-r-lg bg-[var(--primary-color)] py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-purple-700">Signup</button>
          </div>
          <button className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            <svg className="h-5 w-5" viewBox="0 0 48 48">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#4285F4"></path>
              <path d="M6.306 14.691L11.961 19.23C12.991 16.595 14.887 14.28 17.296 12.63L11.892 7.747C9.845 10.054 7.643 12.753 6.306 14.691z" fill="#34A853"></path>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.046 35.663 27.225 37 24 37c-3.185 0-6.035-1.59-7.795-4.044l-5.613 4.545C13.431 41.345 18.315 44 24 44z" fill="#FBBC05"></path>
              <path d="M43.611 20.083L42 20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.657 5.657C41.386 36.626 44 31.637 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#EA4335"></path>
            </svg>
            <span>Continue with Google</span>
          </button>
          <div className="relative mb-6 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 flex-shrink text-sm text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="sr-only" htmlFor="username">Username</label>
              <input
                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-purple-500 focus:ring-purple-500"
                id="username"
                name="username"
                placeholder="Username"
                type="text"
                value={user.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="email">Email</label>
              <input
                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-purple-500 focus:ring-purple-500"
                id="email"
                name="email"
                placeholder="Email"
                type="email"
                value={user.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                className="w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-purple-500 focus:ring-purple-500"
                id="password"
                name="password"
                placeholder="Password"
                type="password"
                value={user.password}
                onChange={handleInputChange}
              />
            </div>
            <button
              className="w-full rounded-lg bg-[var(--primary-color)] py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-700"
              type="submit"
            >
              Create Account
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <a
              onClick={() => navigate('/login')}
              className="font-semibold text-[var(--primary-color)] hover:underline" href="#">Login</a>
          </p>
        </div>
        <div className="relative hidden items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-12 lg:flex">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl font-bold">Turn your ideas into reality</h1>
            <p className="mt-4 text-lg opacity-80">The ultimate collaborative IDE for modern development teams.</p>
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="rounded-xl bg-white/20 p-6 backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-white">show_chart</span>
                <p className="mt-2 font-semibold">Live Analytics</p>
              </div>
              <div className="rounded-xl bg-white/20 p-6 backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-white">groups</span>
                <p className="mt-2 font-semibold">Team Collaboration</p>
              </div>
              <div className="rounded-xl bg-white/20 p-6 backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-white">military_tech</span>
                <p className="mt-2 font-semibold">Rewards System</p>
              </div>
              <div className="rounded-xl bg-white/20 p-6 backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-white">all_inclusive</span>
                <p className="mt-2 font-semibold">Seamless Integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;