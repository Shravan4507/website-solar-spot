import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`toast-container ${type}`}
                    initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    <div className="toast-content">
                        <span className="toast-icon">{getIcon()}</span>
                        <span className="toast-message">{message}</span>
                    </div>
                    <div className="toast-progress">
                        <motion.div
                            className="progress-bar"
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
