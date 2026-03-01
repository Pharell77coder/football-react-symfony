import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin',            icon: '📊', label: 'Dashboard'  },
  { path: '/admin/rencontres', icon: '⚽', label: 'Rencontres' },
  { path: '/admin/joueurs',    icon: '👤', label: 'Joueurs'    },
  { path: '/admin/users',      icon: '👥', label: 'Utilisateurs' },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <Link to="/">⚽</Link>
          <span>ADMIN</span>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user">
            <div className="admin-user__avatar">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="admin-user__info">
              <strong>{user?.username}</strong>
              <span>Administrateur</span>
            </div>
          </div>
          <button className="admin-logout" onClick={handleLogout}>
            ↩ Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        {children}
      </main>

    </div>
  );
}

export default AdminLayout;
