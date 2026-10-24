import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    async function loadBookings() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch('/bookings/my-bookings');
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve your booking history.');
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [user, navigate]);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this reservation? The seats will be immediately released back to other patrons.'
    );
    if (!confirmCancel) return;

    try {
      setCancelLoadingId(bookingId);
      setError(null);
      setActionSuccess(null);
      const res = await apiFetch(`/bookings/${bookingId}/cancel`, { method: 'POST' });
      setActionSuccess('Reservation successfully cancelled. Seats have been made available.');

      // Update state in place
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      setError(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancelLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your member dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page container">
      {/* Profile Header */}
      <div className="dashboard-header-card">
        <div className="profile-badge-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
        </div>
        <div className="profile-details">
          <div className="profile-role-badge">
            {user.role === 'admin' ? '★ Cine-Studio Admin' : 'iMovies Member'}
          </div>
          <h1 className="profile-name">{user.name || user.email.split('@')[0]}</h1>
          <p className="profile-email">{user.email}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{bookings.length}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </span>
            <span className="stat-label">Active Passes</span>
          </div>
        </div>
      </div>

      {actionSuccess && <div className="success-banner">{actionSuccess}</div>}
      {error && <div className="error-banner">{error}</div>}

      {/* Bookings Section */}
      <div className="dashboard-bookings-section">
        <div className="section-header">
          <div>
            <span className="section-subtitle">ADMISSION ARCHIVE</span>
            <h2 className="section-title">My Ticket Reservations</h2>
          </div>
          <Link to="/movies" className="btn-secondary">
            + Book Another Screening
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-dashboard-box">
            <div className="empty-ticket-icon">🎟</div>
            <h3>No Bookings Yet</h3>
            <p>You haven't reserved any showtimes. Browse our active screenings and reserve your seat today.</p>
            <Link to="/movies" className="btn-primary">
              Discover Movies
            </Link>
          </div>
        ) : (
          <div className="bookings-stream">
            {bookings.map((booking) => {
              const movie = booking.movie || {};
              const showtime = booking.showtime || {};
              const dateObj = new Date(showtime.startTime || booking.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              const isConfirmed = booking.status === 'confirmed';

              return (
                <div
                  key={booking._id}
                  className={`booking-item-card ${!isConfirmed ? 'cancelled' : ''}`}
                >
                  <div className="booking-poster-col">
                    <img
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300'}
                      alt={movie.title}
                      className="booking-poster-img"
                    />
                  </div>

                  <div className="booking-main-col">
                    <div className="booking-top-row">
                      <span className="booking-ref-badge">
                        REF: <strong>{booking.bookingReference}</strong>
                      </span>
                      <span
                        className={`status-pill ${isConfirmed ? 'confirmed' : 'cancelled'}`}
                      >
                        {isConfirmed ? '● Confirmed Admission' : 'Cancelled'}
                      </span>
                    </div>

                    <h3 className="booking-film-title">
                      <Link to={`/movies/${movie._id}`}>{movie.title}</Link>
                    </h3>

                    <p className="booking-theater-info">
                      {showtime.theater || 'Main Auditorium'} • <span className="badge-format">{showtime.format || 'IMAX 4K'}</span>
                    </p>

                    <div className="booking-meta-grid">
                      <div>
                        <span className="booking-field-label">DATE & TIME</span>
                        <span className="booking-field-value">{formattedDate} • {formattedTime}</span>
                      </div>
                      <div>
                        <span className="booking-field-label">SEATS ALLOCATED</span>
                        <span className="booking-field-value highlight">
                          {booking.seats ? booking.seats.join(', ') : 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="booking-field-label">TOTAL PAID</span>
                        <span className="booking-field-value">
                          ${(booking.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions-col">
                    <Link
                      to={`/booking/confirmation/${booking._id}`}
                      className="btn-secondary view-pass-btn"
                    >
                      View Ticket Pass
                    </Link>

                    {isConfirmed && (
                      <button
                        className="btn-outline-danger cancel-booking-btn"
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelLoadingId === booking._id}
                      >
                        {cancelLoadingId === booking._id ? 'Releasing...' : 'Cancel Reservation'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
