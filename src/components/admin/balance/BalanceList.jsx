import BalanceRowCard from './BalanceRowCard';
import BalanceRowTable from './BalanceRowTable';
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
        {visibleRows.map((row) => (
          <BalanceRowCard
            key={'balance-card-' + activeTab + '-' + row.id}
            activeTab={activeTab}
            row={row}
            inputClass={inputClass}
            mergedRow={mergedRow}
            isRowSaving={isRowSaving}
            getRowDiffs={getRowDiffs}
            requestSave={requestSave}
            requestDelete={requestDelete}
            updateField={updateField}
            realmUnlockCostsByRealmId={realmUnlockCostsByRealmId}
            resources={resources}
            realms={realms}
            sortedRealms={sortedRealms}
            sortedResources={sortedResources}
          />
        ))}
      </div>

      <BalanceRowTable
        activeTab={activeTab}
        visibleRows={visibleRows}
        inputClass={inputClass}
        mergedRow={mergedRow}
        isRowSaving={isRowSaving}
        getRowDiffs={getRowDiffs}
        requestSave={requestSave}
        requestDelete={requestDelete}
        updateField={updateField}
        realmUnlockCostsByRealmId={realmUnlockCostsByRealmId}
        resources={resources}
        realms={realms}
        sortedRealms={sortedRealms}
        sortedResources={sortedResources}
      />
    </>
  );
}


