import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Movie Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genre: '',
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    duration: 120,
    director: '',
    releaseDate: '',
    isFeatured: false,
  });

  // New Showtime Form State
  const [newShowtime, setNewShowtime] = useState({
    movieId: '',
    theater: '',
    format: 'IMAX 4K Laser',
    price: 18.00,
    startTime: '',
    rows: 6,
    cols: 8,
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, moviesData, cinemasData] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch('/movies?limit=100'),
        apiFetch('/admin/cinemas'),
      ]);
      setStats(statsData);
      setMovies(moviesData.movies || []);
      setCinemas(cinemasData.cinemas || []);
      if (moviesData.movies && moviesData.movies.length > 0 && !newShowtime.movieId) {
        setNewShowtime((prev) => ({
          ...prev,
          movieId: moviesData.movies[0]._id,
          theater: cinemasData.cinemas?.[0]?.name ? `${cinemasData.cinemas[0].name} - Hall 1` : 'Grand Cine - Screen 1',
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load studio management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'admin') {
      setError('Access restricted. Admin authorization required.');
      setLoading(false);
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMsg(null);
      await apiFetch('/movies', {
        method: 'POST',
        body: JSON.stringify(newMovie),
      });
      setSuccessMsg(`Film "${newMovie.title}" successfully added to the catalogue!`);
      setNewMovie({
        title: '',
        description: '',
        genre: '',
        rating: 8.5,
        posterUrl: '',
        backdropUrl: '',
        duration: 120,
        director: '',
        releaseDate: '',
        isFeatured: false,
      });
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (movieId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" and all its showtimes?`)) return;
    try {
      setError(null);
      setSuccessMsg(null);
      await apiFetch(`/movies/${movieId}`, { method: 'DELETE' });
      setSuccessMsg(`Movie "${title}" removed.`);
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete movie.');
    }
  };

  const handleCreateShowtime = async (e) => {
    e.preventDefault();
    if (!newShowtime.startTime) {
      setError('Please select a screening date and start time.');
      return;
    }
    try {
      setError(null);
      setSuccessMsg(null);
      await apiFetch('/showtimes', {
        method: 'POST',
        body: JSON.stringify(newShowtime),
      });
      setSuccessMsg('Auditorium showtime successfully scheduled and seats generated!');
      loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to schedule showtime.');
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Opening Cinema Studio Control Room...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="error-banner">Access Restricted: You must be signed in as an administrator to access the Studio.</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Tip: You can log in using <strong>admin@imovies.com</strong> / <strong>AdminPass123!</strong>
        </p>
        <Link to="/login" className="btn-primary">Sign in as Admin</Link>
      </div>
    );
  }

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <span className="section-subtitle">EXECUTIVE MANAGEMENT</span>
          <h1 className="admin-title">Cinema Studio Console</h1>
        </div>
        <span className="admin-badge">Admin Mode Active</span>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}
      {error && <div className="error-banner">{error}</div>}

      {/* Stats Cards Grid */}
      {stats && (
        <div className="stats-metric-grid">
          <div className="metric-card">
            <span className="metric-label">TOTAL FILMS</span>
            <span className="metric-value">{stats.totalMovies}</span>
            <span className="metric-sub">Across All Genres</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">RESERVATIONS</span>
            <span className="metric-value">{stats.totalBookings}</span>
            <span className="metric-sub">Tickets Issued</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">ACTIVE SHOWTIMES</span>
            <span className="metric-value">{stats.totalShowtimes}</span>
            <span className="metric-sub">Screens Scheduled</span>
          </div>

          <div className="metric-card accent">
            <span className="metric-label">DEMO REVENUE</span>
            <span className="metric-value">${stats.totalRevenue.toFixed(2)}</span>
            <span className="metric-sub">Gross Box Office</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Recent Bookings & Activity
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          Manage Catalogue ({movies.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
          onClick={() => setActiveTab('showtimes')}
        >
          Schedule Screenings
        </button>
      </div>

      {/* Tab 1: Overview & Recent Bookings */}
      {activeTab === 'overview' && (
        <div className="tab-pane">
          <h3 className="pane-title">Recent Patron Bookings</h3>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Movie</th>
                    <th>User</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="code-cell">{b.bookingReference}</td>
                      <td><strong>{b.movie?.title || 'Unknown'}</strong></td>
                      <td>{b.user?.email || 'Guest'}</td>
                      <td>{b.seats?.join(', ') || '-'}</td>
                      <td>
                        <span className={`status-pill ${b.status === 'confirmed' ? 'confirmed' : 'cancelled'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No recent bookings recorded.</p>
          )}
        </div>
      )}

      {/* Tab 2: Manage Movies */}
      {activeTab === 'movies' && (
        <div className="tab-pane">
          <div className="split-view">
            {/* Create Movie Form */}
            <div className="form-card">
              <h3 className="form-title">+ Add New Film</h3>
              <form onSubmit={handleCreateMovie} className="admin-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    placeholder="e.g. Inception"
                  />
                </div>

                <div className="form-group">
                  <label>Description / Synopsis</label>
                  <textarea
                    rows="3"
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                    placeholder="Brief synopsis..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Genres (comma separated)</label>
                    <input
                      type="text"
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                      placeholder="Sci-Fi, Action, Thriller"
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating (0-10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Director</label>
                    <input
                      type="text"
                      value={newMovie.director}
                      onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                      placeholder="e.g. Christopher Nolan"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Poster Image URL</label>
                  <input
                    type="url"
                    value={newMovie.posterUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Backdrop Banner URL</label>
                  <input
                    type="url"
                    value={newMovie.backdropUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, backdropUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={newMovie.isFeatured}
                      onChange={(e) => setNewMovie({ ...newMovie, isFeatured: e.target.checked })}
                    />
                    Feature as Hero Banner Premiere
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Save Film to Catalogue
                </button>
              </form>
            </div>

            {/* Existing Movies List */}
            <div className="list-card">
              <h3 className="form-title">Current Catalogue ({movies.length})</h3>
              <div className="admin-movie-list">
                {movies.map((m) => (
                  <div key={m._id} className="admin-movie-row">
                    <img
                      src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100'}
                      alt={m.title}
                      className="admin-thumb"
                    />
                    <div className="admin-movie-meta">
                      <h4>{m.title} {m.isFeatured && <span className="hero-pill-featured">Featured</span>}</h4>
                      <p>{m.genre?.join(', ')} • {m.duration}m • ★ {m.rating}</p>
                    </div>
                    <button
                      className="btn-outline-danger"
                      onClick={() => handleDeleteMovie(m._id, m.title)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Schedule Showtimes */}
      {activeTab === 'showtimes' && (
        <div className="tab-pane">
          <div className="form-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h3 className="form-title">+ Schedule Showtime & Generate Seat Layout</h3>
            <form onSubmit={handleCreateShowtime} className="admin-form">
              <div className="form-group">
                <label>Select Film *</label>
                <select
                  required
                  value={newShowtime.movieId}
                  onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration}m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Theater / Screen Name *</label>
                <input
                  type="text"
                  required
                  value={newShowtime.theater}
                  onChange={(e) => setNewShowtime({ ...newShowtime, theater: e.target.value })}
                  placeholder="e.g. iMovies Grand Luxe - Screen 1"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Format</label>
                  <select
                    value={newShowtime.format}
                    onChange={(e) => setNewShowtime({ ...newShowtime, format: e.target.value })}
                  >
                    <option value="IMAX 4K Laser">IMAX 4K Laser</option>
                    <option value="Dolby Cinema">Dolby Cinema</option>
                    <option value="Standard 4K">Standard 4K</option>
                    <option value="VIP Luxe Recliner">VIP Luxe Recliner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ticket Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={newShowtime.price}
                    onChange={(e) => setNewShowtime({ ...newShowtime, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Screening Date & Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={newShowtime.startTime}
                  onChange={(e) => setNewShowtime({ ...newShowtime, startTime: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Seat Rows (A, B, C...)</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={newShowtime.rows}
                    onChange={(e) => setNewShowtime({ ...newShowtime, rows: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Seats per Row (Cols)</label>
                  <input
                    type="number"
                    min="4"
                    max="12"
                    value={newShowtime.cols}
                    onChange={(e) => setNewShowtime({ ...newShowtime, cols: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Generate Screen & Schedule Showtime
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
