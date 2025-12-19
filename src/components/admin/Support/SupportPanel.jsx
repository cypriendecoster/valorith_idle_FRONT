export default function SupportPanel({
  supportTab = 'tickets',
  onTabChange,
  ticketsCount = 0,
  logsCount = 0,
  maintenance,
  ticketsToolbar,
  logsToolbar,
  ticketsContent,
  logsContent,
}) {
  const selectTab = (tab) => {
    if (onTabChange) onTabChange(tab);
  };

  return (
    <div className="space-y-4">
      {maintenance || null}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectTab('tickets')}
            className={`px-3 py-1 rounded-md border text-xs transition-colors ${
              supportTab === 'tickets'
                ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
            }`}
          >
            Tickets{' '}
            <span className="text-[11px] text-slate-400">({ticketsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => selectTab('logs')}
            className={`px-3 py-1 rounded-md border text-xs transition-colors ${
              supportTab === 'logs'
                ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
            }`}
          >
            Logs <span className="text-[11px] text-slate-400">({logsCount})</span>
          </button>
        </div>

      </div>

      <div className="border-t border-slate-800/70 pt-3 sticky top-0 z-10 bg-slate-950/85 backdrop-blur">
        <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
          {supportTab === 'tickets' ? 'Filtres tickets' : 'Filtres logs'}
        </p>
        {supportTab === 'tickets' ? ticketsToolbar || null : logsToolbar || null}
      </div>

      <div className="border-t border-slate-800/70 pt-3">
        <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-2">
          {supportTab === 'tickets' ? 'Liste des tickets' : 'Liste des logs'}
        </p>
        {supportTab === 'tickets' ? ticketsContent || null : logsContent || null}
      </div>
    </div>
  );
}
