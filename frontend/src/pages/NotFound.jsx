import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div
      className="container"
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1rem',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '1rem', color: '#C62828' }}>
        🎬
      </div>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '0.75rem', fontFamily: 'Playfair Display, serif' }}>
        404 — Screen Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '500px', marginBottom: '2rem', fontSize: '1.1rem' }}>
        The reel you're looking for seems to have slipped off the projector or been archived.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" className="btn-primary">
          Return to Premiere Home
        </Link>
        <Link to="/movies" className="btn-secondary">
          Browse Movie Catalogue
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
