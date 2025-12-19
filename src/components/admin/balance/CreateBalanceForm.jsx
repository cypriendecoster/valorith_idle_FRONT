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

  const trim = (value) => String(value ?? '').trim();
  const isMissing = (value) => !trim(value);
  const isNumeric = (value) => {
    const t = trim(value);
    if (!t) return false;
    const n = Number(t);
    return Number.isFinite(n);
  };

  const errors = [];

  if (activeTab === 'realms') {
    if (isMissing(createDraft.code)) errors.push('Code requis.');
    if (isMissing(createDraft.name)) errors.push('Nom requis.');
  }

  if (activeTab === 'realm_unlock_costs') {
    if (isMissing(createDraft.target_realm_id)) errors.push('Royaume requis.');
    if (isMissing(createDraft.resource_id)) errors.push('Ressource requise.');
    if (isMissing(createDraft.amount)) errors.push('Montant requis.');
    else if (!isNumeric(createDraft.amount)) errors.push('Montant invalide.');
  }

  if (activeTab === 'resources') {
    if (isMissing(createDraft.code)) errors.push('Code requis.');
    if (isMissing(createDraft.name)) errors.push('Nom requis.');
    if (!isMissing(createDraft.realm_id) && !isNumeric(createDraft.realm_id)) {
      errors.push('Realm ID invalide.');
    }
  }

  if (activeTab === 'factories') {
    if (isMissing(createDraft.realm_id)) errors.push('Royaume requis.');
    if (isMissing(createDraft.resource_id)) errors.push('Ressource requise.');
    if (isMissing(createDraft.code)) errors.push('Code requis.');
    if (isMissing(createDraft.name)) errors.push('Nom requis.');
    if (isMissing(createDraft.base_production)) errors.push('Base prod requise.');
    else if (!isNumeric(createDraft.base_production)) errors.push('Base prod invalide.');
    if (isMissing(createDraft.base_cost)) errors.push('Base cost requise.');
    else if (!isNumeric(createDraft.base_cost)) errors.push('Base cost invalide.');
    if (isMissing(createDraft.unlock_order)) errors.push('Order requis.');
    else if (!isNumeric(createDraft.unlock_order)) errors.push('Order invalide.');
  }

  if (activeTab === 'skills') {
    if (isMissing(createDraft.realm_id)) errors.push('Royaume requis.');
    if (isMissing(createDraft.code)) errors.push('Code requis.');
    if (isMissing(createDraft.name)) errors.push('Nom requis.');
    if (isMissing(createDraft.effect_type)) errors.push('Type requis.');
    if (isMissing(createDraft.effect_value)) errors.push('Value requise.');
    else if (!isNumeric(createDraft.effect_value)) errors.push('Value invalide.');
    if (isMissing(createDraft.max_level)) errors.push('Max requis.');
    else if (!isNumeric(createDraft.max_level)) errors.push('Max invalide.');
    if (isMissing(createDraft.base_cost_resource_id))
      errors.push('Ressource de cout requise.');
    if (isMissing(createDraft.base_cost_amount)) errors.push('Base cost requise.');
    else if (!isNumeric(createDraft.base_cost_amount))
      errors.push('Base cost invalide.');
    if (isMissing(createDraft.cost_growth_factor)) errors.push('Growth requis.');
    else if (!isNumeric(createDraft.cost_growth_factor))
      errors.push('Growth invalide.');
    if (isMissing(createDraft.unlock_order)) errors.push('Order requis.');
    else if (!isNumeric(createDraft.unlock_order)) errors.push('Order invalide.');
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-500/30 bg-slate-950/40 p-3 space-y-3">
      <p className="text-xs text-slate-300">Creation d'un nouvel element ({title})</p>

      {activeTab === 'realms' && (
        <div className="grid gap-2 md:grid-cols-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Code</p>
            <input
              className={inputClass}
              placeholder="Code"
              aria-label="Code"
              value={createDraft.code ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Nom</p>
            <input
              className={inputClass}
              placeholder="Nom"
              aria-label="Nom"
              value={createDraft.name ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Description
            </p>
            <input
              className={inputClass}
              placeholder="Description"
              aria-label="Description"
              value={createDraft.description ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
          </div>
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
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Royaume</p>
            <select
              className={inputClass}
              aria-label="Royaume"
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
          </div>

          <div>
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
              {resources.map((res) => (
                <option key={`create-res-${res.id}`} value={res.id}>
                  {res.code} (#{res.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Montant</p>
            <input
              className={inputClass}
              placeholder="Montant"
              aria-label="Montant"
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
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid gap-2 md:grid-cols-6">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Realm ID (optionnel)
            </p>
            <input
              className={inputClass}
              placeholder="Realm ID (optionnel)"
              aria-label="Realm ID (optionnel)"
              inputMode="numeric"
              value={createDraft.realm_id ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Code</p>
            <input
              className={inputClass}
              placeholder="Code"
              aria-label="Code"
              value={createDraft.code ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Nom</p>
            <input
              className={inputClass}
              placeholder="Nom"
              aria-label="Nom"
              value={createDraft.name ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Description
            </p>
            <input
              className={inputClass}
              placeholder="Description"
              aria-label="Description"
              value={createDraft.description ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </div>
      )}

      {activeTab === 'factories' && (
        <div className="grid gap-2 md:grid-cols-10">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Royaume</p>
            <select
              className={inputClass}
              aria-label="Royaume"
              value={createDraft.realm_id ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))
              }
            >
              <option value="">Royaume</option>
              {sortedRealms.map((realm) => (
                <option key={`create-factory-realm-${realm.id}`} value={realm.id}>
                  {realm.code} - {realm.name} (#{realm.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Ressource
            </p>
            <select
              className={inputClass}
              aria-label="Ressource"
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
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Code</p>
            <input
              className={inputClass}
              placeholder="Code"
              aria-label="Code"
              value={createDraft.code ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Nom</p>
            <input
              className={inputClass}
              placeholder="Nom"
              aria-label="Nom"
              value={createDraft.name ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Description
            </p>
            <input
              className={inputClass}
              placeholder="Description"
              aria-label="Description"
              value={createDraft.description ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Base prod
            </p>
            <input
              className={inputClass}
              placeholder="Base prod"
              aria-label="Base prod"
              inputMode="decimal"
              value={createDraft.base_production ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  base_production: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Base cost
            </p>
            <input
              className={inputClass}
              placeholder="Base cost"
              aria-label="Base cost"
              inputMode="decimal"
              value={createDraft.base_cost ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  base_cost: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Order</p>
            <input
              className={inputClass}
              placeholder="Order"
              aria-label="Order"
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
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Royaume</p>
            <select
              className={inputClass}
              aria-label="Royaume"
              value={createDraft.realm_id ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))
              }
            >
              <option value="">Royaume</option>
              {sortedRealms.map((realm) => (
                <option key={`create-skill-realm-${realm.id}`} value={realm.id}>
                  {realm.code} - {realm.name} (#{realm.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Code</p>
            <input
              className={inputClass}
              placeholder="Code"
              aria-label="Code"
              value={createDraft.code ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Nom</p>
            <input
              className={inputClass}
              placeholder="Nom"
              aria-label="Nom"
              value={createDraft.name ?? ''}
              onChange={(e) => setCreateDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Description
            </p>
            <input
              className={inputClass}
              placeholder="Description"
              aria-label="Description"
              value={createDraft.description ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Type</p>
            <input
              className={inputClass}
              placeholder="Type"
              aria-label="Type"
              value={createDraft.effect_type ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  effect_type: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Value</p>
            <input
              className={inputClass}
              placeholder="Value"
              aria-label="Value"
              inputMode="decimal"
              value={createDraft.effect_value ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  effect_value: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Max</p>
            <input
              className={inputClass}
              placeholder="Max"
              aria-label="Max"
              inputMode="numeric"
              value={createDraft.max_level ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({ ...p, max_level: e.target.value }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Ressource de cout
            </p>
            <select
              className={inputClass}
              aria-label="Ressource de cout"
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
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Base cost
            </p>
            <input
              className={inputClass}
              placeholder="Base cost"
              aria-label="Base cost"
              inputMode="decimal"
              value={createDraft.base_cost_amount ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  base_cost_amount: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              Growth
            </p>
            <input
              className={inputClass}
              placeholder="Growth"
              aria-label="Growth"
              inputMode="decimal"
              value={createDraft.cost_growth_factor ?? ''}
              onChange={(e) =>
                setCreateDraft((p) => ({
                  ...p,
                  cost_growth_factor: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">Order</p>
            <input
              className={inputClass}
              placeholder="Order"
              aria-label="Order"
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
        </div>
      )}

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
          disabled={createSaving || errors.length > 0}
          onClick={onCreate}
          className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
        >
          {createSaving ? 'Creation.' : 'Creer'}
        </button>
      </div>
    </div>
  );
}
