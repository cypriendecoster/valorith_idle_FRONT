import { useMemo } from 'react';
import MaintenanceCard from '../../components/admin/Support/MaintenanceCard';
import SupportToolbar from '../../components/admin/Support/SupportToolbar';
import TicketsList from '../../components/admin/Support/TicketsList';
import TicketDetail from '../../components/admin/Support/TicketDetail';
import LogsToolbar from '../../components/admin/Support/LogsToolbar';
import LogsList from '../../components/admin/Support/LogsList';
import usePagedFilters from './usePagedFilters';

export default function useSupportState({
  maintenanceLoading,
  maintenanceSaving,
  maintenanceMessage,
  setMaintenanceMessage,
  maintenanceRetryAfter,
  setMaintenanceRetryAfter,
  maintenanceEnabled,
  saveMaintenance,
  supportStatus,
  setSupportStatus,
  supportCategory,
  setSupportCategory,
  supportCategoryOptions,
  supportSearch,
  setSupportSearch,
  supportSortDir,
  setSupportSortDir,
  supportLimit,
  setSupportLimit,
  supportTicketsLoading,
  supportTicketsTotal,
  supportPage,
  supportMaxPage,
  supportFrom,
  supportTo,
  setSupportPage,
  refreshSupportTickets,
  logsSearch,
  setLogsSearch,
  logsActionType,
  setLogsActionType,
  logsTargetTable,
  setLogsTargetTable,
  logsUserId,
  setLogsUserId,
  logsSortDir,
  setLogsSortDir,
  logsLimit,
  setLogsLimit,
  logsLoading,
  logsTotal,
  logsPage,
  logsMaxPage,
  logsFrom,
  logsTo,
  setLogsPage,
  refreshAdminLogs,
  setLogsPrefetched,
  supportTickets,
  selectedTicketId,
  setSelectedTicketId,
  selectedTicketIds,
  setSelectedTicketIds,
  onCloseSelected,
  supportBulkClosing,
  selectedTicket,
  normalizeText,
  copyWithToast,
  setToast,
  handleTicketStatus,
  filteredLogs,
}) {
  const supportFilters = usePagedFilters({ setPage: setSupportPage });
  const logsFilters = usePagedFilters({ setPage: setLogsPage });
  const exportTicketsDisabled = !supportTickets || supportTickets.length === 0;
  const exportLogsDisabled = !filteredLogs || filteredLogs.length === 0;

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

  const formatExportDate = () => new Date().toISOString().slice(0, 10);

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

  const supportMaintenance = useMemo(
    () => (
      <MaintenanceCard
        maintenanceLoading={maintenanceLoading}
        maintenanceSaving={maintenanceSaving}
        maintenanceMessage={maintenanceMessage}
        setMaintenanceMessage={setMaintenanceMessage}
        maintenanceRetryAfter={maintenanceRetryAfter}
        setMaintenanceRetryAfter={setMaintenanceRetryAfter}
        maintenanceEnabled={maintenanceEnabled}
        saveMaintenance={saveMaintenance}
      />
    ),
    [
      maintenanceLoading,
      maintenanceSaving,
      maintenanceMessage,
      maintenanceRetryAfter,
      maintenanceEnabled,
      saveMaintenance,
      setMaintenanceMessage,
      setMaintenanceRetryAfter,
    ]
  );

  const supportTicketsToolbar = useMemo(
    () => (
      <SupportToolbar
        supportStatus={supportStatus}
        setSupportStatus={supportFilters.withPageReset(setSupportStatus)}
        supportCategory={supportCategory}
        setSupportCategory={supportFilters.withPageReset(setSupportCategory)}
        supportCategoryOptions={supportCategoryOptions}
        supportSearch={supportSearch}
        setSupportSearch={supportFilters.withPageReset(setSupportSearch)}
        supportSortDir={supportSortDir}
        setSupportSortDir={supportFilters.withPageReset(setSupportSortDir)}
        supportLimit={supportLimit}
        setSupportLimit={supportFilters.withPageReset((value) =>
          setSupportLimit(Number(value))
        )}
        supportTicketsLoading={supportTicketsLoading}
        supportTicketsTotal={supportTicketsTotal}
        supportPage={supportPage}
        supportMaxPage={supportMaxPage}
        supportFrom={supportFrom}
        supportTo={supportTo}
        setSupportPage={setSupportPage}
        refreshSupportTickets={refreshSupportTickets}
        onExportJson={() =>
          downloadFile(
            `support_tickets_${formatExportDate()}.json`,
            JSON.stringify(supportTickets ?? [], null, 2),
            'application/json'
          )
        }
        onExportCsv={() =>
          downloadFile(
            `support_tickets_${formatExportDate()}.csv`,
            toCsv(supportTickets ?? []),
            'text/csv;charset=utf-8'
          )
        }
        exportDisabled={exportTicketsDisabled}
        selectedCount={selectedTicketIds.length}
        onCloseSelected={onCloseSelected}
        closeDisabled={
          supportBulkClosing ||
          supportTicketsLoading ||
          selectedTicketIds.length === 0
        }
      />
    ),
    [
      supportStatus,
      supportCategory,
      supportCategoryOptions,
      supportSearch,
      supportSortDir,
      supportLimit,
      supportTicketsLoading,
      supportTicketsTotal,
      supportPage,
      supportMaxPage,
      supportFrom,
      supportTo,
      setSupportPage,
      refreshSupportTickets,
      supportFilters,
      setSupportStatus,
      setSupportCategory,
      setSupportSearch,
      setSupportSortDir,
      setSupportLimit,
      supportTickets,
      exportTicketsDisabled,
      selectedTicketIds,
      onCloseSelected,
      supportBulkClosing,
    ]
  );

  const supportLogsToolbar = useMemo(
    () => (
      <LogsToolbar
        logsSearch={logsSearch}
        setLogsSearch={setLogsSearch}
        logsActionType={logsActionType}
        setLogsActionType={logsFilters.withPageReset(setLogsActionType, {
          after: () => setLogsPrefetched(false),
        })}
        logsTargetTable={logsTargetTable}
        setLogsTargetTable={logsFilters.withPageReset(setLogsTargetTable, {
          after: () => setLogsPrefetched(false),
        })}
        logsUserId={logsUserId}
        setLogsUserId={logsFilters.withPageReset(setLogsUserId, {
          after: () => setLogsPrefetched(false),
        })}
        logsSortDir={logsSortDir}
        setLogsSortDir={logsFilters.withPageReset(setLogsSortDir)}
        logsLimit={logsLimit}
        setLogsLimit={logsFilters.withPageReset((value) =>
          setLogsLimit(Number(value))
        )}
        logsLoading={logsLoading}
        logsTotal={logsTotal}
        logsPage={logsPage}
        logsMaxPage={logsMaxPage}
        logsFrom={logsFrom}
        logsTo={logsTo}
        setLogsPage={setLogsPage}
        refreshAdminLogs={refreshAdminLogs}
        onExportJson={() =>
          downloadFile(
            `admin_logs_${formatExportDate()}.json`,
            JSON.stringify(filteredLogs ?? [], null, 2),
            'application/json'
          )
        }
        onExportCsv={() =>
          downloadFile(
            `admin_logs_${formatExportDate()}.csv`,
            toCsv(filteredLogs ?? []),
            'text/csv;charset=utf-8'
          )
        }
        exportDisabled={exportLogsDisabled}
      />
    ),
    [
      logsSearch,
      logsActionType,
      logsTargetTable,
      logsUserId,
      logsSortDir,
      logsLimit,
      logsLoading,
      logsTotal,
      logsPage,
      logsMaxPage,
      logsFrom,
      logsTo,
      setLogsPage,
      refreshAdminLogs,
      logsFilters,
      setLogsSearch,
      setLogsActionType,
      setLogsTargetTable,
      setLogsUserId,
      setLogsSortDir,
      setLogsLimit,
      setLogsPrefetched,
      filteredLogs,
      exportLogsDisabled,
    ]
  );

  const toggleTicket = (ticket) => {
    if (!ticket) return;
    if (!setSelectedTicketIds) return;
    setSelectedTicketIds((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const ticketId = ticket.id;
      const exists = list.some((id) => Number(id) === Number(ticketId));
      if (exists) {
        return list.filter((id) => Number(id) !== Number(ticketId));
      }
      return [...list, ticketId];
    });
  };

  const supportTicketsContent = useMemo(
    () => (
      <div className="grid gap-4 lg:grid-cols-2">
        <div
          className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 ${
            selectedTicketId ? 'hidden lg:block' : ''
          }`}
        >
          <TicketsList
            supportTickets={supportTickets}
            supportTicketsLoading={supportTicketsLoading}
            selectedTicketId={selectedTicketId}
            selectedTicketIds={selectedTicketIds}
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
            onToggleTicket={toggleTicket}
          />
        </div>
        <div
          className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-3 ${
            selectedTicketId ? '' : 'hidden lg:block'
          }`}
        >
          <TicketDetail
            selectedTicketId={selectedTicketId}
            selectedTicket={selectedTicket}
            onBack={() => setSelectedTicketId(null)}
            normalizeText={normalizeText}
            copyWithToast={copyWithToast}
            setToast={setToast}
            handleTicketStatus={handleTicketStatus}
          />
        </div>
      </div>
    ),
    [
      supportTickets,
      supportTicketsLoading,
      selectedTicketId,
      selectedTicketIds,
      selectedTicket,
      normalizeText,
      copyWithToast,
      setToast,
      handleTicketStatus,
      setSelectedTicketId,
      setSelectedTicketIds,
    ]
  );

  const supportLogsContent = useMemo(
    () => (
      <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
        <LogsList logsLoading={logsLoading} filteredLogs={filteredLogs} />
      </div>
    ),
    [logsLoading, filteredLogs]
  );

  return {
    supportMaintenance,
    supportTicketsToolbar,
    supportLogsToolbar,
    supportTicketsContent,
    supportLogsContent,
  };
}
