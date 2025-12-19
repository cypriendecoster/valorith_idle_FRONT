export default function PlayerResourcesTable({
  selectedPlayerResources = [],
  formatIntegerFull,
  formatIntegerCompact,
}) {
  if (!selectedPlayerResources || selectedPlayerResources.length === 0) {
    return <p className="text-sm text-slate-300">Aucune ressource.</p>;
  }

  return (
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
          {selectedPlayerResources.map((row) => (
            <tr key={`pr-${row.resource_id}`} className="border-b border-slate-800/60">
              <td className="py-2 pr-3 text-slate-200">
                <span className="text-amber-300 font-mono">{row.code}</span>{' '}
                <span className="text-slate-400">{row.name}</span>
              </td>
              <td className="py-2 pr-3 font-mono text-slate-100 tabular-nums whitespace-nowrap">
                <span
                  title={formatIntegerFull ? formatIntegerFull(row.amount, 'fr-FR') : ''}
                >
                  {formatIntegerCompact
                    ? formatIntegerCompact(row.amount, 'fr-FR')
                    : row.amount}
                </span>
              </td>
              <td className="py-2 font-mono text-slate-300 tabular-nums whitespace-nowrap">
                <span
                  title={
                    formatIntegerFull
                      ? formatIntegerFull(row.lifetime_amount, 'fr-FR')
                      : ''
                  }
                >
                  {formatIntegerCompact
                    ? formatIntegerCompact(row.lifetime_amount, 'fr-FR')
                    : row.lifetime_amount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
