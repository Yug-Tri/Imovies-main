import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import './SeatSelection.css';

function SeatSelection() {
  const { id } = useParams(); // showtimeId
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch(`/showtimes/${id}`);
      setShowtime(data.showtime);
    } catch (err) {
      setError(err.message || 'Failed to load auditorium seat plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [id]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    const isSelected = selectedSeats.includes(seat.seatNumber);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per reservation.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat to proceed.');
      return;
    }

    if (!user) {
      // Store pending booking info and redirect to login
      localStorage.setItem('pending_booking', JSON.stringify({ showtimeId: id, seats: selectedSeats }));
      navigate(`/login?redirect=/showtimes/${id}/seats`);
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);
      const response = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          showtimeId: id,
          seats: selectedSeats,
        }),
      });

      // Clear pending
      localStorage.removeItem('pending_booking');
      navigate(`/booking/confirmation/${response.booking._id}`, {
        state: { booking: response.booking },
      });
    } catch (err) {
      if (err.status === 409) {
        setError(err.message || 'One or more of your chosen seats was just reserved. Seat map updated.');
        // Refresh showtime layout to display updated bookings
        await fetchShowtime();
        setSelectedSeats([]);
      } else {
        setError(err.message || 'Reservation failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Calibrating auditorium seating grid...</p>
      </div>
    );
  }

  if (error && !showtime) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="error-banner">{error}</div>
        <Link to="/movies" className="btn-secondary">← Back to Movies</Link>
      </div>
    );
  }

  const movie = showtime.movie || {};
  const dateObj = new Date(showtime.startTime);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const pricePerSeat = showtime.price || 15.00;
  const totalPrice = selectedSeats.length * pricePerSeat;

  // Group seats by row
  const seatGridByRow = {};
  (showtime.seats || []).forEach((s) => {
    const row = s.row || s.seatNumber.charAt(0);
    if (!seatGridByRow[row]) seatGridByRow[row] = [];
    seatGridByRow[row].push(s);
  });
  // Sort columns in each row
  Object.keys(seatGridByRow).forEach((r) => {
    seatGridByRow[r].sort((a, b) => (a.col || 0) - (b.col || 0));
  });

  return (
    <div className="seat-selection-page container">
      {/* Top Breadcrumb & Showtime Info Header */}
      <div className="seat-header-panel">
        <div className="seat-header-main">
          <Link to={`/movies/${movie._id}`} className="back-link">
            ← {movie.title || 'Movie'}
          </Link>
          <h1 className="seat-screen-title">{movie.title}</h1>
          <div className="seat-meta-details">
            <span className="badge-format">{showtime.format || 'IMAX 4K'}</span>
            <span>🏛 {showtime.theater}</span>
            <span>📅 {formattedDate} at {formattedTime}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="seat-layout-workspace">
        {/* Cinema Screen and Grid */}
        <div className="auditorium-container">
          <div className="curved-screen-wrapper">
            <div className="curved-screen-bar"></div>
            <span className="curved-screen-text">AUDITORIUM SCREEN THIS WAY</span>
          </div>

          <div className="seat-matrix">
            {Object.keys(seatGridByRow).map((rowLetter) => (
              <div key={rowLetter} className="seat-row">
                <span className="row-letter-label">{rowLetter}</span>
                <div className="seat-row-seats">
                  {seatGridByRow[rowLetter].map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isBooked = seat.isBooked;

                    return (
                      <button
                        key={seat.seatNumber}
                        type="button"
                        className={`seat-unit ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : 'available'}`}
                        onClick={() => toggleSeat(seat)}
                        disabled={isBooked}
                        title={`Seat ${seat.seatNumber} • $${seat.price || pricePerSeat} ${isBooked ? '(Reserved)' : ''}`}
                      >
                        {seat.col}
                      </button>
                    );
                  })}
                </div>
                <span className="row-letter-label">{rowLetter}</span>
              </div>
            ))}
          </div>

          {/* Seat Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <span className="legend-swatch available"></span>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch selected"></span>
              <span>Your Selection</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch booked"></span>
              <span>Reserved</span>
            </div>
          </div>
        </div>

        {/* Reservation Summary Card */}
        <div className="booking-summary-sidebar">
          <div className="summary-card">
            <h3 className="summary-title">Reservation Summary</h3>

            <div className="summary-movie-info">
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="summary-poster-thumb"
                />
              )}
              <div>
                <h4 className="summary-film-title">{movie.title}</h4>
                <p className="summary-auditorium">{showtime.theater}</p>
                <p className="summary-timestamp">{formattedDate} • {formattedTime}</p>
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line">
              <span>Format:</span>
              <strong>{showtime.format || 'IMAX 4K Laser'}</strong>
            </div>

            <div className="summary-line">
              <span>Selected Seats:</span>
              <strong style={{ color: selectedSeats.length > 0 ? '#F2EFE8' : '#706E67' }}>
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
              </strong>
            </div>

            <div className="summary-line">
              <span>Ticket Price:</span>
              <span>${pricePerSeat.toFixed(2)} each</span>
            </div>

            <div className="summary-line">
              <span>Booking Fee:</span>
              <span style={{ color: '#81C784' }}>$0.00 (Demo Mode)</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-row">
              <span>Total Price:</span>
              <span className="total-amount">${totalPrice.toFixed(2)}</span>
            </div>

            <div className="demo-disclaimer-box">
              <span>ℹ Demo Reservation: No real payment required. Bookings persist in MongoDB with concurrency conflict safeguards.</span>
            </div>

            <button
              className="btn-primary confirm-booking-btn"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || bookingLoading}
            >
              {bookingLoading
                ? 'Securing Seats...'
                : !user
                ? 'Sign In & Confirm'
                : `Confirm ${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'} ($${totalPrice.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;
