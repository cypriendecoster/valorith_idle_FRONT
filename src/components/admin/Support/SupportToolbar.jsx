import { useState } from 'react';
import PaginationControls from '../../ui/PaginationControls';

export default function SupportToolbar({
  supportStatus = 'OPEN',
  setSupportStatus,
  supportCategory = '',
  setSupportCategory,
  supportCategoryOptions = [],
  supportSearch = '',
  setSupportSearch,
  supportSortDir = 'DESC',
  setSupportSortDir,
  supportLimit = 50,
  setSupportLimit,
  supportTicketsLoading = false,
  supportTicketsTotal = 0,
  supportPage = 0,
  supportMaxPage = 0,
  supportFrom = 0,
  supportTo = 0,
  setSupportPage,
  refreshSupportTickets,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={supportStatus}
          aria-label="Filtrer les tickets par statut"
          onChange={(e) => {
            if (setSupportStatus) setSupportStatus(e.target.value);
          }}
          className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        >
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
          <option value="">ALL</option>
        </select>

        <input
          value={supportSearch}
          aria-label="Rechercher un ticket"
          onChange={(e) => {
            if (setSupportSearch) setSupportSearch(e.target.value);
          }}
          placeholder="Rechercher ticket (email, pseudo, sujet...)"
          className="flex-1 min-w-0 md:flex-none md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        />

        <button
          type="button"
          onClick={() => refreshSupportTickets && refreshSupportTickets()}
          aria-label="Rafraichir les tickets"
          disabled={supportTicketsLoading}
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {supportTicketsLoading ? '...' : 'Rafraichir'}
        </button>

        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          aria-controls="support-advanced-filters"
          aria-expanded={showAdvanced}
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
        >
          Plus de filtres
        </button>

        <PaginationControls
          disabled={supportTicketsLoading || supportTicketsTotal <= 0}
          page={supportPage}
          maxPage={supportMaxPage}
          mode="range"
          from={supportFrom}
          to={supportTo}
          total={supportTicketsTotal}
          onPrev={() => setSupportPage && setSupportPage((p) => Math.max(0, p - 1))}
          onNext={() =>
            setSupportPage && setSupportPage((p) => Math.min(supportMaxPage, p + 1))
          }
          ariaPrev="Page precedente tickets"
          ariaNext="Page suivante tickets"
        />
      </div>

      <div
        id="support-advanced-filters"
        className={`flex flex-wrap items-center gap-2 ${
          showAdvanced ? '' : 'hidden'
        } md:flex`}
      >
        {supportStatus !== 'OPEN' ? (
          <button
            type="button"
            onClick={() => {
              if (setSupportStatus) setSupportStatus('OPEN');
            }}
            aria-label="Afficher uniquement les tickets ouverts"
            className="px-3 py-2 rounded-lg border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors text-xs"
          >
            OPEN only
          </button>
        ) : null}

        <div className="flex items-center gap-2">
          <input
            list="support-category-list"
            value={supportCategory}
            aria-label="Filtrer les tickets par categorie"
            onChange={(e) => {
              if (setSupportCategory) setSupportCategory(e.target.value);
            }}
            placeholder="Categorie"
            className="w-40 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          />
          <datalist id="support-category-list">
            {supportCategoryOptions.map((cat) => (
              <option key={`support-cat-${cat}`} value={cat} />
            ))}
          </datalist>
        </div>

        <select
          value={supportSortDir}
          aria-label="Trier les tickets"
          onChange={(e) => {
            if (setSupportSortDir) setSupportSortDir(e.target.value);
          }}
          className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
        >
          <option value="DESC">Recents</option>
          <option value="ASC">Anciens</option>
        </select>

        <select
          value={supportLimit}
          aria-label="Nombre de tickets par page"
          onChange={(e) => {
            if (setSupportLimit) setSupportLimit(Number(e.target.value));
          }}
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
            if (setSupportStatus) setSupportStatus('OPEN');
            if (setSupportCategory) setSupportCategory('');
            if (setSupportSearch) setSupportSearch('');
            if (setSupportSortDir) setSupportSortDir('DESC');
            if (setSupportLimit) setSupportLimit(200);
            if (setSupportPage) setSupportPage(0);
          }}
          aria-label="Reinitialiser tous les filtres tickets"
          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
        >
          Reinitialiser filtres
        </button>
        <button
          type="button"
          onClick={() => {
            if (setSupportStatus) setSupportStatus('OPEN');
            if (setSupportCategory) setSupportCategory('');
            if (setSupportSearch) setSupportSearch('');
            if (setSupportSortDir) setSupportSortDir('DESC');
            if (setSupportLimit) setSupportLimit(200);
            if (setSupportPage) setSupportPage(0);
            if (refreshSupportTickets) refreshSupportTickets();
          }}
          aria-label="Reinitialiser les filtres et rafraichir les tickets"
          className="px-3 py-2 rounded-lg border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors text-xs"
        >
          Reset + rafraichir
        </button>
      </div>
    </div>
  );
}
