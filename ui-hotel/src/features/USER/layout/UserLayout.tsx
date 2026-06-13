import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../lib/axios';
import { Hotel, User as UserIcon, LogOut, ChevronDown, Wallet } from 'lucide-react';
import './UserLayout.css';

const UserLayout: React.FC = () => {
  const { user, logout, walletBalance, setWalletBalance } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await apiClient.get('/wallets/me');
        setWalletBalance(res.data.data.balance);
      } catch (err) {
        console.error('Failed to fetch wallet', err);
      }
    };
    fetchWallet();
  }, [setWalletBalance]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-layout">
      <header className="user-header">
        <div className="header-container">
          <div className="logo-section" onClick={() => navigate('/user/dashboard')}>
            <Hotel className="logo-icon" size={28} />
            <span className="logo-text">FUN HOTEL</span>
          </div>

          <nav className="main-nav">
            <a onClick={() => navigate('/user/dashboard')} style={{cursor:'pointer'}}>Home</a>
            <a onClick={() => navigate('/user/rooms')} style={{cursor:'pointer'}}>Rooms</a>
            <a onClick={() => navigate('/user/bookings')} style={{cursor:'pointer'}}>My Bookings</a>
          </nav>

          <div className="user-menu-section" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div 
              className="wallet-button"
              onClick={() => navigate('/user/wallet')}
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '99px', color: '#334155', fontWeight: 600}}
            >
              <Wallet size={18} color="#1e3a8a" />
              <span>${walletBalance != null ? walletBalance.toLocaleString() : '0'}</span>
            </div>

            <div 
              className="user-profile-button" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.full_name}</span>
              <ChevronDown size={16} />
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user?.full_name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <UserIcon size={16} />
                  <span>Profile Settings</span>
                </button>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="user-main">
        <Outlet />
      </main>

      <footer className="user-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Hotel size={24} />
            <span>FUN HOTEL</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Fun Hotel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
