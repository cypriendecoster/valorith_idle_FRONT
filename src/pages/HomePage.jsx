// Client/src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';

function HomePage({ isAuthenticated }) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const currentUser = authService.getCurrentUser();
    const isAdmin = !!currentUser && currentUser.role === 'ADMIN';

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const headerOffset = 72; // hauteur approx. de la navbar
        const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
        setIsMobileMenuOpen(false);
    };

    const handleNavTo = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
            {/* NAVBAR */}
            <header
                className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-20"
                role="banner"
            >
                <div className="max-w-6xl mx-auto w-full px-4 py-3 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <button
                        onClick={() => handleNavTo('/')}
                        className="flex items-center gap-3"
                        aria-label="Retour à la page d'accueil Valorith Forge Idle"
                    >
                        <img
                            src="/Assets/LOGO/Logo_gauche.png"
                            alt="Logo Valorith"
                            className="h-7 w-auto object-contain"
                        />

                        <div className="flex items-baseline gap-1 text-sm font-heading">
                            <span className="font-semibold tracking-wide">VALORITH</span>
                            <span className="text-amber-400 font-semibold">FORGE</span>
                            <span className="text-[10px] text-slate-400 ml-1 tracking-[0.25em]">
                                IDLE
                            </span>
                        </div>
                    </button>


                    {/* Desktop nav + actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <nav
                            className="flex items-center gap-4 text-xs text-slate-300"
                            aria-label="Navigation principale"
                        >
                            <button
                                onClick={() => handleNavTo('/help')}
                                className="hover:text-amber-300 transition-colors"
                            >
                                Aide / FAQ
                            </button>
                            <button
                                onClick={() => handleNavTo('/classement')}
                                className="hover:text-amber-300 transition-colors"
                            >
                                Classement
                            </button>
                            <button
                                onClick={() => handleNavTo('/patchnotes')}
                                className="hover:text-amber-300 transition-colors"
                            >
                                Patchnotes
                            </button>
                            {isAuthenticated && isAdmin && (
                                <button
                                    onClick={() => handleNavTo('/admin')}
                                    className="hover:text-amber-300 transition-colors"
                                >
                                    Admin
                                </button>
                            )}
                            <button
                                onClick={() => handleNavTo('/about')}
                                className="hover:text-amber-300 transition-colors"
                            >
                                À propos / Lore
                            </button>
                        </nav>

                        <div className="flex items-center gap-3 text-xs">
                            <button
                                onClick={() => handleNavTo(isAuthenticated ? '/game' : '/login')}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold transition-colors"
                            >
                                Jouer
                            </button>

                            {isAuthenticated ? (
                                <button
                                    onClick={() => handleNavTo('/profile')}
                                    className="px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-200 hover:bg-amber-500/10 transition-colors"
                                >
                                    Profil
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleNavTo('/login')}
                                    className="px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-200 hover:bg-amber-500/10 transition-colors"
                                >
                                    Se connecter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile burger */}
                    <button
                        type="button"
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800/80 transition-colors"
                        aria-label="Ouvrir le menu de navigation"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                    >
                        <span className="sr-only">Ouvrir le menu</span>
                        <div className="space-y-[3px]">
                            <span
                                className={`block h-0.5 w-5 bg-current transition-transform ${isMobileMenuOpen ? 'translate-y-[5px] rotate-45' : ''
                                    }`}
                            />
                            <span
                                className={`block h-0.5 w-5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                    }`}
                            />
                            <span
                                className={`block h-0.5 w-5 bg-current transition-transform ${isMobileMenuOpen ? '-translate-y-[5px] -rotate-45' : ''
                                    }`}
                            />
                        </div>
                    </button>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-800 bg-slate-950/95">
                        <div className="max-w-6xl mx-auto w-full px-4 py-3 space-y-3 text-xs text-slate-200">
                            <nav className="flex flex-col gap-2" aria-label="Navigation mobile">
                                <button
                                    onClick={() => handleNavTo('/help')}
                                    className="text-left hover:text-amber-300 transition-colors"
                                >
                                    Aide / FAQ
                                </button>
                                <button
                                    onClick={() => handleNavTo('/classement')}
                                    className="text-left hover:text-amber-300 transition-colors"
                                >
                                    Classement
                                </button>
                                <button
                                    onClick={() => handleNavTo('/patchnotes')}
                                    className="text-left hover:text-amber-300 transition-colors"
                                >
                                    Patchnotes
                                </button>
                                {isAuthenticated && isAdmin && (
                                    <button
                                        onClick={() => handleNavTo('/admin')}
                                        className="text-left hover:text-amber-300 transition-colors"
                                    >
                                        Admin
                                    </button>
                                )}
                                <button
                                    onClick={() => handleNavTo('/about')}
                                    className="text-left hover:text-amber-300 transition-colors"
                                >
                                    À propos / Lore
                                </button>
                            </nav>

                            <div className="pt-2 flex flex-wrap gap-2">
                                <button
                                    onClick={() =>
                                        handleNavTo(isAuthenticated ? '/game' : '/login')
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold transition-colors"
                                >
                                    Jouer
                                </button>

                                {isAuthenticated ? (
                                    <button
                                        onClick={() => handleNavTo('/profile')}
                                        className="px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-200 hover:bg-amber-500/10 transition-colors"
                                    >
                                        Profil
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleNavTo('/login')}
                                        className="px-3 py-1.5 rounded-lg border border-amber-400/60 text-amber-200 hover:bg-amber-500/10 transition-colors"
                                    >
                                        Se connecter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* SECTION 1 – HERO */}
                <section
                    className="relative flex items-center"
                    aria-labelledby="hero-title"
                    style={{
                        backgroundImage:
                            'url("/Assets/HEADER/HERO HEADER ACCUEIL.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-amber-900/20" />

                    <div className="relative max-w-6xl mx-auto w-full px-4 py-16 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">
                                Idle forge • Royaumes à débloquer
                            </p>

                            <h1
                                id="hero-title"
                                className="text-4xl md:text-5xl font-heading font-bold leading-tight"
                            >
                                VALORITH <span className="text-amber-400">FORGE</span> IDLE
                            </h1>

                            <p className="text-sm md:text-base text-slate-100 max-w-xl">
                                Débloque des royaumes, construis tes usines et laisse ta forge
                                produire pendant que tu es hors-ligne. Une progression chill,
                                orientée long terme.
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() =>
                                        handleNavTo(isAuthenticated ? '/game' : '/login')
                                    }
                                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm shadow-lg shadow-amber-500/30 transition-colors"
                                >
                                    Jouer maintenant
                                </button>

                                {!isAuthenticated && (
                                    <button
                                        onClick={() => handleNavTo('/login')}
                                        className="px-4 py-2.5 rounded-lg border border-amber-300/70 text-amber-100 text-sm hover:bg-amber-500/10 transition-colors"
                                    >
                                        Se connecter / Créer un compte
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-slate-200">
                                Pas de microtransactions, juste ta forge, tes royaumes et le
                                temps.
                            </p>
                        </div>

                        <div
                            className="flex-1 w-full max-w-md"
                            aria-label="Aperçu de l'interface du jeu"
                        >
                            <div className="relative factory-gradient rounded-2xl border border-amber-500/40 bg-black/60 overflow-hidden shadow-[0_0_45px_rgba(251,191,36,0.25)]">
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

                                <div className="p-4 border-b border-amber-500/30 flex items-center justify-between text-xs text-slate-200/90">
                                    <span className="font-semibold text-amber-300">
                                        Aperçu du Royaume
                                    </span>
                                    <span className="text-[10px] text-slate-300">
                                        Forge en activité • Idle ON
                                    </span>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="h-32 rounded-xl overflow-hidden border border-slate-700/70 bg-slate-900/70">
                                        <img
                                            src="/Assets/MOCKUP/mockup.png"
                                            alt="Aperçu du jeu Valorith Forge Idle"
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-200">
                                        <div
                                            className="relative rounded-lg bg-slate-900/80 border border-slate-700/80 p-2 h-24 flex flex-col justify-between overflow-hidden"
                                            style={{
                                                backgroundImage: 'url("/Assets/MOCKUP/Royaumes.png")',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                            aria-label="Royaume Valorith et ressource"
                                        >
                                            <div className="absolute inset-0 bg-slate-950/75" />
                                            <div className="relative z-10 space-y-0.5">
                                                <p className="text-[10px] text-amber-200">Royaume</p>
                                                <p className="font-semibold text-xs text-slate-50">
                                                    Valorith
                                                </p>
                                                <p className="text-[10px] text-slate-200">
                                                    Ressource : Lingots mystiques
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className="relative rounded-lg bg-slate-900/80 border border-slate-700/80 p-2 h-24 flex flex-col justify-between overflow-hidden"
                                            style={{
                                                backgroundImage: 'url("/Assets/MOCKUP/Usines.png")',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                            aria-label="Usines actives et bonus"
                                        >
                                            <div className="absolute inset-0 bg-slate-950/75" />
                                            <div className="relative z-10 space-y-0.5">
                                                <p className="text-[10px] text-amber-200">Usines</p>
                                                <p className="font-semibold text-xs text-slate-50">
                                                    4 actives
                                                </p>
                                                <p className="text-[10px] text-slate-200">
                                                    Bonus x2 tous les 50 niveaux
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className="relative rounded-lg bg-slate-900/80 border border-slate-700/80 p-2 h-24 flex flex-col justify-between overflow-hidden"
                                            style={{
                                                backgroundImage:
                                                    'url("/Assets/MOCKUP/Idle_gains.png")',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                            aria-label="Gains hors-ligne"
                                        >
                                            <div className="absolute inset-0 bg-slate-950/75" />
                                            <div className="relative z-10 space-y-0.5">
                                                <p className="text-[10px] text-amber-200">
                                                    Idle gains
                                                </p>
                                                <p className="font-semibold text-xs text-slate-50">
                                                    +12.4K /h
                                                </p>
                                                <p className="text-[10px] text-slate-200">
                                                    Forge continue hors-ligne
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 – Comment ça marche ? */}
                <section
                    id="how-it-works"
                    className="scroll-mt-24 border-t border-slate-800/80 bg-slate-950/60"
                    aria-labelledby="how-it-works-title"
                >
                    <div className="max-w-6xl mx-auto w-full px-4 py-16">
                        <div className="text-center mb-10">
                            <p className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-2">
                                Étapes
                            </p>
                            <h2
                                id="how-it-works-title"
                                className="text-2xl md:text-3xl font-heading font-semibold mb-2"
                            >
                                Comment ça marche ?
                            </h2>
                            <p className="text-sm text-slate-300 max-w-xl mx-auto">
                                En quelques étapes, ta forge passe de braises hésitantes à un
                                réseau d&apos;usines automatisées qui tournent pendant que tu
                                fais autre chose.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/20 p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-sm font-semibold">
                                        1
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src="/Assets/MOCKUP/Royaumes.png"
                                            alt="Icône royaume"
                                            loading="lazy"
                                            className="w-7 h-7 rounded-sm object-cover border border-slate-700/70"
                                        />
                                        <h3 className="text-sm font-semibold">
                                            Débloque les Royaumes
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Progresse à travers différents royaumes, chacun avec sa
                                    ressource unique, ses défis et ses bonus propres. Tu construis
                                    ta route de forgeron royaume après royaume.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/20 p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-sm font-semibold">
                                        2
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src="/Assets/MOCKUP/Usines.png"
                                            alt="Icône usines"
                                            loading="lazy"
                                            className="w-7 h-7 rounded-sm object-cover border border-slate-700/70"
                                        />
                                        <h3 className="text-sm font-semibold">
                                            Construis tes usines & utilise tes compétences
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Investis dans tes usines, améliore-les, débloque des
                                    compétences et des paliers de puissance. Chaque niveau compte
                                    et renforce ta production.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/20 p-5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-sm font-semibold">
                                        3
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src="/Assets/MOCKUP/Idle_gains.png"
                                            alt="Icône idle gains"
                                            loading="lazy"
                                            className="w-7 h-7 rounded-sm object-cover border border-slate-700/70"
                                        />
                                        <h3 className="text-sm font-semibold">
                                            Laisse la forge travailler hors-ligne
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Ferme le jeu, vis ta vie : tes forges continuent de produire.
                                    À ton retour, récupère tes gains idle et réinvestis pour
                                    pousser encore plus loin ta puissance.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 – Fonctionnalités clés */}
                <section
                    id="features"
                    className="scroll-mt-24 border-t border-slate-800 bg-slate-950/80"
                    aria-labelledby="features-title"
                >
                    <div className="max-w-6xl mx-auto w-full px-4 py-16">
                        <div className="text-center mb-10">
                            <p className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-2">
                                Gameplay
                            </p>
                            <h2
                                id="features-title"
                                className="text-2xl md:text-3xl font-heading font-semibold mb-2"
                            >
                                Fonctionnalités clés
                            </h2>
                            <p className="text-sm text-slate-300 max-w-xl mx-auto">
                                Tout ce qui fait tourner ta forge et rend la progression
                                satisfaisante sans te coller à l&apos;écran.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-4 text-xs text-slate-200">
                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/25 p-4">
                                <p className="text-[11px] text-amber-300/80 mb-1">
                                    Progression multi-mondes
                                </p>
                                <h3 className="text-sm font-semibold mb-1">
                                    Royaumes à débloquer
                                </h3>
                                <p className="text-[11px] text-slate-300">
                                    Enchaîne les royaumes, découvre de nouvelles ressources et
                                    adapte ta stratégie à chaque monde.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/25 p-4">
                                <p className="text-[11px] text-amber-300/80 mb-1">
                                    Usines & compétences
                                </p>
                                <h3 className="text-sm font-semibold mb-1">Usines & Skills</h3>
                                <p className="text-[11px] text-slate-300">
                                    Construis tes usines, améliore-les et combine des compétences
                                    pour booster ta production.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/25 p-4">
                                <p className="text-[11px] text-amber-300/80 mb-1">
                                    Idle gains
                                </p>
                                <h3 className="text-sm font-semibold mb-1">
                                    Progression hors ligne
                                </h3>
                                <p className="text-[11px] text-slate-300">
                                    La forge continue de produire pendant que tu es hors ligne.
                                    Reviens récupérer tes gains et repars plus fort.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-950/80 border border-amber-500/25 p-4">
                                <p className="text-[11px] text-amber-300/80 mb-1">
                                    Fin de jeu & prestige
                                </p>
                                <h3 className="text-sm font-semibold mb-1">
                                    Badge exclusif « Valorith : les 12 royaumes »
                                </h3>
                                <p className="text-[11px] text-slate-300">
                                    Termine les 12 royaumes pour débloquer un badge unique, preuve
                                    que tu as mené la forge à son apogée.
                                </p>
                                <p className="text-[11px] text-amber-200 mt-2">
                                    Ce badge octroie un bonus permanent de production pour toutes
                                    tes futures sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4 – Aperçu du jeu */}
                <section
                    className="border-t border-slate-800/80 bg-slate-950/60"
                    aria-labelledby="preview-title"
                >
                    <div className="max-w-6xl mx-auto w-full px-4 py-16">
                        <div className="flex flex-col md:flex-row items-start gap-10">
                            <div className="flex-1 space-y-4">
                                <p className="text-xs uppercase tracking-[0.25em] text-amber-300/80 mb-1">
                                    Aperçu
                                </p>
                                <h2
                                    id="preview-title"
                                    className="text-2xl md:text-3xl font-heading font-semibold"
                                >
                                    Aperçu du jeu
                                </h2>
                                <p className="text-sm text-slate-300 max-w-md">
                                    Oriente ta forge sur le long terme : pas de microtransactions
                                    agressives, juste une progression chill, pensée pour les
                                    sessions courtes et régulières.
                                </p>
                                <p className="text-xs text-slate-400">
                                    “Pas de microtransactions, progression chill, orientée long
                                    terme.”
                                </p>
                            </div>

                            <div className="flex-1 grid gap-4 md:grid-cols-2 w-full">
                                <div className="rounded-xl overflow-hidden border border-slate-700/70 bg-slate-900/70 h-32">
                                    <img
                                        src="/Assets/GAMECAPTURE/Royaume_ressource.png"
                                        alt="Capture du royaume et de la ressource principale dans Valorith Forge Idle"
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="rounded-xl overflow-hidden border border-slate-700/70 bg-slate-900/70 h-32">
                                    <img
                                        src="/Assets/GAMECAPTURE/Usine_competence.png"
                                        alt="Capture des usines et des compétences dans Valorith Forge Idle"
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5 – Dernières nouveautés / patch notes */}
                <section
                    id="patch-notes"
                    className="scroll-mt-24 border-t border-slate-800 bg-slate-950/80"
                    aria-labelledby="patch-notes-title"
                >
                    <div className="max-w-6xl mx-auto w-full px-4 py-16">
                        <div className="max-w-xl mx-auto rounded-2xl border border-amber-500/30 bg-black/40 p-6 shadow-[0_0_35px_rgba(251,191,36,0.18)]">
                            <div className="flex items-baseline justify-between mb-3">
                                <h2
                                    id="patch-notes-title"
                                    className="text-lg font-heading font-semibold"
                                >
                                    Dernières nouveautés
                                </h2>
                                <span className="text-[11px] text-amber-300/80">
                                    Dernière mise à jour : 10/12/2025
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mb-3">
                                Quelques points clés du dernier patch :
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-200">
                                <li>Barre x10 / x100 / max pour les améliorations.</li>
                                <li>Bonus x2 tous les 50 niveaux sur les usines.</li>
                                <li>Les Royaumes affichent désormais leur ressource unique.</li>
                                <li>Améliorations de lisibilité de la Game Page.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* SECTION 6 – Appel à l'action final */}
                <section className="border-t border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40">
                    <div className="max-w-6xl mx-auto w-full px-4 py-14">
                        <div className="rounded-2xl border border-amber-500/30 bg-black/40 px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-heading font-semibold mb-2">
                                    Prêt à rallumer la forge ?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Rejoins ton royaume, relance tes usines et laisse la forge
                                    travailler pour toi pendant que tu fais autre chose. Un badge
                                    exclusif t&apos;attend si tu viens à bout des 12 royaumes.
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    handleNavTo(isAuthenticated ? '/game' : '/login')
                                }
                                className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm shadow-lg shadow-amber-500/30 transition-colors"
                            >
                                Lancer le jeu
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* SECTION 7 – Footer */}
            <footer className="border-t border-slate-800/80 bg-slate-950/90">
                <div className="max-w-6xl mx-auto w-full px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <button
                            type="button"
                            onClick={() => handleNavTo('/help')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Aide / FAQ
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/patchnotes')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Patchnotes
                        </button>
                        {isAuthenticated && isAdmin && (
                            <button
                                type="button"
                                onClick={() => handleNavTo('/admin')}
                                className="hover:text-amber-300 transition-colors"
                            >
                                Admin
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => handleNavTo('/about')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            À propos
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/contact')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Contact / Support
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/legal#mentions')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Mentions légales
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/legal#privacy')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Confidentialité
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/legal#terms')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            CGU
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/legal#cookies')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Cookies
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNavTo('/legal#credits')}
                            className="hover:text-amber-300 transition-colors"
                        >
                            Crédits
                        </button>
                    </div>
                    <div className="text-center md:text-right space-y-1">
                        <p className="text-[11px] text-slate-500">
                            © {new Date().getFullYear()} Valorith Forge Idle. Tous droits réservés.
                        </p>
                        {import.meta.env.VITE_APP_VERSION && (
                            <p className="text-[11px] text-slate-600">
                                Version {import.meta.env.VITE_APP_VERSION}
                            </p>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
