import { useState } from 'react';
import PaginationControls from '../../ui/PaginationControls';

export default function LogsToolbar({
  logsSearch = '',
  setLogsSearch,
  logsActionType = '',
  setLogsActionType,
  logsTargetTable = '',
  setLogsTargetTable,
  logsUserId = '',
  setLogsUserId,
  logsSortDir = 'DESC',
  setLogsSortDir,
  logsLimit = 50,
  setLogsLimit,
  logsLoading = false,
  logsTotal = 0,
  logsPage = 0,
  logsMaxPage = 0,
  logsFrom = 0,
  logsTo = 0,
  setLogsPage,
  refreshAdminLogs,
  onExportJson,
  onExportCsv,
  exportDisabled = false,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={logsSearch}
          aria-label="Filtrer les logs (local)"
          onChange={(e) => setLogsSearch && setLogsSearch(e.target.value)}
          placeholder="Filtre local (description/table...)"
          className="flex-1 min-w-0 md:flex-none md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        />
        <button
          type="button"
          onClick={() => refreshAdminLogs && refreshAdminLogs()}
          aria-label="Rafraichir les logs"
          disabled={logsLoading}
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {logsLoading ? '...' : 'Rafraichir'}
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          aria-controls="logs-advanced-filters"
          aria-expanded={showAdvanced}
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
        >
          Plus de filtres
        </button>
        <PaginationControls
          disabled={logsLoading || logsTotal <= 0}
          page={logsPage}
          maxPage={logsMaxPage}
          mode="range"
          from={logsFrom}
          to={logsTo}
          total={logsTotal}
          onPrev={() => setLogsPage && setLogsPage((p) => Math.max(0, p - 1))}
          onNext={() =>
            setLogsPage && setLogsPage((p) => Math.min(logsMaxPage, p + 1))
          }
          ariaPrev="Page precedente logs"
          ariaNext="Page suivante logs"
        />
      </div>

      <div
        id="logs-advanced-filters"
        className={`flex flex-wrap items-center gap-2 ${
          showAdvanced ? '' : 'hidden'
        } md:flex`}
      >
        <input
          value={logsActionType}
          aria-label="Filtrer logs par actionType"
          onChange={(e) => setLogsActionType && setLogsActionType(e.target.value)}
          placeholder="actionType"
          className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        />
        <input
          value={logsTargetTable}
          aria-label="Filtrer logs par targetTable"
          onChange={(e) => setLogsTargetTable && setLogsTargetTable(e.target.value)}
          placeholder="targetTable"
          className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        />
        <input
          value={logsUserId}
          aria-label="Filtrer logs par userId"
          onChange={(e) => setLogsUserId && setLogsUserId(e.target.value)}
          placeholder="userId"
          className="w-24 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        />
        <select
          value={logsSortDir}
          aria-label="Trier les logs"
          onChange={(e) => setLogsSortDir && setLogsSortDir(e.target.value)}
          className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        >
          <option value="DESC">Recents</option>
          <option value="ASC">Anciens</option>
        </select>
        <select
          value={logsLimit}
          aria-label="Nombre de logs par page"
          onChange={(e) => setLogsLimit && setLogsLimit(Number(e.target.value))}
          className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={500}>500</option>
        </select>
        <button
          type="button"
          onClick={() => {
            if (setLogsSearch) setLogsSearch('');
            if (setLogsActionType) setLogsActionType('');
            if (setLogsTargetTable) setLogsTargetTable('');
            if (setLogsUserId) setLogsUserId('');
            if (setLogsSortDir) setLogsSortDir('DESC');
            if (setLogsLimit) setLogsLimit(200);
            if (setLogsPage) setLogsPage(0);
          }}
          aria-label="Reinitialiser tous les filtres logs"
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
        >
          Reinitialiser filtres
        </button>
        <button
          type="button"
          onClick={() => {
            if (setLogsSearch) setLogsSearch('');
            if (setLogsActionType) setLogsActionType('');
            if (setLogsTargetTable) setLogsTargetTable('');
            if (setLogsUserId) setLogsUserId('');
            if (setLogsSortDir) setLogsSortDir('DESC');
            if (setLogsLimit) setLogsLimit(200);
            if (setLogsPage) setLogsPage(0);
            if (refreshAdminLogs) refreshAdminLogs();
          }}
          aria-label="Reinitialiser les filtres et rafraichir les logs"
          className="px-3 py-2 rounded-lg border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors text-xs"
        >
          Reset + rafraichir
        </button>
        <button
          type="button"
          onClick={() => onExportJson && onExportJson()}
          disabled={exportDisabled}
          aria-label="Exporter les logs en JSON"
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          Exporter JSON
        </button>
        <button
          type="button"
          onClick={() => onExportCsv && onExportCsv()}
          disabled={exportDisabled}
          aria-label="Exporter les logs en CSV"
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          Exporter CSV
        </button>
      </div>
    </div>
  );
}
