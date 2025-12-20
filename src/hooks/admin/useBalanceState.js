import { useMemo } from 'react';
import { adminService } from '../../services/AdminService';
import {
  normalizeText,
  toNumberOrNull,
  toBooleanInt,
} from '../../utils/adminFormatters';
import {
  mergedRow as mergedRowUtil,
  getRowDiffs as getRowDiffsUtil,
  matchesSearch as matchesSearchUtil,
} from '../../utils/tableHelpers';

export default function useBalanceState({
  activeTab,
  search,
  edits,
  setEdits,
  saving,
  setSaving,
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
  const updateField = (type, id, field, value) => {
    const key = `${type}:${id}`;
    setEdits((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const isRowSaving = (type, id) => !!saving[`${type}:${id}`];

  const setRowSaving = (type, id, value) => {
    const key = `${type}:${id}`;
    setSaving((prev) => ({ ...prev, [key]: value }));
  };

  const clearRowEdits = (type, id) => {
    const key = `${type}:${id}`;
    setEdits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const mergedRow = (type, row) => mergedRowUtil(type, row, edits);

  const getRowDiffs = (type, row) => getRowDiffsUtil(type, row, edits);

  const matchesSearch = (row) => matchesSearchUtil(row, search);

  const realmUnlockCostsByRealmId = useMemo(() => {
    const map = new Map();
    for (const c of realmUnlockCosts || []) {
      const realmId = Number(c.target_realm_id);
      if (!map.has(realmId)) map.set(realmId, []);
      map.get(realmId).push(c);
    }
    return map;
  }, [realmUnlockCosts]);

  const sortedRealms = useMemo(
    () => [...(realms || [])].sort((a, b) => Number(a.id) - Number(b.id)),
    [realms]
  );

  const sortedResources = useMemo(
    () => [...(resources || [])].sort((a, b) => Number(a.id) - Number(b.id)),
    [resources]
  );

  const visibleRows = useMemo(() => {
    const list =
      activeTab === 'realms'
        ? realms
        : activeTab === 'realm_unlock_costs'
          ? realmUnlockCosts
          : activeTab === 'resources'
            ? resources
            : activeTab === 'factories'
              ? factories
              : activeTab === 'skills'
                ? skills
                : [];
    return (list || []).filter(matchesSearch);
  }, [activeTab, realms, realmUnlockCosts, resources, factories, skills, search]);

  const applyOptimisticRowUpdate = (type, id, nextRow) => {
    const numericId = Number(id);

    if (type === 'realms') {
      const prevRow = (realms || []).find((r) => Number(r.id) === numericId);
      setRealms((prev) =>
        (prev || []).map((r) => (Number(r.id) === numericId ? nextRow : r))
      );
      return () => {
        if (!prevRow) return;
        setRealms((prev) =>
          (prev || []).map((r) => (Number(r.id) === numericId ? prevRow : r))
        );
      };
    }

    if (type === 'resources') {
      const prevRow = (resources || []).find((r) => Number(r.id) === numericId);
      setResources((prev) =>
        (prev || []).map((r) => (Number(r.id) === numericId ? nextRow : r))
      );
      return () => {
        if (!prevRow) return;
        setResources((prev) =>
          (prev || []).map((r) => (Number(r.id) === numericId ? prevRow : r))
        );
      };
    }

    if (type === 'factories') {
      const prevRow = (factories || []).find((r) => Number(r.id) === numericId);
      setFactories((prev) =>
        (prev || []).map((r) => (Number(r.id) === numericId ? nextRow : r))
      );
      return () => {
        if (!prevRow) return;
        setFactories((prev) =>
          (prev || []).map((r) => (Number(r.id) === numericId ? prevRow : r))
        );
      };
    }

    if (type === 'skills') {
      const prevRow = (skills || []).find((r) => Number(r.id) === numericId);
      setSkills((prev) =>
        (prev || []).map((r) => (Number(r.id) === numericId ? nextRow : r))
      );
      return () => {
        if (!prevRow) return;
        setSkills((prev) =>
          (prev || []).map((r) => (Number(r.id) === numericId ? prevRow : r))
        );
      };
    }

    if (type === 'realm_unlock_costs') {
      const prevRow = (realmUnlockCosts || []).find(
        (r) => Number(r.id) === numericId
      );
      setRealmUnlockCosts((prev) =>
        (prev || []).map((r) => (Number(r.id) === numericId ? nextRow : r))
      );
      return () => {
        if (!prevRow) return;
        setRealmUnlockCosts((prev) =>
          (prev || []).map((r) => (Number(r.id) === numericId ? prevRow : r))
        );
      };
    }

    if (type === 'endgame_requirements') {
      const prevRow = (endgameRequirements || []).find(
        (r) => Number(r.id) === numericId
      );
      setEndgameRequirements((prev) =>
        (prev || []).map((r) => (Number(r.id) === numericId ? nextRow : r))
      );
      return () => {
        if (!prevRow) return;
        setEndgameRequirements((prev) =>
          (prev || []).map((r) => (Number(r.id) === numericId ? prevRow : r))
        );
      };
    }

    return null;
  };

  const handleSave = async (type, row) => {
    const id = row.id;
    if (id == null) return false;

    const key = `${type}:${id}`;
    const rowEdits = edits[key];
    if (
      !rowEdits ||
      Object.keys(rowEdits).length === 0 ||
      getRowDiffs(type, row).length === 0
    ) {
      setToast({ type: 'success', message: 'Aucune modification a sauvegarder.' });
      return false;
    }

    const merged = mergedRow(type, row);
    setRowSaving(type, id, true);
    let rollbackOptimistic = null;

    try {
      rollbackOptimistic = applyOptimisticRowUpdate(type, id, merged);
      if (type === 'realms') {
        await adminService.updateRealm(id, {
          code: normalizeText(merged.code),
          name: normalizeText(merged.name),
          description: normalizeText(merged.description),
          is_default_unlocked: toBooleanInt(!!merged.is_default_unlocked),
        });
        setRealms((prev) => prev.map((r) => (r.id === id ? merged : r)));
      }

      if (type === 'resources') {
        await adminService.updateResource(id, {
          realm_id: toNumberOrNull(merged.realm_id),
          code: normalizeText(merged.code),
          name: normalizeText(merged.name),
          description: normalizeText(merged.description),
        });
        setResources((prev) => prev.map((r) => (r.id === id ? merged : r)));
      }

      if (type === 'factories') {
        await adminService.updateFactory(id, {
          realm_id: toNumberOrNull(merged.realm_id),
          resource_id: toNumberOrNull(merged.resource_id),
          code: normalizeText(merged.code),
          name: normalizeText(merged.name),
          description: normalizeText(merged.description),
          base_production: toNumberOrNull(merged.base_production),
          base_cost: toNumberOrNull(merged.base_cost),
          unlock_order: toNumberOrNull(merged.unlock_order),
          is_active: toBooleanInt(!!merged.is_active),
        });
        setFactories((prev) => prev.map((r) => (r.id === id ? merged : r)));
      }

      if (type === 'skills') {
        await adminService.updateSkill(id, {
          realm_id: toNumberOrNull(merged.realm_id),
          code: normalizeText(merged.code),
          name: normalizeText(merged.name),
          description: normalizeText(merged.description),
          effect_type: normalizeText(merged.effect_type),
          effect_value: toNumberOrNull(merged.effect_value),
          max_level: toNumberOrNull(merged.max_level),
          base_cost_resource_id: toNumberOrNull(merged.base_cost_resource_id),
          base_cost_amount: toNumberOrNull(merged.base_cost_amount),
          cost_growth_factor: toNumberOrNull(merged.cost_growth_factor),
          unlock_order: toNumberOrNull(merged.unlock_order),
        });
        setSkills((prev) => prev.map((r) => (r.id === id ? merged : r)));
      }

      if (type === 'realm_unlock_costs') {
        await adminService.updateRealmUnlockCost(id, {
          target_realm_id: toNumberOrNull(merged.target_realm_id),
          resource_id: toNumberOrNull(merged.resource_id),
          amount: toNumberOrNull(merged.amount),
        });
        setRealmUnlockCosts((prev) => prev.map((r) => (r.id === id ? merged : r)));
      }

      if (type === 'endgame_requirements') {
        await adminService.updateEndgameRequirement(id, {
          resource_id: toNumberOrNull(merged.resource_id),
          amount: toNumberOrNull(merged.amount),
        });
        setEndgameRequirements((prev) =>
          prev.map((r) => (Number(r.id) === Number(id) ? merged : r))
        );
      }

      clearRowEdits(type, id);
      setToast({ type: 'success', message: 'Mise a jour enregistree.' });
      return true;
    } catch (err) {
      console.error(err);
      rollbackOptimistic?.();
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Impossible d'enregistrer la mise a jour.",
      });
      return false;
    } finally {
      setRowSaving(type, id, false);
    }
  };

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

  const handleCreate = async () => {
    if (createSaving) return;
    setCreateSaving(true);

    try {
      if (activeTab === 'realms') {
        const payload = {
          code: normalizeText(createDraft.code),
          name: normalizeText(createDraft.name),
          description: normalizeText(createDraft.description),
          is_default_unlocked: toBooleanInt(!!createDraft.is_default_unlocked),
        };
        const res = await adminService.createRealm(payload);
        const id = res?.data?.id;
        setRealms((prev) => [{ id, ...payload }, ...prev]);
      }

      if (activeTab === 'resources') {
        const payload = {
          realm_id: toNumberOrNull(createDraft.realm_id),
          code: normalizeText(createDraft.code),
          name: normalizeText(createDraft.name),
          description: normalizeText(createDraft.description),
        };
        const res = await adminService.createResource(payload);
        const id = res?.data?.id;
        setResources((prev) => [{ id, ...payload }, ...prev]);
      }

      if (activeTab === 'factories') {
        const payload = {
          realm_id: toNumberOrNull(createDraft.realm_id),
          resource_id: toNumberOrNull(createDraft.resource_id),
          code: normalizeText(createDraft.code),
          name: normalizeText(createDraft.name),
          description: normalizeText(createDraft.description),
          base_production: toNumberOrNull(createDraft.base_production),
          base_cost: toNumberOrNull(createDraft.base_cost),
          unlock_order: toNumberOrNull(createDraft.unlock_order),
          is_active: toBooleanInt(!!createDraft.is_active),
        };
        const res = await adminService.createFactory(payload);
        const id = res?.data?.id;
        setFactories((prev) => [{ id, ...payload }, ...prev]);
      }

      if (activeTab === 'skills') {
        const payload = {
          realm_id: toNumberOrNull(createDraft.realm_id),
          code: normalizeText(createDraft.code),
          name: normalizeText(createDraft.name),
          description: normalizeText(createDraft.description),
          effect_type: normalizeText(createDraft.effect_type),
          effect_value: toNumberOrNull(createDraft.effect_value),
          max_level: toNumberOrNull(createDraft.max_level),
          base_cost_resource_id: toNumberOrNull(createDraft.base_cost_resource_id),
          base_cost_amount: toNumberOrNull(createDraft.base_cost_amount),
          cost_growth_factor: toNumberOrNull(createDraft.cost_growth_factor),
          unlock_order: toNumberOrNull(createDraft.unlock_order),
        };
        const res = await adminService.createSkill(payload);
        const id = res?.data?.id;
        setSkills((prev) => [{ id, ...payload }, ...prev]);
      }

      if (activeTab === 'realm_unlock_costs') {
        const payload = {
          target_realm_id: toNumberOrNull(createDraft.target_realm_id),
          resource_id: toNumberOrNull(createDraft.resource_id),
          amount: toNumberOrNull(createDraft.amount),
        };

        if (!payload.target_realm_id || !payload.resource_id || payload.amount == null) {
          setToast({ type: 'error', message: 'Royaume, ressource ou montant invalide.' });
          return;
        }

        const existing = (realmUnlockCosts || []).find(
          (c) =>
            Number(c.target_realm_id) === Number(payload.target_realm_id) &&
            Number(c.resource_id) === Number(payload.resource_id)
        );

        if (existing?.id) {
          setToast({
            type: 'error',
            message:
              'Impossible : ressource deja creee pour ce royaume. Effectuez une modification.',
          });
          return;
        }

        await adminService.createRealmUnlockCost(payload);
        const refreshed = await adminService.getRealmUnlockCosts({ limit: 1000 });
        setRealmUnlockCosts(refreshed?.data?.items ?? []);
      }

      setToast({ type: 'success', message: 'Creation effectuee.' });
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de creer l'element.",
      });
    } finally {
      setCreateSaving(false);
    }
  };

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

  const handleDelete = async (type, row) => {
    const id = row?.id;
    if (!id) return false;

    try {
      if (type === 'realms') {
        await adminService.deleteRealm(id);
        setRealms((prev) => prev.filter((r) => r.id !== id));
      } else if (type === 'resources') {
        await adminService.deleteResource(id);
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else if (type === 'factories') {
        await adminService.deleteFactory(id);
        setFactories((prev) => prev.filter((r) => r.id !== id));
      } else if (type === 'skills') {
        await adminService.deleteSkill(id);
        setSkills((prev) => prev.filter((r) => r.id !== id));
      } else if (type === 'realm_unlock_costs') {
        await adminService.deleteRealmUnlockCost(id);
        setRealmUnlockCosts((prev) => prev.filter((r) => r.id !== id));
      } else if (type === 'endgame_requirements') {
        await adminService.deleteEndgameRequirement(id);
        setEndgameRequirements((prev) =>
          prev.filter((r) => Number(r.id) !== Number(id))
        );
      }
      setToast({ type: 'success', message: 'Suppression effectuee.' });
      return true;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de supprimer l'element.",
      });
      return false;
    }
  };

  return {
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
