import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './includes/PrivateRoute';
import AdminRoute from './includes/AdminRoute';

// Pages publiques
import Connexion    from './pages/Connexion';
import Inscription  from './pages/Inscription';

// Pages utilisateur
import Accueil        from './pages/Accueil';
import Rencontres     from './pages/Rencontres';
import RencontreDetail from './pages/RencontreDetail';
import Classement   from './pages/Classement';

// Pages admin
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminRencontres    from './pages/admin/AdminRencontres';
import AdminRencontreForm from './pages/admin/AdminRencontreForm';
import AdminJoueurs       from './pages/admin/AdminJoueurs';
import AdminJoueurForm    from './pages/admin/AdminJoueurForm';
import AdminUsers         from './pages/admin/AdminUsers';

// Layout utilisateur
import Navigation from './includes/Navigation';
import Footer     from './includes/Footer';

function UserLayout({ children }) {
  return (
    <div className="app">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ===== ROUTES PUBLIQUES ===== */}
          <Route path="/connexion"  element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />

          {/* ===== ROUTES UTILISATEUR ===== */}
          <Route path="/" element={
            <PrivateRoute>
              <UserLayout><Accueil /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/rencontres" element={
            <PrivateRoute>
              <UserLayout><Rencontres /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/rencontres/:id" element={
            <PrivateRoute>
              <UserLayout><RencontreDetail /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/Classement" element={
            <PrivateRoute>
              <UserLayout><Classement /></UserLayout>
            </PrivateRoute>
          } />

          {/* ===== ROUTES ADMIN ===== */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/rencontres" element={
            <AdminRoute><AdminRencontres /></AdminRoute>
          } />
          <Route path="/admin/rencontres/nouvelle" element={
            <AdminRoute><AdminRencontreForm /></AdminRoute>
          } />
          <Route path="/admin/rencontres/modifier/:id" element={
            <AdminRoute><AdminRencontreForm /></AdminRoute>
          } />
          <Route path="/admin/joueurs" element={
            <AdminRoute><AdminJoueurs /></AdminRoute>
          } />
          <Route path="/admin/joueurs/nouveau" element={
            <AdminRoute><AdminJoueurForm /></AdminRoute>
          } />
          <Route path="/admin/joueurs/modifier/:id" element={
            <AdminRoute><AdminJoueurForm /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
