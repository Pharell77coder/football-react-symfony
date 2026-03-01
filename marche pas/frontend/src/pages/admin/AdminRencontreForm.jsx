import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRencontreById, createRencontre, updateRencontre } from '../../services/Api';
import AdminLayout from './AdminLayout';
import './AdminLayout.css';

const EMPTY = {
  nom: '', date: '', lieu: '',
  equipe_1: '', equipe_2: '',
  score_1: 0, score_2: 0,
  journee: 1, saison: 2025,
};

function AdminRencontreForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm]     = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (isEdit) {
      getRencontreById(id).then(res => {
        const r = res.data;
        setForm({
          nom:      r.nom,
          date:     r.date?.slice(0, 16) ?? '',
          lieu:     r.lieu,
          equipe_1: r.equipe_1,
          equipe_2: r.equipe_2,
          score_1:  r.score_1,
          score_2:  r.score_2,
          journee:  r.journee,
          saison:   r.saison,
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await updateRencontre(id, form);
      } else {
        await createRencontre(form);
      }
      navigate('/admin/rencontres');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? 'MODIFIER LE MATCH' : 'NOUVEAU MATCH'}</h1>
          <p>{isEdit ? `Modification du match #${id}` : 'Ajouter une nouvelle rencontre'}</p>
        </div>
        <button className="btn-view" onClick={() => navigate('/admin/rencontres')}>
          ← Retour
        </button>
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-card">
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">

            <div className="admin-form-group full">
              <label>COMPÉTITION *</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex: Ligue des Champions - Finale"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>DATE ET HEURE *</label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>LIEU *</label>
              <input
                name="lieu"
                value={form.lieu}
                onChange={handleChange}
                placeholder="Ex: Allianz Arena, Munich"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>ÉQUIPE 1 *</label>
              <input
                name="equipe_1"
                value={form.equipe_1}
                onChange={handleChange}
                placeholder="Ex: Paris Saint-Germain"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>ÉQUIPE 2 *</label>
              <input
                name="equipe_2"
                value={form.equipe_2}
                onChange={handleChange}
                placeholder="Ex: Inter Milan"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>SCORE ÉQUIPE 1</label>
              <input
                type="number"
                name="score_1"
                value={form.score_1}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="admin-form-group">
              <label>SCORE ÉQUIPE 2</label>
              <input
                type="number"
                name="score_2"
                value={form.score_2}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="admin-form-group">
              <label>JOURNÉE</label>
              <input
                type="number"
                name="journee"
                value={form.journee}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="admin-form-group">
              <label>SAISON</label>
              <input
                type="number"
                name="saison"
                value={form.saison}
                onChange={handleChange}
                min="2000"
                max="2100"
              />
            </div>

          </div>

          {/* APERÇU */}
          {form.equipe_1 && form.equipe_2 && (
            <div className="match-preview">
              <span>{form.equipe_1}</span>
              <strong>{form.score_1} – {form.score_2}</strong>
              <span>{form.equipe_2}</span>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-view" onClick={() => navigate('/admin/rencontres')}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'ENREGISTREMENT...' : isEdit ? '💾 ENREGISTRER' : '➕ CRÉER LE MATCH'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .match-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: rgba(0,229,160,0.05);
          border: 1px solid rgba(0,229,160,0.15);
          border-radius: 8px;
        }
        .match-preview span {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
        }
        .match-preview strong {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: #00e5a0;
          letter-spacing: 4px;
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminRencontreForm;
