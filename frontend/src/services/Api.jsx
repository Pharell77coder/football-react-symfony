import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token JWT dans chaque requête automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si le token expire (401), déconnecter automatiquement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const inscription = (data) => api.post('/auth/inscription', data);
export const connexion = (data) => api.post('/auth/connexion', data);
export const deconnexion = () => api.post('/auth/deconnexion');
export const getMe = () => api.get('/auth/me');

// ============ RENCONTRES ============
export const getRencontres = () => api.get('/rencontres');
export const getRencontreById = (id) => api.get(`/rencontres/${id}`);
export const getRencontresBySaison = (saison) => api.get(`/rencontres/saison/${saison}`);
export const getRencontresByEquipe = (equipe) => api.get(`/rencontres/equipe/${equipe}`);
export const createRencontre = (data) => api.post('/rencontres', data);
export const updateRencontre = (id, data) => api.put(`/rencontres/${id}`, data);
export const deleteRencontre = (id) => api.delete(`/rencontres/${id}`);

export default api;
