export default function PlayerMiniStickyHeader({
  selectedPlayerId,
  selectedPlayer,
  onBack,
  onRefresh,
}) {
  return (
    <div className="sticky top-0 z-20 -mx-3 px-3 py-3 bg-slate-950/85 backdrop-blur border-b border-slate-800/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          {selectedPlayerId ? (
            <button
              type="button"
              onClick={onBack}
              className="lg:hidden mb-2 px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              {'<'} Retour
            </button>
          ) : null}
          <p className="text-xs text-slate-300">Gestion du joueur</p>
          {selectedPlayer ? (
            <p className="text-sm text-slate-100 mt-1">
              <span className="text-amber-300 font-semibold">
                {selectedPlayer.username}
              </span>{' '}
              <span className="text-slate-500">#{selectedPlayer.id}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-1">
              Selectionne un joueur a gauche.
            </p>
          )}
        </div>

        {selectedPlayerId && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
          >
            Rafraichir
          </button>
        )}
      </div>
    </div>
  );
}
