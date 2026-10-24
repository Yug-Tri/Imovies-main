import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import './Wishlist.css';

function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/wishlist');
      return;
    }
    async function loadWishlist() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch('/wishlist');
        setWishlist(data.wishlist || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve your wishlist');
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, [user, navigate]);

  const handleWishlistChange = (movieId, isAdded) => {
    if (!isAdded) {
      setWishlist((prev) => prev.filter((m) => m._id !== movieId));
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your saved cinema collection...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <div className="wishlist-header">
        <span className="section-subtitle">PERSONAL VAULT</span>
        <h1 className="wishlist-title">My Wishlist</h1>
        <p className="wishlist-desc">
          Your bookmarked premiere screenings and must-watch motion pictures.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist-box">
          <div className="empty-heart-icon">♡</div>
          <h2>Your Wishlist is Empty</h2>
          <p>You haven't saved any movies yet. Explore our cinematic collection and tap the heart icon to save titles.</p>
          <Link to="/movies" className="btn-primary">
            Explore All Films
          </Link>
        </div>
      ) : (
        <div className="movie-grid">
          {wishlist.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              initialWishlisted={true}
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
