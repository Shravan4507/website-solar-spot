import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isLoggedIn, logout } = useAuth();
    const [showTooltip, setShowTooltip] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowTooltip(!showTooltip);
        // Hide tooltip after some time
        if (!showTooltip) {
            setTimeout(() => setShowTooltip(false), 3000);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                <a href="https://zcoer.in/" target="_blank" rel="noopener noreferrer">
                    <img
                        src="/ZCOER-Logo-White.png"
                        alt="ZCOER Logo"
                        className="college-logo"
                    />
                </a>
            </div>

            <div className="nav-center">
                <div className="nav-links">
                    <Link to="/home" className="nav-item">HOME</Link>
                    {isLoggedIn && (
                        <>
                            <Link to="/dashboard" className="nav-item highlight">DASHBOARD</Link>
                            <button onClick={handleLogout} className="nav-item logout-btn">LOGOUT</button>
                        </>
                    )}
                </div>
            </div>

            <div className="nav-right">
                <div className="tooltip-container">
                    <a href="/" onClick={handleRightClick}>
                        <img
                            src="/Logo_without_background.png"
                            alt="Solar Spot Logo"
                            className="nav-logo filter-solar"
                        />
                    </a>
                    {showTooltip && (
                        <div className="nav-tooltip">
                            ORBIT-X • WEBSITE COMING SOON
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
