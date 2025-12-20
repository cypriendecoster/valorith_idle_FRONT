import { normalizeText } from '../../utils/adminFormatters';
import useBalanceEdits from './useBalanceEdits';
import { createRow, deleteRow, saveRow } from './balanceCrud';
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

  const requestSave = (type, row) => {
    const id = row?.id;
    if (id == null) return;

    const key = `${type}:${id}`;
    const rowEdits = edits[key];
    if (
      !rowEdits ||
      Object.keys(rowEdits).length === 0 ||
      getRowDiffs(type, row).length === 0
    ) {
      setToast({ type: 'success', message: 'Aucune modification a sauvegarder.' });
      return;
    }

    const merged = mergedRow(type, row);
    const changes = Object.entries(rowEdits)
      .map(([field, nextValue]) => {
        const before = row?.[field];
        const after = merged?.[field];
        const beforeText = normalizeText(before);
        const afterText = normalizeText(after);
        if (beforeText === afterText) return null;
        return `${field}: ${beforeText || '-'} -> ${afterText || '-'}`;
      })
      .filter(Boolean);

    const labelParts = [row.code, row.name].filter(Boolean);
    const label = labelParts.length > 0 ? ` (${labelParts.join(' - ')})` : '';
    const changesText =
      changes.length > 0 ? `\n\nChangements:\n- ${changes.join('\n- ')}` : '';
    const diffs = getRowDiffs(type, row);

    openConfirm({
      title: 'Confirmer la sauvegarde',
      message: `Confirmer la sauvegarde de #${id}${label} ?${changesText}`,
      confirmLabel: 'Sauvegarder',
      danger: false,
      details: diffs,
      action: () => handleSave(type, row),
    });
  };

  const requestBatchSave = (type, rows, diffs) => {
    const dirtyRows = (rows || []).filter(
      (row) => getRowDiffs(type, row).length > 0
    );
    if (dirtyRows.length === 0) {
      setToast({ type: 'success', message: 'Aucune modification a sauvegarder.' });
      return;
    }

    const details =
      Array.isArray(diffs) && diffs.length > 0
        ? diffs
        : dirtyRows.flatMap((row) =>
            getRowDiffs(type, row).map((diff) => ({
              ...diff,
              field: `#${row.id} ${diff.field}`,
            }))
          );

    openConfirm({
      title: 'Confirmer la sauvegarde (batch)',
      message: `Sauvegarder ${dirtyRows.length} ligne(s) ?`,
      confirmLabel: 'Sauvegarder',
      danger: false,
      details,
      action: async () => {
        for (const row of dirtyRows) {
          await handleSave(type, row);
        }
      },
    });
  };

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

  const requestDelete = (type, row) => {
    const id = row?.id;
    if (!id) return;

    const labelParts = [row.code, row.name].filter(Boolean);
    const label = labelParts.length > 0 ? ` (${labelParts.join(' - ')})` : '';

    openConfirm({
      title: 'Suppression',
      message:
        `Attention, supprimer est definitif. Cette action est irreversible.\n\n` +
        `Confirmer la suppression de #${id}${label} ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      action: () => handleDelete(type, row),
    });
  };

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
