import StatusBadge from '../../ui/StatusBadge';
import TableShell from '../../ui/TableShell';
import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';

export default function TicketsList({
  supportTickets = [],
  supportTicketsLoading = false,
  selectedTicketId,
  selectedTicketIds = [],
  onSelectTicket,
  onToggleTicket,
}) {
  if (supportTicketsLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="md:hidden">
          <SkeletonCards items={6} />
        </div>
        <div className="hidden md:block">
          <SkeletonTable rows={8} cols={5} titleWidth="w-28" />
        </div>
      </div>
    );
  }

  if (!supportTickets || supportTickets.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3">
        <p className="text-sm text-slate-300">Aucun resultat.</p>
      </div>
    );
  }

  const selectTicket = (ticket) => {
    if (onSelectTicket) onSelectTicket(ticket);
  };
  const toggleTicket = (ticket) => {
    if (onToggleTicket) onToggleTicket(ticket);
  };
  const isSelected = (ticket) =>
    selectedTicketIds.some((id) => Number(id) === Number(ticket.id));

  return (
    <>
      <div className="md:hidden space-y-2">
        {supportTickets.map((ticket) => {
          const selected = Number(selectedTicketId) === Number(ticket.id);
          const multiSelected = isSelected(ticket);
          return (
            <button
              key={`ticket-card-${ticket.id}`}
              type="button"
              onClick={() => selectTicket(ticket)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                selected
                  ? 'border-amber-400/50 bg-amber-500/10'
                  : 'border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40'
              } focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={multiSelected}
                    aria-label={`Selectionner le ticket #${ticket.id}`}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleTicket(ticket);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="accent-amber-400"
                  />
                  <p className="text-[11px] text-amber-300 font-mono">#{ticket.id}</p>
                </div>
                <p className="text-[11px] text-slate-300">
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleString('fr-FR')
                    : '-'}
                </p>
              </div>

              <p className="mt-1 text-sm text-slate-100 font-semibold">
                {ticket.subject || ticket.category || '(sans sujet)'}
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                {ticket.username || ticket.email || '-'}
              </p>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Status:</span> <StatusBadge status={ticket.status} />
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {ticket.category || ''}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <TableShell className="hidden md:block" asChild>
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-slate-800/70">
              <th className="py-2 pr-3">Sel</th>
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">User</th>
              <th className="py-2 pr-3">Sujet</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {supportTickets.map((ticket) => {
              const selected = Number(selectedTicketId) === Number(ticket.id);
              const multiSelected = isSelected(ticket);
              return (
                <tr
                  key={`ticket-${ticket.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ouvrir le ticket #${ticket.id}`}
                  aria-selected={selected}
                  className={`border-b border-slate-800/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    selected ? 'bg-amber-500/10' : 'hover:bg-slate-900/40'
                  }`}
                  onClick={() => selectTicket(ticket)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectTicket(ticket);
                    }
                  }}
                >
                  <td className="py-2 pr-3">
                    <input
                      type="checkbox"
                      checked={multiSelected}
                      aria-label={`Selectionner le ticket #${ticket.id}`}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTicket(ticket);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-amber-400"
                    />
                  </td>
                  <td className="py-2 pr-3 font-mono text-amber-300">{ticket.id}</td>
                  <td className="py-2 pr-3 text-slate-200">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-2 pr-3 text-slate-300">
                    {ticket.username || ticket.email || '-'}
                  </td>
                  <td className="py-2 pr-3 text-slate-300">
                    <span className="block max-w-[240px] truncate">
                      {ticket.subject || ticket.category || '-'}
                    </span>
                  </td>
                  <td className="py-2 text-slate-400">
                    {ticket.created_at
                      ? new Date(ticket.created_at).toLocaleString('fr-FR')
                      : '-'}
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
