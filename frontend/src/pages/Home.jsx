import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import MovieCard from '../components/MovieCard';
import './Home.css';

function Home() {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await apiFetch('/movies?limit=8');
        setMovies(data.movies || []);
        if (data.movies && data.movies.length > 0) {
          const featured = data.movies.find((m) => m.isFeatured) || data.movies[0];
          setFeaturedMovie(featured);
        }
      } catch (err) {
        setError(err.message || 'Failed to load premiere movies');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading Premiere Showtimes...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      {featuredMovie && (
        <section
          className="hero-section"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(16, 16, 16, 0.96) 20%, rgba(16, 16, 16, 0.6) 60%, rgba(16, 16, 16, 0.85) 100%), url(${featuredMovie.backdropUrl || featuredMovie.posterUrl})`,
          }}
        >
          <div className="hero-container container">
            <div className="hero-content">
              <div className="hero-badges">
                <span className="hero-pill-featured">★ PREMIERE SELECTION</span>
                <span className="hero-pill-format">IMAX 4K LASER</span>
                {featuredMovie.rating && (
                  <span className="badge-rating">★ {featuredMovie.rating.toFixed(1)}</span>
                )}
              </div>

              <h1 className="hero-title">{featuredMovie.title}</h1>

              <div className="hero-meta">
                <span>{featuredMovie.releaseDate || 'In Theaters'}</span>
                <span>•</span>
                <span>{featuredMovie.duration ? `${Math.floor(featuredMovie.duration / 60)}h ${featuredMovie.duration % 60}m` : '120m'}</span>
                <span>•</span>
                <span className="hero-genres">{featuredMovie.genre ? featuredMovie.genre.join(', ') : 'Cinema'}</span>
              </div>

              <p className="hero-synopsis">
                {featuredMovie.description || 'Step into the dark. Witness masterclass cinema with crystal-clear laser projection and immersive 64-channel spatial sound.'}
              </p>

              <div className="hero-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate(`/movies/${featuredMovie._id}`)}
                >
                  <span>🎟</span> Book Tickets Now
                </button>

                {featuredMovie.trailerUrl && (
                  <button
                    className="btn-secondary"
                    onClick={() => setActiveTrailer(featuredMovie.trailerUrl)}
                  >
                    <span>▶</span> Watch Trailer
                  </button>
                )}

                <Link to="/movies" className="btn-secondary">
                  Browse All Movies
                </Link>
              </div>
            </div>

            <div className="hero-poster-preview">
              <img
                src={featuredMovie.posterUrl}
                alt={featuredMovie.title}
                className="hero-poster-img"
              />
            </div>
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      {activeTrailer && (
        <div className="modal-backdrop" onClick={() => setActiveTrailer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveTrailer(null)}>✕</button>
            <div className="video-responsive">
              <iframe
                src={activeTrailer.replace('watch?v=', 'embed/')}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="container main-content-wrapper">
        {error && <div className="error-banner">{error}</div>}

        {/* Now Showing Section */}
        <section className="section-block">
          <div className="section-header">
            <div>
              <span className="section-subtitle">THE LINEUP</span>
              <h2 className="section-title">Now Showing in Theaters</h2>
            </div>
            <Link to="/movies" className="section-link">
              View All Catalogue →
            </Link>
          </div>

          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Experience Showcase */}
        <section className="experience-section">
          <div className="experience-header">
            <span className="section-subtitle">STATE OF THE ART</span>
            <h2 className="section-title">The iMovies Sanctuary</h2>
            <p className="experience-desc">
              Every auditorium is acoustically calibrated and engineered for unrivaled visual immersion.
            </p>
          </div>

          <div className="experience-cards">
            <div className="exp-card">
              <div className="exp-icon">📽</div>
              <h3>Dual 4K Laser Projection</h3>
              <p>Experience ultra-vivid contrast, deeper blacks, and radiant colors on 70-foot curved silver screens.</p>
            </div>

            <div className="exp-card highlight">
              <div className="exp-icon">🔊</div>
              <h3>Dolby Atmos Soundscape</h3>
              <p>Overhead acoustic arrays place sounds in 3D space with terrifying precision and resonant low-end bass.</p>
            </div>

            <div className="exp-card">
              <div className="exp-icon">🛋</div>
              <h3>Zero-Gravity Recliners</h3>
              <p>Heated leather motor recliners with reserved armrests, personal tables, and artisanal beverage service.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
