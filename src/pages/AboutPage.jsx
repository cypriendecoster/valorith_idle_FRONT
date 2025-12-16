import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        {/* Titre / intro */}
        <header className="mb-10 text-center">
          {/* Breadcrumb */}
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
              <li
                aria-current="page"
                className="text-amber-200 font-medium"
              >
                Page Lore de l&apos;univers
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Chroniques de la Forge Obscure
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            VALORITH FORGE <span className="text-amber-400">IDLE</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Une enclave de braise obstinée, perdue aux frontières de VALORITH : LES 12 ROYAUMES.
            Ici, il n&apos;y a qu&apos;un serment : forger, encore et encore.
          </p>
        </header>

        {/* Carte de lore */}
        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
              Un monde rongé par la rouille
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Ashkar n&apos;est plus qu&apos;un néant de métal brisé et de braises mourantes.
              Là où s&apos;élevaient jadis des citadelles de fer et de pierre, il ne reste
              que des forges silencieuses, étouffées par une rouille noire qui dévore tout
              ce qu&apos;elle touche.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Pourtant, dans l&apos;ombre, une forge demeure. Une seule. La vôtre. Une
              enclave de braise obstinée qui refuse de s&apos;éteindre.
            </p>
          </section>

          <section className="space-y-3 border-l border-amber-500/30 pl-4">
            <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
              L&apos;objectif unique : le Badge Suprême
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Ici, il n&apos;y a ni prophétie ni grand destin, seulement un serment silencieux :
              forger. Encore. Toujours. Jusqu&apos;à ce que le métal cède, que les enclumes
              se fendent et que vos mains ne puissent plus suivre le rythme des marteaux.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Au bout de cette obsession se trouve un seul artefact, murmuré dans les
              tavernes et craint des anciens maîtres de la forge : le{' '}
              <span className="text-amber-300 font-semibold">Badge Suprême</span>. Un
              insigne incréé, symbole ultime de maîtrise, capable de boire la rouille
              elle-même.
            </p>
          </section>

          <section className="space-y-3 border-l border-amber-500/30 pl-4">
            <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
              Lien avec VALORITH : Les 12 Royaumes
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              On raconte que le Badge Suprême n&apos;est pas né pour Ashkar seulement. Dans
              les profondeurs des grimoires des Arcanistes de Valorith, il est décrit comme
              un <span className="text-amber-300 font-semibold">artefact-pont</span> : un
              fragment de forge capable de déverser ses ressources au-delà de ce monde mourant.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Dans <strong>VALORITH : LES 12 ROYAUMES</strong>, ce badge aurait le pouvoir
              d&apos;alimenter les guerres, les pactes et les ascensions silencieuses des
              Rois et des Sœurs de l&apos;Ombre. Chaque lingot forgé ici, chaque goutte de
              sueur et de sang versée dans cette forge obscure, prépare en secret la chute
              ou le triomphe de ceux qui règnent là-bas.
            </p>
          </section>

          <section className="space-y-3 border-l border-amber-500/30 pl-4">
            <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
              Vous, Forgeron
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Vous n&apos;êtes ni héros ni élu. Vous êtes celui qui reste lorsque tous les
              autres ont fui. Celui qui accepte de laisser tourner la forge jusqu&apos;à ce
              que le temps lui-même se fissure.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Tant que les braises rougeoient, votre tâche est simple : nourrir la Forge,
              la pousser au-delà de ses limites, et gravir seul les marches qui mènent au
              Badge Suprême. Qu&apos;il devienne votre fardeau… ou votre couronne.
            </p>
          </section>

          <section className="space-y-3 border-t border-amber-500/20 pt-5">
            <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
              Par-delà l&apos;écran
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              VALORITH FORGE IDLE n&apos;est qu&apos;un fragment, un éclat de métal détaché
              du monde principal de <strong>VALORITH : LES 12 ROYAUMES</strong>. Une
              excroissance de forge née du besoin d&apos;observer ce qui se passe lorsque
              l&apos;on confie le pouvoir à la patience, à l&apos;endurance… et à
              l&apos;obsession.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-slate-200">
              Que vous laissiez tourner la forge en silence ou que vous surveilliez chaque
              étincelle, souvenez-vous : quelque part, dans un autre royaume, quelqu&apos;un
              bénéficiera des fruits de votre acharnement.
            </p>
          </section>
        </div>

        {/* Bouton retour */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleGoHome}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          >
            ← Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;





