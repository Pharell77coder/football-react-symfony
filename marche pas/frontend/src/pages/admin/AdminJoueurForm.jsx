import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJoueurById, createJoueur, updateJoueur } from '../../services/Api';
import AdminLayout from './AdminLayout';
import './AdminLayout.css';

const EMPTY = {
  nom: '', prenom: '', club: '', nationalite: '',
  poste: 'Attaquant',
  buts: 0, passes_decisives: 0, minutes_jouees: 0, matchs_joues: 0,
  equipe_type: false,
};

function AdminJoueurForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (isEdit) {
      getJoueurById(id).then(res => {
        const j = res.data;
        setForm({
          nom: j.nom, prenom: j.prenom, club: j.club,
          nationalite: j.nationalite, poste: j.poste,
          buts: j.buts, passes_decisives: j.passes_decisives,
          minutes_jouees: j.minutes_jouees, matchs_joues: j.matchs_joues,
          equipe_type: j.equipe_type,
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) { await updateJoueur(id, form); }
      else        { await createJoueur(form); }
      navigate('/admin/joueurs');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'MODIFIER LE JOUEUR' : 'NOUVEAU JOUEUR'}</h1>
          <p>{isEdit ? `Modification du joueur #${id}` : 'Ajouter un nouveau joueur'}</p>
        </div>
        <button className="btn-view" onClick={() => navigate('/admin/joueurs')}>← Retour</button>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-card">
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>PRÉNOM *</label>
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Ex: Kylian" required />
            </div>

            <div className="admin-form-group">
              <label>NOM *</label>
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Mbappé" required />
            </div>

            <div className="admin-form-group">
              <label>CLUB *</label>
              <input name="club" value={form.club} onChange={handleChange} placeholder="Ex: Real Madrid" required />
            </div>

            <div className="admin-form-group">
              <label>NATIONALITÉ</label>
              <input name="nationalite" value={form.nationalite} onChange={handleChange} placeholder="Ex: Française" />
            </div>

            <div className="admin-form-group">
              <label>POSTE *</label>
              <select name="poste" value={form.poste} onChange={handleChange} required>
                <option value="Gardien">Gardien</option>
                <option value="Défenseur">Défenseur</option>
                <option value="Milieu">Milieu</option>
                <option value="Attaquant">Attaquant</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>MATCHS JOUÉS</label>
              <input type="number" name="matchs_joues" value={form.matchs_joues} onChange={handleChange} min="0" />
            </div>

            <div className="admin-form-group">
              <label>BUTS</label>
              <input type="number" name="buts" value={form.buts} onChange={handleChange} min="0" />
            </div>

            <div className="admin-form-group">
              <label>PASSES DÉCISIVES</label>
              <input type="number" name="passes_decisives" value={form.passes_decisives} onChange={handleChange} min="0" />
            </div>

            <div className="admin-form-group">
              <label>MINUTES JOUÉES</label>
              <input type="number" name="minutes_jouees" value={form.minutes_jouees} onChange={handleChange} min="0" />
            </div>

            <div className="admin-form-group" style={{ justifyContent: 'flex-end' }}>
              <label>ÉQUIPE TYPE</label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="equipe_type"
                  checked={form.equipe_type}
                  onChange={handleChange}
                />
                <span className="toggle-text">
                  {form.equipe_type ? '⭐ Dans l\'équipe type' : 'Pas dans l\'équipe type'}
                </span>
              </label>
            </div>

          </div>

          {/* APERÇU */}
          {form.prenom && form.nom && (
            <div className="player-preview">
              <div className="player-preview__avatar">{form.prenom[0]}{form.nom[0]}</div>
              <div className="player-preview__info">
                <strong>{form.prenom} {form.nom}</strong>
                <span>{form.club} · {form.poste}</span>
              </div>
              <div className="player-preview__stats">
                <div><em>{form.buts}</em><small>BUTS</small></div>
                <div><em>{form.passes_decisives}</em><small>PD</small></div>
                <div><em>{form.minutes_jouees}'</em><small>MIN</small></div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-view" onClick={() => navigate('/admin/joueurs')}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'ENREGISTREMENT...' : isEdit ? '💾 ENREGISTRER' : '➕ CRÉER LE JOUEUR'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .toggle-label input { width: 16px; height: 16px; accent-color: #00e5a0; }
        .toggle-text { font-size: 0.88rem; color: rgba(255,255,255,0.6); }

        .player-preview {
          display: flex; align-items: center; gap: 1rem;
          margin-top: 1.5rem; padding: 1.25rem;
          background: rgba(0,229,160,0.05);
          border: 1px solid rgba(0,229,160,0.15); border-radius: 8px;
        }
        .player-preview__avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: #00e5a0; color: #000;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900; font-size: 1rem;
          display: flex; align-items: center; justify-content: center;
          letter-spacing: 1px; flex-shrink: 0;
        }
        .player-preview__info { flex: 1; }
        .player-preview__info strong {
          display: block; font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem; font-weight: 700; letter-spacing: 1px;
          color: #fff; text-transform: uppercase;
        }
        .player-preview__info span { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
        .player-preview__stats { display: flex; gap: 1.5rem; }
        .player-preview__stats > div { display: flex; flex-direction: column; align-items: center; }
        .player-preview__stats em {
          font-style: normal; font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem; font-weight: 900; color: #00e5a0; line-height: 1;
        }
        .player-preview__stats small {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem; letter-spacing: 1.5px; color: rgba(255,255,255,0.3);
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminJoueurForm;
