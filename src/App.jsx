import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage'; // 👉 ajout
import { authService } from './services/AuthService';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LegalPage from './pages/LegalPage';
import StatusPage from './pages/StatusPage';
import PatchnotesPage from './pages/PatchnotesPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('authToken')
  );
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = !!currentUser && currentUser.role === 'ADMIN';

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    navigate('/game', { replace: true });
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      {/* Page d'accueil publique */}
      <Route
        path="/"
        element={<HomePage isAuthenticated={isAuthenticated} />}
      />

      {/* À propos / Lore (publique) */}
      <Route path="/about" element={<AboutPage />} />

      {/* Aide / FAQ (publique) */}
      <Route path="/help" element={<HelpPage />} />

      {/* Contact / Support (publique) */}
      <Route path="/contact" element={<ContactPage />} />

      {/* Classement (publique) */}
      <Route path="/classement" element={<LeaderboardPage />} />

      {/* Légal (publique) */}
      <Route path="/legal" element={<LegalPage />} />

      {/* Statut (publique) */}
      <Route path="/status" element={<StatusPage />} />

      {/* Patchnotes / MAJ (publique) */}
      <Route path="/patchnotes" element={<PatchnotesPage />} />
      <Route path="/maj" element={<Navigate to="/patchnotes" replace />} />

      {/* Admin (protégé + admin) */}
      <Route
        path="/admin"
        element={
          isAuthenticated && isAdmin ? (
            <AdminPage />
          ) : isAuthenticated ? (
            <Navigate to="/game" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Auth */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/game" replace />
          ) : (
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* Jeu (protégé) */}
      <Route
        path="/game"
        element={
          isAuthenticated ? (
            <GamePage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Profil (protégé) */}
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <ProfilePage onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback → page d'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

}

export default App;
