import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playerService } from '../services/PlayerService';
import { authService } from '../services/AuthService';
import { profileService } from '../services/ProfileService';
import GameHeader from '../components/GameHeader';

const ULTIMATE_BADGE_CODE = 'MONSTRE_DU_IDLE';

function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatRole(role) {
  if (!role) return '-';
  const r = String(role).toUpperCase();
  if (r === 'ADMIN') return 'Admin';
  if (r === 'PLAYER') return 'Joueur';
  return r;
}

function ProfilePage({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Edition profil
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Changement mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Déconnexion de toutes les sessions
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [logoutAllError, setLogoutAllError] = useState('');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 80;
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    playerService
      .getProfile()
      .then((res) => {
        const data = res.data;
        setProfile(data);
        if (data.user) {
          setEditUsername(data.user.username || '');
          setEditEmail(data.user.email || '');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(
          err.response?.data?.message || 'Erreur de chargement du profil'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!editUsername || !editEmail) {
      setProfileError('Pseudo et email sont obligatoires.');
      return;
    }

    if (!isValidEmail(editEmail)) {
      setProfileError('Format email invalide.');
      return;
    }

    try {
      setProfileSaving(true);
      const res = await profileService.updateProfile({
        username: editUsername.trim(),
        email: editEmail.trim(),
      });

      setProfile((prev) => ({
        ...prev,
        user: res.data.user,
      }));

      setProfileSuccess(res.data.message || 'Profil mis à jour.');
    } catch (err) {
      console.error(err);
      setProfileError(
        err.response?.data?.message ||
        'Erreur lors de la mise à jour du profil.'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Tous les champs sont obligatoires.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError(
        'Le nouveau mot de passe et la confirmation ne correspondent pas.'
      );
      return;
    }

    if (newPassword.length < 8) {
      setPwError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      setPwLoading(true);
      const res = await authService.changePassword(
        currentPassword,
        newPassword
      );
      setPwSuccess(
        res.message ||
        'Mot de passe mis à jour avec succès. Tu devras te reconnecter sur tes autres appareils.'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPwError(
        err.response?.data?.message ||
        'Erreur lors du changement de mot de passe.'
      );
    } finally {
      setPwLoading(false);
    }
  };

  const handleConfirmLogoutAll = async () => {
    setLogoutAllError('');
    try {
      setLogoutAllLoading(true);
      await authService.logoutAllSessions();
      onLogout();
    } catch (err) {
      console.error(err);
      setLogoutAllError(
        err.response?.data?.message ||
        'Erreur lors de la déconnexion de toutes les sessions.'
      );
    } finally {
      setLogoutAllLoading(false);
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-amber-100"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="text-xl animate-pulse">Chargement du profil…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        <p role="alert">{error}</p>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-100">
        <p role="alert">Profil introuvable.</p>
      </div>
    );

  const { user, stats, realms, badges = [] } = profile;

  const isProfileDirty =
    editUsername.trim() !== (user.username || '') ||
    editEmail.trim() !== (user.email || '');


  const headerStats = (() => {
    if (!stats) return null;

    const maxRealmId = stats.max_realm_unlocked_id;
    let maxRealmName = null;

    if (maxRealmId && realms) {
      const realm = realms.find((r) => r.realm_id === maxRealmId);
      maxRealmName = realm?.name || null;
    }

    return {
      ...stats,
      login_count: stats.total_logins,
      max_realm_unlocked: maxRealmName,
    };
  })();

  const obtainedBadges = badges.filter((b) => b.obtained);
  const lockedBadges = badges.filter((b) => !b.obtained);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <GameHeader
        user={user}
        stats={headerStats}
        onLogout={onLogout}
        onGoToSection={scrollToSection}
      />

      <main
        className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10 space-y-6"
        aria-labelledby="profile-main-title"
      >
        {/* Bouton retour (desktop + mobile, en plus du menu) */}
        <button
          type="button"
          onClick={() => navigate('/game')}
          className="text-xs sm:text-sm text-slate-300 hover:text-amber-300 inline-flex items-center gap-1"
          aria-label="Revenir à la page de jeu"
        >
          <span aria-hidden="true">←</span>
          <span>Retour au jeu</span>
        </button>

        {/* Infos joueur */}
        <section
          id="profile-section-info"
          className="scroll-mt-28 bg-black/30 border border-slate-700/60 rounded-xl p-4 sm:p-5 shadow-[0_0_35px_rgba(15,23,42,0.7)] space-y-3"
          aria-labelledby="profile-info-title"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2
              id="profile-info-title"
              className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2"
            >
              <span className="inline-block h-1 w-6 bg-amber-400 rounded-full" />
              Profil de {user.username}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            Adresse e-mail :{' '}
            <span className="font-semibold text-amber-200">{user.email}</span>
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            ID joueur :{' '}
            <span className="font-mono text-slate-200">{user.id}</span>
          </p>
        </section>

        {/* Infos du compte + édition profil + mot de passe + sécurité */}
        <section
          id="profile-section-edit"
          className="scroll-mt-28 bg-black/30 border border-sky-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_40px_rgba(56,189,248,0.12)] space-y-4"
          aria-labelledby="profile-main-title"
        >
          <h1
            id="profile-main-title"
            className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2"
          >
            <span className="inline-block h-1 w-6 bg-sky-400 rounded-full" />
            Mon profil
          </h1>

          {/* Edition pseudo / email */}
          <form
            onSubmit={handleSaveProfile}
            className="space-y-3 text-sm sm:text-base"
            aria-describedby={
              profileError
                ? 'profile-error-message'
                : profileSuccess
                  ? 'profile-success-message'
                  : undefined
            }
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="profile-username"
                className="text-[11px] sm:text-xs text-slate-400"
              >
                Pseudo
              </label>
              <input
                id="profile-username"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                aria-invalid={!!profileError}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="profile-email"
                className="text-[11px] sm:text-xs text-slate-400"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                aria-invalid={!!profileError}
              />
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                Cet email est utilisé pour la récupération de compte.
              </p>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-400">
              Rôle :{' '}
              <span className="font-semibold text-amber-300">
                {formatRole(user.role)}
              </span>
              {' • '}Compte créé le :{' '}
              <span className="font-semibold text-slate-100">
                {formatDate(user.created_at)}
              </span>
            </p>

            {profileError && (
              <p
                id="profile-error-message"
                className="text-[11px] sm:text-xs text-red-400"
                role="alert"
                aria-live="assertive"
              >
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p
                id="profile-success-message"
                className="text-[11px] sm:text-xs text-emerald-400"
                role="status"
                aria-live="polite"
              >
                {profileSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving || !isProfileDirty}
              className="mt-1 inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 transition-colors"
            >
              {profileSaving
                ? 'Enregistrement...'
                : 'Enregistrer les modifications'}
            </button>
          </form>

          {/* Changement de mot de passe */}
          <div className="mt-4 border-t border-slate-700/50 pt-3">
            <h3 className="text-sm sm:text-base font-semibold text-sky-300 mb-2">
              Changer mon mot de passe
            </h3>

            <form
              onSubmit={handleChangePassword}
              className="space-y-2 text-sm sm:text-base"
              aria-describedby={
                pwError
                  ? 'password-error-message'
                  : pwSuccess
                    ? 'password-success-message'
                    : undefined
              }
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="current-password"
                  className="text-[11px] sm:text-xs text-slate-400"
                >
                  Mot de passe actuel
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  aria-invalid={!!pwError}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="new-password"
                  className="text-[11px] sm:text-xs text-slate-400"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  aria-invalid={!!pwError}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="confirm-password"
                  className="text-[11px] sm:text-xs text-slate-400"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  aria-invalid={!!pwError}
                />
              </div>

              {pwError && (
                <p
                  id="password-error-message"
                  className="text-[11px] sm:text-xs text-red-400"
                  role="alert"
                  aria-live="assertive"
                >
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p
                  id="password-success-message"
                  className="text-[11px] sm:text-xs text-emerald-400"
                  role="status"
                  aria-live="polite"
                >
                  {pwSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="mt-2 inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 transition-colors"
              >
                {pwLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </form>
          </div>

          {/* Sécurité : déconnexion de toutes les sessions */}
          <div className="mt-4 border-t border-slate-700/50 pt-3">
            <h3 className="text-sm sm:text-base font-semibold text-red-300 mb-2">
              Sécurité
            </h3>

            <button
              type="button"
              onClick={() => {
                setLogoutAllError('');
                setShowLogoutAllModal(true);
              }}
              className="inline-flex items-center rounded-md bg-red-500/90 hover:bg-red-400 text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 transition-colors"
            >
              Déconnecter toutes mes sessions
            </button>

            {logoutAllError && (
              <p
                className="text-[11px] sm:text-xs text-red-400 mt-1"
                role="alert"
                aria-live="assertive"
              >
                {logoutAllError}
              </p>
            )}
          </div>
        </section>

        {/* Badges */}
        <section
          id="profile-section-badges"
          className="scroll-mt-28 bg-black/30 border border-amber-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_40px_rgba(251,191,36,0.12)]"
          aria-labelledby="badges-title"
        >
          <h2
            id="badges-title"
            className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2"
          >
            <span className="inline-block h-1 w-6 bg-amber-400 rounded-full" />
            Mes badges
          </h2>

          {badges.length === 0 && (
            <p className="text-sm text-slate-400">
              Aucun badge défini pour le moment.
            </p>
          )}

          {badges.length > 0 && (
            <>
              <p className="text-[11px] sm:text-xs text-slate-400 mb-2">
                Badges obtenus :{' '}
                <span className="text-amber-300 font-semibold">
                  {obtainedBadges.length}/{badges.length}
                </span>
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {obtainedBadges.map((badge) => {
                  const isUltimate =
                    badge.obtained &&
                    badge.code &&
                    badge.code === ULTIMATE_BADGE_CODE;

                  if (isUltimate) {
                    return (
                      <li
                        key={badge.id}
                        className="col-span-1 sm:col-span-2 md:col-span-3 rounded-xl border border-amber-400/70 bg-slate-900/80 px-4 py-3 flex flex-col items-center text-center"
                      >
                        <img
                          src="/Assets/BADGES/badge_idle.png"
                          alt={`Badge ultime : ${badge.name}`}
                          loading="lazy"
                          className="h-20 sm:h-24 object-contain drop-shadow-[0_0_18px_rgba(251,191,36,0.7)]"
                        />
                        <p className="mt-2 text-xs sm:text-sm font-semibold text-amber-200">
                          {badge.name}
                        </p>
                        <p className="text-[11px] text-slate-200">
                          {badge.description}
                        </p>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={badge.id}
                      className="rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs sm:text-sm"
                    >
                      <p className="font-semibold text-emerald-300">
                        {badge.name}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {badge.description}
                      </p>
                    </li>
                  );
                })}

                {lockedBadges.map((badge) => (
                  <li
                    key={badge.id}
                    className="rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-xs sm:text-sm opacity-60"
                  >
                    <p className="font-semibold text-slate-300">
                      {badge.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {badge.description}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1 italic">
                      Badge non débloqué
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>

      {/* Modal déconnexion de toutes les sessions */}
      {showLogoutAllModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div
            className="bg-slate-900 border border-red-500/60 rounded-xl p-4 sm:p-6 max-w-md w-full mx-3 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-all-title"
            aria-describedby="logout-all-description"
          >
            <h2
              id="logout-all-title"
              className="text-lg font-semibold text-red-300 mb-2"
            >
              Déconnecter toutes les sessions ?
            </h2>
            <p
              id="logout-all-description"
              className="text-sm text-slate-200 mb-4"
            >
              Cela va déconnecter toutes tes sessions actives (y compris
              celle-ci). Tu devras te reconnecter sur chaque appareil.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutAllModal(false)}
                className="px-3 py-1 text-xs sm:text-sm rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={logoutAllLoading}
                onClick={handleConfirmLogoutAll}
                className="px-3 py-1 text-xs sm:text-sm rounded-md bg-red-500/90 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
              >
                {logoutAllLoading ? 'Déconnexion...' : 'Oui, déconnecter tout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;










