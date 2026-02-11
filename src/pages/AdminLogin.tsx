import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import PageTransition from '../components/effects/PageTransition';
import './AdminLogin.css';

import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && isLoggedIn && isAdmin) {
            navigate('/admin-dashboard');
        }
    }, [isLoggedIn, isAdmin, authLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoginLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // On success, the useEffect above will handle redirection
        } catch (err: any) {
            console.error("Admin login error:", err);
            setError('Invalid credentials or unauthorized access. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="admin-login-page">
                <div className="security-scanline"></div>

                <motion.div
                    className="admin-login-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="admin-card-inner">
                        <div className="admin-header">
                            <img
                                src="/Logo_without_background.png"
                                alt="Solar Spot Logo"
                                className="admin-logo filter-solar"
                            />
                            <h1>MISSION CONTROL</h1>
                            <span className="subtitle">ADMINISTRATOR ACCESS ONLY</span>
                        </div>

                        <form className="admin-form" onSubmit={handleLogin}>
                            <div className="input-field">
                                <label>ADMIN ID (EMAIL)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter admin email"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="input-field">
                                <label>ACCESS KEY (PASSWORD)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter security key"
                                    required
                                />
                            </div>

                            {error && (
                                <motion.div
                                    className="auth-error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    ⚠ {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                className={`admin-submit-btn ${loginLoading ? 'loading' : ''}`}
                                disabled={loginLoading}
                            >
                                {loginLoading ? 'AUTHENTICATING...' : 'INITIATE OVERRIDE'}
                                <div className="btn-glow"></div>
                            </button>
                        </form>

                        <div className="admin-footer">
                            <button className="back-link" onClick={() => navigate('/home')}>
                                ← BACK TO BASE
                            </button>
                            <span className="system-status">SECURE CHANNEL</span>
                        </div>
                    </div>
                </motion.div>

                {/* Cyberpunk background elements */}
                <div className="admin-particles"></div>
            </div>
        </PageTransition>
    );
};

export default AdminLogin;
