import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRencontres } from '../../services/Api';
import AdminLayout from './AdminLayout';
import './AdminLayout.css';

function AdminDashboard() {
  const [stats, setStats] = useState({ rencontres: 0, joueurs: 0, users: 0 });
  const [derniers, setDerniers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/rencontres', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch('/api/joueurs',    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch('/api/users',      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()).catch(() => []),
    ]).then(([rencontres, joueurs, users]) => {
      setStats({
        rencontres: rencontres.length,
        joueurs:    joueurs.length,
        users:      users.length || 0,
      });
      setDerniers(rencontres.slice(-5).reverse());
    }).finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>DASHBOARD</h1>
          <p>Vue d'ensemble de l'application</p>
        </div>
      </div>

      {/* STATS */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon">⚽</span>
          <div>
            <div className="admin-stat-card__num">{loading ? '—' : stats.rencontres}</div>
            <div className="admin-stat-card__label">Rencontres</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon">👤</span>
          <div>
            <div className="admin-stat-card__num">{loading ? '—' : stats.joueurs}</div>
            <div className="admin-stat-card__label">Joueurs</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon">👥</span>
          <div>
            <div className="admin-stat-card__num">{loading ? '—' : stats.users}</div>
            <div className="admin-stat-card__label">Utilisateurs</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon">🏆</span>
          <div>
            <div className="admin-stat-card__num">2025</div>
            <div className="admin-stat-card__label">Saison active</div>
          </div>
        </div>
      </div>

      {/* RACCOURCIS */}
      <div className="admin-shortcuts">
        <h2 className="admin-section-title">ACCÈS RAPIDE</h2>
        <div className="admin-shortcut-grid">
          <Link to="/admin/rencontres/nouvelle" className="admin-shortcut-card">
            <span>➕</span>
            <strong>Ajouter un match</strong>
          </Link>
          <Link to="/admin/joueurs/nouveau" className="admin-shortcut-card">
            <span>➕</span>
            <strong>Ajouter un joueur</strong>
          </Link>
          <Link to="/admin/rencontres" className="admin-shortcut-card">
            <span>📋</span>
            <strong>Gérer les matchs</strong>
          </Link>
          <Link to="/admin/joueurs" className="admin-shortcut-card">
            <span>📋</span>
            <strong>Gérer les joueurs</strong>
          </Link>
        </div>
      </div>

      {/* DERNIERS MATCHS */}
      <div className="admin-card" style={{ marginTop: '2rem' }}>
        <div className="admin-toolbar">
          <h2 className="admin-section-title" style={{ margin: 0 }}>DERNIERS MATCHS</h2>
          <Link to="/admin/rencontres" className="btn-view">Voir tout →</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>MATCH</th>
                <th>SCORE</th>
                <th>COMPÉTITION</th>
              </tr>
            </thead>
            <tbody>
              {derniers.map(r => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td><strong>{r.equipe_1} vs {r.equipe_2}</strong></td>
                  <td><strong>{r.score_1} – {r.score_2}</strong></td>
                  <td>{r.nom}</td>
                </tr>
              ))}
              {!loading && derniers.length === 0 && (
                <tr><td colSpan={4} className="admin-empty">Aucun match</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
