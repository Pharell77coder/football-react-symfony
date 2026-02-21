import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRencontres } from '../services/Api';

function Accueil() {
  const [rencontres, setRencontres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    fetchRencontres();
  }, []);

  const fetchRencontres = async () => {
    try {
      const response = await getRencontres();
      setRencontres(response.data.slice(0, 5));
      setLoading(false);
    } catch (err) {
      setError('Erreur de chargement');
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
    <div className="accueil">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>FOOTBALL CRUD</h1>
          <p>Suivez et gérez toutes les rencontres de la saison 2026</p>
          <Link to="/rencontres/nouvelle" className="hero-btn">
            + AJOUTER UN MATCH
          </Link>
        </div>
      </div>

      {/* Derniers matchs */}
      <div className="recent-matches">
        <div className="section-header">
          <h2>DERNIERS MATCHS</h2>
          <Link to="/rencontres" className="view-all">
            VOIR TOUT →
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

                  <div className="match-card-right__markets">
                    <strong>
                      {match.score_1} - {match.score_2}
                    </strong>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{rencontres.length}</h3>
            <p>MATCHS RÉCENTS</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚽</div>
          <div className="stat-info">
            <h3>2026</h3>
            <p>SAISON EN COURS</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{Object.values(favorites).filter(Boolean).length}</h3>
            <p>FAVORIS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accueil;