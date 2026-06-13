import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, BedDouble, TrendingUp, AlertTriangle } from 'lucide-react';
import apiClient from '../../../lib/axios';
import './AdminDashboard.css';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  floorNumber: number;
  status: string;
  imageUrl?: string;
}

const FALLBACK_IMAGES: Record<string, string> = {
  SINGLE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
  DELUXE: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
  FAMILY: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80',
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single', DOUBLE: 'Double', SUITE: 'Suite', DELUXE: 'Deluxe', FAMILY: 'Family',
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await apiClient.get('/rooms?page=0&size=100');
        setRooms(res.data.data.content || []);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  const STAT_CARDS = [
    { title: 'Total Rooms', value: stats.total, icon: <BedDouble size={24} />, color: '#1e3a8a' },
    { title: 'Available', value: stats.available, icon: <TrendingUp size={24} />, color: '#10b981' },
    { title: 'Occupied', value: stats.occupied, icon: <Bed size={24} />, color: '#ef4444' },
    { title: 'Maintenance', value: stats.maintenance, icon: <AlertTriangle size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="admin-dashboard-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        {STAT_CARDS.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{loading ? '—' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Rooms Table */}
      <div className="table-container">
        <div className="table-header-row">
          <h3>Room Overview</h3>
          <button className="btn-outline" onClick={() => navigate('/admin/rooms')}>View All</button>
        </div>
        <div className="table-responsive">
          {loading ? (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>No rooms found.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Image</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Price/Night</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.slice(0, 5).map(room => {
                  const img = room.imageUrl || FALLBACK_IMAGES[room.roomType] || FALLBACK_IMAGES.SINGLE;
                  return (
                    <tr key={room.id}>
                      <td className="fw-500">Room {room.roomNumber}</td>
                      <td><img src={img} alt="" style={{width:60,height:40,objectFit:'cover',borderRadius:6}} /></td>
                      <td>{ROOM_TYPE_LABELS[room.roomType] || room.roomType}</td>
                      <td>Floor {room.floorNumber}</td>
                      <td className="fw-500">${room.pricePerNight?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${room.status.toLowerCase()}`}>
                          {room.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
