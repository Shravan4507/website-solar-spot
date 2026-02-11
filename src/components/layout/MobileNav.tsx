import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import './MobileNav.css';

const MobileNav = () => {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();

    // Hide mobile nav on specific system routes
    const hiddenRoutes = ['/', '/admin-login', '/admin-dashboard', '/verify'];
    if (hiddenRoutes.includes(location.pathname)) return null;

    return (
        <motion.nav
            className="mobile-nav-bar"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        >
            <div className="mobile-nav-content">
                {/* Home */}
                <Link to="/home" className={`m-nav-btn ${location.pathname === '/home' ? 'active' : ''}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9.5L12 3L21 9.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span className="m-nav-label">HOME</span>
                </Link>

                {/* Dashboard (If logged in) or Join (If logged out) */}
                {isLoggedIn ? (
                    <Link to="/dashboard" className={`m-nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ borderRadius: '4px' }}>
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <line x1="10" y1="3" x2="10" y2="21" />
                            <line x1="3" y1="10" x2="10" y2="10" />
                        </svg>
                        <span className="m-nav-label">DASHBOARD</span>
                    </Link>
                ) : (
                    <Link to="/register" className={`m-nav-btn ${location.pathname === '/register' ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                        <span className="m-nav-label">JOIN</span>
                    </Link>
                )}

                {/* Logout (Only if logged in) */}
                {isLoggedIn && (
                    <button onClick={() => logout()} className="m-nav-btn logout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span className="m-nav-label">LOGOUT</span>
                    </button>
                )}
            </div>
        </motion.nav>
    );
};

export default MobileNav;
