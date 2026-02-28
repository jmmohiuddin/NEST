import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';

const ProtectedRoute = ({ children, roles = [], allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  const effectiveRoles = allowedRoles || roles;

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // superadmin has access to ALL protected routes regardless of role restriction
  if (
    effectiveRoles.length > 0 &&
    !effectiveRoles.includes(user?.role) &&
    user?.role !== 'superadmin'
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
