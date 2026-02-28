import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          FOOTBALL WEBSITE
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/" className="nav-link">ACCUEIL</Link>
              <Link to="/rencontres" className="nav-link">MATCHS</Link>
              <Link to="/rencontres/nouvelle" className="nav-link btn-add">+ AJOUTER</Link>
              <span className="nav-user">👤 {user.username}</span>
              <button onClick={handleLogout} className="nav-link btn-logout">
                DÉCONNEXION
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="nav-link">CONNEXION </Link>
              <Link to="/inscription" className="nav-link btn-add">INSCRIPTION</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
