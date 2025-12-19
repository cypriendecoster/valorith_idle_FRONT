export default function PlayerActionsFactories({
  inputClass = '',
  factories = [],
  playerFactoryId,
  setPlayerFactoryId = () => {},
  playerFactoryLevel,
  setPlayerFactoryLevel = () => {},
  playerFactoryLevelById = new Map(),
  playerResourceSaving = false,
  handlePlayerSetFactoryLevel,
}) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <div className="md:col-span-2">
        <p className="text-[11px] uppercase tracking-widest text-slate-400">Usine</p>
        <select
          className={inputClass}
          aria-label="Usine"
          value={playerFactoryId}
          onChange={(e) => {
            const nextId = e.target.value;
            setPlayerFactoryId(nextId);
            if (!nextId) {
              setPlayerFactoryLevel('');
              return;
            }
            const current = playerFactoryLevelById.get(Number(nextId));
            if (current != null && Number.isFinite(current)) {
              setPlayerFactoryLevel(String(current));
            }
          }}
        >
          <option value="">Choisir une usine</option>
          {factories.map((factory) => (
            <option key={factory.id} value={factory.id}>
              #{factory.id} - {factory.code} - {factory.name} (actuel:{' '}
              {playerFactoryLevelById.get(Number(factory.id)) ?? 0})
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-slate-400">Niveau</p>
        <input
          className={inputClass}
          inputMode="numeric"
          aria-label="Niveau usine"
          placeholder={
            playerFactoryId
              ? `Niveau (actuel: ${
                  playerFactoryLevelById.get(Number(playerFactoryId)) ?? 0
                })`
              : 'Niveau'
          }
          value={playerFactoryLevel}
          onChange={(e) => setPlayerFactoryLevel(e.target.value)}
        />
      </div>
      <button
        type="button"
        disabled={playerResourceSaving}
        onClick={handlePlayerSetFactoryLevel}
        className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Modifier le niveau
      </button>
    </div>
  );
}
