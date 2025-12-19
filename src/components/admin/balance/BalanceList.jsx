import { useMemo, useState } from 'react';
import BalanceRowCard from './BalanceRowCard';
import BalanceRowTable from './BalanceRowTable';
import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';
import A11yDetailsWrap from '../../ui/A11yDetailsWrap';

export default function BalanceList({
  activeTab,
  loading,
  visibleRows = [],
  inputClass = '',
  mergedRow,
  isRowSaving,
  getRowDiffs,
  requestSave,
  requestBatchSave,
  requestDelete,
  updateField,
  realmUnlockCostsByRealmId,
  resources = [],
  realms = [],
  sortedRealms = [],
  sortedResources = [],
}) {
  const resolveRow = mergedRow || ((_, row) => row ?? {});
  const rowBusy = isRowSaving || (() => false);
  const rowDiffs = getRowDiffs || (() => []);
  const onSave = requestSave || (() => {});
  const onBatchSave = requestBatchSave || (() => {});
  const onDelete = requestDelete || (() => {});
  const onUpdate = updateField || (() => {});
  const unlockCostsByRealm =
    realmUnlockCostsByRealmId instanceof Map ? realmUnlockCostsByRealmId : new Map();
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');

  const fieldsByTab = {
    realms: ['id', 'code', 'name', 'description', 'is_default_unlocked'],
    realm_unlock_costs: ['id', 'target_realm_id', 'resource_id', 'amount'],
    resources: ['id', 'realm_id', 'code', 'name', 'description'],
    factories: [
      'id',
      'realm_id',
      'resource_id',
      'code',
      'name',
      'description',
      'base_production',
      'base_cost',
      'unlock_order',
      'is_active',
    ],
    skills: [
      'id',
      'realm_id',
      'code',
      'name',
      'description',
      'effect_type',
      'effect_value',
      'max_level',
      'base_cost_resource_id',
      'base_cost_amount',
      'cost_growth_factor',
      'unlock_order',
    ],
  };

  const parseBoolean = (value) => {
    if (value === true || value === false) return value;
    const text = String(value || '').trim().toLowerCase();
    if (['1', 'true', 'yes', 'oui'].includes(text)) return true;
    if (['0', 'false', 'no', 'non'].includes(text)) return false;
    return value;
  };

  const exportRows = useMemo(() => {
    const fields = fieldsByTab[activeTab] || ['id'];
    return (visibleRows || []).map((row) => {
      const merged = resolveRow(activeTab, row);
      return fields.reduce((acc, field) => {
        acc[field] = merged?.[field] ?? '';
        return acc;
      }, {});
    });
  }, [activeTab, visibleRows, resolveRow]);

  const editedRows = useMemo(
    () => (visibleRows || []).filter((row) => rowDiffs(activeTab, row).length > 0),
    [activeTab, visibleRows, rowDiffs]
  );

  const batchDiffs = useMemo(
    () =>
      editedRows.flatMap((row) =>
        rowDiffs(activeTab, row).map((diff) => ({
          ...diff,
          field: `#${row.id} ${diff.field}`,
        }))
      ),
    [activeTab, editedRows, rowDiffs]
  );

  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows) => {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) return '';
    const keys = Array.from(
      new Set(list.flatMap((row) => Object.keys(row ?? {})))
    );
    const escapeCell = (value) => {
      if (value == null) return '';
      const raw = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const escaped = raw.replace(/\"/g, '\"\"');
      return `\"${escaped}\"`;
    };
    const header = keys.map(escapeCell).join(',');
    const lines = list.map((row) =>
      keys.map((key) => escapeCell(row?.[key])).join(',')
    );
    return [header, ...lines].join('\n');
  };

  const parseCsv = (text) => {
    const rows = [];
    let current = '';
    let inQuotes = false;
    const pushCell = (cells, cell) => {
      cells.push(cell.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"'));
    };
    const lines = [];
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"' && text[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
        continue;
      }
      if (char === '\n' && !inQuotes) {
        lines.push(current);
        current = '';
        continue;
      }
      current += char;
    }
    if (current) lines.push(current);
    if (lines.length === 0) return rows;
    const header = [];
    let cell = '';
    inQuotes = false;
    for (let i = 0; i < lines[0].length; i += 1) {
      const char = lines[0][i];
      if (char === '"' && lines[0][i + 1] === '"') {
        cell += '"';
        i += 1;
        continue;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        cell += char;
        continue;
      }
      if (char === ',' && !inQuotes) {
        pushCell(header, cell);
        cell = '';
        continue;
      }
      cell += char;
    }
    pushCell(header, cell);
    for (let i = 1; i < lines.length; i += 1) {
      const row = {};
      const cells = [];
      cell = '';
      inQuotes = false;
      for (let j = 0; j < lines[i].length; j += 1) {
        const char = lines[i][j];
        if (char === '"' && lines[i][j + 1] === '"') {
          cell += '"';
          j += 1;
          continue;
        }
        if (char === '"') {
          inQuotes = !inQuotes;
          cell += char;
          continue;
        }
        if (char === ',' && !inQuotes) {
          pushCell(cells, cell);
          cell = '';
          continue;
        }
        cell += char;
      }
      pushCell(cells, cell);
      header.forEach((key, idx) => {
        row[key] = cells[idx] ?? '';
      });
      rows.push(row);
    }
    return rows;
  };

  const handleImportRows = (rows) => {
    const fields = fieldsByTab[activeTab] || ['id'];
    let applied = 0;
    rows.forEach((row) => {
      const rawId = row.id ?? row.ID ?? row.Id;
      if (rawId == null || rawId === '') return;
      fields.forEach((field) => {
        if (field === 'id') return;
        if (!(field in row)) return;
        const value =
          field === 'is_active' || field === 'is_default_unlocked'
            ? parseBoolean(row[field])
            : row[field];
        onUpdate(activeTab, rawId, field, value);
      });
      applied += 1;
    });
    setImportMessage(`Import: ${applied} ligne(s) appliquee(s).`);
    setImportError('');
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = file.name.toLowerCase().endsWith('.csv')
        ? parseCsv(text)
        : JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error('Format invalide (attendu: tableau JSON ou CSV).');
      }
      handleImportRows(data);
    } catch (err) {
      setImportError(err?.message || "Impossible d'importer le fichier.");
      setImportMessage('');
    } finally {
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="md:hidden">
          <SkeletonCards items={6} />
        </div>
        <div className="hidden md:block">
          <SkeletonTable
            rows={10}
            cols={activeTab === 'realm_unlock_costs' ? 4 : 6}
            titleWidth="w-28"
          />
        </div>
      </div>
    );
  }

  if (!visibleRows || visibleRows.length === 0) {
    return <p className="text-sm text-slate-300">Aucun resultat.</p>;
  }

  return (
    <>
      <div className="mb-3 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="text-xs text-slate-300">
            Actions balance ({activeTab})
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                downloadFile(
                  `balance_${activeTab}.json`,
                  JSON.stringify(exportRows, null, 2),
                  'application/json'
                )
              }
              disabled={exportRows.length === 0}
              className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() =>
                downloadFile(
                  `balance_${activeTab}.csv`,
                  toCsv(exportRows),
                  'text/csv;charset=utf-8'
                )
              }
              disabled={exportRows.length === 0}
              className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Export CSV
            </button>
            <label className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors cursor-pointer">
              Import JSON/CSV
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleImportFile}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={() => onBatchSave(activeTab, editedRows, batchDiffs)}
              disabled={editedRows.length === 0}
              className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Sauvegarder {editedRows.length > 0 ? `(${editedRows.length})` : ''}
            </button>
          </div>
        </div>
        {importMessage ? (
          <p className="text-[11px] text-emerald-200">{importMessage}</p>
        ) : null}
        {importError ? (
          <p className="text-[11px] text-red-200">{importError}</p>
        ) : null}
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
                      key={`batch-diff-${idx}-${diff.field}`}
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
        {visibleRows.map((row) => (
          <BalanceRowCard
            key={'balance-card-' + activeTab + '-' + row.id}
            activeTab={activeTab}
            row={row}
            inputClass={inputClass}
            mergedRow={mergedRow}
            isRowSaving={isRowSaving}
            getRowDiffs={getRowDiffs}
            requestSave={requestSave}
            requestDelete={requestDelete}
            updateField={updateField}
            realmUnlockCostsByRealmId={realmUnlockCostsByRealmId}
            resources={resources}
            realms={realms}
            sortedRealms={sortedRealms}
            sortedResources={sortedResources}
          />
        ))}
      </div>

      <BalanceRowTable
        activeTab={activeTab}
        visibleRows={visibleRows}
        inputClass={inputClass}
        mergedRow={mergedRow}
        isRowSaving={isRowSaving}
        getRowDiffs={getRowDiffs}
        requestSave={requestSave}
        requestDelete={requestDelete}
        updateField={updateField}
        realmUnlockCostsByRealmId={realmUnlockCostsByRealmId}
        resources={resources}
        realms={realms}
        sortedRealms={sortedRealms}
        sortedResources={sortedResources}
      />
    </>
  );
}


