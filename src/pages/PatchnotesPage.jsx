import React from 'react';
import { useNavigate } from 'react-router-dom';

function PatchnotesPage() {
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
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
                Patchnotes / Mises à jour
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Dernières nouveautés
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            PATCHNOTES
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Retrouve ici les nouveautés, améliorations et corrections apportées au jeu.
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-6">
          <div>
            <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
              Dernières nouveautés
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Dernière mise à jour :{' '}
              <span className="text-slate-200">10/12/2025</span>
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Quelques points clés du dernier patch :
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-slate-200">
              <li>Barre x10 / x100 / max pour les améliorations.</li>
              <li>Bonus x2 tous les 50 niveaux sur les usines.</li>
              <li>Les Royaumes affichent désormais leur ressource unique.</li>
              <li>Améliorations de lisibilité de la Game Page.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatchnotesPage;

