export default function EndgamePanel({
  endgameTab = 'requirements',
  onTabChange,
  requirementsCount = 0,
  rankingsCount = 0,
  onCreateRequirement,
  onRefresh,
  loading = false,
  requirementsContent,
  rankingsContent,
  createForm,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('requirements')}
            className={`px-3 py-1 rounded-md border text-xs transition-colors ${
              endgameTab === 'requirements'
                ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
            }`}
          >
            Regles <span className="text-[11px] text-slate-400">({requirementsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('rankings')}
            className={`px-3 py-1 rounded-md border text-xs transition-colors ${
              endgameTab === 'rankings'
                ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
            }`}
          >
            Classement <span className="text-[11px] text-slate-400">({rankingsCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {endgameTab === 'requirements' && (
            <button
              type="button"
              onClick={onCreateRequirement}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold transition-colors"
            >
              Creer une regle
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : 'Rafraichir'}
          </button>
        </div>
      </div>

      {endgameTab === 'requirements' ? (
        <>
          {createForm || null}
          {requirementsContent || null}
        </>
      ) : (
        rankingsContent || null
      )}
    </div>
  );
}
