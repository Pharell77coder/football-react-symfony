import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          LOGO FOOTBALL
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            ACCUEIL
          </Link>
          <Link to="/rencontres" className="nav-link">
            MATCHS
          </Link>
          <Link to="/rencontres/nouvelle" className="nav-link btn-add">
            + AJOUTER
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;