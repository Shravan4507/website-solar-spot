import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

interface TimeLeft {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}

const Home = () => {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin, isRegistered, registrationData } = useAuth();

    const calculateTimeLeft = (): TimeLeft => {
        const eventDate = new Date('2026-02-17T11:00:00').getTime();
        const now = new Date().getTime();
        const difference = eventDate - now;

        let timeLeft: TimeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const isEclipseDay = Object.keys(timeLeft).length === 0;

    const handleReserveClick = () => {
        if (!isLoggedIn) {
            navigate('/login');
        } else if (isAdmin) {
            navigate('/admin-dashboard');
        } else if (isRegistered) {
            if (registrationData?.status === 'rejected') {
                navigate('/register');
            } else {
                navigate('/dashboard');
            }
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="home-container">
            {/* Hero Section - Split Layout to avoid central Orb */}
            <section className="home-hero">

                {/* Left Side: Branding and Context */}
                <div className="hero-left">
                    <div className="event-badge">
                        <span className="badge-dot"></span>
                        LIVE EVENT • FEBRUARY 17, 2026
                    </div>

                    <h1 className="hero-title">
                        <span className="bold">SUNSPOTS</span>
                    </h1>

                    <p className="hero-subtitle">
                        Experience the total solar eclipse from the heart of our campus.
                        A rare cosmic alignment bringing science and wonder together.
                    </p>
                </div>

                {/* Right Side: Details and Call to Action */}
                <div className="hero-right">
                    <div className="hero-details-vertical">
                        <div className="detail-item">
                            <span className="label">LOCATION</span>
                            <span className="value">Zeal Institute's Main Grounds</span>
                        </div>
                        <div className="detail-divider-horizontal"></div>
                        <div className="detail-item">
                            <span className="label">TIME</span>
                            <span className="value">11:00 AM - 2:00 PM</span>
                        </div>
                    </div>

                    <div className="hero-actions-vertical">
                        <button className="primary-button" onClick={handleReserveClick}>
                            <span>
                                {!isLoggedIn && 'RESERVE YOUR SPOT'}
                                {isLoggedIn && isAdmin && 'ADMIN CONSOLE'}
                                {isLoggedIn && !isAdmin && !isRegistered && 'COMPLETE REGISTRATION'}
                                {isLoggedIn && !isAdmin && isRegistered && registrationData?.status === 'confirmed' && 'DOWNLOAD YOUR PASS'}
                                {isLoggedIn && !isAdmin && isRegistered && registrationData?.status === 'pending' && 'MISSION PENDING'}
                                {isLoggedIn && !isAdmin && isRegistered && registrationData?.status === 'rejected' && 'RE-REGISTER MISSION'}
                            </span>
                        </button>

                        <div className="countdown-container">
                            {isEclipseDay ? (
                                <div className="eclipse-day-msg">IT'S ECLIPSE DAY!</div>
                            ) : (
                                <div className="timer-grid">
                                    <div className="timer-block">
                                        <span className="time-val">{timeLeft.days || 0}</span>
                                        <span className="time-label">DAYS</span>
                                    </div>
                                    <div className="timer-block">
                                        <span className="time-val">{String(timeLeft.hours || 0).padStart(2, '0')}</span>
                                        <span className="time-label">HRS</span>
                                    </div>
                                    <div className="timer-block">
                                        <span className="time-val">{String(timeLeft.minutes || 0).padStart(2, '0')}</span>
                                        <span className="time-label">MIN</span>
                                    </div>
                                    <div className="timer-block">
                                        <span className="time-val">{String(timeLeft.seconds || 0).padStart(2, '0')}</span>
                                        <span className="time-label">SEC</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
};

export default Home;
