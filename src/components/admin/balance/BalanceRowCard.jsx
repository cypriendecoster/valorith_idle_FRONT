import ActionMenu from '../../ui/ActionMenu';
import A11yDetailsWrap from '../../ui/A11yDetailsWrap';

export default function BalanceRowCard({
  activeTab,
  row,
  inputClass = '',
  mergedRow,
  isRowSaving,
  getRowDiffs,
  requestSave,
  requestDelete,
  updateField,
  realmUnlockCostsByRealmId,
  resources = [],
  realms = [],
  sortedRealms = [],
  sortedResources = [],
}) {
  const resolveRow = mergedRow || ((_, data) => data ?? {});
  const r = resolveRow(activeTab, row);
  const busy = isRowSaving ? isRowSaving(activeTab, row.id) : false;
  const canSave = getRowDiffs ? getRowDiffs(activeTab, row).length > 0 : false;
  const onSave = requestSave || (() => {});
  const onDelete = requestDelete || (() => {});
  const onUpdate = updateField || (() => {});
  const unlockCostsByRealm =
    realmUnlockCostsByRealmId instanceof Map ? realmUnlockCostsByRealmId : new Map();

  const headerLabel =
    activeTab === 'realms'
      ? `${r.code || row.code || ''} ${r.name || row.name || ''}`.trim()
      : activeTab === 'realm_unlock_costs'
        ? `Cout #${row.id}`
        : `${r.code || row.code || ''} ${r.name || row.name || ''}`.trim();

  const saveButton = (
    <button
      type="button"
      disabled={busy || !canSave}
      onClick={() => onSave(activeTab, row)}
      className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors text-xs"
    >
      {busy ? 'Sauvegarde.' : 'Sauvegarder'}
    </button>
  );

  return (
    <A11yDetailsWrap
      className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
      summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none"
    >
      <summary className="cursor-pointer select-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-100 font-semibold">
              {headerLabel || '(sans libelle)'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">#{row.id}</p>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ouvrir</p>
        </div>
      </summary>

      <div className="pt-3 space-y-3">
        {activeTab === 'realms' && (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Code
                </p>
                <input
                  className={inputClass}
                  value={r.code ?? ''}
                  onChange={(e) => onUpdate('realms', row.id, 'code', e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Nom
                </p>
                <input
                  className={inputClass}
                  value={r.name ?? ''}
                  onChange={(e) => onUpdate('realms', row.id, 'name', e.target.value)}
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Description
              </p>
              <input
                className={inputClass}
                value={r.description ?? ''}
                onChange={(e) =>
                  onUpdate('realms', row.id, 'description', e.target.value)
                }
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Couts
              </p>
              {(() => {
                const costs =
                  Array.isArray(row.unlockCosts) && row.unlockCosts.length > 0
                    ? row.unlockCosts
                    : unlockCostsByRealm.get(Number(row.id)) || [];
                if (costs.length === 0) {
                  return <p className="text-xs text-slate-400 mt-1">-</p>;
                }
                return (
                  <ul className="mt-1 space-y-0.5">
                    {costs.map((c) => {
                      const resourceId = Number(c.resourceId ?? c.resource_id);
                      const amount = Number(c.amount ?? 0);
                      const label =
                        c.resourceName ||
                        c.resource_name ||
                        resources.find((res) => Number(res.id) === resourceId)?.name ||
                        resources.find((res) => Number(res.id) === resourceId)?.code ||
                        c.resourceCode ||
                        c.resource_code ||
                        `#${resourceId}`;

                      return (
                        <li
                          key={`realm-cost-mobile-${row.id}-${resourceId}-${amount}`}
                          className="text-xs text-slate-200"
                        >
                          <span className="font-mono text-amber-200">{amount}</span>{' '}
                          <span className="text-slate-300">{label}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={!!r.is_default_unlocked}
                onChange={(e) =>
                  onUpdate('realms', row.id, 'is_default_unlocked', e.target.checked)
                }
                className="accent-amber-400"
              />
              Default
            </label>
          </>
        )}

        {activeTab === 'realm_unlock_costs' && (
          <div className="grid gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Royaume
              </p>
              <select
                className={inputClass}
                value={r.target_realm_id ?? ''}
                onChange={(e) =>
                  onUpdate('realm_unlock_costs', row.id, 'target_realm_id', e.target.value)
                }
              >
                <option value="">-</option>
                {realms.map((realm) => (
                  <option key={`realm-opt-mobile-${realm.id}`} value={realm.id}>
                    {realm.code} (#{realm.id})
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
                value={r.resource_id ?? ''}
                onChange={(e) =>
                  onUpdate('realm_unlock_costs', row.id, 'resource_id', e.target.value)
                }
              >
                <option value="">-</option>
                {resources.map((res) => (
                  <option key={`res-opt-mobile-${res.id}`} value={res.id}>
                    {res.code} (#{res.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Montant
              </p>
              <input
                className={inputClass}
                inputMode="decimal"
                value={r.amount ?? ''}
                onChange={(e) =>
                  onUpdate('realm_unlock_costs', row.id, 'amount', e.target.value)
                }
              />
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid gap-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Realm ID
                </p>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={r.realm_id ?? ''}
                  onChange={(e) => onUpdate('resources', row.id, 'realm_id', e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Code
                </p>
                <input
                  className={inputClass}
                  value={r.code ?? ''}
                  onChange={(e) => onUpdate('resources', row.id, 'code', e.target.value)}
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Nom
              </p>
              <input
                className={inputClass}
                value={r.name ?? ''}
                onChange={(e) => onUpdate('resources', row.id, 'name', e.target.value)}
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Description
              </p>
              <input
                className={inputClass}
                value={r.description ?? ''}
                onChange={(e) =>
                  onUpdate('resources', row.id, 'description', e.target.value)
                }
              />
            </div>
          </div>
        )}

        {activeTab === 'factories' && (
          <div className="grid gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Royaume
              </p>
              <select
                className={inputClass}
                value={r.realm_id ?? ''}
                onChange={(e) => onUpdate('factories', row.id, 'realm_id', e.target.value)}
              >
                <option value="">Royaume</option>
                {sortedRealms.map((realm) => (
                  <option key={`factory-realm-mobile-${row.id}-${realm.id}`} value={realm.id}>
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
                value={r.resource_id ?? ''}
                onChange={(e) =>
                  onUpdate('factories', row.id, 'resource_id', e.target.value)
                }
              >
                <option value="">Ressource</option>
                {sortedResources.map((res) => (
                  <option key={`factory-res-mobile-${row.id}-${res.id}`} value={res.id}>
                    {res.code} - {res.name} (#{res.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Code
                </p>
                <input
                  className={inputClass}
                  value={r.code ?? ''}
                  onChange={(e) => onUpdate('factories', row.id, 'code', e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Nom
                </p>
                <input
                  className={inputClass}
                  value={r.name ?? ''}
                  onChange={(e) => onUpdate('factories', row.id, 'name', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Base prod
                </p>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={r.base_production ?? ''}
                  onChange={(e) =>
                    onUpdate('factories', row.id, 'base_production', e.target.value)
                  }
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Base cost
                </p>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={r.base_cost ?? ''}
                  onChange={(e) =>
                    onUpdate('factories', row.id, 'base_cost', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 items-end">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Order
                </p>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={r.unlock_order ?? ''}
                  onChange={(e) =>
                    onUpdate('factories', row.id, 'unlock_order', e.target.value)
                  }
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={!!r.is_active}
                  onChange={(e) => onUpdate('factories', row.id, 'is_active', e.target.checked)}
                  className="accent-amber-400"
                />
                Active
              </label>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Royaume
              </p>
              <select
                className={inputClass}
                value={r.realm_id ?? ''}
                onChange={(e) => onUpdate('skills', row.id, 'realm_id', e.target.value)}
              >
                <option value="">Royaume</option>
                {sortedRealms.map((realm) => (
                  <option key={`skill-realm-mobile-${row.id}-${realm.id}`} value={realm.id}>
                    {realm.code} - {realm.name} (#{realm.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Code
                </p>
                <input
                  className={inputClass}
                  value={r.code ?? ''}
                  onChange={(e) => onUpdate('skills', row.id, 'code', e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Nom
                </p>
                <input
                  className={inputClass}
                  value={r.name ?? ''}
                  onChange={(e) => onUpdate('skills', row.id, 'name', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Type
                </p>
                <input
                  className={inputClass}
                  value={r.effect_type ?? ''}
                  onChange={(e) => onUpdate('skills', row.id, 'effect_type', e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Value
                </p>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={r.effect_value ?? ''}
                  onChange={(e) => onUpdate('skills', row.id, 'effect_value', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Max
                </p>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={r.max_level ?? ''}
                  onChange={(e) => onUpdate('skills', row.id, 'max_level', e.target.value)}
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Cost res
                </p>
                <select
                  className={inputClass}
                  value={r.base_cost_resource_id ?? ''}
                  onChange={(e) =>
                    onUpdate('skills', row.id, 'base_cost_resource_id', e.target.value)
                  }
                >
                  <option value="">Ressource</option>
                  {sortedResources.map((res) => (
                    <option key={`skill-costres-mobile-${row.id}-${res.id}`} value={res.id}>
                      {res.code} - {res.name} (#{res.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Base cost
                </p>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={r.base_cost_amount ?? ''}
                  onChange={(e) =>
                    onUpdate('skills', row.id, 'base_cost_amount', e.target.value)
                  }
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                  Growth
                </p>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={r.cost_growth_factor ?? ''}
                  onChange={(e) =>
                    onUpdate('skills', row.id, 'cost_growth_factor', e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Order
              </p>
              <input
                className={inputClass}
                inputMode="numeric"
                value={r.unlock_order ?? ''}
                onChange={(e) => onUpdate('skills', row.id, 'unlock_order', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end pt-1">
          {saveButton}
          <ActionMenu
            ariaLabel="Actions"
            items={[
              {
                key: 'delete',
                label: 'Supprimer',
                danger: true,
                onClick: () => onDelete(activeTab, row),
              },
            ]}
          />
        </div>
      </div>
    </A11yDetailsWrap>
  );
}
