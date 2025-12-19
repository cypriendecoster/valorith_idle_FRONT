export default function BalanceSubTabs({ tabs = [], activeKey, onSelect }) {
  if (!Array.isArray(tabs) || tabs.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sous-sections balance">
      {tabs.map((t) => {
        const isActive = String(activeKey) === String(t.key);
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect?.(t.key)}
            className={`px-3 py-1 rounded-md border text-xs transition-colors focus:outline-none focus-visible:ring focus-visible:ring-emerald-400/70 ${
              isActive
                ? 'border-emerald-400 text-emerald-200 bg-emerald-500/10'
                : 'border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-200'
            }`}
          >
            {t.label}{' '}
            {t.count != null ? (
              <span className="text-[11px] text-slate-400">({t.count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

