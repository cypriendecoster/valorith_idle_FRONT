import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatPlayTime(seconds) {
  const total = Number(seconds || 0);
  if (total <= 0) return '-';

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m`;
}

function GameHeader({ user, stats, onLogout, onGoToSection }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isProfilePage = typeof onGoToSection === 'function';

  const handleGoToProfile = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout?.();
    setIsMenuOpen(false);
  };

  const handleGoToGame = () => {
    navigate('/game');
    setIsMenuOpen(false);
  };

  const handleGoHome = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleGoLeaderboard = () => {
    navigate('/classement');
    setIsMenuOpen(false);
  };

  const handleSection = (id) => {
    if (!onGoToSection) return;
    onGoToSection(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b border-amber-500/30 bg-black/40 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Titre + burger mobile */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">
              VALORITH <span className="text-amber-400">FORGE</span> IDLE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Forgeron : <span className="text-amber-300">{user.username}</span>
            </p>
          </div>

          {/* Burger mobile */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800/80 transition-colors"
            aria-label="Ouvrir le menu du joueur"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <div className="space-y-[3px]">
              <span
                className={`block h-0.5 w-5 bg-current transition-transform ${
                  isMenuOpen ? 'translate-y-[5px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition-opacity ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-current transition-transform ${
                  isMenuOpen ? '-translate-y-[5px] -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>

        <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-2 sm:gap-4">
          {stats && (
            <div className="flex flex-wrap gap-3 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-slate-300">
              <div>
                <p className="uppercase tracking-widest text-slate-500">
                  Niveau max usine
                </p>
                <p className="font-semibold text-amber-300">
                  {stats.max_factory_level_reached ?? '-'}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-slate-500">
                  Royaume max
                </p>
                <p className="font-semibold text-amber-300">
                  {stats.max_realm_unlocked ?? '-'}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-slate-500">
                  Temps de jeu
                </p>
                <p className="font-semibold text-amber-300">
                  {formatPlayTime(stats.total_play_time_seconds)}
                </p>
              </div>
            </div>
          )}

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3 self-end sm:self-auto text-xs sm:text-sm">
            <button
              type="button"
              onClick={handleGoHome}
              className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              Accueil
            </button>

            <button
              type="button"
              onClick={handleGoLeaderboard}
              className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              Classement
            </button>

            {isProfilePage && (
              <>
                <button
                  type="button"
                  onClick={() => handleSection('profile-section-info')}
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                >
                  Infos
                </button>
                <button
                  type="button"
                  onClick={() => handleSection('profile-section-edit')}
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                >
                  Compte
                </button>
                <button
                  type="button"
                  onClick={() => handleSection('profile-section-badges')}
                  className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                >
                  Badges
                </button>
              </>
            )}

            {!isProfilePage && (
              <button
                type="button"
                onClick={handleGoToProfile}
                className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors whitespace-nowrap"
              >
                Mon profil
              </button>
            )}

            <button
              type="button"
              onClick={handleLogoutClick}
              className="px-3 py-1 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-colors whitespace-nowrap"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95">
          <div className="max-w-6xl mx-auto w-full px-3 py-2 flex flex-col gap-2 text-xs text-slate-200">
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
            >
              Accueil
            </button>

            <button
              type="button"
              onClick={handleGoLeaderboard}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
            >
              Classement
            </button>

            {isProfilePage ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSection('profile-section-info')}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
                >
                  Infos
                </button>
                <button
                  type="button"
                  onClick={() => handleSection('profile-section-edit')}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
                >
                  Compte & sécurité
                </button>
                <button
                  type="button"
                  onClick={() => handleSection('profile-section-badges')}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
                >
                  Badges
                </button>
                <button
                  type="button"
                  onClick={handleGoToGame}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
                >
                  Retour au jeu
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-left px-2 py-1.5 rounded-md text-red-300 hover:bg-red-900/50"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoToProfile}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-slate-800/80"
                >
                  Mon profil
                </button>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full text-left px-2 py-1.5 rounded-md text-red-300 hover:bg-red-900/50"
                >
                  Se déconnecter
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default GameHeader;


