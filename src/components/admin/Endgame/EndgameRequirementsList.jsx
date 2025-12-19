import { useMemo } from 'react';
import ActionMenu from '../../ui/ActionMenu';
import A11yDetails from '../../ui/A11yDetails';
import A11yDetailsWrap from '../../ui/A11yDetailsWrap';
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
  requestBatchSave,
  requestDelete,
  sortedResources = [],
}) {
  const resolveRow = mergedRow || ((_, row) => row ?? {});
  const rowBusy = isRowSaving || (() => false);
  const rowDiffs = getRowDiffs || (() => []);
  const onUpdate = updateField || (() => {});
  const onSave = requestSave || (() => {});
  const onBatchSave = requestBatchSave || (() => {});
  const onDelete = requestDelete || (() => {});
  const findResourceLabel = (value) => {
    if (value == null || value === '') return '-';
    const id = Number(value);
    const res = sortedResources.find((item) => Number(item.id) === id);
    if (!res) return `#${value}`;
    return `${res.code} - ${res.name} (#${res.id})`;
  };
  const getDiffs = (row, merged) => {
    const diffs = [];
    const beforeRes = row?.resource_id;
    const afterRes = merged?.resource_id;
    if (String(beforeRes ?? '') !== String(afterRes ?? '')) {
      diffs.push(`Ressource: ${findResourceLabel(beforeRes)} -> ${findResourceLabel(afterRes)}`);
    }
    const beforeAmount = row?.amount;
    const afterAmount = merged?.amount;
    if (String(beforeAmount ?? '') !== String(afterAmount ?? '')) {
      diffs.push(`Montant: ${beforeAmount ?? '-'} -> ${afterAmount ?? '-'}`);
    }
    return diffs;
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" role="status" aria-live="polite">
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
    return (
      <p className="text-sm text-slate-300" role="status" aria-live="polite">
        Aucun resultat.
      </p>
    );
  }

  const dirtyRows = useMemo(
    () => requirements.filter((row) => rowDiffs('endgame_requirements', row).length > 0),
    [requirements, rowDiffs]
  );

  const batchDiffs = useMemo(
    () =>
      dirtyRows.flatMap((row) =>
        rowDiffs('endgame_requirements', row).map((diff) => ({
          ...diff,
          field: `#${row.id} ${diff.field}`,
        }))
      ),
    [dirtyRows, rowDiffs]
  );

  return (
    <>
      <div className="mb-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-300">
            Actions endgame (requirements)
          </p>
          <button
            type="button"
            onClick={() => onBatchSave('endgame_requirements', dirtyRows, batchDiffs)}
            disabled={dirtyRows.length === 0}
            className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Sauvegarder {dirtyRows.length > 0 ? `(${dirtyRows.length})` : ''}
          </button>
        </div>
        {batchDiffs.length > 0 ? (
          <A11yDetailsWrap summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-slate-300 hover:text-slate-200">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-slate-300 hover:text-slate-200">
              Apercu des changements ({batchDiffs.length})
            </summary>
            <div className="mt-2 max-h-56 overflow-auto rounded-md border border-slate-800/70 bg-slate-950/40 p-2">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                  <tr className="border-b border-slate-800/70">
                    <th className="py-2 pr-3">Champ</th>
                    <th className="py-2 pr-3">Avant</th>
                    <th className="py-2">Apres</th>
                  </tr>
                </thead>
                <tbody>
                  {batchDiffs.map((diff, idx) => (
                    <tr
                      key={`endgame-batch-diff-${idx}-${diff.field}`}
                      className="border-b border-slate-800/60"
                    >
                      <td className="py-2 pr-3 text-slate-200 font-mono">
                        {diff.field}
                      </td>
                      <td className="py-2 pr-3 text-slate-300">
                        {diff.before}
                      </td>
                      <td className="py-2 text-slate-100">{diff.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </A11yDetailsWrap>
        ) : null}
      </div>

      <div className="md:hidden space-y-2">
          {requirements.map((row) => {
            const type = 'endgame_requirements';
            const r = resolveRow(type, row);
            const busy = rowBusy(type, row.id);
            const canSave = rowDiffs(type, row).length > 0;
            const diffs = canSave ? getDiffs(row, r) : [];
            const dangerHelpId = `endgame-danger-${row.id}`;

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
                {diffs.length > 0 ? (
                  <A11yDetails
                    summary="Changements"
                    summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-slate-300 hover:text-slate-200"
                  >
                    <ul className="mt-2 text-[11px] text-slate-200 space-y-1">
                      {diffs.map((diff) => (
                        <li key={diff}>{diff}</li>
                      ))}
                    </ul>
                  </A11yDetails>
                ) : null}
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
              const diffs = canSave ? getDiffs(row, r) : [];

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
                    <div className="flex flex-wrap gap-2 items-start">
                      <button
                        type="button"
                        disabled={busy || !canSave}
                        onClick={() => onSave(type, row)}
                        className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
                      >
                        {busy ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      {diffs.length > 0 ? (
                        <A11yDetails
                          summary="Changements"
                          summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-slate-300 hover:text-slate-200"
                        >
                          <ul className="mt-2 text-[11px] text-slate-200 space-y-1">
                            {diffs.map((diff) => (
                              <li key={diff}>{diff}</li>
                            ))}
                          </ul>
                        </A11yDetails>
                      ) : null}
                      <span id={dangerHelpId} className="sr-only">
                        Action dangereuse. Cette operation est irreversible.
                      </span>
                      <button
                        type="button"
                        onClick={() => onDelete(type, row)}
                        aria-describedby={dangerHelpId}
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
