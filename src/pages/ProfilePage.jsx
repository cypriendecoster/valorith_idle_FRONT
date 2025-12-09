import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playerService } from '../services/PlayerService';
import { authService } from '../services/AuthService';
import { profileService } from '../services/ProfileService';
import GameHeader from '../components/GameHeader';

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

  // Édition profil
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

    try {
      setProfileSaving(true);
      const res = await profileService.updateProfile({
        username: editUsername,
        email: editEmail,
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
      setPwSuccess(res.message || 'Mot de passe mis à jour avec succès.');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-amber-100">
        <p className="text-xl animate-pulse">Chargement du profil…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-100">
        Profil introuvable.
      </div>
    );

  const { user, stats, realms, badges = [] } = profile;

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
      <GameHeader user={user} stats={headerStats} onLogout={onLogout} />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10 space-y-6">
        {/* Navigation retour */}
        <button
          type="button"
          onClick={() => navigate('/game')}
          className="text-xs sm:text-sm px-3 py-1 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-colors mb-2"
        >
          ← Retour au jeu
        </button>

        {/* Infos du compte + édition profil + mot de passe + sécurité */}
        <section className="bg-black/30 border border-sky-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_40px_rgba(56,189,248,0.12)] space-y-4">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
            <span className="inline-block h-1 w-6 bg-sky-400 rounded-full" />
            Mon profil
          </h2>

          {/* Édition pseudo / email */}
          <form
            onSubmit={handleSaveProfile}
            className="space-y-3 text-sm sm:text-base"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[11px] sm:text-xs text-slate-400">
                Pseudo
              </label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] sm:text-xs text-slate-400">
                Email
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <p className="text-[11px] sm:text-xs text-slate-400">
              Rôle :{' '}
              <span className="font-semibold text-amber-300">
                {formatRole(user.role)}
              </span>
              {' · '}Compte créé le :{' '}
              <span className="font-semibold text-slate-100">
                {formatDate(user.created_at)}
              </span>
            </p>

            {profileError && (
              <p className="text-[11px] sm:text-xs text-red-400">
                {profileError}
              </p>
            )}
            {profileSuccess && (
              <p className="text-[11px] sm:text-xs text-emerald-400">
                {profileSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="mt-1 inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2 transition-colors"
            >
              {profileSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
            >
              <div className="flex flex-col gap-1">
                <label className="text-[11px] sm:text-xs text-slate-400">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] sm:text-xs text-slate-400">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] sm:text-xs text-slate-400">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900/70 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {pwError && (
                <p className="text-[11px] sm:text-xs text-red-400">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-[11px] sm:text-xs text-emerald-400">
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
              se déconnecter
            </button>

            {logoutAllError && (
              <p className="text-[11px] sm:text-xs text-red-400 mt-1">
                {logoutAllError}
              </p>
            )}
          </div>
        </section>

        {/* Badges */}
        <section className="bg-black/30 border border-amber-500/20 rounded-xl p-4 sm:p-5 shadow-[0_0_40px_rgba(251,191,36,0.12)]">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {obtainedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-xs sm:text-sm"
                  >
                    <p className="font-semibold text-emerald-300">
                      {badge.name}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      {badge.description}
                    </p>
                  </div>
                ))}

                {lockedBadges.map((badge) => (
                  <div
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
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Modal déconnexion de toutes les sessions */}
      {showLogoutAllModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-red-500/60 rounded-xl p-4 sm:p-6 max-w-md w-full mx-3 shadow-xl">
            <h2 className="text-lg font-semibold text-red-300 mb-2">
              Déconnecter toutes les sessions ?
            </h2>
            <p className="text-sm text-slate-200 mb-4">
              Cela va déconnecter toutes tes sessions actives (y compris celle-ci).
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




