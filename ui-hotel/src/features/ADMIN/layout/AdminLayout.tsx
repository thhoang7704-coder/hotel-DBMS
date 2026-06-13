import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../lib/axios';
import { 
  Hotel, 
  LayoutDashboard, 
  BedDouble, 
  CalendarCheck, 
  Users, 
  LogOut,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const { user, logout, walletBalance, setWalletBalance } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Rooms', path: '/admin/rooms', icon: <BedDouble size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <CalendarCheck size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <Hotel className="logo-icon" size={24} />
            {sidebarOpen && <span className="logo-text">FUN HOTEL</span>}
          </div>
          <button className="toggle-btn mobile-only" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div 
              key={item.name}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {sidebarOpen && <span>{item.name}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item text-danger" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <header className="admin-header">
          <div className="header-left">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            <h2 className="page-title">
              {navItems.find(i => i.path === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
          <div className="header-right" style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
            <div 
              className="wallet-button"
              onClick={() => navigate('/admin/wallet')}
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '99px', color: '#334155', fontWeight: 600}}
            >
              <Wallet size={18} color="#1e3a8a" />
              <span>${walletBalance != null ? walletBalance.toLocaleString() : '0'}</span>
            </div>
            <div className="admin-profile">
              <div className="avatar">
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.full_name}</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
