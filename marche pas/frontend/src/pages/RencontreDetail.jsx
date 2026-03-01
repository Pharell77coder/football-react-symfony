import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRencontreById, deleteRencontre } from '../services/Api';

function RencontreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rencontre, setRencontre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRencontre();
  }, [id]);

  const fetchRencontre = async () => {
    try {
      const response = await getRencontreById(id);
      setRencontre(response.data);
      setLoading(false);
    } catch (err) {
      setError('RENCONTRE NON TROUVÉE');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette rencontre ?')) {
      try {
        await deleteRencontre(id);
        navigate('/rencontres');
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div className="loading">CHARGEMENT...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!rencontre) return <div className="error">RENCONTRE INTROUVABLE</div>;

  return (
    <div className="detail-container">
      <Link to="/rencontres" className="back-link">← RETOUR AUX MATCHS</Link>
      
      <div className="match-detail">
        <div className="match-header">
          <h1>{rencontre.equipe_1} <span className="vs">VS</span> {rencontre.equipe_2}</h1>
          <div className="match-meta">
            <span>📅 {new Date(rencontre.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>⏰ {new Date(rencontre.date).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            <span>📍 {rencontre.lieu || 'À DÉTERMINER'}</span>
            <span>⚽ {rencontre.nom.toUpperCase()}</span>
            <span>📆 JOURNÉE {rencontre.journee} - {rencontre.saison}</span>
          </div>
        </div>

        <div className="score-board">
          <div className="team-detail">
            <h2>{rencontre.equipe_1}</h2>
            <span className="score-large">{rencontre.score_1}</span>
          </div>
          <div className="score-separator">VS</div>
          <div className="team-detail">
            <h2>{rencontre.equipe_2}</h2>
            <span className="score-large">{rencontre.score_2}</span>
          </div>
        </div>

        <div className="detail-actions">
          <Link to={`/rencontres/modifier/${rencontre.id}`} className="btn-edit-large">
            ✏️ MODIFIER
          </Link>
          <button onClick={handleDelete} className="btn-delete-large">
            🗑️ SUPPRIMER
          </button>
        </div>
      </div>
    </div>
  );
}

export default RencontreDetail;