import TableShell from '../../ui/TableShell';
import UnlockCostsEditor from './UnlockCostsEditor';

export default function BalanceRowTable({
  activeTab,
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

  return (
    <TableShell className="hidden md:block" asChild>
      <table className="min-w-[1100px] w-full text-left text-xs">
        <colgroup>
          <col className="w-24" />
          {activeTab === 'realms' && (
            <>
              <col className="w-32" />
              <col className="w-40" />
              <col />
              <col className="w-48" />
              <col className="w-24" />
              <col className="w-40" />
            </>
          )}
          {activeTab === 'realm_unlock_costs' && (
            <>
              <col className="w-40" />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-40" />
            </>
          )}
          {activeTab === 'resources' && (
            <>
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-40" />
              <col />
              <col className="w-40" />
            </>
          )}
          {activeTab === 'factories' && (
            <>
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-40" />
            </>
          )}
          {activeTab === 'skills' && (
            <>
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-32" />
              <col className="w-40" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-40" />
            </>
          )}
        </colgroup>
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
                <th className="py-3 pr-3">Realm</th>
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
              return (
                <tr key={`realms-${row.id}`} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3 font-mono text-amber-300 text-right">
                    {row.id}
                  </td>
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
                    <UnlockCostsEditor
                      realmId={row.id}
                      unlockCostsByRealmId={realmUnlockCostsByRealmId}
                      unlockCosts={row.unlockCosts}
                      resources={resources}
                    />
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
                  <td className="py-2 pr-3 font-mono text-amber-300 text-right">
                    {row.id}
                  </td>
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
                  <td className="py-2 pr-3 font-mono text-amber-300 text-right">
                    {row.id}
                  </td>
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
                  <td className="py-2 pr-3 font-mono text-amber-300 text-right">
                    {row.id}
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className={inputClass}
                      value={r.realm_id ?? ''}
                      onChange={(e) =>
                        onUpdate('factories', row.id, 'realm_id', e.target.value)
                      }
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
                      onChange={(e) =>
                        onUpdate('factories', row.id, 'resource_id', e.target.value)
                      }
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
                        onChange={(e) =>
                          onUpdate('factories', row.id, 'is_active', e.target.checked)
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

            return (
              <tr key={`skills-${row.id}`} className="border-b border-slate-800/60">
                <td className="py-2 pr-3 font-mono text-amber-300 text-right">
                  {row.id}
                </td>
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
  );
}
