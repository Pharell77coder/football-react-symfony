import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRencontres, getRencontresBySaison, getRencontresByEquipe } from '../services/Api';
import './Rencontres.css';

function Rencontres() {
  const [rencontres, setRencontres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState({});
  const [oddsState, setOddsState] = useState({});

  useEffect(() => {
    fetchRencontres();
  }, []);

  const fetchRencontres = async () => {
    try {
      const response = await getRencontres();
      setRencontres(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur de chargement');
      setLoading(false);
    }
  };

  const handleFilterChange = async (type, value) => {
    setFilter(type);
    try {
      setLoading(true);
      let response;
      if (type === 'saison') {
        response = await getRencontresBySaison(value);
      } else if (type === 'equipe') {
        response = await getRencontresByEquipe(value);
      } else {
        response = await getRencontres();
      }
      setRencontres(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur de filtrage');
      setLoading(false);
    }
  };

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOddsClick = (matchId, oddsType, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOddsState(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [oddsType]: !prev[matchId]?.[oddsType]
      }
    }));
  };

  const getOddsClass = (matchId, oddsType) => {
    return oddsState[matchId]?.[oddsType] ? 'clicked' : '';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLive = (dateStr) => {
    const matchDate = new Date(dateStr);
    const now = new Date();
    return matchDate < now && now - matchDate < 7200000;
  };

  if (loading) return <div className="loading">CHARGEMENT...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="rencontres-page">
      <div className="filters-section">
        <div className="filters-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            TOUS LES MATCHS
          </button>
          <button 
            className={`filter-btn ${filter === 'saison' ? 'active' : ''}`}
            onClick={() => handleFilterChange('saison', 2026)}
          >
            SAISON 2026
          </button>
          <button 
            className={`filter-btn ${filter === 'equipe' ? 'active' : ''}`}
            onClick={() => handleFilterChange('equipe', 'france')}
          >
            ÉQUIPE DE FRANCE
          </button>
        </div>
        <Link to="/rencontres/nouvelle" className="add-match-btn">
          + NOUVEAU MATCH
        </Link>
      </div>

      <div className="wrap">
        {rencontres.map((match) => {
          const live = isLive(match.date);
          
          return (
            <Link 
              to={`/rencontres/${match.id}`} 
              key={match.id} 
              className={`match-card ${live ? 'odds-up' : ''}`}
            >
              <div className="match-card-left">
                <div className="match-card-left__score">
                  <h5>{formatDate(match.date)}</h5>
                  <span className="match-time">{formatTime(match.date)}</span>
                </div>
                <div className="match-card-left__competitors">
                  <span>
                    {match.equipe_1} <span className="vs">vs</span> {match.equipe_2}
                  </span>
                </div>
              </div>
              
              <div className="match-card-right">
                <div className="match-card-right__fav">
                  <div 
                    className={`star ${favorites[match.id] ? 'fav' : ''}`}
                    onClick={(e) => toggleFavorite(match.id, e)}
                  >
                    <svg className="white" viewBox="0 0 24 24">
                      <polygon points="12,2 15,9 23,9 16,14 19,22 12,17 5,22 8,14 1,9 9,9 12,2" />
                    </svg>
                    <svg className="gold" viewBox="0 0 24 24">
                      <polygon points="12,2 15,9 23,9 16,14 19,22 12,17 5,22 8,14 1,9 9,9 12,2" />
                    </svg>
                  </div>
                </div>

                {live && (
                  <div className="match-card-right__live">
                    <em>LIVE</em>
                  </div>
                )}

                <div className="match-card-right__odds">
                  <button 
                    className={`odds-1 ${getOddsClass(match.id, '1')}`}
                    onClick={(e) => handleOddsClick(match.id, '1', e)}
                  >
                    <strong>1</strong>
                    <p>{(Math.random() * 2 + 1.1).toFixed(2)}</p>
                  </button>
                  <button 
                    className={`odds-2 ${getOddsClass(match.id, '2')}`}
                    onClick={(e) => handleOddsClick(match.id, '2', e)}
                  >
                    <strong>2</strong>
                    <p>{(Math.random() * 3 + 2.1).toFixed(2)}</p>
                  </button>
                </div>

                <div className="match-card-right__markets">
                  <strong>
                    {match.score_1} - {match.score_2}
                  </strong>
                </div>
              </div>
            </Link>
          );
        })}

        {rencontres.length === 0 && (
          <div className="match-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '55px', paddingLeft: '24px' }}>
              AUCUNE RENCONTRE TROUVÉE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rencontres;