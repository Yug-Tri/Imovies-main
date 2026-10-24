import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import './BookingConfirmation.css';

function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking && id) {
      async function loadBooking() {
        try {
          setLoading(true);
          const data = await apiFetch(`/bookings/${id}`);
          setBooking(data.booking);
        } catch (err) {
          setError(err.message || 'Unable to retrieve ticket reservation.');
        } finally {
          setLoading(false);
        }
      }
      loadBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your confirmed ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="error-banner">{error || 'Booking reservation not found.'}</div>
        <Link to="/dashboard" className="btn-secondary">View My Dashboard</Link>
      </div>
    );
  }

  const movie = booking.movie || {};
  const showtime = booking.showtime || {};
  const dateObj = new Date(showtime.startTime || booking.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="confirmation-page container">
      <div className="confirmation-hero">
        <div className="success-icon-badge">✓</div>
        <h1 className="confirmation-heading">Reservation Confirmed</h1>
        <p className="confirmation-subtext">
          Your cinematic admission has been permanently secured and stored in MongoDB.
        </p>
      </div>

      {/* Cinematic Ticket Pass */}
      <div className="ticket-pass-container">
        <div className="ticket-card">
          <div className="ticket-main-col">
            <div className="ticket-header">
              <span className="ticket-brand">iMovies Premiere Ticket</span>
              <span className="badge-format">{showtime.format || 'IMAX 4K Laser'}</span>
            </div>

            <div className="ticket-film-row">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="ticket-poster"
                />
              )}
              <div className="ticket-film-details">
                <h2 className="ticket-movie-title">{movie.title}</h2>
                <p className="ticket-theater">{showtime.theater || 'Main Auditorium'}</p>
                <div className="ticket-time-badge">
                  <span>📅 {formattedDate}</span>
                  <span>⏰ {formattedTime}</span>
                </div>
              </div>
            </div>

            <div className="ticket-specs-grid">
              <div className="spec-box">
                <span className="spec-label">SEATS</span>
                <span className="spec-value highlight-seats">
                  {booking.seats ? booking.seats.join(', ') : 'N/A'}
                </span>
              </div>
              <div className="spec-box">
                <span className="spec-label">ADMISSION STATUS</span>
                <span className="spec-value" style={{ color: '#81C784' }}>
                  {booking.status ? booking.status.toUpperCase() : 'CONFIRMED'}
                </span>
              </div>
              <div className="spec-box">
                <span className="spec-label">TOTAL (DEMO)</span>
                <span className="spec-value">
                  ${(booking.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="ticket-stub-col">
            <div className="stub-notch top"></div>
            <div className="stub-notch bottom"></div>

            <span className="stub-label">BOOKING REFERENCE</span>
            <div className="stub-code">{booking.bookingReference}</div>

            <div className="stub-barcode">
              <div className="barcode-lines"></div>
              <span className="barcode-num">{booking.bookingReference}</span>
            </div>

            <p className="stub-note">Show this pass or reference upon entry</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="confirmation-actions">
        <button className="btn-primary" onClick={() => window.print()}>
          <span>🖨</span> Print / Save Pass
        </button>
        <Link to="/dashboard" className="btn-secondary">
          <span>📋</span> View in Dashboard
        </Link>
        <Link to="/movies" className="btn-secondary">
          Browse More Films
        </Link>
      </div>
    </div>
  );
}

export default BookingConfirmation;
