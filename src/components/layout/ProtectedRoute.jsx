import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ role }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (role && userRole !== role) {
        // If user's role doesn't match the required role
        return <Navigate to="/unauthorized" replace />; // Or redirect to their respective dashboard
    }

    return <Outlet />;
};

export default ProtectedRoute;
