import { useState, useEffect } from 'react';
import './Classement.css';

const SAISONS = [2025, 2026];

function Classement() {
  const [classement, setClassement] = useState([]);
  const [saison, setSaison]         = useState(2025);
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState(null);

  useEffect(() => {
    fetchClassement(saison);
  }, [saison]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchClassement = async (s) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rencontres/classement/${s}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setClassement(data);
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/rencontres/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(await res.json());
    } catch {}
  };

  const getRowClass = (rang) => {
    if (rang <= 1)  return 'row-gold';
    if (rang <= 4)  return 'row-qualify';
    return '';
  };

  return (
    <div className="classement-page">

      <div className="classement-hero">
        <div className="classement-hero__label">CLASSEMENT</div>
        <h1>TABLEAU DE BORD</h1>
        <p>STATISTIQUES & CLASSEMENTS</p>
      </div>

      {/* STATS GLOBALES */}
      {stats && (
        <div className="global-stats">
          <div className="global-stat"><em>{stats.total_matchs}</em><span>MATCHS</span></div>
          <div className="global-stat"><em>{stats.total_buts}</em><span>BUTS</span></div>
          <div className="global-stat"><em>{stats.moyenne_buts}</em><span>BUTS/MATCH</span></div>
          <div className="global-stat"><em>{stats.high_scoring_games}</em><span>MATCHS SPECTACULAIRES</span></div>
          <div className="global-stat"><em>{stats.clean_sheets}</em><span>CLEAN SHEETS</span></div>
        </div>
      )}

      {/* SÉLECTEUR SAISON */}
      <div className="classement-controls">
        <div className="saison-tabs">
          {SAISONS.map(s => (
            <button
              key={s}
              className={saison === s ? 'active' : ''}
              onClick={() => setSaison(s)}
            >
              SAISON {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU */}
      <div className="classement-wrap">
        {loading ? (
          <div className="classement-loading">CHARGEMENT...</div>
        ) : classement.length === 0 ? (
          <div className="classement-empty">Aucune donnée pour la saison {saison}</div>
        ) : (
          <table className="classement-table">
            <thead>
              <tr>
                <th className="col-rang">#</th>
                <th className="col-equipe">ÉQUIPE</th>
                <th>MJ</th>
                <th>V</th>
                <th>N</th>
                <th>D</th>
                <th>BP</th>
                <th>BC</th>
                <th>DIFF</th>
                <th className="col-pts">PTS</th>
              </tr>
            </thead>
            <tbody>
              {classement.map((row) => (
                <tr key={row.equipe} className={getRowClass(row.rang)}>
                  <td className="col-rang">
                    <span className={`rang rang-${row.rang}`}>{row.rang}</span>
                  </td>
                  <td className="col-equipe">
                    <strong>{row.equipe}</strong>
                  </td>
                  <td>{row.matchs_joues}</td>
                  <td className="cell-v">{row.victoires}</td>
                  <td>{row.nuls}</td>
                  <td className="cell-d">{row.defaites}</td>
                  <td>{row.buts_marques}</td>
                  <td>{row.buts_encaisses}</td>
                  <td className={row.difference_buts >= 0 ? 'cell-pos' : 'cell-neg'}>
                    {row.difference_buts > 0 ? '+' : ''}{row.difference_buts}
                  </td>
                  <td className="col-pts">
                    <strong>{row.points}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* LÉGENDE */}
        {classement.length > 0 && (
          <div className="classement-legend">
            <div className="legend-item legend-gold">🏆 1er : Vainqueur</div>
            <div className="legend-item legend-qualify">🔵 Top 4 : Qualification</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Classement;
