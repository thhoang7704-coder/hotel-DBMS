import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import apiClient from '../../../lib/axios';
import { Calendar, Search, MapPin, Star, BedDouble } from 'lucide-react';
import './UserDashboard.css';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  floorNumber: number;
  status: string;
  imageUrl?: string;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single', DOUBLE: 'Double', SUITE: 'Suite', DELUXE: 'Deluxe', FAMILY: 'Family',
};

const FALLBACK_IMAGES: Record<string, string> = {
  SINGLE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
  DELUXE: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
  FAMILY: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80',
};

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await apiClient.get('/rooms?page=0&size=6');
        setRooms(res.data.data.content || []);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE');

  return (
    <div className="user-dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Stay</h1>
          <p className="hero-subtitle">Discover luxury and comfort with FUN HOTEL</p>
          
          <div className="search-widget">
            <div className="search-field">
              <MapPin size={20} className="text-muted" />
              <div className="field-inner">
                <label>Location</label>
                <input type="text" placeholder="Where are you going?" defaultValue="FUN HOTEL Central" />
              </div>
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <Calendar size={20} className="text-muted" />
              <div className="field-inner">
                <label>Check-in</label>
                <input type="text" placeholder="Add dates" />
              </div>
            </div>
            <div className="search-divider"></div>
            <button className="search-btn" onClick={() => navigate('/user/rooms')}>
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="dashboard-container">
        <div className="welcome-banner">
          <h2>Welcome back, {user?.full_name}! 👋</h2>
          <p>Ready for your next adventure? Check out our available rooms.</p>
        </div>

        <div className="section-header">
          <h3>Featured Rooms</h3>
          <a onClick={() => navigate('/user/rooms')} className="view-all" style={{cursor:'pointer'}}>View all rooms →</a>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>Loading rooms...</div>
        ) : availableRooms.length === 0 ? (
          <div style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
            <BedDouble size={48} color="#cbd5e1" />
            <p>No available rooms at the moment.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {availableRooms.slice(0, 3).map(room => {
              const img = room.imageUrl || FALLBACK_IMAGES[room.roomType] || FALLBACK_IMAGES.SINGLE;
              return (
                <div key={room.id} className="room-card">
                  <div className="room-image-wrapper">
                    <img src={img} alt={`Room ${room.roomNumber}`} className="room-image" />
                    <div className="room-price-badge">
                      <span className="price">${room.pricePerNight?.toLocaleString()}</span>
                      <span className="period">/night</span>
                    </div>
                  </div>
                  <div className="room-info">
                    <div className="room-header">
                      <h4 className="room-name">Room {room.roomNumber}</h4>
                      <div className="room-rating">
                        <Star size={16} fill="#fbbf24" color="#fbbf24" />
                        <span>{ROOM_TYPE_LABELS[room.roomType] || room.roomType}</span>
                      </div>
                    </div>
                    <div className="room-amenities">
                      <span className="amenity-tag">{ROOM_TYPE_LABELS[room.roomType] || room.roomType}</span>
                      <span className="amenity-tag">Floor {room.floorNumber}</span>
                    </div>
                    <button 
                      className="book-btn"
                      onClick={() => navigate('/user/booking', { state: { room } })}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
