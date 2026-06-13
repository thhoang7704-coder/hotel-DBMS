import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Hotel, Mail, Lock, ArrowRight } from 'lucide-react';
import apiClient from '../../../lib/axios';
import { extractErrorMessage } from '../../../utils/apiError';
import { useAuthStore } from '../../../store/authStore';
import './Auth.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data.data;
      
      setAuth(data.user, data.access_token, data.refresh_token);

      const from = (location.state as any)?.from?.pathname || (data.user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard');
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side: Image */}
      <div className="auth-image-side">
        <div className="auth-image-overlay">
          <h1>Experience Luxury</h1>
          <p>Book your perfect getaway with FUN HOTEL. Discover breathtaking views and world-class amenities.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-brand">
            <Hotel size={28} color="#ff6b6b" />
            <span>FUN HOTEL</span>
          </div>
          
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Please enter your details to sign in.</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
