import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './includes/PrivateRoute';
import Navigation from './includes/Navigation';
import Footer from './includes/Footer';
import Accueil from './pages/Accueil';
import Rencontres from './pages/Rencontres';
import RencontreForm from './pages/RencontreForm';
import RencontreDetail from './pages/RencontreDetail';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navigation />

          <Routes>
            {/* Routes publiques */}
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />

            {/* Routes protégées */}
            <Route path="/" element={<PrivateRoute><Accueil /></PrivateRoute>} />
            <Route path="/rencontres" element={<PrivateRoute><Rencontres /></PrivateRoute>} />
            <Route path="/rencontres/nouvelle" element={<PrivateRoute><RencontreForm /></PrivateRoute>} />
            <Route path="/rencontres/modifier/:id" element={<PrivateRoute><RencontreForm /></PrivateRoute>} />
            <Route path="/rencontres/:id" element={<PrivateRoute><RencontreDetail /></PrivateRoute>} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
