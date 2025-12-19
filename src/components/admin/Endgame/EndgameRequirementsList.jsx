import ActionMenu from '../../ui/ActionMenu';
import TableShell from '../../ui/TableShell';
import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';

export default function EndgameRequirementsList({
  loading = false,
  requirements = [],
  inputClass = '',
  mergedRow,
  isRowSaving,
  getRowDiffs,
  updateField,
  requestSave,
  requestDelete,
  sortedResources = [],
}) {
  const resolveRow = mergedRow || ((_, row) => row ?? {});
  const rowBusy = isRowSaving || (() => false);
  const rowDiffs = getRowDiffs || (() => []);
  const onUpdate = updateField || (() => {});
  const onSave = requestSave || (() => {});
  const onDelete = requestDelete || (() => {});

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="md:hidden">
          <SkeletonCards items={6} />
        </div>
        <div className="hidden md:block">
          <SkeletonTable rows={8} cols={5} titleWidth="w-32" />
        </div>
      </div>
    );
  }

  if (!requirements || requirements.length === 0) {
    return <p className="text-sm text-slate-300">Aucun resultat.</p>;
  }

  return (
    <>
      <div className="md:hidden space-y-2">
        {requirements.map((row) => {
          const type = 'endgame_requirements';
          const r = resolveRow(type, row);
          const busy = rowBusy(type, row.id);
          const canSave = rowDiffs(type, row).length > 0;

          return (
            <div
              key={`endgame-req-card-${row.id}`}
              className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-amber-300 font-mono">#{row.id}</p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Ressource
                </p>
                <select
                  className={inputClass}
                  value={r.resource_id ?? ''}
                  onChange={(e) => onUpdate(type, row.id, 'resource_id', e.target.value)}
                >
                  <option value="">Ressource</option>
                  {sortedResources.map((res) => (
                    <option key={`endgame-req-res-mobile-${row.id}-${res.id}`} value={res.id}>
                      {res.code} - {res.name} (#{res.id})
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
                  value={r.amount ?? ''}
                  onChange={(e) => onUpdate(type, row.id, 'amount', e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-end pt-1">
                <button
                  type="button"
                  disabled={busy || !canSave}
                  onClick={() => onSave(type, row)}
                  className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors text-xs"
                >
                  {busy ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <ActionMenu
                  ariaLabel="Actions"
                  items={[
                    {
                      key: 'delete',
                      label: 'Supprimer',
                      danger: true,
                      onClick: () => onDelete(type, row),
                    },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>

      <TableShell className="hidden md:block" asChild>
        <table className="min-w-[900px] w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-amber-500/20">
              <th className="py-3 pr-3">ID</th>
              <th className="py-3 pr-3">Ressource</th>
              <th className="py-3 pr-3">Montant</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((row) => {
              const type = 'endgame_requirements';
              const r = resolveRow(type, row);
              const busy = rowBusy(type, row.id);
              const canSave = rowDiffs(type, row).length > 0;

              return (
                <tr key={`endgame-req-${row.id}`} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3 font-mono text-amber-300">{row.id}</td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputClass}
                      value={r.resource_id ?? ''}
                      onChange={(e) =>
                        onUpdate(type, row.id, 'resource_id', e.target.value)
                      }
                    >
                      <option value="">Ressource</option>
                      {sortedResources.map((res) => (
                        <option key={`endgame-req-res-${row.id}-${res.id}`} value={res.id}>
                          {res.code} - {res.name} (#{res.id})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={r.amount ?? ''}
                      onChange={(e) => onUpdate(type, row.id, 'amount', e.target.value)}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || !canSave}
                        onClick={() => onSave(type, row)}
                        className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
                      >
                        {busy ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(type, row)}
                        className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
