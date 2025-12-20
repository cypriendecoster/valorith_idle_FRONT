import CreateBalanceForm from '../balance/CreateBalanceForm';
import BalanceList from '../balance/BalanceList';

export default function AdminBalanceSection({
  activeTab,
  isBalanceTab,
  title,
  createOpen,
  createDraft,
  setCreateDraft,
  inputClass,
  realms,
  resources,
  sortedRealms,
  sortedResources,
  createSaving,
  onCreate,
  onCancelCreate,
  loading,
  visibleRows,
  mergedRow,
  isRowSaving,
  getRowDiffs,
  requestSave,
  requestDelete,
  updateField,
  realmUnlockCostsByRealmId,
}) {
  return (
    <>
      <CreateBalanceForm
        open={createOpen && isBalanceTab}
        title={title}
        activeTab={activeTab}
        createDraft={createDraft}
        setCreateDraft={setCreateDraft}
        inputClass={inputClass}
        realms={realms}
        resources={resources}
        sortedRealms={sortedRealms}
        sortedResources={sortedResources}
        createSaving={createSaving}
        onCreate={onCreate}
        onCancel={onCancelCreate}
      />

      <BalanceList
        activeTab={activeTab}
        loading={loading}
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
