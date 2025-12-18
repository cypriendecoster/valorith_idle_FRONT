import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Toast from '../components/Toast';

function StatusBadge({ ok, children }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${
        ok
          ? 'border-emerald-500/40 text-emerald-200 bg-emerald-950/30'
          : 'border-red-500/40 text-red-200 bg-red-950/30'
      }`}
    >
      {children}
    </span>
  );
}

function StatusPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/health')
      .then((res) => {
        if (cancelled) return;
        setStatus(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        setToast({
          type: 'error',
          message:
            err?.response?.data?.message ||
            'Impossible de récupérer le statut du serveur.',
        });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  const ok = status?.status === 'ok';

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
                  onClick={() => navigate('/')}
                  className="hover:text-amber-300 hover:underline underline-offset-2 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70 rounded-sm"
                >
                  Accueil
                </button>
              </li>
              <li aria-hidden="true" className="text-slate-600 mx-1">
                /
              </li>
              <li aria-current="page" className="text-amber-200 font-medium">
                Statut
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Service
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Statut du serveur
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Vérifie rapidement si l’API et la base de données répondent.
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-300">Chargement…</p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-200">API</p>
                <StatusBadge ok={ok}>{ok ? 'OK' : 'KO'}</StatusBadge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-200">Base de données</p>
                <StatusBadge ok={status?.db === 'connected'}>
                  {status?.db || 'unknown'}
                </StatusBadge>
              </div>
              {status?.message && (
                <p className="text-xs text-slate-400">{status.message}</p>
              )}
            </>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
