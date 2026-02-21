import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './includes/Navigation';
import Footer from './includes/Footer';
import Accueil from './pages/Accueil';
import Rencontres from './pages/Rencontres';
import RencontreForm from './pages/RencontreForm';
import RencontreDetail from './pages/RencontreDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/rencontres" element={<Rencontres />} />
          <Route path="/rencontres/nouvelle" element={<RencontreForm />} />
          <Route path="/rencontres/modifier/:id" element={<RencontreForm />} />
          <Route path="/rencontres/:id" element={<RencontreDetail />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;