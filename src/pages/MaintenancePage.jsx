import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Toast from '../components/Toast';

function MaintenancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState(null);

  const redirectAfter = useMemo(() => {
    try {
      return sessionStorage.getItem('postMaintenanceRedirect');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get('/api/status')
      .then((res) => {
        if (cancelled) return;
        setStatus(res.data);
      })
      .catch((err) => {
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

  const isMaintenance =
    status?.maintenance === true || status?.status === 'maintenance';

  const handleRetry = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/status');
      setStatus(res.data);

      const maintenanceNow =
        res?.data?.maintenance === true || res?.data?.status === 'maintenance';

      if (!maintenanceNow) {
        const target = redirectAfter || '/';
        try {
          sessionStorage.removeItem('postMaintenanceRedirect');
        } catch {
          // ignore
        }
        navigate(target, { replace: true });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Le serveur ne répond pas, réessaie dans un instant.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <Toast toast={toast} />

      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Statut
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Maintenance
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            {loading
              ? 'Vérification en cours…'
              : isMaintenance
                ? status?.message ||
                  'Le service est temporairement indisponible.'
                : 'Le service est disponible.'}
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-4">
          {isMaintenance ? (
            <div className="text-sm text-slate-300 space-y-2">
              <p>
                Le jeu est en maintenance. Réessaie dans quelques instants.
              </p>
              {status?.retryAfterSeconds ? (
                <p className="text-xs text-slate-400">
                  Conseil : réessaie dans ~{status.retryAfterSeconds}s.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-300">
              Tout est bon. Tu peux revenir au jeu.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Chargement…' : 'Réessayer'}
            </button>
            {!isMaintenance ? (
              <button
                type="button"
                onClick={() => navigate(redirectAfter || '/game', { replace: true })}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-500/40 text-slate-200 text-xs md:text-sm hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-slate-400/60"
              >
                Revenir
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;

