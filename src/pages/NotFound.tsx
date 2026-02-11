import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/effects/PageTransition';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="not-found-page">
                <div className="not-found-content">
                    <motion.div
                        className="error-code"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        404
                    </motion.div>
                    <motion.div
                        className="error-orbital"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="orbital-dot"></div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        SIGNAL LOST IN SPACE
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        The coordinates you're looking for don't exist in this sector of the mission.
                    </motion.p>

                    <motion.button
                        className="return-home-btn"
                        onClick={() => navigate('/home')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        RETURN TO ORBIT
                    </motion.button>
                </div>
            </div>
        </PageTransition>
    );
};

export default NotFound;
