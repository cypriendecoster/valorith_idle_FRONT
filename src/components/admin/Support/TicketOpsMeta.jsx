import KeyValueRow from '../../ui/KeyValueRow';
import CopyButton from '../../ui/CopyButton';

export default function TicketOpsMeta({
  selectedTicket,
  normalizeText = (value) => String(value ?? '').trim(),
  copyWithToast,
}) {
  if (!selectedTicket) return null;

  const handleCopy = (value, label) => {
    if (copyWithToast) copyWithToast(value, label);
  };

  const openPage = (url) => {
    if (!normalizeText(url)) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-lg border border-slate-800/70 bg-black/20 p-3 space-y-2">
      <p className="text-xs text-slate-300 font-semibold">Infos techniques</p>
      <dl className="grid gap-2 sm:grid-cols-2 text-[11px] text-slate-300">
        <div>
          <dt className="uppercase tracking-widest text-slate-500">Categorie</dt>
          <dd className="mt-0.5 text-slate-200">{selectedTicket.category || '-'}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest text-slate-500">Date serveur</dt>
          <dd className="mt-0.5 text-slate-200 font-mono">
            {selectedTicket.created_at
              ? new Date(selectedTicket.created_at).toLocaleString('fr-FR')
              : '-'}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest text-slate-500">IP</dt>
          <dd className="mt-0.5 text-slate-200 font-mono">
            {selectedTicket.ip_address || '-'}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest text-slate-500">Heure client</dt>
          <dd className="mt-0.5 text-slate-200 font-mono">
            {selectedTicket.client_time_iso
              ? new Date(selectedTicket.client_time_iso).toLocaleString('fr-FR')
              : '-'}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="uppercase tracking-widest text-slate-500">Page</dt>
          <dd className="mt-0.5 text-slate-200 break-all">
            {selectedTicket.page_url ? (
              <div className="flex items-start justify-between gap-2">
                <a
                  href={selectedTicket.page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-200 hover:text-amber-100 underline underline-offset-2 break-all"
                  title={selectedTicket.page_url}
                >
                  {selectedTicket.page_url}
                </a>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPage(selectedTicket.page_url)}
                    aria-label="Ouvrir la page du ticket"
                    className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                  >
                    Ouvrir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTicket.page_url, 'URL page')}
                    aria-label="Copier l'URL de la page"
                    className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                  >
                    Copier
                  </button>
                </div>
              </div>
            ) : (
              '-'
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <KeyValueRow
            label="User-Agent"
            value={selectedTicket.user_agent || '-'}
            mono
            actions={
              <CopyButton
                value={selectedTicket.user_agent}
                label="Copier UA"
                ariaLabel="Copier User-Agent"
                disabled={!normalizeText(selectedTicket.user_agent)}
                className="px-2 py-1 rounded-md text-[11px]"
              />
            }
          />
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => handleCopy(selectedTicket.ip_address, 'IP')}
          disabled={!normalizeText(selectedTicket.ip_address)}
          aria-label="Copier l'adresse IP"
          className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Copier IP
        </button>
        <button
          type="button"
          onClick={() => handleCopy(selectedTicket.user_agent, 'User-Agent')}
          disabled={!normalizeText(selectedTicket.user_agent)}
          aria-label="Copier le User-Agent"
          className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Copier UA
        </button>
      </div>
    </div>
  );
}
