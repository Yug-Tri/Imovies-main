import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">iMovies</Link>
      </div>
      <ul className="nav-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/movies">Movies</NavLink></li>
        {user && <li><NavLink to="/wishlist">Wishlist</NavLink></li>}
        {user && <li><NavLink to="/dashboard">My Dashboard</NavLink></li>}
        {user && user.role === 'admin' && (
          <li><NavLink to="/admin" style={{ color: '#E53935', fontWeight: 'bold' }}>Admin Studio</NavLink></li>
        )}
        {!user ? (
          <>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register">Register</NavLink></li>
          </>
        ) : (
          <>
            <li className="user-greeting" style={{ color: '#A09E97', fontSize: '0.88rem' }}>
              Hi, <span style={{ color: '#F2EFE8' }}>{user.name || user.email.split('@')[0]}</span>
            </li>
            <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
