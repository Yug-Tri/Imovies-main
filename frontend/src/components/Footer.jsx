import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="cinematic-footer">
      <div className="footer-content">
        <div className="footer-col brand-col">
          <h2 className="footer-brand"><span>▶</span> iMovies</h2>
          <p className="footer-desc">
            The ultimate cinematic movie discovery and reservation sanctuary. Experience premiere screenings, IMAX 4K Laser, and Dolby Atmos audio.
          </p>
          <div className="footer-badge">Premium Cinema Experience</div>
        </div>

        <div className="footer-col">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/movies">All Movies</Link></li>
            <li><Link to="/movies?featured=true">Featured Screenings</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><Link to="/dashboard">Ticket History</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Formats</h3>
          <ul>
            <li><span className="format-tag">IMAX 4K Laser</span></li>
            <li><span className="format-tag">Dolby Atmos Sound</span></li>
            <li><span className="format-tag">Prime 3D Vision</span></li>
            <li><span className="format-tag">VIP Luxe Recliner</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Demo Notice</h3>
          <p className="demo-notice">
            This platform operates in demonstration mode. Seat reservations are fully interactive and persist in MongoDB. No real financial payments are charged.
          </p>
          <div className="server-status">
            <span className="status-dot"></span> Backend Engine Online
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} iMovies Inc. Built with precision for cinema lovers.</p>
      </div>
    </footer>
  );
}

export default Footer;
