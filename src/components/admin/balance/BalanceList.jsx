import ActionMenu from '../../ui/ActionMenu';
import A11yDetailsWrap from '../../ui/A11yDetailsWrap';
import TableShell from '../../ui/TableShell';
import SkeletonCards from '../../ui/SkeletonCards';
import SkeletonTable from '../../ui/SkeletonTable';

export default function BalanceList({
  activeTab,
  loading,
  visibleRows = [],
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
  const resolveRow = mergedRow || ((_, row) => row ?? {});
  const rowBusy = isRowSaving || (() => false);
  const rowDiffs = getRowDiffs || (() => []);
  const onSave = requestSave || (() => {});
  const onDelete = requestDelete || (() => {});
  const onUpdate = updateField || (() => {});
  const unlockCostsByRealm =
    realmUnlockCostsByRealmId instanceof Map ? realmUnlockCostsByRealmId : new Map();

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="md:hidden">
          <SkeletonCards items={6} />
        </div>
        <div className="hidden md:block">
          <SkeletonTable
            rows={10}
            cols={activeTab === 'realm_unlock_costs' ? 4 : 6}
            titleWidth="w-28"
          />
        </div>
      </div>
    );
  }

  if (!visibleRows || visibleRows.length === 0) {
    return <p className="text-sm text-slate-300">Aucun resultat.</p>;
  }

  return (
    <>
      <div className="md:hidden space-y-2">
        {visibleRows.map((row) => {
          const type = activeTab;
          const r = resolveRow(type, row);
          const busy = rowBusy(type, row.id);
          const canSave = rowDiffs(type, row).length > 0;

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
              onClick={() => onSave(type, row)}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors text-xs"
            >
              {busy ? 'Sauvegarde.' : 'Sauvegarder'}
            </button>
          );

          return (
            <A11yDetailsWrap
              key={`balance-card-${type}-${row.id}`}
              className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
              summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none"
            >
              <summary className="cursor-pointer select-none">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-100 font-semibold">
                      {headerLabel || '(sans libelle)'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      #{row.id}
                    </p>
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
                          onChange={(e) =>
                            onUpdate('realms', row.id, 'code', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                          Nom
                        </p>
                        <input
                          className={inputClass}
                          value={r.name ?? ''}
                          onChange={(e) =>
                            onUpdate('realms', row.id, 'name', e.target.value)
                          }
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
                          onUpdate(
                            'realms',
                            row.id,
                            'is_default_unlocked',
                            e.target.checked
                          )
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
                          onUpdate(
                            'realm_unlock_costs',
                            row.id,
                            'target_realm_id',
                            e.target.value
                          )
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
                          onChange={(e) =>
                            onUpdate('resources', row.id, 'realm_id', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                          Code
                        </p>
                        <input
                          className={inputClass}
                          value={r.code ?? ''}
                          onChange={(e) =>
                            onUpdate('resources', row.id, 'code', e.target.value)
                          }
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
                        onChange={(e) =>
                          onUpdate('resources', row.id, 'name', e.target.value)
                        }
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
                  <div className="hidden">Edition complete disponible sur desktop.</div>
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
                        onChange={(e) =>
                          onUpdate('factories', row.id, 'realm_id', e.target.value)
                        }
                      >
                        <option value="">Royaume</option>
                        {sortedRealms.map((realm) => (
                          <option
                            key={`factory-realm-mobile-${row.id}-${realm.id}`}
                            value={realm.id}
                          >
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
                          <option
                            key={`factory-res-mobile-${row.id}-${res.id}`}
                            value={res.id}
                          >
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
                          onChange={(e) =>
                            onUpdate('factories', row.id, 'code', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                          Nom
                        </p>
                        <input
                          className={inputClass}
                          value={r.name ?? ''}
                          onChange={(e) =>
                            onUpdate('factories', row.id, 'name', e.target.value)
                          }
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
                          onChange={(e) =>
                            onUpdate('factories', row.id, 'is_active', e.target.checked)
                          }
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
                        onChange={(e) =>
                          onUpdate('skills', row.id, 'realm_id', e.target.value)
                        }
                      >
                        <option value="">Royaume</option>
                        {sortedRealms.map((realm) => (
                          <option
                            key={`skill-realm-mobile-${row.id}-${realm.id}`}
                            value={realm.id}
                          >
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
                          onChange={(e) =>
                            onUpdate('skills', row.id, 'code', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                          Nom
                        </p>
                        <input
                          className={inputClass}
                          value={r.name ?? ''}
                          onChange={(e) =>
                            onUpdate('skills', row.id, 'name', e.target.value)
                          }
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
                          onChange={(e) =>
                            onUpdate('skills', row.id, 'effect_type', e.target.value)
                          }
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
                          onChange={(e) =>
                            onUpdate('skills', row.id, 'effect_value', e.target.value)
                          }
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
                          onChange={(e) =>
                            onUpdate('skills', row.id, 'max_level', e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                          Order
                        </p>
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          value={r.unlock_order ?? ''}
                          onChange={(e) =>
                            onUpdate('skills', row.id, 'unlock_order', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-slate-400">
                        Cost res
                      </p>
                      <select
                        className={inputClass}
                        value={r.base_cost_resource_id ?? ''}
                        onChange={(e) =>
                          onUpdate(
                            'skills',
                            row.id,
                            'base_cost_resource_id',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Ressource</option>
                        {sortedResources.map((res) => (
                          <option
                            key={`skill-costres-mobile-${row.id}-${res.id}`}
                            value={res.id}
                          >
                            {res.code} - {res.name} (#{res.id})
                          </option>
                        ))}
                      </select>
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
                            onUpdate(
                              'skills',
                              row.id,
                              'base_cost_amount',
                              e.target.value
                            )
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
                            onUpdate(
                              'skills',
                              row.id,
                              'cost_growth_factor',
                              e.target.value
                            )
                          }
                        />
                      </div>
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
                        onClick: () => onDelete(type, row),
                      },
                    ]}
                  />
                </div>
              </div>
            </A11yDetailsWrap>
          );
        })}
      </div>

      <TableShell className="hidden md:block" asChild>
        <table className="min-w-[900px] w-full text-left text-xs">
          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
            <tr className="border-b border-amber-500/20">
              {activeTab === 'realms' && (
                <>
                  <th className="py-3 pr-3">ID</th>
                  <th className="py-3 pr-3">Code</th>
                  <th className="py-3 pr-3">Nom</th>
                  <th className="py-3 pr-3">Description</th>
                  <th className="py-3 pr-3">Couts</th>
                  <th className="py-3 pr-3">Default</th>
                  <th className="py-3">Actions</th>
                </>
              )}
              {activeTab === 'realm_unlock_costs' && (
                <>
                  <th className="py-3 pr-3">ID</th>
                  <th className="py-3 pr-3">Royaume</th>
                  <th className="py-3 pr-3">Ressource</th>
                  <th className="py-3 pr-3">Montant</th>
                  <th className="py-3">Actions</th>
                </>
              )}
              {activeTab === 'resources' && (
                <>
                  <th className="py-3 pr-3">ID</th>
                  <th className="py-3 pr-3">Realm ID</th>
                  <th className="py-3 pr-3">Code</th>
                  <th className="py-3 pr-3">Nom</th>
                  <th className="py-3 pr-3">Description</th>
                  <th className="py-3">Actions</th>
                </>
              )}
              {activeTab === 'factories' && (
                <>
                  <th className="py-3 pr-3">ID</th>
                  <th className="py-3 pr-3">Realm</th>
                  <th className="py-3 pr-3">Res</th>
                  <th className="py-3 pr-3">Code</th>
                  <th className="py-3 pr-3">Nom</th>
                  <th className="py-3 pr-3">Base prod</th>
                  <th className="py-3 pr-3">Base cost</th>
                  <th className="py-3 pr-3">Order</th>
                  <th className="py-3 pr-3">Active</th>
                  <th className="py-3">Actions</th>
                </>
              )}
              {activeTab === 'skills' && (
                <>
                  <th className="py-3 pr-3">ID</th>
                  <th className="py-3 pr-3">Realm</th>
                  <th className="py-3 pr-3">Code</th>
                  <th className="py-3 pr-3">Nom</th>
                  <th className="py-3 pr-3">Type</th>
                  <th className="py-3 pr-3">Value</th>
                  <th className="py-3 pr-3">Max</th>
                  <th className="py-3 pr-3">Cost res</th>
                  <th className="py-3 pr-3">Base cost</th>
                  <th className="py-3 pr-3">Growth</th>
                  <th className="py-3 pr-3">Order</th>
                  <th className="py-3">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const type = activeTab;
              const r = resolveRow(type, row);
              const busy = rowBusy(type, row.id);
              const canSave = rowDiffs(type, row).length > 0;

              const saveButton = (
                <button
                  type="button"
                  disabled={busy || !canSave}
                  onClick={() => onSave(type, row)}
                  className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
                >
                  {busy ? 'Sauvegarde.' : 'Sauvegarder'}
                </button>
              );

              const actionButtons = (
                <div className="flex flex-wrap gap-2">
                  {saveButton}
                  <button
                    type="button"
                    onClick={() => onDelete(type, row)}
                    className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              );

              if (activeTab === 'realms') {
                const costs =
                  Array.isArray(row.unlockCosts) && row.unlockCosts.length > 0
                    ? row.unlockCosts
                    : unlockCostsByRealm.get(Number(row.id)) || [];

                return (
                  <tr key={`realms-${row.id}`} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 font-mono text-amber-300">{row.id}</td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.code ?? ''}
                        onChange={(e) => onUpdate('realms', row.id, 'code', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.name ?? ''}
                        onChange={(e) => onUpdate('realms', row.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.description ?? ''}
                        onChange={(e) =>
                          onUpdate('realms', row.id, 'description', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      {costs.length === 0 ? (
                        <span className="text-slate-500">-</span>
                      ) : (
                        <ul className="space-y-0.5">
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
                                key={`realm-cost-${row.id}-${resourceId}-${amount}`}
                                className="text-[11px] text-slate-200"
                              >
                                <span className="font-mono text-amber-200">{amount}</span>{' '}
                                <span className="text-slate-300">{label}</span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={!!r.is_default_unlocked}
                          onChange={(e) =>
                            onUpdate('realms', row.id, 'is_default_unlocked', e.target.checked)
                          }
                          className="accent-amber-400"
                        />
                        Oui
                      </label>
                    </td>
                    <td className="py-2">{actionButtons}</td>
                  </tr>
                );
              }

              if (activeTab === 'realm_unlock_costs') {
                return (
                  <tr
                    key={`realm_unlock_costs-${row.id}`}
                    className="border-b border-slate-800/60"
                  >
                    <td className="py-2 pr-3 font-mono text-amber-300">{row.id}</td>
                    <td className="py-2 pr-3">
                      <select
                        className={inputClass}
                        value={r.target_realm_id ?? ''}
                        onChange={(e) =>
                          onUpdate(
                            'realm_unlock_costs',
                            row.id,
                            'target_realm_id',
                            e.target.value
                          )
                        }
                      >
                        <option value="">-</option>
                        {realms.map((realm) => (
                          <option key={`realm-opt-${realm.id}`} value={realm.id}>
                            {realm.code} (#{realm.id})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className={inputClass}
                        value={r.resource_id ?? ''}
                        onChange={(e) =>
                          onUpdate('realm_unlock_costs', row.id, 'resource_id', e.target.value)
                        }
                      >
                        <option value="">-</option>
                        {resources.map((res) => (
                          <option key={`res-opt-${res.id}`} value={res.id}>
                            {res.code} (#{res.id})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        value={r.amount ?? ''}
                        onChange={(e) =>
                          onUpdate('realm_unlock_costs', row.id, 'amount', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2">{actionButtons}</td>
                  </tr>
                );
              }

              if (activeTab === 'resources') {
                return (
                  <tr key={`resources-${row.id}`} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 font-mono text-amber-300">{row.id}</td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        inputMode="numeric"
                        value={r.realm_id ?? ''}
                        onChange={(e) =>
                          onUpdate('resources', row.id, 'realm_id', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.code ?? ''}
                        onChange={(e) => onUpdate('resources', row.id, 'code', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.name ?? ''}
                        onChange={(e) => onUpdate('resources', row.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.description ?? ''}
                        onChange={(e) =>
                          onUpdate('resources', row.id, 'description', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2">{actionButtons}</td>
                  </tr>
                );
              }

              if (activeTab === 'factories') {
                return (
                  <tr key={`factories-${row.id}`} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 font-mono text-amber-300">{row.id}</td>
                    <td className="py-2 pr-3">
                      <select
                        className={inputClass}
                        value={r.realm_id ?? ''}
                        onChange={(e) => onUpdate('factories', row.id, 'realm_id', e.target.value)}
                      >
                        <option value="">Royaume</option>
                        {sortedRealms.map((realm) => (
                          <option key={`factory-realm-${realm.id}`} value={realm.id}>
                            {realm.code} - {realm.name} (#{realm.id})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        className={inputClass}
                        value={r.resource_id ?? ''}
                        onChange={(e) => onUpdate('factories', row.id, 'resource_id', e.target.value)}
                      >
                        <option value="">Ressource</option>
                        {sortedResources.map((res) => (
                          <option key={`factory-res-${res.id}`} value={res.id}>
                            {res.code} - {res.name} (#{res.id})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.code ?? ''}
                        onChange={(e) => onUpdate('factories', row.id, 'code', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        value={r.name ?? ''}
                        onChange={(e) => onUpdate('factories', row.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        value={r.base_production ?? ''}
                        onChange={(e) =>
                          onUpdate('factories', row.id, 'base_production', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        value={r.base_cost ?? ''}
                        onChange={(e) => onUpdate('factories', row.id, 'base_cost', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        className={inputClass}
                        inputMode="numeric"
                        value={r.unlock_order ?? ''}
                        onChange={(e) =>
                          onUpdate('factories', row.id, 'unlock_order', e.target.value)
                        }
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={!!r.is_active}
                          onChange={(e) => onUpdate('factories', row.id, 'is_active', e.target.checked)}
                          className="accent-amber-400"
                        />
                        Oui
                      </label>
                    </td>
                    <td className="py-2">{actionButtons}</td>
                  </tr>
                );
              }

              return (
                <tr key={`skills-${row.id}`} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3 font-mono text-amber-300">{row.id}</td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputClass}
                      value={r.realm_id ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'realm_id', e.target.value)}
                    >
                      <option value="">Royaume</option>
                      {sortedRealms.map((realm) => (
                        <option key={`skill-realm-${realm.id}`} value={realm.id}>
                          {realm.code} - {realm.name} (#{realm.id})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      value={r.code ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'code', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      value={r.name ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      value={r.effect_type ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'effect_type', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={r.effect_value ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'effect_value', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={r.max_level ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'max_level', e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputClass}
                      value={r.base_cost_resource_id ?? ''}
                      onChange={(e) =>
                        onUpdate('skills', row.id, 'base_cost_resource_id', e.target.value)
                      }
                    >
                      <option value="">Ressource</option>
                      {sortedResources.map((res) => (
                        <option key={`skill-costres-${res.id}`} value={res.id}>
                          {res.code} - {res.name} (#{res.id})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={r.base_cost_amount ?? ''}
                      onChange={(e) =>
                        onUpdate('skills', row.id, 'base_cost_amount', e.target.value)
                      }
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      inputMode="decimal"
                      value={r.cost_growth_factor ?? ''}
                      onChange={(e) =>
                        onUpdate('skills', row.id, 'cost_growth_factor', e.target.value)
                      }
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      value={r.unlock_order ?? ''}
                      onChange={(e) => onUpdate('skills', row.id, 'unlock_order', e.target.value)}
                    />
                  </td>
                  <td className="py-2">{actionButtons}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableShell>
    </>
  );
}
