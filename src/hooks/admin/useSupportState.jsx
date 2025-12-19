import { useMemo } from 'react';
import MaintenanceCard from '../../components/admin/Support/MaintenanceCard';
import SupportToolbar from '../../components/admin/Support/SupportToolbar';
import TicketsList from '../../components/admin/Support/TicketsList';
import TicketDetail from '../../components/admin/Support/TicketDetail';
import LogsToolbar from '../../components/admin/Support/LogsToolbar';
import LogsList from '../../components/admin/Support/LogsList';

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
  selectedTicket,
  normalizeText,
  copyWithToast,
  setToast,
  handleTicketStatus,
  filteredLogs,
}) {
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
        setSupportStatus={(value) => {
          setSupportStatus(value);
          setSupportPage(0);
        }}
        supportCategory={supportCategory}
        setSupportCategory={(value) => {
          setSupportCategory(value);
          setSupportPage(0);
        }}
        supportCategoryOptions={supportCategoryOptions}
        supportSearch={supportSearch}
        setSupportSearch={(value) => {
          setSupportSearch(value);
          setSupportPage(0);
        }}
        supportSortDir={supportSortDir}
        setSupportSortDir={(value) => {
          setSupportSortDir(value);
          setSupportPage(0);
        }}
        supportLimit={supportLimit}
        setSupportLimit={(value) => {
          setSupportLimit(Number(value));
          setSupportPage(0);
        }}
        supportTicketsLoading={supportTicketsLoading}
        supportTicketsTotal={supportTicketsTotal}
        supportPage={supportPage}
        supportMaxPage={supportMaxPage}
        supportFrom={supportFrom}
        supportTo={supportTo}
        setSupportPage={setSupportPage}
        refreshSupportTickets={refreshSupportTickets}
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
      setSupportStatus,
      setSupportCategory,
      setSupportSearch,
      setSupportSortDir,
      setSupportLimit,
    ]
  );

  const supportLogsToolbar = useMemo(
    () => (
      <LogsToolbar
        logsSearch={logsSearch}
        setLogsSearch={setLogsSearch}
        logsActionType={logsActionType}
        setLogsActionType={(value) => {
          setLogsActionType(value);
          setLogsPage(0);
          setLogsPrefetched(false);
        }}
        logsTargetTable={logsTargetTable}
        setLogsTargetTable={(value) => {
          setLogsTargetTable(value);
          setLogsPage(0);
          setLogsPrefetched(false);
        }}
        logsUserId={logsUserId}
        setLogsUserId={(value) => {
          setLogsUserId(value);
          setLogsPage(0);
          setLogsPrefetched(false);
        }}
        logsSortDir={logsSortDir}
        setLogsSortDir={(value) => {
          setLogsSortDir(value);
          setLogsPage(0);
        }}
        logsLimit={logsLimit}
        setLogsLimit={(value) => {
          setLogsLimit(Number(value));
          setLogsPage(0);
        }}
        logsLoading={logsLoading}
        logsTotal={logsTotal}
        logsPage={logsPage}
        logsMaxPage={logsMaxPage}
        logsFrom={logsFrom}
        logsTo={logsTo}
        setLogsPage={setLogsPage}
        refreshAdminLogs={refreshAdminLogs}
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
      setLogsSearch,
      setLogsActionType,
      setLogsTargetTable,
      setLogsUserId,
      setLogsSortDir,
      setLogsLimit,
      setLogsPrefetched,
    ]
  );

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
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
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
      selectedTicket,
      normalizeText,
      copyWithToast,
      setToast,
      handleTicketStatus,
      setSelectedTicketId,
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
