import React, {useContext} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';

const icons = {
    polls: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
    ),
    create: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
    ),
    login: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
    ),
    register: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round">
            <circle cx="12" cy="7" r="4"/>
            <path d="M5.5 21a8.38 8.38 0 0113 0"/>
        </svg>
    ),
    logout: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    ),
    news: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
             strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-3 2 3h4a2 2 0 012 2v12a2 2 0 01-2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
    ),
};

const Navbar = () => {
    const {user, logout} = useContext(AuthContext);
    const navigate = useNavigate();

    const activeStyle = {
        color: '#6366F1',
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>MyPolls</div>
            <div style={styles.links}>
                <NavLink
                    to="/"
                    end
                    style={({isActive}) => (isActive ? {...styles.link, ...activeStyle} : styles.link)}
                    title="Список опросов"
                    aria-label="Список опросов"
                >
                    {icons.polls}
                </NavLink>

                {user && (
                    <NavLink
                        to="/news"
                        style={({isActive}) => (isActive ? {...styles.link, ...activeStyle} : styles.link)}
                        title="Новости"
                        aria-label="Новости"
                    >
                        {icons.news}
                    </NavLink>
                )}

                {user && (
                    <NavLink
                        to="/create"
                        style={({isActive}) => (isActive ? {...styles.link, ...activeStyle} : styles.link)}
                        title="Создать опрос"
                        aria-label="Создать опрос"
                    >
                        {icons.create}
                    </NavLink>
                )}

                {!user && (
                    <>
                        <NavLink
                            to="/login"
                            style={({isActive}) => (isActive ? {...styles.link, ...activeStyle} : styles.link)}
                            title="Вход"
                            aria-label="Вход"
                        >
                            {icons.login}
                        </NavLink>

                        <NavLink
                            to="/register"
                            style={({isActive}) => (isActive ? {...styles.link, ...activeStyle} : styles.link)}
                            title="Регистрация"
                            aria-label="Регистрация"
                        >
                            {icons.register}
                        </NavLink>
                    </>
                )}

                {user && (
                    <button
                        onClick={handleLogout}
                        style={{...styles.link, ...styles.logoutBtn}}
                        title="Выйти"
                        aria-label="Выйти"
                        type="button"
                    >
                        {icons.logout}
                    </button>
                )}
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
        backgroundColor: '#232329',
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
        gap: '32px',
    },
    link: {
        color: '#CBD5E1',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '1.5rem',
        paddingBottom: '4px',
        transition: 'color 0.3s ease, transform 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    logoutBtn: {
        color: '#F87171',
    },
};

// Плавный эффект при наведении и активном состоянии
const styleSheet = `
  nav a:hover, nav button:hover {
    color: #8b5cf6;
    transform: scale(1.1);
  }
  nav a[aria-current="page"] {
    border-bottom: 3px solid #6366F1;
  }
`;

if (typeof window !== 'undefined') {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = styleSheet;
    document.head.appendChild(styleTag);
}

export default Navbar;
