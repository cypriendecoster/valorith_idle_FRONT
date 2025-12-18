import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Erreur 404
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Page introuvable
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Cette page n’existe pas (ou a été déplacée).
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-4">
          <p className="text-sm text-slate-300">
            Tu peux retourner à l’accueil, ou revenir à la page précédente.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
            >
              Aller à l’accueil
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-500/40 text-slate-200 text-xs md:text-sm hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-slate-400/60"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;

