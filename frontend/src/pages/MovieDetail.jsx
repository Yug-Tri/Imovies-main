import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import './MovieDetail.css';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('all');

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(`/movies/${id}`);
        setMovie(data.movie);
        setShowtimes(data.showtimes || []);

        if (user) {
          try {
            const wishData = await apiFetch('/wishlist');
            const found = (wishData.wishlist || []).some(
              (w) => (w._id || w) === id
            );
            setIsWishlisted(found);
          } catch (e) {
            // non-fatal if wishlist fails
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        await apiFetch(`/wishlist/${id}`, { method: 'DELETE' });
        setIsWishlisted(false);
      } else {
        await apiFetch(`/wishlist/${id}`, { method: 'POST' });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving movie details and screenings...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="error-banner">{error || 'Movie not found.'}</div>
        <Link to="/movies" className="btn-secondary">
          ← Back to All Movies
        </Link>
      </div>
    );
  }

  // Format dates for filter pills
  const dates = Array.from(
    new Set(
      showtimes.map((st) => new Date(st.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }))
    )
  );

  const filteredShowtimes = selectedDate === 'all'
    ? showtimes
    : showtimes.filter((st) => {
        const d = new Date(st.startTime).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        return d === selectedDate;
      });

  return (
    <div className="movie-detail-page">
      {/* Backdrop Banner */}
      <div
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(16, 16, 16, 0.4) 0%, rgba(16, 16, 16, 0.95) 85%, #101010 100%), url(${movie.backdropUrl || movie.posterUrl || FALLBACK_POSTER})`,
        }}
      >
        <div className="container detail-hero-container">
          <div className="detail-poster-col">
            <img
              src={movie.posterUrl || FALLBACK_POSTER}
              alt={movie.title}
              className="detail-poster"
              onError={(e) => { e.target.src = FALLBACK_POSTER; }}
            />
          </div>

          <div className="detail-info-col">
            <div className="detail-tag-row">
              {movie.isFeatured && <span className="hero-pill-featured">FEATURED PREMIERE</span>}
              {movie.rating ? (
                <span className="badge-rating">★ {movie.rating.toFixed(1)} / 10</span>
              ) : null}
              <span className="badge-format">
                {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '120m'}
              </span>
            </div>

            <h1 className="detail-title">{movie.title}</h1>

            <div className="detail-meta-list">
              {movie.releaseDate && (
                <div className="meta-item">
                  <span className="meta-label">Release:</span> {movie.releaseDate}
                </div>
              )}
              {movie.director && (
                <div className="meta-item">
                  <span className="meta-label">Directed by:</span> {movie.director}
                </div>
              )}
              {movie.genre && movie.genre.length > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Genres:</span> {movie.genre.join(', ')}
                </div>
              )}
            </div>

            <p className="detail-synopsis">{movie.description}</p>

            {movie.cast && movie.cast.length > 0 && (
              <div className="detail-cast-block">
                <span className="meta-label">Starring:</span>
                <div className="cast-pills">
                  {movie.cast.map((actor, idx) => (
                    <span key={idx} className="cast-pill">{actor}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-cta-row">
              <a href="#showtimes-section" className="btn-primary">
                <span>🎟</span> Choose Showtime & Seats
              </a>

              <button
                className={`btn-secondary wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
                onClick={toggleWishlist}
                disabled={wishlistLoading}
              >
                <span>{isWishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Selection Section */}
      <div className="container" id="showtimes-section">
        <div className="showtimes-container">
          <div className="showtimes-header">
            <div>
              <span className="section-subtitle">SCREENING SCHEDULE</span>
              <h2 className="section-title">Select Cinema & Showtime</h2>
            </div>
          </div>

          {/* Date Filter Bar */}
          {dates.length > 0 && (
            <div className="date-filter-bar">
              <button
                className={`date-pill ${selectedDate === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDate('all')}
              >
                All Dates
              </button>
              {dates.map((d) => (
                <button
                  key={d}
                  className={`date-pill ${selectedDate === d ? 'active' : ''}`}
                  onClick={() => setSelectedDate(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {filteredShowtimes.length === 0 ? (
            <div className="no-showtimes-box">
              <p>No showtimes scheduled for this date. Please check another date or cinema.</p>
            </div>
          ) : (
            <div className="showtimes-list">
              {filteredShowtimes.map((st) => {
                const dateObj = new Date(st.startTime);
                const timeStr = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateStr = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                const availableSeats = (st.seats || []).filter((s) => !s.isBooked).length;
                const totalSeats = (st.seats || []).length || 48;

                return (
                  <div key={st._id} className="showtime-card">
                    <div className="st-info">
                      <div className="st-theater-name">{st.theater}</div>
                      <div className="st-meta-row">
                        <span className="badge-format">{st.format || 'IMAX 4K'}</span>
                        <span className="st-date">{dateStr}</span>
                        <span className="st-seats-avail">
                          {availableSeats} of {totalSeats} seats open
                        </span>
                      </div>
                    </div>

                    <div className="st-booking-action">
                      <div className="st-price-tag">
                        ${(st.price || 15).toFixed(2)}
                      </div>
                      <button
                        className="btn-primary st-select-btn"
                        onClick={() => navigate(`/showtimes/${st._id}/seats`)}
                      >
                        {timeStr} • Select Seats
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
