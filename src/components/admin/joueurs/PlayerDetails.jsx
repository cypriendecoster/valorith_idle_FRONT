import PlayerMiniStickyHeader from './PlayerMiniStickyHeader';
import PlayerActionsRealms from './PlayerActionsRealms';
import PlayerActionsFactories from './PlayerActionsFactories';
import PlayerActionSkills from './PlayerActionSkills';
import PlayerResourcesTable from './PlayerResourcesTable';
import PlayerDangerZone from './PlayerDangerZone';

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
      <PlayerMiniStickyHeader
        selectedPlayerId={selectedPlayerId}
        selectedPlayer={selectedPlayer}
        onBack={onBack}
        onRefresh={refreshSelectedPlayer}
      />

      {selectedPlayer && (
        <div className="space-y-3" aria-live="polite" aria-atomic="true">
          <div className="lg:hidden rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
            Joueur selectionne :{' '}
            <span className="font-semibold text-amber-100">
              {selectedPlayer.username || '(sans pseudo)'}
            </span>{' '}
            <span className="text-amber-300/80">#{selectedPlayer.id}</span>
          </div>
          <PlayerActionsRealms
            inputClass={inputClass}
            realms={realms}
            playerRealmCode={playerRealmCode}
            setPlayerRealmCode={setPlayerRealmCode}
            playerRealmActivateId={playerRealmActivateId}
            setPlayerRealmActivateId={setPlayerRealmActivateId}
            playerResourceSaving={playerResourceSaving}
            handlePlayerUnlockRealm={handlePlayerUnlockRealm}
            handlePlayerActivateRealm={handlePlayerActivateRealm}
          />

          <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
            <p className="text-xs text-slate-300 font-semibold">Niveaux usines / competences</p>
            <PlayerActionsFactories
              inputClass={inputClass}
              factories={factories}
              playerFactoryId={playerFactoryId}
              setPlayerFactoryId={setPlayerFactoryId}
              playerFactoryLevel={playerFactoryLevel}
              setPlayerFactoryLevel={setPlayerFactoryLevel}
              playerFactoryLevelById={playerFactoryLevelById}
              playerResourceSaving={playerResourceSaving}
              handlePlayerSetFactoryLevel={handlePlayerSetFactoryLevel}
            />
            <PlayerActionSkills
              inputClass={inputClass}
              skills={skills}
              playerSkillId={playerSkillId}
              setPlayerSkillId={setPlayerSkillId}
              playerSkillLevel={playerSkillLevel}
              setPlayerSkillLevel={setPlayerSkillLevel}
              playerSkillLevelById={playerSkillLevelById}
              playerResourceSaving={playerResourceSaving}
              handlePlayerSetSkillLevel={handlePlayerSetSkillLevel}
            />
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Ressource
              </p>
              <select
                className={inputClass}
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
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Montant
              </p>
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="Montant (ex: 1000)"
                aria-label="Montant ressource"
                value={playerResourceAmount}
                onChange={(e) => setPlayerResourceAmount(e.target.value)}
              />
            </div>
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

          <PlayerResourcesTable
            selectedPlayerResources={selectedPlayerResources}
            formatIntegerFull={formatIntegerFull}
            formatIntegerCompact={formatIntegerCompact}
          />

          <PlayerDangerZone
            playerDangerLoading={playerDangerLoading}
            onReset={requestPlayerReset}
            onDelete={requestPlayerDelete}
          />
        </div>
      )}
    </>
  );
}
