import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';
import './MovieCard.css';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';

function MovieCard({ movie, initialWishlisted = false, onWishlistChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [imgSrc, setImgSrc] = useState(movie.posterUrl || FALLBACK_POSTER);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (wishlisted) {
        await apiFetch(`/wishlist/${movie._id}`, { method: 'DELETE' });
        setWishlisted(false);
        if (onWishlistChange) onWishlistChange(movie._id, false);
      } else {
        await apiFetch(`/wishlist/${movie._id}`, { method: 'POST' });
        setWishlisted(true);
        if (onWishlistChange) onWishlistChange(movie._id, true);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
  };

  return (
    <div className="movie-card">
      <Link to={`/movies/${movie._id}`} className="movie-card-link">
        <div className="poster-wrapper">
          <img
            src={imgSrc}
            alt={movie.title}
            className="movie-poster"
            onError={() => setImgSrc(FALLBACK_POSTER)}
            loading="lazy"
          />
          <div className="poster-overlay">
            <span className="view-details-btn">View Screenings</span>
          </div>

          <div className="poster-top-bar">
            {movie.rating ? (
              <span className="badge-rating">
                ★ {movie.rating.toFixed(1)}
              </span>
            ) : <span />}

            <button
              className={`wishlist-icon-btn ${wishlisted ? 'active' : ''}`}
              onClick={toggleWishlist}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              type="button"
            >
              ♥
            </button>
          </div>

          {movie.isFeatured && (
            <div className="featured-ribbon">Premiere</div>
          )}
        </div>

        <div className="movie-info">
          <div className="movie-meta-row">
            <span className="movie-duration">
              {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '120m'}
            </span>
            {movie.genre && movie.genre.length > 0 && (
              <span className="movie-genre-badge">{movie.genre[0]}</span>
            )}
          </div>

          <h3 className="movie-title">{movie.title}</h3>

          <p className="movie-synopsis-snippet">
            {movie.description
              ? (movie.description.length > 80 ? movie.description.substring(0, 80) + '...' : movie.description)
              : 'Experience on the big screen.'}
          </p>

          <div className="card-action">
            <span className="book-pill">Book Tickets</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default MovieCard;
