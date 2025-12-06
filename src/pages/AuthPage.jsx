import { useState } from 'react';
import { authService } from '../services/AuthService';

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const validate = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "L'email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email invalide.';
    }

    if (!isLogin) {
      if (!username.trim()) {
        errors.username = 'Le pseudo est obligatoire.';
      } else if (username.trim().length < 3) {
        errors.username = 'Le pseudo doit faire au moins 3 caractères.';
      }
    }

    if (!password) {
      errors.password = 'Le mot de passe est obligatoire.';
    } else if (password.length < 8) {
      errors.password = 'Au moins 8 caractères recommandés.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await authService.login(email.trim(), password);
      } else {
        await authService.register(email.trim(), username.trim(), password);
      }
      onAuthSuccess?.();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Erreur d'authentification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setFormError('');
    setFieldErrors({});
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100 px-3">
      <div className="w-full max-w-md bg-black/40 border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_45px_rgba(251,191,36,0.18)]">
        <h1 className="text-2xl font-semibold mb-1 text-center tracking-wide">
          ASHKAR <span className="text-amber-400">FORGE</span> IDLE
        </h1>
        <p className="text-xs text-center text-slate-400 mb-6">
          {isLogin
            ? 'Reprends ta forge là où tu l’as laissée.'
            : 'Grave ton nom dans les flammes de Valorith.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1 text-sm">
            <label className="block text-slate-300">
              Email
              <span className="text-amber-400 text-xs ml-1">*</span>
            </label>
            <input
              className={`w-full rounded-lg bg-slate-900/70 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                fieldErrors.email ? 'border-red-500' : 'border-slate-700'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex : forgeron@valorith.com"
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* Username (register only) */}
          {!isLogin && (
            <div className="space-y-1 text-sm">
              <label className="block text-slate-300">
                Pseudo
                <span className="text-amber-400 text-xs ml-1">*</span>
              </label>
              <input
                className={`w-full rounded-lg bg-slate-900/70 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  fieldErrors.username ? 'border-red-500' : 'border-slate-700'
                }`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom gravé sur l’enclume"
              />
              {fieldErrors.username && (
                <p className="text-[11px] text-red-400">
                  {fieldErrors.username}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1 text-sm">
            <label className="block text-slate-300">
              Mot de passe
              <span className="text-amber-400 text-xs ml-1">*</span>
            </label>
            <input
              type="password"
              className={`w-full rounded-lg bg-slate-900/70 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                fieldErrors.password ? 'border-red-500' : 'border-slate-700'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
            />
            {fieldErrors.password ? (
              <p className="text-[11px] text-red-400">
                {fieldErrors.password}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Astuce : mélange lettres, chiffres et métal en fusion.
              </p>
            )}
          </div>

          {formError && (
            <p className="text-xs text-red-400 text-center mt-1">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 inline-flex justify-center items-center rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold py-2 text-sm transition-colors"
          >
            {isSubmitting
              ? isLogin
                ? 'Connexion...'
                : 'Création du compte...'
              : isLogin
              ? 'Se connecter'
              : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={toggleMode}
          className="w-full mt-4 text-xs text-center text-slate-400 hover:text-amber-300 transition-colors"
        >
          {isLogin
            ? "Pas de compte ? S'inscrire"
            : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;


