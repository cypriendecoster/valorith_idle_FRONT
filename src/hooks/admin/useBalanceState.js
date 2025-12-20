import useBalanceEdits from './useBalanceEdits';
import { createRow, deleteRow, saveRow } from './balanceCrud';
import useBalanceConfirmActions from './useBalanceConfirmActions';
import useBalanceSelectors from './useBalanceSelectors';
import {
  mergedRow as mergedRowUtil,
  getRowDiffs as getRowDiffsUtil,
} from '../../utils/tableHelpers';

export default function useBalanceState({
  activeTab,
  search,
  realms,
  setRealms,
  resources,
  setResources,
  factories,
  setFactories,
  skills,
  setSkills,
  realmUnlockCosts,
  setRealmUnlockCosts,
  endgameRequirements,
  setEndgameRequirements,
  createDraft,
  setCreateDraft,
  createSaving,
  setCreateSaving,
  setCreateOpen,
  setToast,
  openConfirm,
}) {
  const {
    edits,
    saving,
    updateField,
    isRowSaving,
    setRowSaving,
    clearRowEdits,
  } = useBalanceEdits();

  const mergedRow = (type, row) => mergedRowUtil(type, row, edits);

  const getRowDiffs = (type, row) => getRowDiffsUtil(type, row, edits);

  const {
    matchesSearch,
    realmUnlockCostsByRealmId,
    sortedRealms,
    sortedResources,
    visibleRows,
  } = useBalanceSelectors({
    activeTab,
    search,
    realms,
    resources,
    factories,
    skills,
    realmUnlockCosts,
  });

  const handleSave = (type, row) =>
    saveRow({
      type,
      row,
      edits,
      getRowDiffs,
      mergedRow,
      setRowSaving,
      clearRowEdits,
      setToast,
      realms,
      setRealms,
      resources,
      setResources,
      factories,
      setFactories,
      skills,
      setSkills,
      realmUnlockCosts,
      setRealmUnlockCosts,
      endgameRequirements,
      setEndgameRequirements,
    });

  const openCreate = () => {
    setCreateOpen(true);
    setCreateDraft(() => {
      if (activeTab === 'realms') {
        return {
          code: '',
          name: '',
          description: '',
          is_default_unlocked: false,
        };
      }
      if (activeTab === 'resources') {
        return { realm_id: '', code: '', name: '', description: '' };
      }
      if (activeTab === 'factories') {
        return {
          realm_id: '',
          resource_id: '',
          code: '',
          name: '',
          description: '',
          base_production: '',
          base_cost: '',
          unlock_order: '',
          is_active: true,
        };
      }
      if (activeTab === 'skills') {
        return {
          realm_id: '',
          code: '',
          name: '',
          description: '',
          effect_type: '',
          effect_value: '',
          max_level: '',
          base_cost_resource_id: '',
          base_cost_amount: '',
          cost_growth_factor: '',
          unlock_order: '',
        };
      }
      if (activeTab === 'realm_unlock_costs') {
        return { target_realm_id: '', resource_id: '', amount: '' };
      }
      return {};
    });
  };

  const handleCreate = () =>
    createRow({
      activeTab,
      createDraft,
      createSaving,
      setCreateSaving,
      setCreateOpen,
      setToast,
      realms,
      setRealms,
      resources,
      setResources,
      factories,
      setFactories,
      skills,
      setSkills,
      realmUnlockCosts,
      setRealmUnlockCosts,
    });

  const handleDelete = (type, row) =>
    deleteRow({
      type,
      row,
      setToast,
      setRealms,
      setResources,
      setFactories,
      setSkills,
      setRealmUnlockCosts,
      setEndgameRequirements,
    });

  const { requestSave, requestBatchSave, requestDelete } =
    useBalanceConfirmActions({
      edits,
      openConfirm,
      getRowDiffs,
      mergedRow,
      handleSave,
      handleDelete,
      setToast,
    });

  return {
    edits,
    saving,
    updateField,
    isRowSaving,
    mergedRow,
    getRowDiffs,
    matchesSearch,
    realmUnlockCostsByRealmId,
    sortedRealms,
    sortedResources,
    visibleRows,
    requestSave,
    requestBatchSave,
    requestDelete,
    openCreate,
    handleCreate,
  };
}
