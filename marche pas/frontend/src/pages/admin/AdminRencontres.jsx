import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRencontres, deleteRencontre } from '../../services/Api';
import AdminLayout from './AdminLayout';
import './AdminLayout.css';

function AdminRencontres() {
  const [rencontres, setRencontres] = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(rencontres); return; }
    const q = search.toLowerCase();
    setFiltered(rencontres.filter(r =>
      r.equipe_1?.toLowerCase().includes(q) ||
      r.equipe_2?.toLowerCase().includes(q) ||
      r.nom?.toLowerCase().includes(q) ||
      r.lieu?.toLowerCase().includes(q)
    ));
  }, [search, rencontres]);

  const fetchData = async () => {
    try {
      const res = await getRencontres();
      const data = [...res.data].reverse();
      setRencontres(data);
      setFiltered(data);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRencontre(id);
      setRencontres(prev => prev.filter(r => r.id !== id));
      setMsg({ type: 'success', text: 'Match supprimé avec succès' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally { setConfirmDelete(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>RENCONTRES</h1>
          <p>{rencontres.length} match{rencontres.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/admin/rencontres/nouvelle" className="btn-primary">
          ➕ NOUVEAU MATCH
        </Link>
      </div>

      {msg && <div className={`admin-alert ${msg.type}`}>{msg.text}</div>}

      <div className="admin-card">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="🔍 Rechercher un match, une équipe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>MATCH</th>
                <th>SCORE</th>
                <th>LIEU</th>
                <th>COMPÉTITION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="admin-empty">CHARGEMENT...</td></tr>
              )}
              {!loading && filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                  <td><strong>{r.equipe_1} vs {r.equipe_2}</strong></td>
                  <td>
                    <span style={{
                      fontFamily: 'Barlow Condensed',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '2px'
                    }}>
                      {r.score_1} – {r.score_2}
                    </span>
                  </td>
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.lieu}
                  </td>
                  <td>{r.nom}</td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/rencontres/${r.id}`} className="btn-view">👁</Link>
                      <Link to={`/admin/rencontres/modifier/${r.id}`} className="btn-edit">✏️ Modifier</Link>
                      <button className="btn-delete" onClick={() => setConfirmDelete(r)}>🗑 Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">AUCUN RÉSULTAT</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>🗑 SUPPRIMER</h2>
              <button className="admin-modal__close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                Confirmer la suppression de ce match ?
              </p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                {confirmDelete.equipe_1} {confirmDelete.score_1} – {confirmDelete.score_2} {confirmDelete.equipe_2}
              </p>
              <p style={{ color: 'rgba(255,59,92,0.8)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                ⚠️ Cette action est irréversible.
              </p>
            </div>
            <div className="admin-modal__footer">
              <button className="btn-view" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="btn-delete" onClick={() => handleDelete(confirmDelete.id)}>
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminRencontres;
