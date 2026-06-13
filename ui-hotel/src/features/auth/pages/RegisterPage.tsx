import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hotel, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import apiClient from '../../../lib/axios';
import { extractErrorMessage } from '../../../utils/apiError';
import { useAuthStore } from '../../../store/authStore';
import './Auth.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', formData);
      const data = response.data.data;
      
      setAuth(data.user, data.access_token, data.refresh_token);

      const redirectPath = data.user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left side: Image */}
      <div className="auth-image-side" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}>
        <div className="auth-image-overlay">
          <h1>Join Our Community</h1>
          <p>Create an account to unlock exclusive member rates, early access to offers, and seamless booking management.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-brand">
            <Hotel size={28} color="#ff6b6b" />
            <span>FUN HOTEL</span>
          </div>

          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Enter your details below to register.</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  id="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+84 123 456 789"
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
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Registering...' : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
