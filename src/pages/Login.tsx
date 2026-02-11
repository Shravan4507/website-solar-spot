import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithRedirect } from 'firebase/auth';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin, isRegistered, loading } = useAuth();

    useEffect(() => {
        if (!loading && isLoggedIn) {
            if (isAdmin) {
                navigate('/admin-dashboard');
            } else if (isRegistered) {
                navigate('/dashboard');
            } else {
                navigate('/register');
            }
        }
    }, [isLoggedIn, isAdmin, isRegistered, loading, navigate]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithRedirect(auth, googleProvider);
            // After redirect, AuthProvider will handle the state change
        } catch (error) {
            console.error("Error signing in with Google:", error);
        }
    };

    return (
        <div className="login-page">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <div className="card-glow"></div>

                <div className="login-header">
                    <img
                        src="/Logo_without_background.png"
                        alt="Solar Spot Logo"
                        className="login-logo filter-solar"
                    />
                    <h1>Mission Control</h1>
                    <p>Authenticate to access your solar dashboard</p>
                </div>

                <button className="google-login-button" onClick={handleGoogleLogin}>
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="google-icon"
                    />
                    <span>Continue with Google</span>
                </button>

                <div className="login-footer">
                    <a href="/terms">Privacy Policy & Terms & Conditions</a>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
