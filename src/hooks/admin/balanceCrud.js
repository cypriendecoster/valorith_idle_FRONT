import { adminService } from '../../services/AdminService';
import {
  normalizeText,
  toNumberOrNull,
  toBooleanInt,
} from '../../utils/adminFormatters';
import { applyOptimisticRowUpdate } from './balanceHelpers';

export async function saveRow({
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
}) {
  const id = row?.id;
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
    rollbackOptimistic = applyOptimisticRowUpdate({
      type,
      id,
      nextRow: merged,
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
}

export async function createRow({
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
}) {
  if (createSaving) return false;
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
        return false;
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
        return false;
      }

      await adminService.createRealmUnlockCost(payload);
      const refreshed = await adminService.getRealmUnlockCosts({ limit: 1000 });
      setRealmUnlockCosts(refreshed?.data?.items ?? []);
    }

    setToast({ type: 'success', message: 'Creation effectuee.' });
    setCreateOpen(false);
    return true;
  } catch (err) {
    console.error(err);
    setToast({
      type: 'error',
      message:
        err?.response?.data?.message || "Impossible de creer l'element.",
    });
    return false;
  } finally {
    setCreateSaving(false);
  }
}

export async function deleteRow({
  type,
  row,
  setToast,
  setRealms,
  setResources,
  setFactories,
  setSkills,
  setRealmUnlockCosts,
  setEndgameRequirements,
}) {
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
}
