import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="loading">CHARGEMENT...</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;

  return children;
}

export default AdminRoute;
