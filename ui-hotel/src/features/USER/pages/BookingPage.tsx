import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, BedDouble, MapPin, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../../lib/axios';
import { extractErrorMessage } from '../../../utils/apiError';
import './BookingPage.css';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  floorNumber: number;
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

interface BookingResult {
  booking: {
    id: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
  };
  invoice: {
    totalDays: number;
    pricePerNight: number;
    totalAmount: number;
    status: string;
  };
}

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room as Room | undefined;

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BookingResult | null>(null);

  if (!room) {
    return (
      <div className="booking-no-room">
        <AlertCircle size={48} color="#ef4444" />
        <p>No room selected. Please go back and choose a room.</p>
        <button onClick={() => navigate('/user/rooms')} className="back-btn">
          <ArrowLeft size={16} /> Go to Rooms
        </button>
      </div>
    );
  }

  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ));
  const estimatedTotal = (room.pricePerNight * nights).toLocaleString();
  const img = room.imageUrl || FALLBACK_IMAGES[room.roomType] || FALLBACK_IMAGES.SINGLE;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/bookings', {
        roomId: room.id,
        checkIn,
        checkOut,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!result) return;
    setError('');
    setPayLoading(true);
    try {
      await apiClient.post(`/bookings/${result.booking.id}/payment`);
      navigate('/user/wallet');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <button className="back-link" onClick={() => navigate('/user/rooms')}>
        <ArrowLeft size={16} /> Back to Rooms
      </button>

      <h1 className="booking-title">Book Your Stay</h1>

      <div className="booking-layout">
        {/* Left: Room Info */}
        <div className="room-summary-card">
          <img src={img} alt={`Room ${room.roomNumber}`} className="room-summary-img" />
          <div className="room-summary-body">
            <div className="room-summary-badge">{ROOM_TYPE_LABELS[room.roomType] || room.roomType}</div>
            <h2>Room {room.roomNumber}</h2>
            <p className="room-summary-meta"><MapPin size={14} /> Floor {room.floorNumber}</p>
            <div className="room-summary-price">
              <span className="price-big">${room.pricePerNight?.toLocaleString()}</span>
              <span className="price-sub"> / night</span>
            </div>
          </div>
        </div>

        {/* Right: Form / Result */}
        <div className="booking-form-card">
          {result ? (
            /* Booking Success UI */
            <div className="booking-success">
              <CheckCircle size={56} color="#10b981" />
              <h2>Booking Confirmed!</h2>
              <p>Your reservation has been created. Review the details below.</p>

              <div className="invoice-details">
                <div className="invoice-row">
                  <span>Booking ID</span>
                  <span className="mono">{result.booking.id.slice(0, 8)}...</span>
                </div>
                <div className="invoice-row">
                  <span>Room</span>
                  <span>{result.booking.roomNumber}</span>
                </div>
                <div className="invoice-row">
                  <span>Check-in</span>
                  <span>{result.booking.checkIn}</span>
                </div>
                <div className="invoice-row">
                  <span>Check-out</span>
                  <span>{result.booking.checkOut}</span>
                </div>
                <div className="invoice-row">
                  <span>Total Nights</span>
                  <span>{result.invoice.totalDays} night(s)</span>
                </div>
                <div className="invoice-row">
                  <span>Price/Night</span>
                  <span>${result.invoice.pricePerNight?.toLocaleString()}</span>
                </div>
                <div className="invoice-row total">
                  <span>Total Amount</span>
                  <span>${result.invoice.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {error && <div className="booking-error">{error}</div>}

              <div className="booking-actions">
                <button className="pay-btn" onClick={handlePay} disabled={payLoading}>
                  {payLoading ? 'Processing payment...' : '💳 Pay Now from Wallet'}
                </button>
                <button className="later-btn" onClick={() => navigate('/user/dashboard')}>
                  Pay Later
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <>
              <h3 className="form-section-title"><CalendarDays size={20} /> Choose Your Dates</h3>
              {error && <div className="booking-error">{error}</div>}
              <form onSubmit={handleBook} className="booking-form">
                <div className="date-fields">
                  <div className="form-group">
                    <label>Check-in Date</label>
                    <input
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={e => setCheckIn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Check-out Date</label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || tomorrow}
                      onChange={e => setCheckOut(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="booking-estimate">
                  <div className="estimate-row">
                    <span>Duration</span>
                    <strong>{nights} night(s)</strong>
                  </div>
                  <div className="estimate-row">
                    <span>Price per night</span>
                    <strong>${room.pricePerNight?.toLocaleString()}</strong>
                  </div>
                  <div className="estimate-row total">
                    <span>Estimated Total</span>
                    <strong>${estimatedTotal}</strong>
                  </div>
                </div>

                <button type="submit" className="book-now-btn" disabled={loading}>
                  <BedDouble size={18} />
                  {loading ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
