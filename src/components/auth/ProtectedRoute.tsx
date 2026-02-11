import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { type ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
    const { isLoggedIn, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen" style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#ff8c00',
                fontFamily: 'Iceland, sans-serif',
                fontSize: '1.5rem',
                letterSpacing: '0.2rem'
            }}>
                VERIFYING MISSION CLEARANCE...
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to={adminOnly ? "/admin-login" : "/login"} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
