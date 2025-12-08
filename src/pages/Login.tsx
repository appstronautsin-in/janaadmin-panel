import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Cookies from 'js-cookie';
import api from '../config/axios';
import { jwtDecode } from 'jwt-decode';
import { sessionManager } from '../utils/sessionManager';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    // Check for existing token and its validity
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if ((decoded as any).exp > currentTime) {
          navigate('/dashboard');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          sessionManager.clearSession();
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionManager.clearSession();
      }
    }

    // Load remembered credentials
    const savedEmail = Cookies.get('rememberedEmail');
    const savedPassword = Cookies.get('rememberedPassword');
    if (savedEmail && savedPassword) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }));
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/v1/admin/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Check if we have a valid response with token
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }

      if (formData.rememberMe) {
        Cookies.set('rememberedEmail', formData.email, { expires: 30 });
        Cookies.set('rememberedPassword', formData.password, { expires: 30 });
      } else {
        Cookies.remove('rememberedEmail');
        Cookies.remove('rememberedPassword');
      }

      localStorage.setItem('token', response.data.token);

      // Only set userId if it exists in the response
      if (response.data.user && response.data.user._id) {
        localStorage.setItem('userId', response.data.user._id);
      }

      // Clear any old session and start a new one
      console.log('[Login] Clearing any existing session and starting new session...');
      sessionManager.clearSession();
      await sessionManager.startSession();

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.response?.status === 403) {
        setError(
          err.response?.data?.error ||
          'You are not permitted to login at this time.'
        );
      } else {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-lg border border-black">
        <div>
          <img
            className="mx-auto h-20 w-auto"
            src="https://janathavani.com/wp-content/uploads/2023/01/janathavani-19-scaled.jpg"
            alt="Logo"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 border border-black">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-12 pr-3 py-3 border border-black placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full pl-12 pr-10 py-3 border border-black placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-black"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-black hover:text-gray-700">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-black text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;