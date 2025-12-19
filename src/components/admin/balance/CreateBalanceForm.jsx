export default function CreateBalanceForm({
  open,
  title = '',
  activeTab,
  createDraft,
  setCreateDraft,
  inputClass = '',
  realms = [],
  resources = [],
  sortedRealms = [],
  sortedResources = [],
  createSaving = false,
  onCreate,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-slate-950/40 p-3 space-y-3">
      <p className="text-xs text-slate-300">Creation d'un nouvel element ({title})</p>

      {activeTab === 'realms' && (
        <div className="grid gap-2 md:grid-cols-6">
          <input
            className={inputClass}
            placeholder="Code"
            value={createDraft.code ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Nom"
            value={createDraft.name ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className={`${inputClass} md:col-span-2`}
            placeholder="Description"
            value={createDraft.description ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />
          <label className="inline-flex items-center gap-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={!!createDraft.is_default_unlocked}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  is_default_unlocked: e.target.checked,
                }))
              }
              className="accent-amber-400"
            />
            Default
          </label>
        </div>
      )}

      {activeTab === 'realm_unlock_costs' && (
        <div className="grid gap-2 md:grid-cols-3">
          <select
            className={inputClass}
            value={createDraft.target_realm_id ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                target_realm_id: e.target.value,
              }))
            }
          >
            <option value="">Royaume</option>
            {realms.map((realm) => (
              <option key={`create-realm-${realm.id}`} value={realm.id}>
                {realm.code} (#{realm.id})
              </option>
            ))}
          </select>

          <select
            className={inputClass}
            value={createDraft.resource_id ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                resource_id: e.target.value,
              }))
            }
          >
            <option value="">Ressource</option>
            {resources.map((res) => (
              <option key={`create-res-${res.id}`} value={res.id}>
                {res.code} (#{res.id})
              </option>
            ))}
          </select>

          <input
            className={inputClass}
            placeholder="Montant"
            inputMode="decimal"
            value={createDraft.amount ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                amount: e.target.value,
              }))
            }
          />
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid gap-2 md:grid-cols-6">
          <input
            className={inputClass}
            placeholder="Realm ID (optionnel)"
            inputMode="numeric"
            value={createDraft.realm_id ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Code"
            value={createDraft.code ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Nom"
            value={createDraft.name ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className={`${inputClass} md:col-span-3`}
            placeholder="Description"
            value={createDraft.description ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />
        </div>
      )}

      {activeTab === 'factories' && (
        <div className="grid gap-2 md:grid-cols-10">
          <select
            className={inputClass}
            value={createDraft.realm_id ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))}
          >
            <option value="">Royaume</option>
            {sortedRealms.map((realm) => (
              <option key={`create-factory-realm-${realm.id}`} value={realm.id}>
                {realm.code} - {realm.name} (#{realm.id})
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={createDraft.resource_id ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({ ...p, resource_id: e.target.value }))
            }
          >
            <option value="">Ressource</option>
            {sortedResources.map((res) => (
              <option key={`create-factory-res-${res.id}`} value={res.id}>
                {res.code} - {res.name} (#{res.id})
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Code"
            value={createDraft.code ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Nom"
            value={createDraft.name ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className={`${inputClass} md:col-span-2`}
            placeholder="Description"
            value={createDraft.description ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Base prod"
            inputMode="decimal"
            value={createDraft.base_production ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                base_production: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Base cost"
            inputMode="decimal"
            value={createDraft.base_cost ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                base_cost: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Order"
            inputMode="numeric"
            value={createDraft.unlock_order ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                unlock_order: e.target.value,
              }))
            }
          />
          <label className="inline-flex items-center gap-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={!!createDraft.is_active}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  is_active: e.target.checked,
                }))
              }
              className="accent-amber-400"
            />
            Active
          </label>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid gap-2 md:grid-cols-12">
          <select
            className={inputClass}
            value={createDraft.realm_id ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))}
          >
            <option value="">Royaume</option>
            {sortedRealms.map((realm) => (
              <option key={`create-skill-realm-${realm.id}`} value={realm.id}>
                {realm.code} - {realm.name} (#{realm.id})
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Code"
            value={createDraft.code ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Nom"
            value={createDraft.name ?? ''}
            onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
          />
          <input
            className={`${inputClass} md:col-span-2`}
            placeholder="Description"
            value={createDraft.description ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Type"
            value={createDraft.effect_type ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                effect_type: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Value"
            inputMode="decimal"
            value={createDraft.effect_value ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                effect_value: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Max"
            inputMode="numeric"
            value={createDraft.max_level ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({ ...p, max_level: e.target.value }))
            }
          />
          <select
            className={inputClass}
            value={createDraft.base_cost_resource_id ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                base_cost_resource_id: e.target.value,
              }))
            }
          >
            <option value="">Ressource de cout</option>
            {sortedResources.map((res) => (
              <option key={`create-skill-costres-${res.id}`} value={res.id}>
                {res.code} - {res.name} (#{res.id})
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Base cost"
            inputMode="decimal"
            value={createDraft.base_cost_amount ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                base_cost_amount: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Growth"
            inputMode="decimal"
            value={createDraft.cost_growth_factor ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                cost_growth_factor: e.target.value,
              }))
            }
          />
          <input
            className={inputClass}
            placeholder="Order"
            inputMode="numeric"
            value={createDraft.unlock_order ?? ''}
            onChange={(e) =>
              setCreateDraft((p) => ({
                ...p,
                unlock_order: e.target.value,
              }))
            }
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={createSaving}
          onClick={onCreate}
          className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
        >
          {createSaving ? 'Creation.' : 'Creer'}
        </button>
      </div>
    </div>
  );
}
