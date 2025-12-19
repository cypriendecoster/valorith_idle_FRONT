export default function PlayerActionsRealms({
  inputClass = '',
  realms = [],
  playerRealmCode,
  setPlayerRealmCode = () => {},
  playerRealmActivateId,
  setPlayerRealmActivateId = () => {},
  playerResourceSaving = false,
  handlePlayerUnlockRealm,
  handlePlayerActivateRealm,
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
      <p className="text-xs text-slate-300 font-semibold">Royaumes</p>
      <div className="grid gap-2 md:grid-cols-3">
        <select
          className={`${inputClass} md:col-span-2`}
          value={playerRealmCode}
          onChange={(e) => setPlayerRealmCode(e.target.value)}
        >
          <option value="">Debloquer un royaume</option>
          {realms.map((realm) => (
            <option key={realm.id} value={realm.code}>
              {realm.code} - {realm.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={playerResourceSaving}
          onClick={handlePlayerUnlockRealm}
          className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
        >
          Debloquer
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select
          className={`${inputClass} md:col-span-2`}
          value={playerRealmActivateId}
          onChange={(e) => setPlayerRealmActivateId(e.target.value)}
        >
          <option value="">Activer un royaume (id)</option>
          {realms.map((realm) => (
            <option key={realm.id} value={realm.id}>
              #{realm.id} - {realm.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={playerResourceSaving}
          onClick={handlePlayerActivateRealm}
          className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Activer
        </button>
      </div>
    </div>
  );
}
