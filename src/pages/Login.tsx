import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, checkRegistration } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const names = user.displayName?.split(' ') || [];
            const userData = {
                uid: user.uid,
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: user.email || '',
                profilePic: user.photoURL || '',
                isAdmin: false
            };

            login(userData);

            // Check if user is already registered
            const registered = await checkRegistration(user.uid);
            if (registered) {
                navigate('/dashboard');
            } else {
                navigate('/register');
            }
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
                    <button className="back-to-base" onClick={() => navigate('/home')}>
                        RETURN TO COMMAND
                    </button>
                    <a href="/terms">Privacy Policy & Terms & Conditions</a>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
