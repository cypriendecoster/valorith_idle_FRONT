import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { authService } from '../services/AuthService';
import { supportService } from '../services/SupportService';

const DEFAULT_CATEGORIES = [
  { value: 'BUG', label: 'Bug / Problème technique' },
  { value: 'ACCOUNT', label: 'Compte / Connexion' },
  { value: 'FEEDBACK', label: 'Suggestion / Feedback' },
  { value: 'OTHER', label: 'Autre' },
];

function clampText(value, maxLen) {
  const text = String(value ?? '').trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen);
}

function isEmailLike(value) {
  const email = String(value ?? '').trim();
  if (!email) return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function ContactPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = !!authService.getToken();

  const [category, setCategory] = useState('BUG');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [includeTech, setIncludeTech] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const supportEmail =
    import.meta.env.VITE_SUPPORT_EMAIL || 'support@valorithforge.example';

  const techInfo = useMemo(() => {
    return {
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      clientTimeIso: new Date().toISOString(),
      locale: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      appMode: import.meta.env.MODE,
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const handleGoHome = () => navigate('/');
  const handleGoHelp = () => navigate('/help');

  const validate = () => {
    const cleanedSubject = clampText(subject, 120);
    const cleanedMessage = clampText(message, 4000);
    const cleanedEmail = clampText(email, 254);
    const cleanedUsername = clampText(username, 32);

    if (!cleanedMessage || cleanedMessage.length < 10) {
      return {
        ok: false,
        message: 'Décris ton problème en quelques lignes (min. 10 caractères).',
      };
    }

    if (!isAuthenticated && !isEmailLike(cleanedEmail)) {
      return {
        ok: false,
        message: 'Ajoute un email valide pour qu’on puisse te répondre.',
      };
    }

    return {
      ok: true,
      values: {
        category,
        subject: cleanedSubject,
        message: cleanedMessage,
        email: cleanedEmail,
        username: cleanedUsername,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const result = validate();
    if (!result.ok) {
      setToast({ type: 'error', message: result.message });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...result.values,
        tech: includeTech ? techInfo : null,
      };

      const res = await supportService.createTicket(payload);
      setToast({
        type: 'success',
        message:
          res?.data?.message || 'Merci ! Ton message a été envoyé au support.',
      });

      setSubject('');
      setMessage('');
      if (!isAuthenticated) {
        setEmail('');
        setUsername('');
      }
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Impossible d'envoyer la demande. Réessaie plus tard.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <Toast toast={toast} />

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-10 text-center">
          <nav
            className="mb-4 text-[11px] md:text-xs text-slate-400"
            aria-label="Fil d'Ariane"
          >
            <ol className="flex items-center justify-center gap-1">
              <li>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="hover:text-amber-300 hover:underline underline-offset-2 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70 rounded-sm"
                >
                  Accueil
                </button>
              </li>
              <li aria-hidden="true" className="text-slate-600 mx-1">
                /
              </li>
              <li aria-current="page" className="text-amber-200 font-medium">
                Contact / Support
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Aide rapide &amp; assistance
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Contact &amp; Support&nbsp;
            <span className="text-amber-400">VALORITH FORGE IDLE</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Une question, un bug, une idée ? Envoie un message au support. Réponse
            sous 24–48h (en période de forte activité, ça peut être un peu plus
            long).
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <aside className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] p-5 md:p-7 space-y-5">
            <section className="space-y-2">
              <h2 className="text-lg font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                Avant de nous écrire
              </h2>
              <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                <li>Recharge la page (Ctrl+F5) si l’interface bug.</li>
                <li>Vérifie ta connexion et retente une action.</li>
                <li>
                  Consulte l’{' '}
                  <button
                    type="button"
                    onClick={handleGoHelp}
                    className="text-amber-200 hover:underline underline-offset-2"
                  >
                    Aide / FAQ
                  </button>{' '}
                  pour les questions fréquentes.
                </li>
              </ul>
            </section>

            <section className="space-y-2 border-t border-amber-500/20 pt-4">
              <h2 className="text-lg font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                Canaux
              </h2>
              <p className="text-sm text-slate-200">
                Tu peux aussi nous écrire par email :{' '}
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-amber-200 hover:underline underline-offset-2"
                >
                  {supportEmail}
                </a>
              </p>
              <p className="text-xs text-slate-400">
                Astuce : plus tu décris précisément les étapes pour reproduire,
                plus on corrige vite.
              </p>
            </section>

            <section className="space-y-2 border-t border-amber-500/20 pt-4">
              <h2 className="text-lg font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                Données &amp; confidentialité
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Les informations fournies servent uniquement à traiter ta demande.
                Les “infos techniques” (URL, navigateur, heure) aident à diagnostiquer
                un bug.
              </p>
            </section>
          </aside>

          <section className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] p-5 md:p-7">
            <h2 className="text-lg font-heading font-semibold text-amber-300 uppercase tracking-[0.18em] mb-4">
              Envoyer une demande
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-slate-300">
                  Catégorie
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs text-slate-300">
                  Sujet (optionnel)
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={120}
                    className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                    placeholder="Ex: Gains hors-ligne incorrects"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-slate-300">
                  Email {!isAuthenticated && <span className="text-amber-300">*</span>}
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    inputMode="email"
                    className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                    placeholder={isAuthenticated ? 'Optionnel' : 'ton@email.com'}
                  />
                </label>

                <label className="block text-xs text-slate-300">
                  Pseudo (optionnel)
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={32}
                    className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                    placeholder={currentUser?.username ? currentUser.username : 'Ton pseudo en jeu'}
                    disabled={!!currentUser?.username}
                  />
                </label>
              </div>

              <label className="block text-xs text-slate-300">
                Message <span className="text-amber-300">*</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  maxLength={4000}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                  placeholder="Dis-nous ce qui s’est passé, les étapes pour reproduire, et ce que tu attendais."
                />
                <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Plus c’est précis, plus c’est rapide.</span>
                  <span>{message.length}/4000</span>
                </div>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={includeTech}
                  onChange={(e) => setIncludeTech(e.target.checked)}
                  className="mt-0.5 accent-amber-400"
                />
                <span>Inclure les infos techniques (URL, navigateur, heure).</span>
              </label>

              {includeTech && (
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-300">
                  <p className="text-slate-400 mb-2">Aperçu :</p>
                  <ul className="space-y-1">
                    <li>
                      <span className="text-slate-500">URL :</span> {techInfo.pageUrl}
                    </li>
                    <li>
                      <span className="text-slate-500">Navigateur :</span> {techInfo.userAgent}
                    </li>
                    <li>
                      <span className="text-slate-500">Heure :</span> {techInfo.clientTimeIso}
                    </li>
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Envoi…' : 'Envoyer au support'}
              </button>
            </form>
          </section>
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;

