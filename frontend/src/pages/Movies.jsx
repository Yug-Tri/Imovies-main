import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import MovieCard from '../components/MovieCard';
import './Movies.css';

const GENRES = [
  'All',
  'Sci-Fi',
  'Action',
  'Drama',
  'Adventure',
  'Animation',
  'Biography',
  'History',
  'Mystery',
  'Thriller',
];

function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialFeatured = searchParams.get('featured') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('rating');

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre);
      if (initialFeatured) params.append('featured', 'true');
      if (sortBy) params.append('sort', sortBy);
      params.append('limit', '30');

      const data = await apiFetch(`/movies?${params.toString()}`);
      setMovies(data.movies || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', genre);
    }
    setSearchParams(searchParams);
  };

  const resetFilters = () => {
    setSelectedGenre('All');
    setSearchQuery('');
    setSortBy('rating');
    searchParams.delete('genre');
    searchParams.delete('search');
    searchParams.delete('featured');
    setSearchParams(searchParams);
  };

  return (
    <div className="movies-page container">
      {/* Page Header */}
      <div className="catalogue-header">
        <span className="section-subtitle">THE REPERTOIRE</span>
        <h1 className="catalogue-title">Cinematic Catalogue</h1>
        <p className="catalogue-subtitle">
          Curated masterworks, new festival premieres, and timeless cinematic visions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="catalogue-controls">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, director, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre(selectedGenre);
              }}
            >
              ✕
            </button>
          )}
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>

        <div className="sort-wrapper">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Top Rated</option>
            <option value="latest">Latest Releases</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="genre-pills">
        {GENRES.map((g) => (
          <button
            key={g}
            className={`genre-pill ${selectedGenre === g ? 'active' : ''}`}
            onClick={() => handleGenreChange(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Movie Results */}
      {error && <div className="error-banner">{error}</div>}

      <div className="results-status-bar">
        <span>
          Showing <strong>{movies.length}</strong> {movies.length === 1 ? 'title' : 'titles'}
          {selectedGenre !== 'All' ? ` in ${selectedGenre}` : ''}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </span>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Filtering screenings...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-results">
          <div className="empty-icon">🎞</div>
          <h3>No films match your criteria</h3>
          <p>Try searching with another keyword or explore all genres.</p>
          <button className="btn-secondary" onClick={resetFilters}>
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="movie-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Movies;
