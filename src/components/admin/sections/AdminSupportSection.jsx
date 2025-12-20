import SupportPanel from '../Support/SupportPanel';

export default function AdminSupportSection({
  supportTab = 'tickets',
  setSupportTab,
  setSelectedTicketId,
  setSelectedTicketIds,
  setSupportPage,
  setLogsPage,
  ticketsCount = 0,
  logsCount = 0,
  maintenance,
  ticketsToolbar,
  logsToolbar,
  ticketsContent,
  logsContent,
}) {
  const handleTabChange = (tab) => {
    setSupportTab(tab);
    setSelectedTicketId(null);
    setSelectedTicketIds([]);
    if (tab === 'tickets') {
      setSupportPage(0);
    } else {
      setLogsPage(0);
    }
  };

  return (
    <SupportPanel
      supportTab={supportTab}
      onTabChange={handleTabChange}
      ticketsCount={ticketsCount}
      logsCount={logsCount}
      maintenance={maintenance}
      ticketsToolbar={ticketsToolbar}
      logsToolbar={logsToolbar}
      ticketsContent={ticketsContent}
      logsContent={logsContent}
    />
  );
}
