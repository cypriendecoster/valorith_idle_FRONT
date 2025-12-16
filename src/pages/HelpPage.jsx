import React from 'react';
import { useNavigate } from 'react-router-dom';

const HelpPage = () => {
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
                                Aide &amp; FAQ
                            </li>
                        </ol>
                    </nav>

                    <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
                        Guide du Forgeron Patient
                    </p>
                    <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-3">
                        Aide &amp; FAQ&nbsp;
                        <span className="text-amber-400">VALORITH FORGE IDLE</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
                        Cette page répond aux questions les plus fréquentes sur le
                        fonctionnement du jeu, la progression et ce qu&apos;il faut faire
                        lorsque vous avez l&apos;impression d&apos;être bloqué.
                    </p>
                </header>

                {/* Carte principale */}
                <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-6 md:px-8 md:py-9 space-y-8">
                    {/* 1. Introduction rapide */}
                    <section className="space-y-3">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            1. Principe du jeu
                        </h2>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            VALORITH FORGE IDLE est un jeu de type idle : vous gérez
                            des forges, produisez des ressources, améliorez vos installations
                            et laissez la production tourner même lorsque vous n'êtes
                            pas devant l'écran.
                        </p>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Votre objectif est simple : faire grandir vos forges, débloquer
                            de nouveaux paliers de puissance et des Royaumes, et vous rapprocher, lentement
                            mais sûrement, du{' '}
                            <span className="text-amber-300 font-semibold">Badge Suprême</span>.
                        </p>
                    </section>

                    {/* 2. Comment jouer ? */}
                    <section className="space-y-3 border-l border-amber-500/30 pl-4">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            2. Comment jouer ?
                        </h2>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Comment gagner des ressources ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Vous gagnez des ressources principalement en laissant la forge
                            travailler. Selon votre progression, vous pouvez produire du Charbon de Guerre
                            , de l'Essence Abyssale ou d'autres ressources.
                            Certaines
                            actions demandent un clic, d'autres sont entièrement
                            automatisées.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Que faire au début ?
                        </h3>
                        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed text-slate-200 space-y-1">
                            <li>Commencez par lancer la production de base de votre forge.</li>
                            <li>Utilisez les ressources produites pour acheter des améliorations.</li>
                            <li>Débloquez vos premieres compétences pour que la forge tourne plus facilement.</li>
                            <li>Revenez régulièrement pour investir vos gains dans de nouveaux paliers.</li>
                        </ul>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Que se passe-t-il quand je ferme le jeu ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Le jeu est pensé pour continuer à produire lorsque vous êtes
                            déconnecté. Lorsque vous relancez VALORITH FORGE IDLE, le jeu
                            calcule ce que votre forge a produit pendant votre absence, avec
                            des limites pour éviter les abus (par exemple un maximum de
                            production hors-ligne et sous côté par rapport au jeu allumé).
                        </p>
                    </section>

                    {/* 3. Améliorations et progression */}
                    <section className="space-y-3 border-l border-amber-500/30 pl-4">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            3. Améliorations &amp; progression
                        </h2>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            À quoi servent les améliorations ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Les améliorations augmentent votre production, réduisent les temps
                            d'attente, débloquent de nouvelles ressources ou de nouvelles
                            mécaniques de jeu. Investir régulièrement dans vos upgrades est
                            indispensable pour ne pas plafonner.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Comment débloquer de nouvelles zones / machines ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Certains contenus se débloquent lorsque vous atteignez un certain
                            niveau, accumulez assez de ressources ou complétez des objectifs.
                            Si une zone est encore verrouillée, survolez ou cliquez dessus :
                            une condition d&apos;accès devrait être indiquée.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Je suis bloqué, je ne progresse plus, que faire ?
                        </h3>
                        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed text-slate-200 space-y-1">
                            <li>Vérifiez que toutes vos machines / lignes de forge sont bien actives.</li>
                            <li>Investissez dans des améliorations qui augmentent la production automatique.</li>
                            <li>Regardez si une nouvelle mécanique (compétence, usine, Royaume) est déblocable.</li>
                            <li>Ralentissez le spam de clics et concentrez-vous sur l'optimisation à long terme.</li>
                        </ul>
                    </section>

                    {/* 4. Compétences / talents */}
                    <section className="space-y-3 border-l border-amber-500/30 pl-4">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            4. Compétences &amp; talents
                        </h2>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            À quoi servent les compétences ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Les compétences vous permettent de spécialiser votre forgeron :
                            augmenter la production, réduire les coûts, améliorer les gains
                            hors-ligne, sécuriser certaines actions, etc. Elles complètent les
                            améliorations classiques de la forge.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Comment améliorer mes compétences ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Chaque compétence à un coût de ressources pour les compétences passives,
                            et un coût de temps (qui est le vôtre) pour les compétences actives.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Puis-je réinitialiser mes compétences ?
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Il n'est pas possible de réinitialiser les compétences passives,
                            mais vous devez attendre un certain laps de temps pour réutiliser les compétences
                            actives.
                        </p>
                    </section>

                    {/* 5. Interface */}
                    <section className="space-y-3 border-l border-amber-500/30 pl-4">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            5. Interface &amp; onglets
                        </h2>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            L'interface est organisée en plusieurs sections, pour simplifier
                            la lisibilité et la continuité d'un IDLE traditionnel.
                        </p>
                        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed text-slate-200 space-y-1">
                            <li>
                                <span className="text-amber-200 font-semibold">Usines :</span>{' '}
                                zone principale de production.
                            </li>
                            <li>
                                <span className="text-amber-200 font-semibold">Compétences passives :</span>{' '}
                                amélioration des machines, de la production, réduction des coûts, etc..
                            </li>
                            <li>
                                <span className="text-amber-200 font-semibold">Compétences actives:</span>{' '}
                                Grande amélioration de la production, réduction des coûts, etc... pendant un temps limité
                            </li>
                            <li>
                                <span className="text-amber-200 font-semibold">Profil :</span>{' '}
                                progression globale, statistiques et éventuellement d'autres
                                systèmes liés au compte.
                            </li>
                        </ul>
                    </section>

                    {/* 6. Problèmes fréquents */}
                    <section className="space-y-3 border-l border-amber-500/30 pl-4">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            6. Problèmes fréquents
                        </h2>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Ma production est à 0, que se passe-t-il ?
                        </h3>
                        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed text-slate-200 space-y-1">
                            <li>Vérifiez que la machine ou la ligne concernée est bien activée.</li>
                            <li>Assurez-vous que vous avez assez de ressources d'entrée.</li>
                            <li>
                                Si ce souci se présente, veuillez contacter la page support rapidement.
                            </li>
                        </ul>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Je ne vois pas mes gains hors-ligne.
                        </h3>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Certains navigateurs ou paramètres peuvent limiter la précision du
                            calcul hors-ligne. Assurez-vous d'utiliser un navigateur
                            récent, de ne pas changer l'heure de votre système et de bien
                            recharger le jeu complètement.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold text-amber-200">
                            Le jeu semble lent ou buggé.
                        </h3>
                        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed text-slate-200 space-y-1">
                            <li>Essayez de recharger la page du jeu.</li>
                            <li>Fermez d'autres onglets très gourmands en ressources.</li>
                            <li>
                                Si le problème persiste, contactez le développeur en indiquant
                                votre navigateur et ce que vous faisiez juste avant le bug.
                            </li>
                        </ul>
                    </section>

                    {/* 7. Contact */}
                    <section className="space-y-3 border-t border-amber-500/20 pt-5">
                        <h2 className="text-lg md:text-xl font-heading font-semibold text-amber-300 uppercase tracking-[0.18em]">
                            7. Contact &amp; retours
                        </h2>
                        <p className="text-sm md:text-base leading-relaxed text-slate-200">
                            Vous avez trouvé un bug, une idée d'amélioration ou une
                            question qui n'apparaît pas ici ? N'hésitez pas à
                            utiliser la page support pour nous envoyer un message.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/contact')}
                            className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                        >
                            Ouvrir Contact / Support
                        </button>
                    </section>
                </div>

                {/* Bouton retour */}
                <div className="mt-10 text-center">
                    <button
                        type="button"
                        onClick={handleGoHome}
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                    >
                        ← Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
