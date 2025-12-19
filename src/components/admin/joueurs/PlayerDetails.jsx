import A11yDetailsWrap from '../../ui/A11yDetailsWrap';

export default function PlayerDetails({
  selectedPlayerId,
  selectedPlayer,
  onBack,
  refreshSelectedPlayer,
  inputClass = '',
  realms = [],
  factories = [],
  skills = [],
  resources = [],
  playerRealmCode,
  setPlayerRealmCode = () => {},
  playerRealmActivateId,
  setPlayerRealmActivateId = () => {},
  playerFactoryId,
  setPlayerFactoryId = () => {},
  playerFactoryLevel,
  setPlayerFactoryLevel = () => {},
  playerFactoryLevelById = new Map(),
  playerSkillId,
  setPlayerSkillId = () => {},
  playerSkillLevel,
  setPlayerSkillLevel = () => {},
  playerSkillLevelById = new Map(),
  playerResourceId,
  setPlayerResourceId = () => {},
  playerResourceAmount,
  setPlayerResourceAmount = () => {},
  playerResourceSaving = false,
  handlePlayerUnlockRealm,
  handlePlayerActivateRealm,
  handlePlayerSetFactoryLevel,
  handlePlayerSetSkillLevel,
  handlePlayerAddResource,
  handlePlayerRemoveResource,
  handlePlayerSet,
  selectedPlayerResources = [],
  formatIntegerFull,
  formatIntegerCompact,
  playerDangerLoading = false,
  requestPlayerReset,
  requestPlayerDelete,
}) {
  return (
    <>
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
            {selectedPlayer ? (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
                <p className="truncate">
                  <span className="text-slate-500">Email:</span>{' '}
                  <span className="text-slate-200">{selectedPlayer.email || '-'}</span>
                </p>
                <p className="truncate">
                  <span className="text-slate-500">Role:</span>{' '}
                  <span className="text-slate-200">{selectedPlayer.role || '-'}</span>
                </p>
                <p className="col-span-2 truncate">
                  <span className="text-slate-500">Derniere connexion:</span>{' '}
                  <span className="text-slate-200">
                    {selectedPlayer.last_login_at
                      ? new Date(selectedPlayer.last_login_at).toLocaleString('fr-FR')
                      : '-'}
                  </span>
                </p>
              </div>
            ) : null}
          </div>

          {selectedPlayerId && (
            <button
              type="button"
              onClick={refreshSelectedPlayer}
              className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              Rafraichir
            </button>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <div className="space-y-3">
          <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
            <p className="text-xs text-slate-300 font-semibold">Royaumes</p>
            <div className="grid gap-2 md:grid-cols-3">
              <select
                className={`${inputClass} md:col-span-2`}
                value={playerRealmCode}
                onChange={(e) => setPlayerRealmCode(e.target.value)}
              >
                <option value="">Debloquer un royaume</option>
                {realms.map((r) => (
                  <option key={r.id} value={r.code}>
                    {r.code} - {r.name}
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
                {realms.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.id} - {r.name}
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

          <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
            <p className="text-xs text-slate-300 font-semibold">Niveaux usines / competences</p>
            <div className="grid gap-2 md:grid-cols-4">
              <select
                className={`${inputClass} md:col-span-2`}
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
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    #{f.id} - {f.code} - {f.name} (actuel:{' '}
                    {playerFactoryLevelById.get(Number(f.id)) ?? 0})
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                inputMode="numeric"
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
              <button
                type="button"
                disabled={playerResourceSaving}
                onClick={handlePlayerSetFactoryLevel}
                className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Modifier le niveau
              </button>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <select
                className={`${inputClass} md:col-span-2`}
                value={playerSkillId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setPlayerSkillId(nextId);
                  if (!nextId) {
                    setPlayerSkillLevel('');
                    return;
                  }
                  const current = playerSkillLevelById.get(Number(nextId));
                  if (current != null && Number.isFinite(current)) {
                    setPlayerSkillLevel(String(current));
                  }
                }}
              >
                <option value="">Choisir une competence</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{s.id} - {s.code} - {s.name} (actuel:{' '}
                    {playerSkillLevelById.get(Number(s.id)) ?? 0})
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder={
                  playerSkillId
                    ? `Niveau (actuel: ${
                        playerSkillLevelById.get(Number(playerSkillId)) ?? 0
                      })`
                    : 'Niveau'
                }
                value={playerSkillLevel}
                onChange={(e) => setPlayerSkillLevel(e.target.value)}
              />
              <button
                type="button"
                disabled={playerResourceSaving}
                onClick={handlePlayerSetSkillLevel}
                className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Modifier le niveau
              </button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <select
              className={`${inputClass} md:col-span-2`}
              value={playerResourceId}
              onChange={(e) => setPlayerResourceId(e.target.value)}
            >
              <option value="">Choisir une ressource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="Montant (ex: 1000)"
              value={playerResourceAmount}
              onChange={(e) => setPlayerResourceAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={playerResourceSaving}
              onClick={handlePlayerAddResource}
              className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
            >
              Ajouter
            </button>
            <button
              type="button"
              disabled={playerResourceSaving}
              onClick={handlePlayerRemoveResource}
              className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
            >
              Retirer
            </button>
            <button
              type="button"
              disabled={playerResourceSaving}
              onClick={handlePlayerSet}
              className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Definir
            </button>
            <button
              type="button"
              onClick={() => setPlayerResourceAmount('1000')}
              className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              +1k
            </button>
            <button
              type="button"
              onClick={() => setPlayerResourceAmount('1000000')}
              className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              +1M
            </button>
          </div>

          <div className="min-w-0 max-w-full rounded-lg border border-slate-800 bg-slate-950/30 p-2 max-h-80 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                <tr className="border-b border-slate-800/70">
                  <th className="py-2 pr-3">Ressource</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {selectedPlayerResources.map((r) => (
                  <tr
                    key={`pr-${r.resource_id}`}
                    className="border-b border-slate-800/60"
                  >
                    <td className="py-2 pr-3 text-slate-200">
                      <span className="text-amber-300 font-mono">{r.code}</span>{' '}
                      <span className="text-slate-400">{r.name}</span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-slate-100 tabular-nums whitespace-nowrap">
                      <span
                        title={
                          formatIntegerFull ? formatIntegerFull(r.amount, 'fr-FR') : ''
                        }
                      >
                        {formatIntegerCompact
                          ? formatIntegerCompact(r.amount, 'fr-FR')
                          : r.amount}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-slate-300 tabular-nums whitespace-nowrap">
                      <span
                        title={
                          formatIntegerFull
                            ? formatIntegerFull(r.lifetime_amount, 'fr-FR')
                            : ''
                        }
                      >
                        {formatIntegerCompact
                          ? formatIntegerCompact(r.lifetime_amount, 'fr-FR')
                          : r.lifetime_amount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <A11yDetailsWrap
            className="pt-2 border-t border-slate-800/70"
            summaryClassName="rounded-md"
          >
            <summary className="cursor-pointer select-none px-1 py-2 text-xs font-semibold text-red-200 flex items-center justify-between gap-3">
              <span>Actions dangereuses</span>
              <span className="text-[11px] font-normal text-slate-500">
                Reset / suppression
              </span>
            </summary>
            <div className="flex flex-wrap gap-2 justify-end pt-1">
              <button
                type="button"
                disabled={playerDangerLoading}
                onClick={requestPlayerReset}
                className="px-3 py-1 rounded-md border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Reset progression
              </button>
              <button
                type="button"
                disabled={playerDangerLoading}
                onClick={requestPlayerDelete}
                className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Supprimer compte
              </button>
            </div>
          </A11yDetailsWrap>
        </div>
      )}
    </>
  );
}
