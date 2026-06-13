import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Clock, CheckCircle, Receipt } from 'lucide-react';
import apiClient from '../../../lib/axios';
import { extractErrorMessage } from '../../../utils/apiError';
import { useAuthStore } from '../../../store/authStore';
import './MyBookingsPage.css';

interface BookingWithInvoice {
  booking: {
    id: string;
    roomId: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
  };
  invoice: {
    id: string;
    totalDays: number;
    pricePerNight: number;
    totalAmount: number;
    status: string;
  };
}

interface PaymentTransaction {
  paymentId: string;
  bookingId: string;
  amount: number;
  status: string;
  createdAt: string;
}

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithInvoice[]>([]);
  const [payments, setPayments] = useState<Record<string, PaymentTransaction>>({});
  const [loading, setLoading] = useState(true);
  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const { walletBalance, setWalletBalance } = useAuthStore();
  const navigate = useNavigate();

  const fetchBookingsAndPayments = async () => {
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        apiClient.get('/bookings/me?page=0&size=100'),
        apiClient.get('/payments/me')
      ]);
      
      setBookings(bookingsRes.data.data.content || []);
      
      // Create lookup map for payments by bookingId
      const paymentMap: Record<string, PaymentTransaction> = {};
      const paymentsData = paymentsRes.data.data || [];
      paymentsData.forEach((p: PaymentTransaction) => {
        paymentMap[p.bookingId] = p;
      });
      setPayments(paymentMap);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setError('Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndPayments();
  }, []);

  const handlePay = async (bookingId: string, amount: number) => {
    if (walletBalance !== null && walletBalance < amount) {
      setError(`Insufficient balance. You need $${amount.toLocaleString()} but only have $${walletBalance.toLocaleString()}. Please deposit first.`);
      return;
    }
    
    setError('');
    setPayLoadingId(bookingId);
    try {
      await apiClient.post(`/bookings/${bookingId}/payment`);
      // Update wallet balance locally
      if (walletBalance !== null) {
        setWalletBalance(walletBalance - amount);
      }
      // Refresh list
      await fetchBookingsAndPayments();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPayLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="my-bookings-loading">
        <div className="loading-spinner" />
        <p>Loading your trips...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Manage your reservations and payments.</p>
      </div>

      {error && <div className="global-error">{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} color="#cbd5e1" />
          <h2>No Bookings Yet</h2>
          <p>You haven't booked any rooms. Start exploring to find your perfect stay.</p>
          <button className="browse-btn" onClick={() => navigate('/user/rooms')}>
            Browse Rooms
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((item) => {
            const { booking, invoice } = item;
            const isPaid = booking.status === 'PAID';
            const payment = payments[booking.id];

            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <div>
                    <h3>Room {booking.roomNumber}</h3>
                    <span className="booking-id">ID: {booking.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className={`status-badge ${isPaid ? 'paid' : 'pending'}`}>
                    {isPaid ? <CheckCircle size={16} /> : <Clock size={16} />}
                    <span>{isPaid ? 'Confirmed & Paid' : 'Pending Payment'}</span>
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="booking-details-grid">
                    <div className="detail-item">
                      <span className="label">Check-in</span>
                      <span className="value">{booking.checkIn}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Check-out</span>
                      <span className="value">{booking.checkOut}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration</span>
                      <span className="value">{invoice.totalDays} Night(s)</span>
                    </div>
                    <div className="detail-item total-item">
                      <span className="label">Total Amount</span>
                      <span className="value highlight">${invoice.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-card-footer">
                  {isPaid ? (
                    <div className="payment-info">
                      <Receipt size={18} />
                      <div>
                        <strong>Payment Successful</strong>
                        {payment && (
                          <p className="tx-id">Transaction: {payment.paymentId.slice(0, 8)} • {new Date(payment.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="payment-actions">
                      <p className="payment-warning">Please complete your payment to secure the reservation.</p>
                      <button 
                        className="pay-now-btn"
                        onClick={() => handlePay(booking.id, invoice.totalAmount)}
                        disabled={payLoadingId === booking.id}
                      >
                        <CreditCard size={18} />
                        {payLoadingId === booking.id ? 'Processing...' : 'Pay Now from Wallet'}
                      </button>
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

export default MyBookingsPage;
