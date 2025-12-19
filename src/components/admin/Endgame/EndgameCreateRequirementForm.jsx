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

  return (
    <div className="rounded-xl border border-amber-500/30 bg-slate-950/40 p-3 space-y-3">
      <p className="text-xs text-slate-300">Creation d'une regle endgame</p>
      <div className="grid gap-2 md:grid-cols-6">
        <select
          className={`${inputClass} md:col-span-3`}
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
        <input
          className={`${inputClass} md:col-span-2`}
          placeholder="Montant"
          inputMode="decimal"
          value={createDraft.amount ?? ''}
          onChange={(e) =>
            setCreateDraft((p) => ({ ...p, amount: e.target.value }))
          }
        />
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
            disabled={createSaving}
            onClick={onCreate}
            className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
          >
            {createSaving ? 'Creation...' : 'Creer'}
          </button>
        </div>
      </div>
    </div>
  );
}
