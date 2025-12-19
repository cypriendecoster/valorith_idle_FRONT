import PlayersList from './PlayersList';
import PlayerDetails from './PlayerDetails';

export default function PlayersPanel({
  selectedPlayerId,
  listProps = {},
  detailsProps = {},
  listClassName = '',
  detailsClassName = '',
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div
        className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 ${
          selectedPlayerId ? 'hidden lg:block' : ''
        } ${listClassName}`.trim()}
      >
        <PlayersList {...listProps} />
      </div>

      <div
        className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-3 ${
          selectedPlayerId ? '' : 'hidden lg:block'
        } ${detailsClassName}`.trim()}
      >
        <PlayerDetails {...detailsProps} />
      </div>
    </div>
  );
}
