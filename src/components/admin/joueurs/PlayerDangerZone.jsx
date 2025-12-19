import A11yDetailsWrap from '../../ui/A11yDetailsWrap';

export default function PlayerDangerZone({
  playerDangerLoading = false,
  onReset,
  onDelete,
}) {
  return (
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
          onClick={onReset}
          className="px-3 py-1 rounded-md border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Reset progression
        </button>
        <button
          type="button"
          disabled={playerDangerLoading}
          onClick={onDelete}
          className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Supprimer compte
        </button>
      </div>
    </A11yDetailsWrap>
  );
}
