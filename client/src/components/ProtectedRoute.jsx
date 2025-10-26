import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../Constants';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 ProtectedRoute: Starting authentication check...');
      
      try {
        // First check for OAuth tokens in URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlUserId = urlParams.get('userId');
        const urlUsername = urlParams.get('username');
        
        if (urlToken && urlUserId && urlUsername) {
          console.log('🎯 ProtectedRoute: Found OAuth tokens in URL, storing...');
          localStorage.setItem('authToken', urlToken);
          localStorage.setItem('userId', urlUserId);
          localStorage.setItem('username', urlUsername);
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          console.log('✅ ProtectedRoute: OAuth tokens stored');
        }
        
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        
        console.log('📝 ProtectedRoute: localStorage contents:', {
          token: token ? `${token.substring(0, 20)}...` : 'Missing',
          userId: userId || 'Missing',
          username: username || 'Missing'
        });
        
        if (!token) {
          console.log('❌ ProtectedRoute: No token found in localStorage');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log('🔄 ProtectedRoute: Verifying token with server...');
        // Add timeout to the request
        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        });
        
        console.log('✅ ProtectedRoute: Token verification successful!', response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('❌ ProtectedRoute: Auth check failed!');
        console.log('Error details:', {
          message: error.message,
          status: error?.response?.status,
          data: error?.response?.data,
          url: error?.config?.url
        });
        
        // If token is invalid or expired, clear storage
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.log('🧹 ProtectedRoute: Token expired or invalid, clearing storage');
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentRoomId');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
        } else if (error.code === 'ECONNABORTED') {
          console.log('⏰ ProtectedRoute: Request timeout - server may be slow');
        } else {
          console.log('🌐 ProtectedRoute: Network or server error', error);
        }
        
        setIsAuthenticated(false);
      } finally {
        console.log('🏁 ProtectedRoute: Auth check completed');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
