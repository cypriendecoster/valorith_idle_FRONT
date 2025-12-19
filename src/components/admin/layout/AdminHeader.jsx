export default function AdminHeader({
  onHome,
  eyebrow = "Outils d'administration",
  title = 'Panneau Admin',
  subtitle = 'Balance, endgame, support et outils joueur (debug / assistance).',
}) {
  return (
    <header className="mb-8 text-center">
      <nav
        className="mb-4 text-[11px] md:text-xs text-slate-400"
        aria-label="Fil d'Ariane"
      >
        <ol className="flex items-center justify-center gap-1">
          <li>
            <button
              type="button"
              onClick={onHome}
              className="hover:text-amber-300 hover:underline underline-offset-2 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70 rounded-sm"
            >
              Accueil
            </button>
          </li>
          <li aria-hidden="true" className="text-slate-600 mx-1">
            /
          </li>
          <li aria-current="page" className="text-amber-200 font-medium">
            Admin
          </li>
        </ol>
      </nav>

      <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
        {eyebrow}
      </p>
      <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-2">
        {title}
      </h1>
      <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto">
        {subtitle}
      </p>
    </header>
  );
}

