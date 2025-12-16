import React from 'react';
import { useNavigate } from 'react-router-dom';

function Section({ id, title, children }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
        {title}
      </h2>
      <div className="text-sm md:text-base leading-relaxed text-slate-200 space-y-2">
        {children}
      </div>
    </section>
  );
}

function LegalPage() {
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
                Informations légales
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Transparence
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
            Mentions légales &amp; politiques
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Page modèle à compléter (nom/raison sociale, adresse, hébergeur, etc.).
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-8">
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[
              ['mentions', 'Mentions'],
              ['privacy', 'Confidentialité'],
              ['terms', 'CGU'],
              ['cookies', 'Cookies'],
              ['credits', 'Crédits'],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-3 py-1 rounded-md border border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <Section id="mentions" title="Mentions légales">
            <p>
              Éditeur du site : <span className="text-amber-200">À compléter</span>
            </p>
            <p>
              Contact : <span className="text-amber-200">À compléter</span>
            </p>
            <p>
              Hébergeur : <span className="text-amber-200">À compléter</span>
            </p>
            <p className="text-xs text-slate-400">
              Conseil : renseigne ton nom/raison sociale, adresse, SIRET (si
              applicable), et les infos de l’hébergeur.
            </p>
          </Section>

          <Section id="privacy" title="Politique de confidentialité (RGPD)">
            <p>
              Données collectées : compte (email/pseudo), progression de jeu,
              statistiques (temps de jeu), et tickets support.
            </p>
            <p>
              Finalités : authentification, sauvegarde de progression, affichage du
              classement, support et amélioration du jeu.
            </p>
            <p>
              Durées de conservation : <span className="text-amber-200">à préciser</span>{' '}
              (ex : tant que le compte est actif, puis suppression après X mois).
            </p>
            <p>
              Droits : accès, rectification, suppression. Contact via la page support.
            </p>
          </Section>

          <Section id="terms" title="Conditions Générales d’Utilisation (CGU)">
            <p>
              Le service est fourni “en l’état”, sans garantie de disponibilité
              permanente.
            </p>
            <p>
              Interdictions : triche/automation abusive, exploitation de failles,
              atteinte au service.
            </p>
            <p>
              Modération : possibilité de suspension en cas d’abus.
            </p>
          </Section>

          <Section id="cookies" title="Cookies">
            <p>
              Cookies/stockage technique : conservation de session (token), préférences
              éventuelles.
            </p>
            <p>
              Analytics / publicité :{' '}
              <span className="text-amber-200">à compléter</span> (si tu ajoutes du tracking,
              il faudra un bandeau de consentement).
            </p>
          </Section>

          <Section id="credits" title="Crédits">
            <p>
              Illustrations, icônes, sons : <span className="text-amber-200">à compléter</span>
            </p>
            <p className="text-xs text-slate-400">
              Note : indique les auteurs/sources/licences des assets tiers.
            </p>
          </Section>
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

export default LegalPage;

