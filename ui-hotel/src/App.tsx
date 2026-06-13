import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import AuthGuard from './components/guards/AuthGuard';

import AdminLayout from './features/ADMIN/layout/AdminLayout';
import AdminDashboard from './features/ADMIN/pages/AdminDashboard';
import AdminRoomsPage from './features/ADMIN/pages/AdminRoomsPage';

import UserLayout from './features/USER/layout/UserLayout';
import UserDashboard from './features/USER/pages/UserDashboard';
import RoomsPage from './features/USER/pages/RoomsPage';
import BookingPage from './features/USER/pages/BookingPage';
import MyBookingsPage from './features/USER/pages/MyBookingsPage';

import WalletPage from './features/wallet/pages/WalletPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes - ADMIN */}
        <Route element={<AuthGuard allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<AdminRoomsPage />} />
            <Route path="/admin/wallet" element={<WalletPage />} />
            <Route path="/admin/bookings" element={<div style={{padding:'2rem'}}>Bookings Management</div>} />
            <Route path="/admin/users" element={<div style={{padding:'2rem'}}>Users Management</div>} />
          </Route>
        </Route>

        {/* Protected Routes - USER */}
        <Route element={<AuthGuard allowedRoles={['USER']} />}>
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/rooms" element={<RoomsPage />} />
            <Route path="/user/booking" element={<BookingPage />} />
            <Route path="/user/wallet" element={<WalletPage />} />
            <Route path="/user/bookings" element={<MyBookingsPage />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
