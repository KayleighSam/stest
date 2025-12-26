import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // User is authenticated but not an admin
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Access Denied</h2>
        <p>You do not have administrator privileges.</p>
        <button onClick={() => window.location.href = '/'}>Go to Homepage</button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;