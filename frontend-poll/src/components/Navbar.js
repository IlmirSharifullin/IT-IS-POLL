import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const activeStyle = {
    fontWeight: '700',
    color: '#6366F1', // красивый фиолетовый оттенок
    borderBottom: '3px solid #6366F1',
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>MyPolls</div>
      <div style={styles.links}>
        <NavLink
          to="/"
          end
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...activeStyle } : styles.link
          }
        >
          Список опросов
        </NavLink>

        <NavLink
          to="/create"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...activeStyle } : styles.link
          }
        >
          Создать опрос
        </NavLink>

        <NavLink
          to="/login"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...activeStyle } : styles.link
          }
        >
          Вход
        </NavLink>

        <NavLink
          to="/register"
          style={({ isActive }) =>
            isActive ? { ...styles.link, ...activeStyle } : styles.link
          }
        >
          Регистрация
        </NavLink>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    backgroundColor: '#1F2937', // темно-серый фон
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontFamily: "'Inter', sans-serif",
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    color: '#E0E7FF',
    fontWeight: '800',
    fontSize: '1.5rem',
    userSelect: 'none',
  },
  links: {
    display: 'flex',
    gap: '24px',
  },
  link: {
    color: '#CBD5E1',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    paddingBottom: '4px',
    transition: 'color 0.3s, border-bottom 0.3s',
  },
};

export default Navbar;
