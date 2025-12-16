import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { leaderboardService } from '../services/LeaderboardService';

function formatDuration(totalSeconds) {
  const s = Math.max(0, Number(totalSeconds) || 0);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}j`);
  parts.push(`${hours.toString().padStart(2, '0')}h`);
  parts.push(`${minutes.toString().padStart(2, '0')}m`);
  parts.push(`${seconds.toString().padStart(2, '0')}s`);
  return parts.join(' ');
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LeaderboardPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    leaderboardService
      .getCompletions({ limit: 200 })
      .then((res) => {
        if (cancelled) return;
        setItems(res?.data?.items || []);
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        setToast({
          type: 'error',
          message:
            err?.response?.data?.message ||
            'Impossible de charger le classement.',
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

  const rows = useMemo(() => {
    return (items || []).map((it, idx) => ({
      rank: idx + 1,
      username: it.username || `Joueur #${it.userId ?? '?'}`,
      duration: formatDuration(it.completionSeconds),
      completedAt: formatDateTime(it.completedAt),
    }));
  }, [items]);

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
                Classement
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Hall des légendes
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Classement&nbsp;
            <span className="text-amber-400">100%</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Ici s’affichent les joueurs ayant débloqué tous les royaumes. Le temps
            correspond à la durée entre la création du compte et le déblocage du
            dernier royaume.
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9">
          {loading ? (
            <p className="text-sm text-slate-300">Chargement…</p>
          ) : rows.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-200">
                Aucun joueur n’a encore terminé à 100%.
              </p>
              <p className="text-xs text-slate-400">
                Dès qu’un joueur débloque tous les royaumes, il apparaîtra ici.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-widest text-slate-400">
                  <tr className="border-b border-amber-500/20">
                    <th className="py-3 pr-3">#</th>
                    <th className="py-3 pr-3">Joueur</th>
                    <th className="py-3 pr-3">Temps</th>
                    <th className="py-3">Terminé le</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={`${r.rank}-${r.username}`}
                      className="border-b border-slate-800/60 hover:bg-slate-900/30"
                    >
                      <td className="py-3 pr-3 font-mono text-amber-300">
                        {r.rank}
                      </td>
                      <td className="py-3 pr-3 font-semibold text-slate-100">
                        {r.username}
                      </td>
                      <td className="py-3 pr-3 font-mono text-amber-200">
                        {r.duration}
                      </td>
                      <td className="py-3 text-slate-300">{r.completedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;

