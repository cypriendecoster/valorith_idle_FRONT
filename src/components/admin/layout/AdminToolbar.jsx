import DirtyIndicator from './DirtyIndicator';

export default function AdminToolbar({
  dirtyCount = 0,
  searchValue,
  searchAriaLabel,
  searchPlaceholder,
  onSearchChange,
  showCreate = false,
  onCreate,
  createLabel = 'Créer',
  onReset,
  resetLabel = 'Reset',
  resetAriaLabel = 'Réinitialiser la recherche',
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
      <DirtyIndicator count={dirtyCount} />

      <input
        value={searchValue}
        aria-label={searchAriaLabel}
        onChange={(e) => onSearchChange?.(e.target.value)}
        placeholder={searchPlaceholder}
        className="flex-1 min-w-0 md:flex-none md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
      />

      {showCreate ? (
        <button
          type="button"
          onClick={onCreate}
          className="shrink-0 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold transition-colors"
        >
          {createLabel}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onReset}
        aria-label={resetAriaLabel}
        className="shrink-0 px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
      >
        {resetLabel}
      </button>
    </div>
  );
}
