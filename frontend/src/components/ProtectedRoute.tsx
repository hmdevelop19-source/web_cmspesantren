import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

const ProtectedRoute = () => {
  const { isAuthenticated, setPermissions } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPermissions = async () => {
        try {
          const response = await api.get('/permissions');
          setPermissions(response.data.matrix);
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        }
      };
      fetchPermissions();
    }
  }, [isAuthenticated, setPermissions]);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
