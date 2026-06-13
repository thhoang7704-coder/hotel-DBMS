import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BedDouble, Star, MapPin, Filter } from 'lucide-react';
import apiClient from '../../../lib/axios';
import './RoomsPage.css';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  floorNumber: number;
  status: string;
  imageUrl?: string;
  bookedDates?: { checkIn: string; checkOut: string }[];
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  SUITE: 'Suite',
  DELUXE: 'Deluxe',
  FAMILY: 'Family',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available', color: '#10b981' },
  OCCUPIED: { label: 'Occupied', color: '#ef4444' },
  MAINTENANCE: { label: 'Maintenance', color: '#f59e0b' },
};

const FALLBACK_IMAGES: Record<string, string> = {
  SINGLE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
  DELUXE: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80',
  FAMILY: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80',
};

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filtered, setFiltered] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

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

  useEffect(() => {
    let result = rooms;
    if (search) {
      result = result.filter(r =>
        r.roomNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (typeFilter !== 'ALL') {
      result = result.filter(r => r.roomType === typeFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }
    setFiltered(result);
  }, [rooms, search, typeFilter, statusFilter]);

  const handleBook = (room: Room) => {
    navigate('/user/booking', { state: { room } });
  };

  if (loading) {
    return (
      <div className="rooms-loading">
        <div className="loading-spinner" />
        <p>Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h1>Browse Rooms</h1>
          <p>Find your perfect stay from our curated selection.</p>
        </div>
        <span className="rooms-count">{filtered.length} rooms found</span>
      </div>

      {/* Filters */}
      <div className="rooms-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search room number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            {Object.entries(ROOM_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rooms-empty">
          <BedDouble size={64} color="#cbd5e1" />
          <p>No rooms match your filters.</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {filtered.map(room => {
            const statusInfo = STATUS_LABELS[room.status] || { label: room.status, color: '#64748b' };
            const img = room.imageUrl || FALLBACK_IMAGES[room.roomType] || FALLBACK_IMAGES.SINGLE;
            return (
              <div key={room.id} className="room-card">
                <div className="room-card-image">
                  <img src={img} alt={`Room ${room.roomNumber}`} />
                  <div
                    className="room-status-badge"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </div>
                </div>
                <div className="room-card-body">
                  <div className="room-card-header">
                    <h3>Room {room.roomNumber}</h3>
                    <span className="room-type-tag">{ROOM_TYPE_LABELS[room.roomType] || room.roomType}</span>
                  </div>
                  <div className="room-card-meta">
                    <span><MapPin size={14} /> Floor {room.floorNumber}</span>
                    <span><Star size={14} /> {ROOM_TYPE_LABELS[room.roomType] || room.roomType}</span>
                  </div>
                  <div className="room-card-footer">
                    <div className="room-price">
                      <span className="price-amount">${room.pricePerNight?.toLocaleString()}</span>
                      <span className="price-unit"> / night</span>
                    </div>
                    <button
                      className="book-btn"
                      disabled={room.status !== 'AVAILABLE'}
                      onClick={() => handleBook(room)}
                    >
                      {room.status === 'AVAILABLE' ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                  {room.bookedDates && room.bookedDates.length > 0 && (
                    <div className="booked-dates-info">
                      <div className="booked-dates-title">Reserved Dates:</div>
                      <div className="booked-dates-list">
                        {room.bookedDates.map((d, i) => (
                          <span key={i} className="booked-date-pill">{new Date(d.checkIn).toLocaleDateString()} - {new Date(d.checkOut).toLocaleDateString()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
