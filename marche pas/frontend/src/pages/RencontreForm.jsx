import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRencontreById, createRencontre, updateRencontre } from '../services/Api';

function RencontreForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom: 'match amical',
    date: '',
    lieu: '',
    equipe_1: '',
    equipe_2: '',
    score_1: 0,
    score_2: 0,
    journee: 1,
    saison: 2026
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchRencontre();
    }
  }, [id]);

  const fetchRencontre = async () => {
    try {
      setLoading(true);
      const response = await getRencontreById(id);
      const rencontre = response.data;
      const date = new Date(rencontre.date).toISOString().slice(0, 16);
      setFormData({ ...rencontre, date });
      setLoading(false);
    } catch (err) {
      setError('Erreur de chargement');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode) {
        await updateRencontre(id, formData);
        setSuccess('RENCONTRE MODIFIÉE !');
      } else {
        await createRencontre(formData);
        setSuccess('RENCONTRE CRÉÉE !');
        setFormData({
          nom: 'match amical',
          date: '',
          lieu: '',
          equipe_1: '',
          equipe_2: '',
          score_1: 0,
          score_2: 0,
          journee: 1,
          saison: 2026
        });
      }
      
      setTimeout(() => {
        setSuccess('');
        navigate('/rencontres');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'ERREUR');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className="loading">CHARGEMENT...</div>;

  return (
    <div className="form-container">
      <h1>{isEditMode ? 'MODIFIER LA RENCONTRE' : 'AJOUTER UNE RENCONTRE'}</h1>
      
      {success && <div className="alert-success">{success}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="rencontre-form">
        <div className="form-grid">
          <div className="form-group">
            <label>TYPE DE MATCH *</label>
            <select name="nom" value={formData.nom} onChange={handleChange} required>
              <option value="match amical">MATCH AMICAL</option>
              <option value="championnat">CHAMPIONNAT</option>
              <option value="coupe">COUPE</option>
              <option value="euro">EURO</option>
              <option value="coupe du monde">COUPE DU MONDE</option>
            </select>
          </div>

          <div className="form-group">
            <label>DATE ET HEURE *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>LIEU</label>
            <input
              type="text"
              name="lieu"
              value={formData.lieu}
              onChange={handleChange}
              placeholder="STADE DE FRANCE"
            />
          </div>

          <div className="form-group">
            <label>SAISON *</label>
            <input
              type="number"
              name="saison"
              value={formData.saison}
              onChange={handleChange}
              required
              min="2020"
              max="2030"
            />
          </div>

          <div className="form-group">
            <label>JOURNÉE *</label>
            <input
              type="number"
              name="journee"
              value={formData.journee}
              onChange={handleChange}
              required
              min="1"
              max="38"
            />
          </div>

          <div className="form-group">
            <label>ÉQUIPE DOMICILE *</label>
            <input
              type="text"
              name="equipe_1"
              value={formData.equipe_1}
              onChange={handleChange}
              placeholder="PSG"
              required
            />
          </div>

          <div className="form-group">
            <label>ÉQUIPE EXTÉRIEUR *</label>
            <input
              type="text"
              name="equipe_2"
              value={formData.equipe_2}
              onChange={handleChange}
              placeholder="OM"
              required
            />
          </div>

          <div className="form-group score-group">
            <label>SCORE</label>
            <div className="score-inputs">
              <input
                type="number"
                name="score_1"
                value={formData.score_1}
                onChange={handleChange}
                min="0"
              />
              <span>-</span>
              <input
                type="number"
                name="score_2"
                value={formData.score_2}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/rencontres')} className="btn-cancel">
            ANNULER
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'EN COURS...' : isEditMode ? 'MODIFIER' : 'CRÉER'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RencontreForm;