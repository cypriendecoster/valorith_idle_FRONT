import { useMemo, useState } from 'react';
import Badge from '../../ui/Badge';
import PaginationControls from '../../ui/PaginationControls';
import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';
import TableShell from '../../ui/TableShell';

export default function PlayersList({
  players = [],
  playersLoading = false,
  playersFrom = 0,
  playersTo = 0,
  playersTotal = 0,
  playersSortBy = 'id',
  playersSortDir = 'ASC',
  playersLimit = 25,
  playersPage = 0,
  playersMaxPage = 0,
  selectedPlayerId,
  onSortByChange,
  onSortDirToggle,
  onSortDirChange,
  onLimitChange,
  onPrevPage,
  onNextPage,
  onSelectPlayer,
}) {
  const [localSearch, setLocalSearch] = useState('');
  const normalizedSearch = localSearch.trim().toLowerCase();

  const filteredPlayers = useMemo(() => {
    if (!normalizedSearch) return players;
    return (players || []).filter((player) => {
      const id = String(player?.id ?? '').toLowerCase();
      const username = String(player?.username ?? '').toLowerCase();
      const email = String(player?.email ?? '').toLowerCase();
      const role = String(player?.role ?? '').toLowerCase();
      return (
        id.includes(normalizedSearch) ||
        username.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        role.includes(normalizedSearch)
      );
    });
  }, [players, normalizedSearch]);

  const applyPreset = (sortBy, sortDir) => {
    if (onSortByChange) onSortByChange(sortBy);
    if (onSortDirChange) {
      onSortDirChange(sortDir);
    } else if (onSortDirToggle && playersSortDir !== sortDir) {
      onSortDirToggle();
    }
  };

  const handleSelect = (player) => {
    if (!onSelectPlayer) return;
    onSelectPlayer(player);
  };

  return (
    <>
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-300">Liste des joueurs</p>
            <span className="px-2 py-0.5 rounded-full border border-slate-700 text-[10px] text-slate-300">
              Recherche serveur
            </span>
            <span className="px-2 py-0.5 rounded-full border border-slate-700 text-[10px] text-slate-300">
              Filtre local
            </span>
          </div>
          {playersLoading && <p className="text-[11px] text-slate-500">Chargement...</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">
            {playersFrom}-{playersTo} / {playersTotal}
            {normalizedSearch ? ` · Local: ${filteredPlayers.length}` : ''}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={playersSortBy}
              aria-label="Trier les joueurs par"
              onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
              className="rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
            >
              <option value="id">ID</option>
              <option value="last_login_at">Derniere connexion</option>
              <option value="created_at">Creation</option>
              <option value="username">Pseudo</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>

            <button
              type="button"
              aria-label="Inverser le sens du tri des joueurs"
              onClick={() => onSortDirToggle && onSortDirToggle()}
              className="px-2 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              {playersSortDir === 'ASC' ? 'Asc' : 'Desc'}
            </button>

            <select
              value={playersLimit}
              aria-label="Nombre de joueurs par page"
              onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
              className="rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>

            <PaginationControls
              disabled={playersLoading || playersTotal <= 0}
              page={playersPage}
              maxPage={playersMaxPage}
              onPrev={onPrevPage}
              onNext={onNextPage}
              ariaPrev="Page precedente joueurs"
              ariaNext="Page suivante joueurs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={localSearch}
            aria-label="Filtrer localement la liste des joueurs"
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtre local (id, pseudo, email, role...)"
            className="flex-1 min-w-0 md:flex-none md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          />
          {localSearch ? (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              aria-label="Reinitialiser le filtre local"
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              Reset local
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => applyPreset('last_login_at', 'DESC')}
            className="px-3 py-2 rounded-lg border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors text-xs"
          >
            Dernieres connexions
          </button>
          <button
            type="button"
            onClick={() => applyPreset('created_at', 'DESC')}
            className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
          >
            Nouveaux comptes
          </button>
        </div>
      </div>

      {playersLoading ? (
        <div className="space-y-3" aria-busy="true" role="status" aria-live="polite">
          <div className="md:hidden">
            <SkeletonCards items={6} />
          </div>
          <div className="hidden md:block">
            <SkeletonTable rows={8} cols={5} titleWidth="w-32" />
          </div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <p className="text-sm text-slate-300" role="status" aria-live="polite">
          Aucun joueur.
        </p>
      ) : (
        <>
          <div className="md:hidden space-y-2">
            {filteredPlayers.map((player) => {
              const selected = Number(selectedPlayerId) === Number(player.id);
              return (
                <button
                  key={`player-card-${player.id}`}
                  type="button"
                  onClick={() => handleSelect(player)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    selected
                      ? 'border-amber-400/50 bg-amber-500/10'
                      : 'border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40'
                  } focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-100 font-semibold">
                        {player.username || '(sans pseudo)'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {player.email || '-'}
                      </p>
                    </div>
                    <p className="text-[11px] text-amber-300 font-mono">#{player.id}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <p className="uppercase tracking-widest text-slate-500">Role</p>
                      <Badge className="mt-0.5">{player.role || '-'}</Badge>
                    </div>
                    <div>
                      <p className="uppercase tracking-widest text-slate-500">
                        Derniere connexion
                      </p>
                      <p className="text-slate-300">
                        {player.last_login_at
                          ? new Date(player.last_login_at).toLocaleString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <TableShell className="hidden md:block" asChild>
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                <tr className="border-b border-slate-800/70">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Pseudo</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2">Derniere connexion</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const selected = Number(selectedPlayerId) === Number(player.id);
                  const selectPlayer = () => handleSelect(player);
                  return (
                    <tr
                      key={`player-${player.id}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ouvrir le joueur #${player.id}`}
                      aria-selected={selected}
                      className={`border-b border-slate-800/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                        selected ? 'bg-amber-500/10' : 'hover:bg-slate-900/40'
                      }`}
                      onClick={selectPlayer}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectPlayer();
                        }
                      }}
                    >
                      <td className="py-2 pr-3 font-mono text-amber-300">
                        {player.id}
                      </td>
                      <td className="py-2 pr-3 text-slate-100 font-semibold">
                        {player.username || '-'}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {player.email || '-'}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        <Badge>{player.role || '-'}</Badge>
                      </td>
                      <td className="py-2 text-slate-400">
                        {player.last_login_at
                          ? new Date(player.last_login_at).toLocaleString('fr-FR')
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
        </>
      )}
    </>
  );
}
