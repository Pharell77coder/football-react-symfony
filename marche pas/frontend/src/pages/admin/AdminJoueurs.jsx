import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJoueurs, deleteJoueur } from '../../services/Api';
import AdminLayout from './AdminLayout';
import './AdminLayout.css';

const BADGE_POSTE = {
  Gardien: 'badge-gardien',
  Défenseur: 'badge-def',
  Milieu: 'badge-mil',
  Attaquant: 'badge-att',
};

function AdminJoueurs() {
  const [joueurs, setJoueurs]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [posteFilter, setPosteFilter] = useState('tous');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = joueurs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.nom?.toLowerCase().includes(q) ||
        j.prenom?.toLowerCase().includes(q) ||
        j.club?.toLowerCase().includes(q)
      );
    }
    if (posteFilter !== 'tous') {
      result = result.filter(j => j.poste === posteFilter);
    }
    setFiltered(result);
  }, [search, posteFilter, joueurs]);

  const fetchData = async () => {
    try {
      const res = await getJoueurs();
      setJoueurs(res.data);
      setFiltered(res.data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJoueur(id);
      setJoueurs(prev => prev.filter(j => j.id !== id));
      setMsg({ type: 'success', text: 'Joueur supprimé avec succès' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally { setConfirmDelete(null); }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>JOUEURS</h1>
          <p>{joueurs.length} joueur{joueurs.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/admin/joueurs/nouveau" className="btn-primary">➕ NOUVEAU JOUEUR</Link>
      </div>

      {msg && <div className={`admin-alert ${msg.type}`}>{msg.text}</div>}

      <div className="admin-card">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="🔍 Rechercher nom, club..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['tous', 'Gardien', 'Défenseur', 'Milieu', 'Attaquant'].map(p => (
              <button
                key={p}
                className={`filter-chip ${posteFilter === p ? 'active' : ''}`}
                onClick={() => setPosteFilter(p)}
              >
                {p === 'tous' ? 'TOUS' : p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>JOUEUR</th>
                <th>CLUB</th>
                <th>POSTE</th>
                <th>BUTS</th>
                <th>PD</th>
                <th>MIN</th>
                <th>ÉQ. TYPE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="admin-empty">CHARGEMENT...</td></tr>}
              {!loading && filtered.map(j => (
                <tr key={j.id}>
                  <td><strong>{j.prenom} {j.nom}</strong></td>
                  <td>{j.club}</td>
                  <td>
                    <span className={`badge ${BADGE_POSTE[j.poste] || 'badge-user'}`}>
                      {j.poste}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', color: '#00e5a0', fontWeight: 700 }}>{j.buts}</td>
                  <td style={{ textAlign: 'center', color: '#c084fc', fontWeight: 700 }}>{j.passes_decisives}</td>
                  <td style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>{j.minutes_jouees}'</td>
                  <td style={{ textAlign: 'center' }}>
                    {j.equipe_type ? '⭐' : '—'}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/joueurs/modifier/${j.id}`} className="btn-edit">✏️ Modifier</Link>
                      <button className="btn-delete" onClick={() => setConfirmDelete(j)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="admin-empty">AUCUN RÉSULTAT</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SUPPRESSION */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>🗑 SUPPRIMER</h2>
              <button className="admin-modal__close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Supprimer ce joueur ?</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: '0.5rem 0' }}>
                {confirmDelete.prenom} {confirmDelete.nom} — {confirmDelete.club}
              </p>
              <p style={{ color: 'rgba(255,59,92,0.8)', fontSize: '0.82rem' }}>⚠️ Cette action est irréversible.</p>
            </div>
            <div className="admin-modal__footer">
              <button className="btn-view" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="btn-delete" onClick={() => handleDelete(confirmDelete.id)}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-chip {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-chip:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
        .filter-chip.active { background: rgba(0,229,160,0.1); color: #00e5a0; border-color: rgba(0,229,160,0.3); }
      `}</style>
    </AdminLayout>
  );
}

export default AdminJoueurs;
