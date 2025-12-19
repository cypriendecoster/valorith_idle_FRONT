import ActionMenu from '../../ui/ActionMenu';
import A11yDetails from '../../ui/A11yDetails';
import StatusBadge from '../../ui/StatusBadge';
import TicketOpsMeta from './TicketOpsMeta';

export default function TicketDetail({
  selectedTicketId,
  selectedTicket,
  onBack,
  normalizeText = (value) => String(value ?? '').trim(),
  copyWithToast,
  setToast,
  handleTicketStatus,
}) {
  if (!selectedTicketId) {
    return <p className="text-sm text-slate-300">Selectionne un ticket.</p>;
  }

  if (!selectedTicket) {
    return <p className="text-sm text-slate-300">Chargement...</p>;
  }

  const onCopy = (value, label) => {
    if (copyWithToast) copyWithToast(value, label);
  };

  const openPage = (url) => {
    if (!normalizeText(url)) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div aria-live="polite" aria-atomic="true">
      <button
        type="button"
        onClick={onBack}
        aria-label="Retour"
        className="lg:hidden px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
      >
        {'<'} Retour
      </button>
      <p className="text-xs text-slate-300">Detail du ticket</p>

      <div className="text-sm text-slate-100">
        <p className="font-semibold flex flex-wrap items-center gap-2">
          <span className="font-mono text-amber-300">#{selectedTicket.id}</span>
          <StatusBadge status={selectedTicket.status} />
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {selectedTicket.username || '-'} · {selectedTicket.email || '-'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ActionMenu
            ariaLabel="Actions rapides ticket"
            triggerLabel="Copier"
            items={[
              {
                key: 'copy-id',
                label: `Copier ID (#${selectedTicket.id})`,
                onClick: () => onCopy(selectedTicket.id, 'ID'),
              },
              {
                key: 'copy-email',
                label: 'Copier email',
                disabled: !normalizeText(selectedTicket.email),
                onClick: () => onCopy(selectedTicket.email, 'Email'),
              },
              {
                key: 'copy-ip',
                label: 'Copier IP',
                disabled: !normalizeText(selectedTicket.ip_address),
                onClick: () => onCopy(selectedTicket.ip_address, 'IP'),
              },
              {
                key: 'copy-ua',
                label: 'Copier User-Agent',
                disabled: !normalizeText(selectedTicket.user_agent),
                onClick: () => onCopy(selectedTicket.user_agent, 'User-Agent'),
              },
              {
                key: 'copy-page',
                label: 'Copier URL page',
                disabled: !normalizeText(selectedTicket.page_url),
                onClick: () => onCopy(selectedTicket.page_url, 'URL page'),
              },
              {
                key: 'open-page',
                label: 'Ouvrir page',
                disabled: !normalizeText(selectedTicket.page_url),
                onClick: () => openPage(selectedTicket.page_url),
              },
            ]}
          />
          {selectedTicket.page_url ? (
            <button
              type="button"
              onClick={() => openPage(selectedTicket.page_url)}
              aria-label="Ouvrir la page du ticket"
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
            >
              Ouvrir page
            </button>
          ) : null}
        </div>
      </div>

      <TicketOpsMeta
        selectedTicket={selectedTicket}
        normalizeText={normalizeText}
        copyWithToast={copyWithToast}
      />

      {selectedTicket.client_meta ? (
        <A11yDetails
          className="pt-1"
          summary="Client meta"
          summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-slate-300 hover:text-slate-200"
        >
          <pre className="mt-2 whitespace-pre-wrap text-[11px] text-slate-200 font-mono rounded-md border border-slate-800/70 bg-slate-950/40 p-2 max-h-48 overflow-y-auto">
            {typeof selectedTicket.client_meta === 'string'
              ? selectedTicket.client_meta
              : JSON.stringify(selectedTicket.client_meta, null, 2)}
          </pre>
        </A11yDetails>
      ) : null}

      <div className="rounded-lg border border-slate-800/70 bg-black/20 p-3">
        <p className="text-xs text-slate-300 mb-2">
          {selectedTicket.subject || '(sans sujet)'}
        </p>
        <pre className="whitespace-pre-wrap text-xs text-slate-200 font-mono">
          {selectedTicket.message || ''}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => handleTicketStatus && handleTicketStatus(selectedTicket.id, 'OPEN')}
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
        >
          Reouvrir
        </button>
        <button
          type="button"
          onClick={() =>
            handleTicketStatus && handleTicketStatus(selectedTicket.id, 'CLOSED')
          }
          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold transition-colors"
        >
          Clore
        </button>
      </div>
    </div>
  );
}
