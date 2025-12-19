export default function EndgameCreateRequirementForm({
  open = false,
  inputClass = '',
  createDraft,
  setCreateDraft = () => {},
  sortedResources = [],
  createSaving = false,
  onCancel,
  onCreate,
}) {
  if (!open) return null;

  const trim = (value) => String(value ?? '').trim();
  const isMissing = (value) => !trim(value);
  const isNumeric = (value) => {
    const t = trim(value);
    if (!t) return false;
    const n = Number(t);
    return Number.isFinite(n);
  };

  const errors = [];
  if (isMissing(createDraft.resource_id)) errors.push('Ressource requise.');
  if (isMissing(createDraft.amount)) errors.push('Montant requis.');
  else if (!isNumeric(createDraft.amount)) errors.push('Montant invalide.');

  return (
    <div className="rounded-xl border border-amber-500/30 bg-slate-950/40 p-3 space-y-3">
      <p className="text-xs text-slate-300">Creation d'une regle endgame</p>
      <div className="grid gap-2 md:grid-cols-6">
        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-widest text-slate-400">Ressource</p>
          <select
            className={inputClass}
            aria-label="Ressource"
            value={createDraft.resource_id ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                resource_id: e.target.value,
              }))
            }
          >
            <option value="">Ressource</option>
            {sortedResources.map((res) => (
              <option key={`endgame-create-res-${res.id}`} value={res.id}>
                {res.code} - {res.name} (#{res.id})
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] uppercase tracking-widest text-slate-400">Montant</p>
          <input
            className={inputClass}
            placeholder="Montant"
            aria-label="Montant"
            inputMode="decimal"
            value={createDraft.amount ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({ ...p, amount: e.target.value }))
            }
          />
        </div>
        <div className="flex gap-2 justify-end md:col-span-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={createSaving || errors.length > 0}
            onClick={onCreate}
            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
          >
            {createSaving ? 'Creation...' : 'Creer'}
          </button>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2">
          <p className="text-[11px] uppercase tracking-widest text-red-300">
            Champs invalides
          </p>
          <ul className="mt-1 text-xs text-red-200 space-y-0.5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
