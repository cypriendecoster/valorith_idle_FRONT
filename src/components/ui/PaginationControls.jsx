export default function PaginationControls({
  disabled = false,
  page,
  maxPage,
  from,
  to,
  total,
  onPrev,
  onNext,
  mode = 'page',
  ariaPrev = 'Page précédente',
  ariaNext = 'Page suivante',
  className = '',
}) {
  const canPrev = !disabled && Number(page) > 0;
  const canNext = !disabled && Number(page) < Number(maxPage);

  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      <button
        type="button"
        aria-label={ariaPrev}
        disabled={!canPrev}
        onClick={onPrev}
        className="px-2 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {'<'}
      </button>
      {mode === 'range' ? (
        <p className="text-[11px] text-slate-400 min-w-[108px] text-center">
          {from}-{to} / {total}
        </p>
      ) : (
        <p className="text-[11px] text-slate-400 min-w-[72px] text-center">
          {Number(page) + 1}/{Number(maxPage) + 1}
        </p>
      )}
      <button
        type="button"
        aria-label={ariaNext}
        disabled={!canNext}
        onClick={onNext}
        className="px-2 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {'>'}
      </button>
    </div>
  );
}

