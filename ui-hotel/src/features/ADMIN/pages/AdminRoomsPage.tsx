import React, { useState, useEffect } from 'react';
import { BedDouble, Search, Filter, TrendingUp, Plus, Edit, DollarSign, X } from 'lucide-react';
import apiClient from '../../../lib/axios';
import { extractErrorMessage } from '../../../utils/apiError';
import './AdminRoomsPage.css';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  floorNumber: number;
  status: string;
  imageUrl?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#10b981', bg: '#d1fae5' },
  OCCUPIED: { label: 'Occupied', color: '#ef4444', bg: '#fee2e2' },
  MAINTENANCE: { label: 'Maintenance', color: '#f59e0b', bg: '#fef3c7' },
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Single', DOUBLE: 'Double', SUITE: 'Suite', DELUXE: 'Deluxe', FAMILY: 'Family',
};

const FALLBACK_IMAGES: Record<string, string> = {
  SINGLE: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
  DOUBLE: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80',
  SUITE: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80',
  DELUXE: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80',
  FAMILY: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80',
};

const AdminRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filtered, setFiltered] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [modalType, setModalType] = useState<'NONE' | 'CREATE' | 'EDIT' | 'EDIT_PRICE'>('NONE');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('SINGLE');
  const [pricePerNight, setPricePerNight] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [imageFile, setImageFile] = useState<File | null>(null);

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

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    let result = rooms;
    if (search) result = result.filter(r => r.roomNumber.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'ALL') result = result.filter(r => r.roomType === typeFilter);
    if (statusFilter !== 'ALL') result = result.filter(r => r.status === statusFilter);
    setFiltered(result);
  }, [rooms, search, typeFilter, statusFilter]);

  const openCreateModal = () => {
    setRoomNumber('');
    setRoomType('SINGLE');
    setPricePerNight('');
    setFloorNumber('');
    setImageFile(null);
    setFormError('');
    setModalType('CREATE');
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setFloorNumber(room.floorNumber.toString());
    setStatus(room.status);
    setFormError('');
    setModalType('EDIT');
  };

  const openEditPriceModal = (room: Room) => {
    setSelectedRoom(room);
    setPricePerNight(room.pricePerNight.toString());
    setFormError('');
    setModalType('EDIT_PRICE');
  };

  const closeModal = () => {
    setModalType('NONE');
    setSelectedRoom(null);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('roomNumber', roomNumber);
      formData.append('roomType', roomType);
      formData.append('pricePerNight', pricePerNight);
      formData.append('floorNumber', floorNumber);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiClient.post('/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchRooms();
      closeModal();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setFormError('');
    setFormLoading(true);
    try {
      await apiClient.put(`/rooms/${selectedRoom.id}`, {
        roomNumber,
        roomType,
        floorNumber: parseInt(floorNumber),
        status
      });
      await fetchRooms();
      closeModal();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setFormError('');
    setFormLoading(true);
    try {
      await apiClient.patch(`/rooms/${selectedRoom.id}/price`, {
        pricePerNight: parseFloat(pricePerNight)
      });
      await fetchRooms();
      closeModal();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  return (
    <div className="admin-rooms-page">
      <div className="admin-rooms-header">
        <div>
          <h1>Room Management</h1>
          <p>Overview and manage all rooms in the system.</p>
        </div>
        <button className="create-room-btn" onClick={openCreateModal}>
          <Plus size={18} /> Add New Room
        </button>
      </div>

      {/* Stats */}
      <div className="rooms-stats">
        {[
          { label: 'Total Rooms', value: stats.total, color: '#1e3a8a', icon: <BedDouble size={20} /> },
          { label: 'Available', value: stats.available, color: '#10b981', icon: <TrendingUp size={20} /> },
          { label: 'Occupied', value: stats.occupied, color: '#ef4444', icon: <BedDouble size={20} /> },
          { label: 'Maintenance', value: stats.maintenance, color: '#f59e0b', icon: <Filter size={20} /> },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ borderTopColor: s.color }}>
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
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
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          {Object.entries(ROOM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {loading ? (
        <div className="rooms-loading"><div className="loading-spinner" /><p>Loading rooms...</p></div>
      ) : (
        <div className="admin-rooms-table-wrap">
          <table className="admin-rooms-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Image</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Price/Night</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">No rooms found.</td></tr>
              ) : filtered.map(room => {
                const s = STATUS_LABELS[room.status] || { label: room.status, color: '#64748b', bg: '#f1f5f9' };
                const img = room.imageUrl || FALLBACK_IMAGES[room.roomType] || FALLBACK_IMAGES.SINGLE;
                return (
                  <tr key={room.id} className="room-row">
                    <td><strong>Room {room.roomNumber}</strong></td>
                    <td><img src={img} alt="" className="table-room-img" /></td>
                    <td>{ROOM_TYPE_LABELS[room.roomType] || room.roomType}</td>
                    <td>Floor {room.floorNumber}</td>
                    <td><strong>${room.pricePerNight?.toLocaleString()}</strong></td>
                    <td>
                      <span className="status-pill" style={{ color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn edit" onClick={() => openEditModal(room)} title="Edit Room Info">
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn price" onClick={() => openEditPriceModal(room)} title="Update Price">
                          <DollarSign size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS */}
      {modalType !== 'NONE' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            
            {modalType === 'CREATE' && (
              <>
                <h2>Add New Room</h2>
                {formError && <div className="modal-error">{formError}</div>}
                <form onSubmit={handleCreateRoom} className="modal-form">
                  <div className="form-group">
                    <label>Room Number</label>
                    <input type="text" required value={roomNumber} onChange={e => setRoomNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select value={roomType} onChange={e => setRoomType(e.target.value)}>
                      {Object.keys(ROOM_TYPE_LABELS).map(k => <option key={k} value={k}>{ROOM_TYPE_LABELS[k]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price Per Night</label>
                    <input type="number" min="0" step="0.01" required value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Floor Number</label>
                    <input type="number" min="1" required value={floorNumber} onChange={e => setFloorNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Room Image</label>
                    <input type="file" accept="image/*" onChange={e => {
                      if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                    }} />
                  </div>
                  <button type="submit" className="submit-btn" disabled={formLoading}>
                    {formLoading ? 'Creating...' : 'Create Room'}
                  </button>
                </form>
              </>
            )}

            {modalType === 'EDIT' && (
              <>
                <h2>Edit Room Info</h2>
                {formError && <div className="modal-error">{formError}</div>}
                <form onSubmit={handleEditRoom} className="modal-form">
                  <div className="form-group">
                    <label>Room Number</label>
                    <input type="text" required value={roomNumber} onChange={e => setRoomNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select value={roomType} onChange={e => setRoomType(e.target.value)}>
                      {Object.keys(ROOM_TYPE_LABELS).map(k => <option key={k} value={k}>{ROOM_TYPE_LABELS[k]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Floor Number</label>
                    <input type="number" min="1" required value={floorNumber} onChange={e => setFloorNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                      {Object.keys(STATUS_LABELS).map(k => <option key={k} value={k}>{STATUS_LABELS[k].label}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="submit-btn" disabled={formLoading}>
                    {formLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </>
            )}

            {modalType === 'EDIT_PRICE' && (
              <>
                <h2>Update Room Price</h2>
                <p className="modal-subtitle">Room {selectedRoom?.roomNumber}</p>
                {formError && <div className="modal-error">{formError}</div>}
                <form onSubmit={handleEditPrice} className="modal-form">
                  <div className="form-group">
                    <label>Price Per Night ($)</label>
                    <input type="number" min="0" step="0.01" required value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} />
                  </div>
                  <button type="submit" className="submit-btn" disabled={formLoading}>
                    {formLoading ? 'Updating...' : 'Update Price'}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomsPage;
