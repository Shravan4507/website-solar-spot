import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
    const { isLoggedIn } = useAuth();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-section brand">
                        <Link to="/" className="footer-logo">
                            <img
                                src="/Logo_without_background.png"
                                alt="Solar Spot Logo"
                                className="footer-logo-img filter-solar"
                            />
                        </Link>
                        <p className="footer-tagline">
                            Experience the rare cosmic alignment at Zeal Institute.
                            Chasing the shadow, together.
                        </p>
                    </div>

                    {/* Mission Links */}
                    <div className="footer-section">
                        <h4 className="footer-title">MISSION</h4>
                        <ul className="footer-links">
                            <li><Link to="/home">HOME</Link></li>
                            <li><Link to="/register">JOIN MISSION</Link></li>
                            {isLoggedIn && <li><Link to="/dashboard">DASHBOARD</Link></li>}
                            <li><Link to="/admin-login">ADMIN LOGIN</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="footer-section">
                        <h4 className="footer-title">RESOURCES</h4>
                        <ul className="footer-links">
                            <li><Link to="/safety">SAFETY GUIDE</Link></li>
                            <li><Link to="/venue">VENUE MAP</Link></li>
                        </ul>
                    </div>

                    {/* Contact/Support */}
                    <div className="footer-section">
                        <h4 className="footer-title">SUPPORT</h4>
                        <ul className="footer-links">
                            <li><Link to="/contact">CONTACT</Link></li>
                            <li><Link to="/privacy">PRIVACY POLICY</Link></li>
                            <li><Link to="/terms">TERMS OF SERVICE</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-divider"></div>
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © {currentYear} SOLAR SPOT EVENT. ALL RIGHTS RESERVED.
                        </p>
                        <p className="built-by">
                            BUILT BY <span className="highlight">
                                <a href="https://www.instagram.com/shravan45x/" target="_blank" rel="noopener noreferrer">
                                    Shrvan
                                </a>
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
