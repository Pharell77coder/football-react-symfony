import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminLayout.css';

function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setUsers(data);
      setFiltered(data);
    } catch {
      setMsg({ type: 'error', text: 'Erreur de chargement des utilisateurs' });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      setMsg({ type: 'success', text: 'Utilisateur supprimé' });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Erreur lors de la suppression' });
    } finally { setConfirmDelete(null); }
  };

  const handleToggleRole = async (user) => {
    const newRoles = user.roles.includes('ROLE_ADMIN')
      ? ['ROLE_USER']
      : ['ROLE_ADMIN', 'ROLE_USER'];

    try {
      await fetch(`/api/users/${user.id}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roles: newRoles })
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roles: newRoles } : u));
      setMsg({ type: 'success', text: `Rôle modifié pour ${user.username}` });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Erreur lors de la modification du rôle' });
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>UTILISATEURS</h1>
          <p>{users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {msg && <div className={`admin-alert ${msg.type}`}>{msg.text}</div>}

      <div className="admin-card">
        <div className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="🔍 Rechercher un utilisateur..."
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
                <th>#</th>
                <th>UTILISATEUR</th>
                <th>EMAIL</th>
                <th>RÔLE</th>
                <th>INSCRIPTION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="admin-empty">CHARGEMENT...</td></tr>}
              {!loading && filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'rgba(255,255,255,0.3)' }}>{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: u.roles?.includes('ROLE_ADMIN') ? '#00e5a0' : '#3b82f6',
                        color: '#000', fontFamily: 'Barlow Condensed',
                        fontWeight: 900, fontSize: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.5)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.roles?.includes('ROLE_ADMIN') ? 'badge-admin' : 'badge-user'}`}>
                      {u.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleToggleRole(u)}
                        title="Changer le rôle"
                      >
                        {u.roles?.includes('ROLE_ADMIN') ? '↓ USER' : '↑ ADMIN'}
                      </button>
                      <button className="btn-delete" onClick={() => setConfirmDelete(u)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="admin-empty">AUCUN UTILISATEUR</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>🗑 SUPPRIMER</h2>
              <button className="admin-modal__close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Supprimer cet utilisateur ?</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: '0.5rem 0' }}>
                {confirmDelete.username} — {confirmDelete.email}
              </p>
              <p style={{ color: 'rgba(255,59,92,0.8)', fontSize: '0.82rem' }}>⚠️ Irréversible.</p>
            </div>
            <div className="admin-modal__footer">
              <button className="btn-view" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="btn-delete" onClick={() => handleDelete(confirmDelete.id)}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUsers;
