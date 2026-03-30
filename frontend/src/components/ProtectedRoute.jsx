import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ user, requireAdmin = false, children }) => {
  if (!user) return <Navigate to="/login" />;
  
  if (requireAdmin && user.user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};
