import SupportPanel from '../Support/SupportPanel';

export default function AdminSupportSection({
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
  return (
    <SupportPanel
      supportTab={supportTab}
      onTabChange={onTabChange}
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
