import React, { useState, useEffect } from 'react';
import { CreditCard, History, Plus, ArrowUpRight, X, Calendar, MapPin, BedDouble } from 'lucide-react';
import apiClient from '../../../lib/axios';
import { useAuthStore } from '../../../store/authStore';
import { extractErrorMessage } from '../../../utils/apiError';
import './WalletPage.css';

interface Payment {
  paymentId: string;
  bookingId: string;
  amount: number;
  status: string;
  payerBalanceAfter: number;
  receiverBalanceAfter: number;
  createdAt: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
}

const WalletPage: React.FC = () => {
  const { walletBalance, setWalletBalance, user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    if (user?.role !== 'USER') return;

    try {
      const res = await apiClient.get('/payments/me');
      setPayments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/wallets/deposit', { amount: Number(depositAmount) });
      const newBalance = res.data.data.balance;
      setWalletBalance(newBalance);
      setSuccess(`Successfully deposited $${Number(depositAmount).toLocaleString()}`);
      setDepositAmount('');
      fetchPayments(); // Refresh history
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>My Wallet</h1>
        <p>Manage your funds and view payment history.</p>
      </div>

      <div className="wallet-content">
        <div className="wallet-left">
          <div className="balance-card">
            <div className="balance-title">
              <CreditCard size={20} />
              <span>Current Balance</span>
            </div>
            <div className="balance-amount">
              ${walletBalance != null ? walletBalance.toLocaleString() : '0'}
            </div>
          </div>

          <div className="deposit-card">
            <h3><Plus size={18} /> Deposit Funds</h3>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}
            <form onSubmit={handleDeposit} className="deposit-form">
              <div className="input-group">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="deposit-btn">
                {loading ? 'Processing...' : 'Deposit Now'}
              </button>
            </form>
          </div>
        </div>

        <div className="wallet-right">
          <div className="history-card">
            <h3><History size={18} /> Payment History</h3>
            {user?.role !== 'USER' ? (
              <p className="no-data">Payment history is only available for users.</p>
            ) : payments.length === 0 ? (
              <p className="no-data">No transactions found.</p>
            ) : (
              <ul className="transaction-list">
                {payments.map(payment => (
                  <li key={payment.paymentId} className="transaction-item clickable" onClick={() => setSelectedPayment(payment)}>
                    <div className="tx-icon">
                      <ArrowUpRight size={20} color="#dc2626" />
                    </div>
                    <div className="tx-details">
                      <span className="tx-title">Room {payment.roomNumber} - Booking Payment</span>
                      <span className="tx-date">{new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="tx-amount negative">
                      -${payment.amount.toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selectedPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <button className="payment-modal-close" onClick={() => setSelectedPayment(null)}>
              <X size={20} />
            </button>
            
            <div className="receipt-header">
              <div className="receipt-icon">
                <CreditCard size={32} color="#10b981" />
              </div>
              <h2>Payment Receipt</h2>
              <p className="receipt-amount">${selectedPayment.amount.toLocaleString()}</p>
              <span className="receipt-status">SUCCESSFUL</span>
            </div>

            <div className="receipt-body">
              <div className="receipt-row">
                <span className="receipt-label">Transaction ID</span>
                <span className="receipt-value mono">{selectedPayment.paymentId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Date & Time</span>
                <span className="receipt-value">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="receipt-divider"></div>

              <h4>Booking Details</h4>
              <div className="booking-info-grid">
                <div className="booking-info-item">
                  <MapPin size={16} />
                  <div>
                    <span className="label">Room Number</span>
                    <span className="value">A0{selectedPayment.roomNumber}</span>
                  </div>
                </div>
                <div className="booking-info-item">
                  <BedDouble size={16} />
                  <div>
                    <span className="label">Room Type</span>
                    <span className="value">{selectedPayment.roomType}</span>
                  </div>
                </div>
                <div className="booking-info-item">
                  <Calendar size={16} />
                  <div>
                    <span className="label">Check-In</span>
                    <span className="value">{selectedPayment.checkIn}</span>
                  </div>
                </div>
                <div className="booking-info-item">
                  <Calendar size={16} />
                  <div>
                    <span className="label">Check-Out</span>
                    <span className="value">{selectedPayment.checkOut}</span>
                  </div>
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-row">
                <span className="receipt-label">Wallet Balance After</span>
                <span className="receipt-value highlight">${selectedPayment.payerBalanceAfter.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
