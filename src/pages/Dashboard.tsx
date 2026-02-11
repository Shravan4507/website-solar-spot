import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateSecurePassToken } from '../utils/security';
import MissionPass from '../components/ui/MissionPass';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, registrationData: globalRegData, isAdmin } = useAuth();
    const [solarActivity, setSolarActivity] = useState("High (M-Class)");
    const [eventScore, setEventScore] = useState(850);
    const [cloudCover, setCloudCover] = useState(12);
    const [regData, setRegData] = useState<any>(globalRegData);
    const [qrToken, setQrToken] = useState<string>('');
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            navigate('/admin-dashboard', { replace: true });
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        const fetchRegistration = async () => {
            if (authUser?.uid) {
                try {
                    const docRef = doc(db, "registrations", authUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setRegData(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching registration:", error);
                }
            }
        };

        fetchRegistration();

        const interval = setInterval(() => {
            const activities = ["Stable (C-Pulse)", "High (M-Class)", "Active (X-Flare)", "Ionized (B-Wave)"];
            setSolarActivity(activities[Math.floor(Math.random() * activities.length)]);
            setEventScore(prev => prev + (Math.random() > 0.5 ? 1 : -1));
            setCloudCover(prev => {
                const change = (Math.random() - 0.5) * 2;
                return Math.max(5, Math.min(25, Number((prev + change).toFixed(1))));
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [authUser?.uid]);

    useEffect(() => {
        const prepareQr = async () => {
            if (regData && regData.status === 'confirmed') {
                const token = await generateSecurePassToken({
                    uid: regData.ticketId,
                    name: `${regData.firstName} ${regData.lastName}`,
                    email: regData.email,
                    phone: regData.phone
                });
                setQrToken(token);
            }
        };
        prepareQr();
    }, [regData]);

    // Merge actual Firestore data with identity data
    const user = {
        firstName: regData?.firstName || authUser?.firstName || "Observer",
        lastName: regData?.lastName || authUser?.lastName || "",
        email: regData?.email || authUser?.email || "",
        profilePic: authUser?.profilePic,
        registrationType: regData?.year ? `${regData.year} Student` : (regData ? "Elite Observer" : "New Recruit"),
        ticketId: regData?.ticketId || "NO TICKET",
        status: regData?.status ? regData.status.toUpperCase() : "NOT REGISTERED"
    };

    const stats = [
        { label: "Solar Activity", value: solarActivity, color: "#ff8c00" },
        { label: "Event Score", value: `${eventScore} Pts`, color: "#2ed573" },
        { label: "Cloud Cover", value: `${cloudCover}%`, color: "#74ebd5" }
    ];

    const timeline = [
        { time: "09:00 AM", event: "Event Gates Open" },
        { time: "11:30 AM", event: "Partial Phase Begins" },
        { time: "12:45 PM", event: "Solar Peak Alignment" },
        { time: "02:15 PM", event: "Elite Member Workshop" }
    ];

    return (
        <div className="dashboard-page">
            <motion.div
                className="dashboard-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Profile Header */}
                <section className="dashboard-header">
                    <div className="profile-info">
                        <div className="profile-avatar">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                                <>{user.firstName[0]}{user.lastName[0]}</>
                            )}
                        </div>
                        <div className="profile-text">
                            <h1>Welcome back, {user.firstName}!</h1>
                            <p>{user.email} • {user.registrationType}</p>
                        </div>
                    </div>
                    <div className="status-badge" style={{
                        background: user.status === 'CONFIRMED' ? 'rgba(46, 213, 115, 0.1)' :
                            user.status === 'REJECTED' ? 'rgba(235, 77, 75, 0.1)' :
                                user.status === 'NOT REGISTERED' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 140, 0, 0.1)',
                        color: user.status === 'CONFIRMED' ? '#2ed573' :
                            user.status === 'REJECTED' ? '#eb4d4b' :
                                user.status === 'NOT REGISTERED' ? 'rgba(255, 255, 255, 0.4)' : '#ff8c00',
                        border: `1px solid ${user.status === 'CONFIRMED' ? '#2ed573' :
                            user.status === 'REJECTED' ? '#eb4d4b' :
                                user.status === 'NOT REGISTERED' ? 'rgba(255, 255, 255, 0.1)' : '#ff8c00'}`
                    }}>
                        {user.status === 'NOT REGISTERED' ? 'NEW RECRUIT' : user.status}
                    </div>
                </section>

                <div className="dashboard-grid">
                    {/* Left Column: Stats and Timeline */}
                    <div className="dashboard-left">
                        <section className="dashboard-card mb-32">
                            <h2 className="card-title">Real-time Metrics</h2>
                            <div className="stats-row">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="stat-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                    >
                                        <span className="stat-label">{stat.label}</span>
                                        <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        <section className="dashboard-card">
                            <h2 className="card-title">Your Timeline</h2>
                            <div className="timeline">
                                {timeline.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="timeline-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.6 }}
                                    >
                                        <div className="timeline-time">{item.time}</div>
                                        <div className="timeline-event">{item.event}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Ticket and Quick Info */}
                    <div className="dashboard-right">
                        <section className="dashboard-card">
                            <h2 className="card-title">Digital Entry Key</h2>
                            <div className="ticket-section">
                                <div className={`qr-placeholder ${user.status !== 'CONFIRMED' ? 'locked' : ''}`}>
                                    {user.status === 'CONFIRMED' && qrToken ? (
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrToken)}`}
                                            alt="Ticket QR"
                                        />
                                    ) : (
                                        <div className="qr-lock-overlay">
                                            <span className="lock-icon">{user.status === 'REJECTED' ? '✕' : 'ᯤ'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="ticket-id">{user.ticketId}</div>

                                <div className="status-notice">
                                    {user.status === 'CONFIRMED' && (
                                        <p className="qr-hint active">Show this at the gate for instant access</p>
                                    )}
                                    {user.status === 'PENDING' && (
                                        <p className="qr-hint pending">Payment verification in progress...</p>
                                    )}
                                    {user.status === 'REJECTED' && (
                                        <p className="qr-hint rejected">Registration Rejected. Check status for details.</p>
                                    )}
                                    {user.status === 'NOT REGISTERED' && (
                                        <p className="qr-hint" style={{ color: 'rgba(255,255,255,0.4)' }}>Join the mission to receive your entry key</p>
                                    )}
                                </div>

                                {user.status === 'NOT REGISTERED' ? (
                                    <button
                                        className="submit-button primary"
                                        style={{ width: '100%', marginTop: '20px' }}
                                        onClick={() => navigate('/register')}
                                    >
                                        <span>COMPLETE REGISTRATION</span>
                                        <div className="button-glow"></div>
                                    </button>
                                ) : user.status === 'REJECTED' ? (
                                    <button
                                        className="submit-button primary"
                                        style={{ width: '100%', marginTop: '20px' }}
                                        onClick={() => navigate('/register')}
                                    >
                                        <span>RE-REGISTER MISSION</span>
                                        <div className="button-glow"></div>
                                    </button>
                                ) : (
                                    <button
                                        className={`submit-button primary ${user.status !== 'CONFIRMED' ? 'disabled' : ''}`}
                                        style={{ width: '100%', marginTop: '20px' }}
                                        disabled={user.status !== 'CONFIRMED'}
                                        onClick={() => setShowPass(true)}
                                    >
                                        <span>DOWNLOAD PASS</span>
                                        {user.status === 'CONFIRMED' && <div className="button-glow"></div>}
                                    </button>
                                )}
                            </div>
                        </section>

                        <section className="dashboard-card" style={{ marginTop: '32px' }}>
                            <h2 className="card-title">Help & Support</h2>
                            <div className="help-content">
                                <p className="help-desc">Having issues with your payment or mission status?</p>
                                <button className="secondary-button" style={{ width: '100%', marginTop: '15px' }} onClick={() => navigate('/contact')}>
                                    CONTACT MISSION CONTROL
                                </button>
                                <ul className="help-links">
                                    <li onClick={() => navigate('/safety')}>Solar Safety Guide</li>
                                    <li onClick={() => navigate('/venue')}>Venue Map</li>
                                    <li onClick={() => navigate('/terms')}>Terms of Service</li>
                                    <li onClick={() => navigate('/privacy')}>Privacy Policy</li>
                                    {isAdmin && (
                                        <li
                                            onClick={() => navigate('/admin-dashboard')}
                                            style={{ color: '#ff8c00', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            ADMIN DASHBOARD
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>

            {showPass && regData && (
                <MissionPass
                    userData={{
                        firstName: regData.firstName,
                        lastName: regData.lastName,
                        email: regData.email,
                        phone: regData.phone,
                        ticketId: regData.ticketId
                    }}
                    directDownload={true}
                    onClose={() => setShowPass(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
