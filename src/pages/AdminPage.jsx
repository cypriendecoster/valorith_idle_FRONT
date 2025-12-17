import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { adminService } from '../services/AdminService';
import { authService } from '../services/AuthService';

function normalizeText(value) {
  return String(value ?? '').trim();
}

function toNumberOrNull(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toBooleanInt(value) {
  return value ? 1 : 0;
}

function formatDurationSeconds(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return '-';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function AdminPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('realms');
  const [balanceTab, setBalanceTab] = useState('realms');
  const [supportTab, setSupportTab] = useState('tickets');
  const [endgameTab, setEndgameTab] = useState('requirements');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [realms, setRealms] = useState([]);
  const [resources, setResources] = useState([]);
  const [factories, setFactories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [realmUnlockCosts, setRealmUnlockCosts] = useState([]);

  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersPrefetched, setPlayersPrefetched] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerResources, setSelectedPlayerResources] = useState([]);
  const [selectedPlayerFactories, setSelectedPlayerFactories] = useState([]);
  const [selectedPlayerSkills, setSelectedPlayerSkills] = useState([]);
  const [playerResourceId, setPlayerResourceId] = useState('');
  const [playerResourceAmount, setPlayerResourceAmount] = useState('');
  const [playerResourceSaving, setPlayerResourceSaving] = useState(false);
  const [playerRealmCode, setPlayerRealmCode] = useState('');
  const [playerRealmActivateId, setPlayerRealmActivateId] = useState('');
  const [playerFactoryId, setPlayerFactoryId] = useState('');
  const [playerFactoryLevel, setPlayerFactoryLevel] = useState('');
  const [playerSkillId, setPlayerSkillId] = useState('');
  const [playerSkillLevel, setPlayerSkillLevel] = useState('');
  const [playerDangerLoading, setPlayerDangerLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState({});
  const [createSaving, setCreateSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});

  const [supportStatus, setSupportStatus] = useState('OPEN');
  const [supportSearch, setSupportSearch] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportTicketsTotal, setSupportTicketsTotal] = useState(0);
  const [supportTicketsLoading, setSupportTicketsLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsActionType, setLogsActionType] = useState('');
  const [logsTargetTable, setLogsTargetTable] = useState('');
  const [logsUserId, setLogsUserId] = useState('');

  const [endgameRequirements, setEndgameRequirements] = useState([]);
  const [endgameRankings, setEndgameRankings] = useState([]);
  const [endgameLoading, setEndgameLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmDanger, setConfirmDanger] = useState(true);
  const [confirmLabel, setConfirmLabel] = useState('Confirmer');
  const [confirmExpectedText, setConfirmExpectedText] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (
      activeTab === 'realms' ||
      activeTab === 'realm_unlock_costs' ||
      activeTab === 'resources' ||
      activeTab === 'factories' ||
      activeTab === 'skills'
    ) {
      setBalanceTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      adminService.getRealms(),
      adminService.getResources(),
      adminService.getFactories(),
      adminService.getSkills(),
      adminService.getRealmUnlockCosts({ limit: 1000 }),
      adminService.getPlayers({ search: '', limit: 100 }),
    ]).then((results) => {
      if (cancelled) return;

      const [
        realmsRes,
        resourcesRes,
        factoriesRes,
        skillsRes,
        realmUnlockCostsRes,
        playersRes,
      ] = results;

      if (realmsRes.status === 'fulfilled') {
        setRealms(realmsRes.value?.data ?? []);
      }
      if (resourcesRes.status === 'fulfilled') {
        setResources(resourcesRes.value?.data ?? []);
      }
      if (factoriesRes.status === 'fulfilled') {
        setFactories(factoriesRes.value?.data ?? []);
      }
      if (skillsRes.status === 'fulfilled') {
        setSkills(skillsRes.value?.data ?? []);
      }
      if (realmUnlockCostsRes.status === 'fulfilled') {
        setRealmUnlockCosts(realmUnlockCostsRes.value?.data?.items ?? []);
      }
      if (playersRes.status === 'fulfilled') {
        setPlayers(playersRes.value?.data?.items ?? []);
        setPlayersPrefetched(true);
      }

      const firstError =
        realmsRes.status === 'rejected'
          ? { label: 'Royaumes', err: realmsRes.reason }
          : resourcesRes.status === 'rejected'
            ? { label: 'Ressources', err: resourcesRes.reason }
            : factoriesRes.status === 'rejected'
              ? { label: 'Usines', err: factoriesRes.reason }
              : skillsRes.status === 'rejected'
                ? { label: 'Skills', err: skillsRes.reason }
                : realmUnlockCostsRes.status === 'rejected'
                  ? { label: 'Coûts royaumes', err: realmUnlockCostsRes.reason }
                : playersRes.status === 'rejected'
                  ? { label: 'Joueurs', err: playersRes.reason }
                : null;

      if (firstError) {
        console.error('Admin load error:', firstError.label, firstError.err);
        setToast({
          type: 'error',
          message:
            firstError.err?.response?.data?.message ||
            `Impossible de charger : ${firstError.label}.`,
        });
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'players') return;

    if (playersPrefetched && !normalizeText(search)) {
      setPlayersPrefetched(false);
      return;
    }

    let cancelled = false;
    setPlayersLoading(true);

    const q = normalizeText(search);
    const id = setTimeout(() => {
      adminService
        .getPlayers({ search: q, limit: 100 })
        .then((res) => {
          if (cancelled) return;
          setPlayers(res?.data?.items ?? []);
        })
        .catch((err) => {
          console.error(err);
          if (cancelled) return;
          setToast({
            type: 'error',
            message:
              err?.response?.data?.message ||
              'Erreur lors de la récupération des joueurs.',
          });
        })
        .finally(() => {
          if (cancelled) return;
          setPlayersLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [activeTab, isAdmin, search]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'players') return;
    if (!selectedPlayerId) return;

    let cancelled = false;
    setPlayerResourceSaving(false);

      adminService
        .getPlayerResources(selectedPlayerId)
        .then((res) => {
          if (cancelled) return;
          setSelectedPlayer(res?.data?.user ?? null);
          setSelectedPlayerResources(res?.data?.resources ?? []);
          setSelectedPlayerFactories(res?.data?.factories ?? []);
          setSelectedPlayerSkills(res?.data?.skills ?? []);
        })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        setToast({
          type: 'error',
          message:
            err?.response?.data?.message ||
            'Erreur lors du chargement des ressources du joueur.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isAdmin, selectedPlayerId]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;
    if (supportTab !== 'tickets') return;

    let cancelled = false;
    setSupportTicketsLoading(true);

    const status = String(supportStatus ?? '').trim();
    const q = normalizeText(supportSearch);

    const id = setTimeout(() => {
      adminService
        .getSupportTickets({ status, search: q, limit: 200, offset: 0 })
        .then((res) => {
          if (cancelled) return;
          setSupportTickets(res?.data?.items ?? []);
          setSupportTicketsTotal(Number(res?.data?.total ?? 0));
        })
        .catch((err) => {
          console.error(err);
          if (cancelled) return;
          setToast({
            type: 'error',
            message:
              err?.response?.data?.message ||
              'Erreur lors du chargement des tickets support.',
          });
        })
        .finally(() => {
          if (cancelled) return;
          setSupportTicketsLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [activeTab, isAdmin, supportTab, supportStatus, supportSearch]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;
    if (supportTab !== 'logs') return;

    let cancelled = false;
    setLogsLoading(true);

    const id = setTimeout(() => {
      adminService
        .getAdminLogs({
          limit: 250,
          offset: 0,
          actionType: normalizeText(logsActionType),
          targetTable: normalizeText(logsTargetTable),
          userId: normalizeText(logsUserId),
        })
        .then((res) => {
          if (cancelled) return;
          setLogs(res?.data?.items ?? []);
          setLogsTotal(Number(res?.data?.total ?? 0));
        })
        .catch((err) => {
          console.error(err);
          if (cancelled) return;
          setToast({
            type: 'error',
            message:
              err?.response?.data?.message ||
              'Erreur lors du chargement des logs admin.',
          });
        })
        .finally(() => {
          if (cancelled) return;
          setLogsLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [
    activeTab,
    isAdmin,
    supportTab,
    logsActionType,
    logsTargetTable,
    logsUserId,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'endgame') return;

    let cancelled = false;
    setEndgameLoading(true);

    Promise.allSettled([
      adminService.getEndgameRequirements(),
      adminService.getEndgameRankings(),
    ])
      .then((results) => {
        if (cancelled) return;
        const [reqRes, rankRes] = results;

        if (reqRes.status === 'fulfilled') {
          setEndgameRequirements(reqRes.value?.data ?? []);
        } else {
          console.error(reqRes.reason);
          setToast({
            type: 'error',
            message:
              reqRes.reason?.response?.data?.message ||
              'Erreur lors du chargement des règles endgame.',
          });
        }

        if (rankRes.status === 'fulfilled') {
          setEndgameRankings(rankRes.value?.data ?? []);
        } else {
          console.error(rankRes.reason);
          setToast({
            type: 'error',
            message:
              rankRes.reason?.response?.data?.message ||
              'Erreur lors du chargement du classement endgame.',
          });
        }
      })
      .finally(() => {
        if (cancelled) return;
        setEndgameLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isAdmin]);

  useEffect(() => {
    setCreateOpen(false);
    setCreateDraft({});
    if (activeTab !== 'players') {
      setSelectedPlayerId(null);
      setSelectedPlayer(null);
      setSelectedPlayerResources([]);
      setSelectedPlayerFactories([]);
      setSelectedPlayerSkills([]);
    }
    if (activeTab !== 'support') {
      setSelectedTicketId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!confirmOpen) return;
    setConfirmInput('');
    setConfirmError('');
    setConfirmLoading(false);
  }, [confirmOpen]);

  const openConfirm = ({
    title,
    message,
    confirmLabel: nextConfirmLabel = 'Confirmer',
    danger = true,
    expectedText = '',
    action,
  }) => {
    setConfirmTitle(title || 'Confirmation');
    setConfirmMessage(message || '');
    setConfirmLabel(nextConfirmLabel);
    setConfirmDanger(danger);
    setConfirmExpectedText(expectedText);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  const submitConfirm = async () => {
    if (confirmLoading) return;

    if (confirmExpectedText) {
      const expected = normalizeText(confirmExpectedText);
      const actual = normalizeText(confirmInput);
      if (expected !== actual) {
        setConfirmError(`Tape \"${expected}\" pour confirmer.`);
        return;
      }
    }

    if (!confirmAction) {
      closeConfirm();
      return;
    }

    try {
      setConfirmLoading(true);
      setConfirmError('');
      const result = await confirmAction();
      if (result === false) return;
      closeConfirm();
    } catch (err) {
      console.error(err);
      setConfirmError(
        err?.response?.data?.message || "Action impossible. Réessaie."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

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

  const mergedRow = (type, row) => {
    const key = `${type}:${row.id}`;
    return { ...row, ...(edits[key] || {}) };
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

  const matchesSearch = (row) => {
    const q = normalizeText(search).toLowerCase();
    if (!q) return true;

    const parts = [];

    for (const value of Object.values(row || {})) {
      if (value == null) continue;
      const t = typeof value;
      if (t === 'string' || t === 'number' || t === 'boolean') {
        parts.push(value);
      }
    }

    if (Array.isArray(row?.unlockCosts)) {
      for (const c of row.unlockCosts) {
        if (!c) continue;
        parts.push(c.amount, c.resource_code, c.resource_name, c.realm_code);
      }
    }

    const hay = parts.map((p) => String(p ?? '').toLowerCase()).join(' ');
    return hay.includes(q);
  };

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

  const playerFactoryLevelById = useMemo(() => {
    const map = new Map();
    for (const row of selectedPlayerFactories || []) {
      const id = Number(row?.factory_id ?? row?.id);
      if (!Number.isFinite(id)) continue;
      map.set(id, Number(row?.level ?? 0));
    }
    return map;
  }, [selectedPlayerFactories]);

  const playerSkillLevelById = useMemo(() => {
    const map = new Map();
    for (const row of selectedPlayerSkills || []) {
      const id = Number(row?.skill_id ?? row?.id);
      if (!Number.isFinite(id)) continue;
      map.set(id, Number(row?.level ?? 0));
    }
    return map;
  }, [selectedPlayerSkills]);

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

  const filteredLogs = useMemo(() => {
    const q = normalizeText(logsSearch).toLowerCase();
    if (!q) return logs;
    return (logs || []).filter((row) => {
      const parts = [
        row.id,
        row.user_id,
        row.action_type,
        row.target_table,
        row.target_id,
        row.description,
        row.created_at,
      ];
      return parts
        .map((p) => String(p ?? '').toLowerCase())
        .join(' ')
        .includes(q);
    });
  }, [logs, logsSearch]);

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return (supportTickets || []).find(
      (t) => Number(t.id) === Number(selectedTicketId)
    );
  }, [supportTickets, selectedTicketId]);

  const handleSave = async (type, row) => {
    const id = row.id;
    if (id == null) return false;

    const key = `${type}:${id}`;
    const rowEdits = edits[key];
    if (!rowEdits || Object.keys(rowEdits).length === 0) {
      setToast({ type: 'success', message: 'Aucune modification à sauvegarder.' });
      return false;
    }

    const merged = mergedRow(type, row);
    setRowSaving(type, id, true);

    try {
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
        setRealmUnlockCosts((prev) =>
          prev.map((r) => (r.id === id ? merged : r))
        );
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
      setToast({ type: 'success', message: 'Mise à jour enregistrée.' });
      return true;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Impossible d'enregistrer la mise à jour.",
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
    if (!rowEdits || Object.keys(rowEdits).length === 0) {
      setToast({ type: 'success', message: 'Aucune modification à sauvegarder.' });
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

    openConfirm({
      title: 'Confirmer la sauvegarde',
      message: `Confirmer la sauvegarde de #${id}${label} ?${changesText}`,
      confirmLabel: 'Sauvegarder',
      danger: false,
      action: () => handleSave(type, row),
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
              'Impossible : ressource déjà créée pour ce royaume. Effectuez une modification.',
          });
          return;
        }

        await adminService.createRealmUnlockCost(payload);
        const refreshed = await adminService.getRealmUnlockCosts({ limit: 1000 });
        setRealmUnlockCosts(refreshed?.data?.items ?? []);
      }

      setToast({ type: 'success', message: 'Création effectuée.' });
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de créer l'élément.",
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
      message: `Attention, supprimer est définitif. Cette action est irréversible.\n\nConfirmer la suppression de #${id}${label} ?`,
      confirmLabel: 'Supprimer',
      danger: true,
      action: () => handleDelete(type, row),
    });
  };

  const handleDelete = async (type, row) => {
    const id = row?.id;
    if (!id) return false;
    // confirmation handled via modal (requestDelete)

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
      setToast({ type: 'success', message: 'Suppression effectuée.' });
      return true;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de supprimer l'élément.",
      });
      return false;
    }
  };

  const refreshSelectedPlayer = async () => {
    if (!selectedPlayerId) return;
    const res = await adminService.getPlayerResources(selectedPlayerId);
    setSelectedPlayer(res?.data?.user ?? null);
    setSelectedPlayerResources(res?.data?.resources ?? []);
    setSelectedPlayerFactories(res?.data?.factories ?? []);
    setSelectedPlayerSkills(res?.data?.skills ?? []);
  };

  const handlePlayerGrant = async () => {
    if (!selectedPlayerId) return;
    const resourceId = toNumberOrNull(playerResourceId);
    const amount = toNumberOrNull(playerResourceAmount);
    if (!resourceId || !amount) {
      setToast({ type: 'error', message: 'Choisis une ressource et un montant.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.grantPlayerResource(selectedPlayerId, {
        resourceId,
        amount,
      });
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Ressource ajoutée.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message: err?.response?.data?.message || "Impossible d'ajouter la ressource.",
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const getSelectedPlayerResourceAmount = (resourceId) => {
    const r = (selectedPlayerResources || []).find(
      (row) => Number(row.resource_id) === Number(resourceId)
    );
    return Number(r?.amount ?? 0);
  };

  const handlePlayerAddResource = async () => {
    if (!selectedPlayerId) return;
    const resourceId = toNumberOrNull(playerResourceId);
    const amount = toNumberOrNull(playerResourceAmount);
    if (!resourceId || amount == null || amount <= 0) {
      setToast({ type: 'error', message: 'Choisis une ressource et un montant > 0.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.grantPlayerResource(selectedPlayerId, {
        resourceId,
        amount,
      });
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Ressource ajoutée.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message: err?.response?.data?.message || "Impossible d'ajouter la ressource.",
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const handlePlayerRemoveResource = async () => {
    if (!selectedPlayerId) return;
    const resourceId = toNumberOrNull(playerResourceId);
    const amount = toNumberOrNull(playerResourceAmount);
    if (!resourceId || amount == null || amount <= 0) {
      setToast({ type: 'error', message: 'Choisis une ressource et un montant > 0.' });
      return;
    }

    const current = getSelectedPlayerResourceAmount(resourceId);
    if (amount > current) {
      setToast({
        type: 'error',
        message: `Impossible : le joueur n'a que ${current.toLocaleString('fr-FR')} de cette ressource.`,
      });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.grantPlayerResource(selectedPlayerId, {
        resourceId,
        amount: -amount,
      });
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Ressource retirée.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || 'Impossible de retirer la ressource.',
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const handlePlayerSet = async () => {
    if (!selectedPlayerId) return;
    const resourceId = toNumberOrNull(playerResourceId);
    const amount = toNumberOrNull(playerResourceAmount);
    if (!resourceId || amount == null) {
      setToast({ type: 'error', message: 'Choisis une ressource et un montant.' });
      return;
    }
    if (amount < 0) {
      setToast({ type: 'error', message: 'Le montant doit être ≥ 0.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.setPlayerResource(selectedPlayerId, {
        resourceId,
        amount,
      });
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Ressource mise à jour.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || 'Impossible de mettre à jour la ressource.',
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const handlePlayerUnlockRealm = async () => {
    if (!selectedPlayerId) return;
    const realmCode = normalizeText(playerRealmCode);
    if (!realmCode) {
      setToast({ type: 'error', message: 'Choisis un royaume.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.unlockPlayerRealm(selectedPlayerId, { realmCode });
      setToast({ type: 'success', message: 'Royaume débloqué.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de débloquer le royaume.",
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const handlePlayerActivateRealm = async () => {
    if (!selectedPlayerId) return;
    const realmId = toNumberOrNull(playerRealmActivateId);
    if (!realmId) {
      setToast({ type: 'error', message: 'Choisis un royaume.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.activatePlayerRealm(selectedPlayerId, { realmId });
      setToast({ type: 'success', message: 'Royaume activé.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible d'activer le royaume.",
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const handlePlayerSetFactoryLevel = async () => {
    if (!selectedPlayerId) return;
    const factoryId = toNumberOrNull(playerFactoryId);
    const level = toNumberOrNull(playerFactoryLevel);
    if (!factoryId || level == null || level < 0) {
      setToast({ type: 'error', message: 'Usine ou niveau invalide.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.setPlayerFactoryLevel(selectedPlayerId, {
        factoryId,
        level,
      });
      setToast({ type: 'success', message: 'Niveau usine mis à jour.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de modifier l'usine.",
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const handlePlayerSetSkillLevel = async () => {
    if (!selectedPlayerId) return;
    const skillId = toNumberOrNull(playerSkillId);
    const level = toNumberOrNull(playerSkillLevel);
    if (!skillId || level == null || level < 0) {
      setToast({ type: 'error', message: 'Skill ou niveau invalide.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.setPlayerSkillLevel(selectedPlayerId, { skillId, level });
      setToast({ type: 'success', message: 'Niveau skill mis à jour.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message: err?.response?.data?.message || 'Impossible de modifier le skill.',
      });
    } finally {
      setPlayerResourceSaving(false);
    }
  };

  const requestPlayerReset = () => {
    if (!selectedPlayerId || !selectedPlayer) return;

    openConfirm({
      title: 'Réinitialisation',
      message: `Attention, réinitialiser est définitif.\n\nRéinitialiser la progression de ${selectedPlayer.username} (#${selectedPlayer.id}) ?`,
      confirmLabel: 'Réinitialiser',
      danger: true,
      action: async () => {
        try {
          setPlayerDangerLoading(true);
          await adminService.resetPlayer(selectedPlayerId);
          await refreshSelectedPlayer();
          setToast({ type: 'success', message: 'Progression réinitialisée.' });
        } catch (err) {
          console.error(err);
          setToast({
            type: 'error',
            message:
              err?.response?.data?.message || 'Impossible de reset le joueur.',
          });
          throw err;
        } finally {
          setPlayerDangerLoading(false);
        }
      },
    });
  };

  const requestPlayerDelete = () => {
    if (!selectedPlayerId || !selectedPlayer) return;

    openConfirm({
      title: 'Suppression de compte',
      message: `Attention, supprimer est définitif.\n\nTape SUPPRIMER pour confirmer la suppression du compte ${selectedPlayer.username} (#${selectedPlayer.id}).`,
      confirmLabel: 'Supprimer',
      danger: true,
      expectedText: 'SUPPRIMER',
      action: async () => {
        try {
          setPlayerDangerLoading(true);
          await adminService.deletePlayer(selectedPlayerId);
          setPlayers((prev) =>
            prev.filter((p) => Number(p.id) !== Number(selectedPlayerId))
          );
          setSelectedPlayerId(null);
          setSelectedPlayer(null);
          setSelectedPlayerResources([]);
          setSelectedPlayerFactories([]);
          setSelectedPlayerSkills([]);
          setToast({ type: 'success', message: 'Compte supprimé.' });
        } catch (err) {
          console.error(err);
          setToast({
            type: 'error',
            message:
              err?.response?.data?.message || 'Impossible de supprimer le compte.',
          });
          throw err;
        } finally {
          setPlayerDangerLoading(false);
        }
      },
    });
  };

  const handlePlayerReset = async () => {
    if (!selectedPlayerId || !selectedPlayer) return;
    requestPlayerReset();
    return;
    if (
      !window.confirm(
        `Réinitialiser la progression de ${selectedPlayer.username} (#${selectedPlayer.id}) ?`
      )
    ) {
      return;
    }

    try {
      setPlayerDangerLoading(true);
      await adminService.resetPlayer(selectedPlayerId);
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Progression réinitialisée.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message: err?.response?.data?.message || 'Impossible de reset le joueur.',
      });
    } finally {
      setPlayerDangerLoading(false);
    }
  };

  const handlePlayerDelete = async () => {
    if (!selectedPlayerId || !selectedPlayer) return;
    requestPlayerDelete();
    return;
    const confirmText = window.prompt(
      `Tape SUPPRIMER pour confirmer la suppression du compte ${selectedPlayer.username} (#${selectedPlayer.id}).`
    );
    if (confirmText !== 'SUPPRIMER') return;

    try {
      setPlayerDangerLoading(true);
      await adminService.deletePlayer(selectedPlayerId);
      setPlayers((prev) => prev.filter((p) => Number(p.id) !== Number(selectedPlayerId)));
      setSelectedPlayerId(null);
      setSelectedPlayer(null);
      setSelectedPlayerResources([]);
      setToast({ type: 'success', message: 'Compte supprimé.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || 'Impossible de supprimer le compte.',
      });
    } finally {
      setPlayerDangerLoading(false);
    }
  };

  const refreshSupportTickets = async () => {
    try {
      setSupportTicketsLoading(true);
      const res = await adminService.getSupportTickets({
        status: normalizeText(supportStatus),
        search: normalizeText(supportSearch),
        limit: 200,
        offset: 0,
      });
      setSupportTickets(res?.data?.items ?? []);
      setSupportTicketsTotal(Number(res?.data?.total ?? 0));
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Erreur lors du chargement des tickets support.',
      });
    } finally {
      setSupportTicketsLoading(false);
    }
  };

  const handleTicketStatus = async (ticketId, status) => {
    if (!ticketId) return;
    try {
      await adminService.updateSupportTicketStatus(ticketId, status);
      setToast({ type: 'success', message: 'Ticket mis à jour.' });
      await refreshSupportTickets();
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Impossible de modifier le ticket support.',
      });
    }
  };

  const refreshAdminLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await adminService.getAdminLogs({
        limit: 250,
        offset: 0,
        actionType: normalizeText(logsActionType),
        targetTable: normalizeText(logsTargetTable),
        userId: normalizeText(logsUserId),
      });
      setLogs(res?.data?.items ?? []);
      setLogsTotal(Number(res?.data?.total ?? 0));
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Erreur lors du chargement des logs admin.',
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const refreshEndgame = async () => {
    try {
      setEndgameLoading(true);
      const [reqRes, rankRes] = await Promise.all([
        adminService.getEndgameRequirements(),
        adminService.getEndgameRankings(),
      ]);
      setEndgameRequirements(reqRes?.data ?? []);
      setEndgameRankings(rankRes?.data ?? []);
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Erreur lors du rafraîchissement de l'endgame.",
      });
    } finally {
      setEndgameLoading(false);
    }
  };

  const openEndgameCreate = () => {
    setCreateOpen(true);
    setCreateDraft({ resource_id: '', amount: '' });
  };

  const handleCreateEndgameRequirement = async () => {
    try {
      setCreateSaving(true);
      const payload = {
        resource_id: toNumberOrNull(createDraft.resource_id),
        amount: toNumberOrNull(createDraft.amount),
      };

      if (!payload.resource_id || payload.amount == null) {
        setToast({ type: 'error', message: 'Ressource ou montant invalide.' });
        return;
      }

      const exists = (endgameRequirements || []).some(
        (r) => Number(r.resource_id) === Number(payload.resource_id)
      );
      if (exists) {
        setToast({
          type: 'error',
          message: 'Cette ressource est déjà présente dans les règles endgame.',
        });
        return;
      }

      await adminService.createEndgameRequirement(payload);
      const reqRes = await adminService.getEndgameRequirements();
      setEndgameRequirements(reqRes?.data ?? []);
      setToast({ type: 'success', message: 'Règle créée.' });
      setCreateOpen(false);
      setCreateDraft({});
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Impossible de créer la règle endgame.",
      });
    } finally {
      setCreateSaving(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const isBalanceTab =
    activeTab === 'realms' ||
    activeTab === 'realm_unlock_costs' ||
    activeTab === 'resources' ||
    activeTab === 'factories' ||
    activeTab === 'skills';

  const activeMainTab = isBalanceTab
    ? 'balance'
    : activeTab === 'players'
      ? 'players'
      : activeTab === 'support'
        ? 'support'
        : 'endgame';

  const mainTabs = [
    {
      key: 'balance',
      label: 'Balance',
      hint: `${realms.length + realmUnlockCosts.length + resources.length + factories.length + skills.length} items`,
    },
    { key: 'endgame', label: 'Endgame', hint: 'Règles + classement' },
    { key: 'players', label: 'Joueurs', hint: `${players.length} joueurs` },
    { key: 'support', label: 'Support & Logs', hint: 'Ops + audit' },
  ];

  const balanceTabs = [
    { key: 'realms', label: 'Royaumes', count: realms.length },
    { key: 'realm_unlock_costs', label: 'Coûts royaumes', count: realmUnlockCosts.length },
    { key: 'resources', label: 'Ressources', count: resources.length },
    { key: 'factories', label: 'Usines', count: factories.length },
    { key: 'skills', label: 'Skills', count: skills.length },
  ];

  const title =
    activeTab === 'realms'
      ? 'Balance · Royaumes'
      : activeTab === 'realm_unlock_costs'
        ? 'Balance · Coûts royaumes'
        : activeTab === 'resources'
        ? 'Balance · Ressources'
        : activeTab === 'factories'
          ? 'Balance · Usines'
          : activeTab === 'skills'
            ? 'Balance · Skills'
            : activeTab === 'players'
              ? 'Joueurs'
              : activeTab === 'support'
                ? supportTab === 'tickets'
                  ? 'Support · Tickets'
                  : 'Audit · Logs admin'
                : endgameTab === 'requirements'
                  ? 'Endgame · Règles'
                  : 'Endgame · Classement';

  const inputClass =
    'w-full rounded-md bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <Toast toast={toast} />

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Fermer"
            onClick={closeConfirm}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={confirmTitle || 'Confirmation'}
            className="relative w-full max-w-lg"
          >
            <div
              className={`rounded-2xl border bg-slate-950/90 shadow-[0_0_40px_rgba(0,0,0,0.55)] ${
                confirmDanger ? 'border-red-500/40' : 'border-amber-500/30'
              }`}
            >
              <div className="px-5 py-4 border-b border-slate-800/60">
                <h2
                  className={`text-lg font-semibold ${
                    confirmDanger ? 'text-red-100' : 'text-amber-100'
                  }`}
                >
                  {confirmTitle}
                </h2>
                {confirmMessage && (
                  <p className="mt-2 text-sm text-slate-200/90 whitespace-pre-line">
                    {confirmMessage}
                  </p>
                )}
              </div>

              <div className="px-5 py-4 space-y-3">
                {confirmExpectedText ? (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">
                      Confirmation (à taper)
                    </label>
                    <input
                      className="w-full rounded-md bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitConfirm();
                        if (e.key === 'Escape') closeConfirm();
                      }}
                      autoFocus
                      placeholder={confirmExpectedText}
                      disabled={confirmLoading}
                    />
                  </div>
                ) : null}

                {confirmError ? (
                  <div className="rounded-md border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
                    {confirmError}
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeConfirm}
                    disabled={confirmLoading}
                    className="px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:border-slate-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={submitConfirm}
                    disabled={confirmLoading}
                    className={`px-3 py-2 rounded-md font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      confirmDanger
                        ? 'bg-red-500 hover:bg-red-400 text-slate-900'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                    }`}
                  >
                    {confirmLoading ? 'En coursâ€¦' : confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <header className="mb-8 text-center">
          <nav
            className="mb-4 text-[11px] md:text-xs text-slate-400"
            aria-label="Fil d'Ariane"
          >
            <ol className="flex items-center justify-center gap-1">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-amber-300 hover:underline underline-offset-2 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70 rounded-sm"
                >
                  Accueil
                </button>
              </li>
              <li aria-hidden="true" className="text-slate-600 mx-1">
                /
              </li>
              <li aria-current="page" className="text-amber-200 font-medium">
                Admin
              </li>
            </ol>
          </nav>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-300 mb-2">
            Outils d'administration
          </p>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-2">
            Panneau Admin
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto">
            Balance, endgame, support et outils joueur (debug / assistance).
          </p>
        </header>

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-5 md:px-6 md:py-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {mainTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    if (t.key === 'balance') setActiveTab(balanceTab);
                    else setActiveTab(t.key);
                  }}
                  className={`px-3 py-1 rounded-md border text-xs transition-colors ${
                    activeMainTab === t.key
                      ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                      : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
                  }`}
                >
                  {t.label}{' '}
                  <span className="text-[11px] text-slate-400">({t.hint})</span>
                </button>
              ))}
            </div>

            {activeMainTab === 'balance' && (
              <div className="flex flex-wrap gap-2">
                {balanceTabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-1 rounded-md border text-xs transition-colors ${
                      activeTab === t.key
                        ? 'border-emerald-400 text-emerald-200 bg-emerald-500/10'
                        : 'border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-200'
                    }`}
                  >
                    {t.label}{' '}
                    <span className="text-[11px] text-slate-400">
                      ({t.count})
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === 'players'
                    ? 'Rechercher (id, pseudo, email...)'
                    : 'Rechercher (id, code, nom...)'
                }
                className="w-full md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
              />
              {isBalanceTab && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold transition-colors"
                >
                  Créer
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearch('')}
                className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800/70 pt-4">
            <h2 className="text-sm font-semibold text-amber-200 mb-3">
              {title}
            </h2>

            {createOpen && isBalanceTab && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-slate-950/40 p-3 space-y-3">
                <p className="text-xs text-slate-300">
                  Création d’un nouvel élément ({title})
                </p>

                {activeTab === 'realms' && (
                  <div className="grid gap-2 md:grid-cols-6">
                    <input
                      className={inputClass}
                      placeholder="Code"
                      value={createDraft.code ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, code: e.target.value }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Nom"
                      value={createDraft.name ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    <input
                      className={`${inputClass} md:col-span-2`}
                      placeholder="Description"
                      value={createDraft.description ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
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
                    <select
                      className={inputClass}
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

                    <select
                      className={inputClass}
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

                    <input
                      className={inputClass}
                      placeholder="Montant"
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
                )}

                {activeTab === 'resources' && (
                  <div className="grid gap-2 md:grid-cols-6">
                    <input
                      className={inputClass}
                      placeholder="Realm ID (optionnel)"
                      inputMode="numeric"
                      value={createDraft.realm_id ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, realm_id: e.target.value }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Code"
                      value={createDraft.code ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, code: e.target.value }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Nom"
                      value={createDraft.name ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    <input
                      className={`${inputClass} md:col-span-3`}
                      placeholder="Description"
                      value={createDraft.description ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                {activeTab === 'factories' && (
                  <div className="grid gap-2 md:grid-cols-10">
                    <select
                      className={inputClass}
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
                    <select
                      className={inputClass}
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
                    <input
                      className={inputClass}
                      placeholder="Code"
                      value={createDraft.code ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, code: e.target.value }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Nom"
                      value={createDraft.name ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    <input
                      className={`${inputClass} md:col-span-2`}
                      placeholder="Description"
                      value={createDraft.description ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Base prod"
                      inputMode="decimal"
                      value={createDraft.base_production ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          base_production: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Base cost"
                      inputMode="decimal"
                      value={createDraft.base_cost ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          base_cost: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Order"
                      inputMode="numeric"
                      value={createDraft.unlock_order ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          unlock_order: e.target.value,
                        }))
                      }
                    />
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
                    <select
                      className={inputClass}
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
                    <input
                      className={inputClass}
                      placeholder="Code"
                      value={createDraft.code ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, code: e.target.value }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Nom"
                      value={createDraft.name ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    <input
                      className={`${inputClass} md:col-span-2`}
                      placeholder="Description"
                      value={createDraft.description ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Type"
                      value={createDraft.effect_type ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          effect_type: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Value"
                      inputMode="decimal"
                      value={createDraft.effect_value ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          effect_value: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Max"
                      inputMode="numeric"
                      value={createDraft.max_level ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({ ...p, max_level: e.target.value }))
                      }
                    />
                    <select
                      className={inputClass}
                      value={createDraft.base_cost_resource_id ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          base_cost_resource_id: e.target.value,
                        }))
                      }
                    >
                      <option value="">Ressource de coût</option>
                      {sortedResources.map((res) => (
                        <option key={`create-skill-costres-${res.id}`} value={res.id}>
                          {res.code} - {res.name} (#{res.id})
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      placeholder="Base cost"
                      inputMode="decimal"
                      value={createDraft.base_cost_amount ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          base_cost_amount: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Growth"
                      inputMode="decimal"
                      value={createDraft.cost_growth_factor ?? ''}
                      onChange={(e) =>
                        setCreateDraft((p) => ({
                          ...p,
                          cost_growth_factor: e.target.value,
                        }))
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Order"
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
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={createSaving}
                    onClick={handleCreate}
                    className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
                  >
                    {createSaving ? 'Création…' : 'Créer'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'players' ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs text-slate-300">Liste des joueurs</p>
                    {playersLoading && (
                      <p className="text-[11px] text-slate-500">Chargement...</p>
                    )}
                  </div>

                  {playersLoading ? (
                    <p className="text-sm text-slate-300">Chargement...</p>
                  ) : players.length === 0 ? (
                    <p className="text-sm text-slate-300">Aucun joueur.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                          <tr className="border-b border-slate-800/70">
                            <th className="py-2 pr-3">ID</th>
                            <th className="py-2 pr-3">Pseudo</th>
                            <th className="py-2 pr-3">Email</th>
                            <th className="py-2 pr-3">Rôle</th>
                            <th className="py-2">Dernière connexion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {players.map((p) => {
                            const selected =
                              Number(selectedPlayerId) === Number(p.id);
                            return (
                              <tr
                                key={`player-${p.id}`}
                                className={`border-b border-slate-800/60 cursor-pointer ${
                                  selected
                                    ? 'bg-amber-500/10'
                                    : 'hover:bg-slate-900/40'
                                }`}
                                onClick={() => {
                                  setSelectedPlayerId(p.id);
                                  setPlayerResourceId('');
                                  setPlayerResourceAmount('');
                                  setPlayerRealmCode('');
                                  setPlayerRealmActivateId('');
                                  setPlayerFactoryId('');
                                  setPlayerFactoryLevel('');
                                  setPlayerSkillId('');
                                  setPlayerSkillLevel('');
                                  setSelectedPlayerFactories([]);
                                  setSelectedPlayerSkills([]);
                                }}
                              >
                                <td className="py-2 pr-3 font-mono text-amber-300">
                                  {p.id}
                                </td>
                                <td className="py-2 pr-3 text-slate-100 font-semibold">
                                  {p.username || '-'}
                                </td>
                                <td className="py-2 pr-3 text-slate-300">
                                  {p.email || '-'}
                                </td>
                                <td className="py-2 pr-3 text-slate-300">
                                  {p.role || '-'}
                                </td>
                                <td className="py-2 text-slate-400">
                                  {p.last_login_at
                                    ? new Date(p.last_login_at).toLocaleString(
                                        'fr-FR'
                                      )
                                    : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-300">Gestion du joueur</p>
                      {selectedPlayer ? (
                        <p className="text-sm text-slate-100 mt-1">
                          <span className="text-amber-300 font-semibold">
                            {selectedPlayer.username}
                          </span>{' '}
                          <span className="text-slate-500">
                            #{selectedPlayer.id}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 mt-1">
                          Sélectionne un joueur à gauche.
                        </p>
                      )}
                    </div>

                    {selectedPlayerId && (
                      <button
                        type="button"
                        onClick={() => refreshSelectedPlayer()}
                        className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                      >
                        Rafraîchir
                      </button>
                    )}
                  </div>

                  {selectedPlayer && (
                    <div className="space-y-3">
                      <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
                        <p className="text-xs text-slate-300 font-semibold">
                          Royaumes
                        </p>
                        <div className="grid gap-2 md:grid-cols-3">
                          <select
                            className={`${inputClass} md:col-span-2`}
                            value={playerRealmCode}
                            onChange={(e) => setPlayerRealmCode(e.target.value)}
                          >
                            <option value="">Débloquer un royaume</option>
                            {realms.map((r) => (
                              <option key={r.id} value={r.code}>
                                {r.code} — {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={playerResourceSaving}
                            onClick={handlePlayerUnlockRealm}
                            className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
                          >
                            Débloquer
                          </button>
                        </div>

                        <div className="grid gap-2 md:grid-cols-3">
                          <select
                            className={`${inputClass} md:col-span-2`}
                            value={playerRealmActivateId}
                            onChange={(e) => setPlayerRealmActivateId(e.target.value)}
                          >
                            <option value="">Activer un royaume (id)</option>
                            {realms.map((r) => (
                              <option key={r.id} value={r.id}>
                                #{r.id} — {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={playerResourceSaving}
                            onClick={handlePlayerActivateRealm}
                            className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Activer
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
                        <p className="text-xs text-slate-300 font-semibold">
                          Niveaux usines / skills
                        </p>
                        <div className="grid gap-2 md:grid-cols-4">
                          <select
                            className={`${inputClass} md:col-span-2`}
                            value={playerFactoryId}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              setPlayerFactoryId(nextId);
                              if (!nextId) {
                                setPlayerFactoryLevel('');
                                return;
                              }
                              const current = playerFactoryLevelById.get(Number(nextId));
                              if (current != null && Number.isFinite(current)) {
                                setPlayerFactoryLevel(String(current));
                              }
                            }}
                          >
                            <option value="">Choisir une usine</option>
                            {factories.map((f) => (
                              <option key={f.id} value={f.id}>
                                #{f.id} — {f.code} — {f.name} (actuel:{' '}
                                {playerFactoryLevelById.get(Number(f.id)) ?? 0})
                              </option>
                            ))}
                          </select>
                          <input
                            className={inputClass}
                            inputMode="numeric"
                            placeholder={
                              playerFactoryId
                                ? `Niveau (actuel: ${playerFactoryLevelById.get(Number(playerFactoryId)) ?? 0})`
                                : 'Niveau'
                            }
                            value={playerFactoryLevel}
                            onChange={(e) => setPlayerFactoryLevel(e.target.value)}
                          />
                          <button
                            type="button"
                            disabled={playerResourceSaving}
                            onClick={handlePlayerSetFactoryLevel}
                            className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Modifier le niveau
                          </button>
                        </div>

                        <div className="grid gap-2 md:grid-cols-4">
                          <select
                            className={`${inputClass} md:col-span-2`}
                            value={playerSkillId}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              setPlayerSkillId(nextId);
                              if (!nextId) {
                                setPlayerSkillLevel('');
                                return;
                              }
                              const current = playerSkillLevelById.get(Number(nextId));
                              if (current != null && Number.isFinite(current)) {
                                setPlayerSkillLevel(String(current));
                              }
                            }}
                          >
                            <option value="">Choisir une compétence</option>
                            {skills.map((s) => (
                              <option key={s.id} value={s.id}>
                                #{s.id} — {s.code} — {s.name} (actuel:{' '}
                                {playerSkillLevelById.get(Number(s.id)) ?? 0})
                              </option>
                            ))}
                          </select>
                          <input
                            className={inputClass}
                            inputMode="numeric"
                            placeholder={
                              playerSkillId
                                ? `Niveau (actuel: ${playerSkillLevelById.get(Number(playerSkillId)) ?? 0})`
                                : 'Niveau'
                            }
                            value={playerSkillLevel}
                            onChange={(e) => setPlayerSkillLevel(e.target.value)}
                          />
                          <button
                            type="button"
                            disabled={playerResourceSaving}
                            onClick={handlePlayerSetSkillLevel}
                            className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            Modifier le niveau
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3">
                        <select
                          className={`${inputClass} md:col-span-2`}
                          value={playerResourceId}
                          onChange={(e) => setPlayerResourceId(e.target.value)}
                        >
                          <option value="">Choisir une ressource</option>
                          {resources.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.code} — {r.name}
                            </option>
                          ))}
                        </select>
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          placeholder="Montant (ex: 1000)"
                          value={playerResourceAmount}
                          onChange={(e) =>
                            setPlayerResourceAmount(e.target.value)
                          }
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={playerResourceSaving}
                          onClick={handlePlayerAddResource}
                          className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
                        >
                          Ajouter
                        </button>
                        <button
                          type="button"
                          disabled={playerResourceSaving}
                          onClick={handlePlayerRemoveResource}
                          className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                        >
                          Retirer
                        </button>
                        <button
                          type="button"
                          disabled={playerResourceSaving}
                          onClick={handlePlayerSet}
                          className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Définir
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlayerResourceAmount('1000')}
                          className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                        >
                          +1k
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlayerResourceAmount('1000000')}
                          className="px-3 py-1 rounded-md border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                        >
                          +1M
                        </button>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-950/30 p-2 max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                            <tr className="border-b border-slate-800/70">
                              <th className="py-2 pr-3">Ressource</th>
                              <th className="py-2 pr-3">Amount</th>
                              <th className="py-2">Lifetime</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPlayerResources.map((r) => (
                              <tr
                                key={`pr-${r.resource_id}`}
                                className="border-b border-slate-800/60"
                              >
                                <td className="py-2 pr-3 text-slate-200">
                                  <span className="text-amber-300 font-mono">
                                    {r.code}
                                  </span>{' '}
                                  <span className="text-slate-400">{r.name}</span>
                                </td>
                                <td className="py-2 pr-3 font-mono text-slate-100">
                                  {Number(r.amount || 0).toLocaleString('fr-FR')}
                                </td>
                                <td className="py-2 font-mono text-slate-300">
                                  {Number(r.lifetime_amount || 0).toLocaleString(
                                    'fr-FR'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-2 border-t border-slate-800/70 flex flex-wrap gap-2 justify-end">
                        <button
                          type="button"
                          disabled={playerDangerLoading}
                          onClick={requestPlayerReset}
                          className="px-3 py-1 rounded-md border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Reset progression
                        </button>
                        <button
                          type="button"
                          disabled={playerDangerLoading}
                          onClick={requestPlayerDelete}
                          className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Supprimer compte
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'support' ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSupportTab('tickets')}
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${
                        supportTab === 'tickets'
                          ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                          : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
                      }`}
                    >
                      Tickets{' '}
                      <span className="text-[11px] text-slate-400">
                        ({supportTicketsTotal})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportTab('logs')}
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${
                        supportTab === 'logs'
                          ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                          : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
                      }`}
                    >
                      Logs{' '}
                      <span className="text-[11px] text-slate-400">
                        ({logsTotal})
                      </span>
                    </button>
                  </div>

                  {supportTab === 'tickets' ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={supportStatus}
                        onChange={(e) => setSupportStatus(e.target.value)}
                        className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="">ALL</option>
                      </select>
                      <input
                        value={supportSearch}
                        onChange={(e) => setSupportSearch(e.target.value)}
                        placeholder="Rechercher ticket (email, pseudo, sujet...)"
                        className="w-full md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <button
                        type="button"
                        onClick={refreshSupportTickets}
                        disabled={supportTicketsLoading}
                        className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {supportTicketsLoading ? '...' : 'Rafraîchir'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={logsSearch}
                        onChange={(e) => setLogsSearch(e.target.value)}
                        placeholder="Filtre local (description/table...)"
                        className="w-full md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <input
                        value={logsActionType}
                        onChange={(e) => setLogsActionType(e.target.value)}
                        placeholder="actionType"
                        className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <input
                        value={logsTargetTable}
                        onChange={(e) => setLogsTargetTable(e.target.value)}
                        placeholder="targetTable"
                        className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <input
                        value={logsUserId}
                        onChange={(e) => setLogsUserId(e.target.value)}
                        placeholder="userId"
                        className="w-24 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <button
                        type="button"
                        onClick={refreshAdminLogs}
                        disabled={logsLoading}
                        className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {logsLoading ? '...' : 'Rafraîchir'}
                      </button>
                    </div>
                  )}
                </div>

                {supportTab === 'tickets' ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                      {supportTicketsLoading ? (
                        <p className="text-sm text-slate-300">Chargement...</p>
                      ) : supportTickets.length === 0 ? (
                        <p className="text-sm text-slate-300">Aucun ticket.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                              <tr className="border-b border-slate-800/70">
                                <th className="py-2 pr-3">ID</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 pr-3">User</th>
                                <th className="py-2 pr-3">Sujet</th>
                                <th className="py-2">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {supportTickets.map((t) => {
                                const selected =
                                  Number(selectedTicketId) === Number(t.id);
                                return (
                                  <tr
                                    key={`ticket-${t.id}`}
                                    className={`border-b border-slate-800/60 cursor-pointer ${
                                      selected
                                        ? 'bg-amber-500/10'
                                        : 'hover:bg-slate-900/40'
                                    }`}
                                    onClick={() => setSelectedTicketId(t.id)}
                                  >
                                    <td className="py-2 pr-3 font-mono text-amber-300">
                                      {t.id}
                                    </td>
                                    <td className="py-2 pr-3 text-slate-200">
                                      {t.status || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-slate-300">
                                      {t.username || t.email || '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-slate-300">
                                      <span className="block max-w-[240px] truncate">
                                        {t.subject || t.category || '-'}
                                      </span>
                                    </td>
                                    <td className="py-2 text-slate-400">
                                      {t.created_at
                                        ? new Date(t.created_at).toLocaleString(
                                            'fr-FR'
                                          )
                                        : '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-3">
                      <p className="text-xs text-slate-300">Détail du ticket</p>
                      {selectedTicket ? (
                        <>
                          <div className="text-sm text-slate-100">
                            <p className="font-semibold">
                              #{selectedTicket.id} · {selectedTicket.status}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {selectedTicket.username || '-'} ·{' '}
                              {selectedTicket.email || '-'}
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-800/70 bg-black/20 p-3">
                            <p className="text-xs text-slate-300 mb-2">
                              {selectedTicket.subject || '(sans sujet)'}
                            </p>
                            <pre className="whitespace-pre-wrap text-xs text-slate-200 font-mono">
                              {selectedTicket.message || ''}
                            </pre>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleTicketStatus(selectedTicket.id, 'OPEN')
                              }
                              className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                            >
                              Réouvrir
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleTicketStatus(selectedTicket.id, 'CLOSED')
                              }
                              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold transition-colors"
                            >
                              Clore
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-300">
                          Sélectionne un ticket.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                    {logsLoading ? (
                      <p className="text-sm text-slate-300">Chargement...</p>
                    ) : filteredLogs.length === 0 ? (
                      <p className="text-sm text-slate-300">Aucun log.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full text-left text-xs">
                          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                            <tr className="border-b border-slate-800/70">
                              <th className="py-2 pr-3">Date</th>
                              <th className="py-2 pr-3">User</th>
                              <th className="py-2 pr-3">Type</th>
                              <th className="py-2 pr-3">Table</th>
                              <th className="py-2 pr-3">Target</th>
                              <th className="py-2">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLogs.map((l) => (
                              <tr
                                key={`log-${l.id}`}
                                className="border-b border-slate-800/60"
                              >
                                <td className="py-2 pr-3 text-slate-400">
                                  {l.created_at
                                    ? new Date(l.created_at).toLocaleString(
                                        'fr-FR'
                                      )
                                    : '-'}
                                </td>
                                <td className="py-2 pr-3 text-slate-300 font-mono">
                                  {l.user_id ?? '-'}
                                </td>
                                <td className="py-2 pr-3 text-slate-200">
                                  {l.action_type || '-'}
                                </td>
                                <td className="py-2 pr-3 text-slate-300">
                                  {l.target_table || '-'}
                                </td>
                                <td className="py-2 pr-3 text-slate-300 font-mono">
                                  {l.target_id ?? '-'}
                                </td>
                                <td className="py-2 text-slate-300">
                                  {l.description || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === 'endgame' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEndgameTab('requirements')}
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${
                        endgameTab === 'requirements'
                          ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                          : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
                      }`}
                    >
                      Règles{' '}
                      <span className="text-[11px] text-slate-400">
                        ({endgameRequirements.length})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndgameTab('rankings')}
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${
                        endgameTab === 'rankings'
                          ? 'border-amber-400 text-amber-200 bg-amber-500/10'
                          : 'border-slate-700 text-slate-200 hover:border-amber-400 hover:text-amber-200'
                      }`}
                    >
                      Classement{' '}
                      <span className="text-[11px] text-slate-400">
                        ({endgameRankings.length})
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {endgameTab === 'requirements' && (
                      <button
                        type="button"
                        onClick={openEndgameCreate}
                        className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs text-slate-900 font-semibold transition-colors"
                      >
                        Créer une règle
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={refreshEndgame}
                      disabled={endgameLoading}
                      className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {endgameLoading ? '...' : 'Rafraîchir'}
                    </button>
                  </div>
                </div>

                {endgameTab === 'requirements' && createOpen && (
                  <div className="rounded-xl border border-amber-500/30 bg-slate-950/40 p-3 space-y-3">
                    <p className="text-xs text-slate-300">
                      Création d'une règle endgame
                    </p>
                    <div className="grid gap-2 md:grid-cols-6">
                      <select
                        className={`${inputClass} md:col-span-3`}
                        value={createDraft.resource_id ?? ''}
                        onChange={(e) =>
                          setCreateDraft((p) => ({
                            ...p,
                            resource_id: e.target.value,
                          }))
                        }
                      >
                        <option value="">Ressource</option>
                        {sortedResources.map((res) => (
                          <option key={`endgame-create-res-${res.id}`} value={res.id}>
                            {res.code} - {res.name} (#{res.id})
                          </option>
                        ))}
                      </select>
                      <input
                        className={`${inputClass} md:col-span-2`}
                        placeholder="Montant"
                        inputMode="decimal"
                        value={createDraft.amount ?? ''}
                        onChange={(e) =>
                          setCreateDraft((p) => ({ ...p, amount: e.target.value }))
                        }
                      />
                      <div className="flex gap-2 justify-end md:col-span-1">
                        <button
                          type="button"
                          onClick={() => setCreateOpen(false)}
                          className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          disabled={createSaving}
                          onClick={handleCreateEndgameRequirement}
                          className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs text-slate-900 font-semibold transition-colors"
                        >
                          {createSaving ? 'Création…' : 'Créer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {endgameLoading ? (
                  <p className="text-sm text-slate-300">Chargement...</p>
                ) : endgameTab === 'requirements' ? (
                  (endgameRequirements || []).filter(matchesSearch).length === 0 ? (
                    <p className="text-sm text-slate-300">Aucun résultat.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] w-full text-left text-xs">
                        <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                          <tr className="border-b border-amber-500/20">
                            <th className="py-3 pr-3">ID</th>
                            <th className="py-3 pr-3">Ressource</th>
                            <th className="py-3 pr-3">Montant</th>
                            <th className="py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(endgameRequirements || [])
                            .filter(matchesSearch)
                            .map((row) => {
                              const type = 'endgame_requirements';
                              const r = mergedRow(type, row);
                              const busy = isRowSaving(type, row.id);

                              return (
                                <tr
                                  key={`endgame-req-${row.id}`}
                                  className="border-b border-slate-800/60"
                                >
                                  <td className="py-2 pr-3 font-mono text-amber-300">
                                    {row.id}
                                  </td>
                                  <td className="py-2 pr-3">
                                    <select
                                      className={inputClass}
                                      value={r.resource_id ?? ''}
                                      onChange={(e) =>
                                        updateField(
                                          type,
                                          row.id,
                                          'resource_id',
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">Ressource</option>
                                      {sortedResources.map((res) => (
                                        <option
                                          key={`endgame-req-res-${row.id}-${res.id}`}
                                          value={res.id}
                                        >
                                          {res.code} - {res.name} (#{res.id})
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
                                        updateField(type, row.id, 'amount', e.target.value)
                                      }
                                    />
                                  </td>
                                  <td className="py-2">
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => requestSave(type, row)}
                                        className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
                                      >
                                        {busy ? 'Sauvegarde…' : 'Sauvegarder'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => requestDelete(type, row)}
                                        className="px-3 py-1 rounded-md border border-red-500/50 text-red-200 hover:bg-red-900/30 transition-colors"
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                    {(endgameRankings || []).filter(matchesSearch).length === 0 ? (
                      <p className="text-sm text-slate-300">Aucun résultat.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full text-left text-xs">
                          <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                            <tr className="border-b border-slate-800/70">
                              <th className="py-2 pr-3">ID</th>
                              <th className="py-2 pr-3">User</th>
                              <th className="py-2 pr-3">Complété le</th>
                              <th className="py-2 pr-3">Temps (s)</th>
                              <th className="py-2">Données</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(endgameRankings || [])
                              .filter(matchesSearch)
                              .map((row, idx) => (
                                <tr
                                  key={`endgame-rank-${row?.id ?? idx}`}
                                  className="border-b border-slate-800/60"
                                >
                                  <td className="py-2 pr-3 font-mono text-amber-300">
                                    {row?.id ?? '-'}
                                  </td>
                                  <td className="py-2 pr-3 text-slate-300 font-mono">
                                    {row?.user_id ?? '-'}
                                  </td>
                                  <td className="py-2 pr-3 text-slate-300">
                                    {row?.completed_at
                                      ? new Date(row.completed_at).toLocaleString('fr-FR')
                                      : '-'}
                                  </td>
                                  <td className="py-2 pr-3 text-slate-300 font-mono">
                                    {formatDurationSeconds(row?.playtime_seconds)}
                                    {row?.playtime_seconds != null
                                      ? ` (${row.playtime_seconds}s)`
                                      : ''}
                                  </td>
                                  <td className="py-2 text-slate-300 font-mono">
                                    <pre className="whitespace-pre-wrap text-[11px] leading-5 max-w-[680px]">
                                      {JSON.stringify(row, null, 2)}
                                    </pre>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : loading ? (
              <p className="text-sm text-slate-300">Chargement…</p>
            ) : visibleRows.length === 0 ? (
              <p className="text-sm text-slate-300">Aucun résultat.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-xs">
                  <thead className="text-[11px] uppercase tracking-widest text-slate-400">
                    <tr className="border-b border-amber-500/20">
                      {activeTab === 'realms' && (
                        <>
                          <th className="py-3 pr-3">ID</th>
                          <th className="py-3 pr-3">Code</th>
                          <th className="py-3 pr-3">Nom</th>
                          <th className="py-3 pr-3">Description</th>
                          <th className="py-3 pr-3">Coûts</th>
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
                      const r = mergedRow(type, row);
                      const busy = isRowSaving(type, row.id);

                      const saveButton = (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => requestSave(type, row)}
                          className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
                        >
                          {busy ? 'Sauvegarde…' : 'Sauvegarder'}
                        </button>
                      );

                      const actionButtons = (
                        <div className="flex flex-wrap gap-2">
                          {saveButton}
                          <button
                            type="button"
                            onClick={() => requestDelete(type, row)}
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
                            : realmUnlockCostsByRealmId.get(Number(row.id)) || [];

                        return (
                          <tr
                            key={`realms-${row.id}`}
                            className="border-b border-slate-800/60"
                          >
                            <td className="py-2 pr-3 font-mono text-amber-300">
                              {row.id}
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.code ?? ''}
                                onChange={(e) =>
                                  updateField('realms', row.id, 'code', e.target.value)
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.name ?? ''}
                                onChange={(e) =>
                                  updateField('realms', row.id, 'name', e.target.value)
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.description ?? ''}
                                onChange={(e) =>
                                  updateField(
                                    'realms',
                                    row.id,
                                    'description',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              {costs.length === 0 ? (
                                <span className="text-slate-500">-</span>
                              ) : (
                                <ul className="space-y-0.5">
                                  {costs.map((c) => {
                                    const resourceId = Number(
                                      c.resourceId ?? c.resource_id
                                    );
                                    const amount = Number(c.amount ?? 0);
                                    const label =
                                      c.resourceName ||
                                      c.resource_name ||
                                      resources.find(
                                        (res) => Number(res.id) === resourceId
                                      )?.name ||
                                      resources.find(
                                        (res) =>
                                          Number(res.id) === resourceId
                                      )?.code ||
                                      c.resourceCode ||
                                      c.resource_code ||
                                      `#${resourceId}`;

                                    return (
                                      <li
                                        key={`realm-cost-${row.id}-${resourceId}-${amount}`}
                                        className="text-[11px] text-slate-200"
                                      >
                                        <span className="font-mono text-amber-200">
                                          {amount}
                                        </span>{' '}
                                        <span className="text-slate-300">
                                          {label}
                                        </span>
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
                                    updateField(
                                      'realms',
                                      row.id,
                                      'is_default_unlocked',
                                      e.target.checked
                                    )
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
                            <td className="py-2 pr-3 font-mono text-amber-300">
                              {row.id}
                            </td>
                            <td className="py-2 pr-3">
                              <select
                                className={inputClass}
                                value={r.target_realm_id ?? ''}
                                onChange={(e) =>
                                  updateField(
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
                                  updateField(
                                    'realm_unlock_costs',
                                    row.id,
                                    'resource_id',
                                    e.target.value
                                  )
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
                                  updateField(
                                    'realm_unlock_costs',
                                    row.id,
                                    'amount',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2">{actionButtons}</td>
                          </tr>
                        );
                      }

                      if (activeTab === 'resources') {
                        return (
                          <tr
                            key={`resources-${row.id}`}
                            className="border-b border-slate-800/60"
                          >
                            <td className="py-2 pr-3 font-mono text-amber-300">
                              {row.id}
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                inputMode="numeric"
                                value={r.realm_id ?? ''}
                                onChange={(e) =>
                                  updateField(
                                    'resources',
                                    row.id,
                                    'realm_id',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.code ?? ''}
                                onChange={(e) =>
                                  updateField('resources', row.id, 'code', e.target.value)
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.name ?? ''}
                                onChange={(e) =>
                                  updateField('resources', row.id, 'name', e.target.value)
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.description ?? ''}
                                onChange={(e) =>
                                  updateField(
                                    'resources',
                                    row.id,
                                    'description',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2">{actionButtons}</td>
                          </tr>
                        );
                      }

                      if (activeTab === 'factories') {
                        return (
                          <tr
                            key={`factories-${row.id}`}
                            className="border-b border-slate-800/60"
                          >
                            <td className="py-2 pr-3 font-mono text-amber-300">
                              {row.id}
                            </td>
                            <td className="py-2 pr-3">
                              <select
                                className={inputClass}
                                value={r.realm_id ?? ''}
                                onChange={(e) =>
                                  updateField('factories', row.id, 'realm_id', e.target.value)
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
                                  updateField(
                                    'factories',
                                    row.id,
                                    'resource_id',
                                    e.target.value
                                  )
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
                                onChange={(e) =>
                                  updateField('factories', row.id, 'code', e.target.value)
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                value={r.name ?? ''}
                                onChange={(e) =>
                                  updateField('factories', row.id, 'name', e.target.value)
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                inputMode="decimal"
                                value={r.base_production ?? ''}
                                onChange={(e) =>
                                  updateField(
                                    'factories',
                                    row.id,
                                    'base_production',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                inputMode="decimal"
                                value={r.base_cost ?? ''}
                                onChange={(e) =>
                                  updateField(
                                    'factories',
                                    row.id,
                                    'base_cost',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className={inputClass}
                                inputMode="numeric"
                                value={r.unlock_order ?? ''}
                                onChange={(e) =>
                                  updateField(
                                    'factories',
                                    row.id,
                                    'unlock_order',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={!!r.is_active}
                                  onChange={(e) =>
                                    updateField(
                                      'factories',
                                      row.id,
                                      'is_active',
                                      e.target.checked
                                    )
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
                        <tr
                          key={`skills-${row.id}`}
                          className="border-b border-slate-800/60"
                        >
                          <td className="py-2 pr-3 font-mono text-amber-300">
                            {row.id}
                          </td>
                          <td className="py-2 pr-3">
                            <select
                              className={inputClass}
                              value={r.realm_id ?? ''}
                              onChange={(e) =>
                                updateField('skills', row.id, 'realm_id', e.target.value)
                              }
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
                              onChange={(e) =>
                                updateField('skills', row.id, 'code', e.target.value)
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              className={inputClass}
                              value={r.name ?? ''}
                              onChange={(e) =>
                                updateField('skills', row.id, 'name', e.target.value)
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              className={inputClass}
                              value={r.effect_type ?? ''}
                              onChange={(e) =>
                                updateField(
                                  'skills',
                                  row.id,
                                  'effect_type',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              className={inputClass}
                              inputMode="decimal"
                              value={r.effect_value ?? ''}
                              onChange={(e) =>
                                updateField(
                                  'skills',
                                  row.id,
                                  'effect_value',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              className={inputClass}
                              inputMode="numeric"
                              value={r.max_level ?? ''}
                              onChange={(e) =>
                                updateField('skills', row.id, 'max_level', e.target.value)
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <select
                              className={inputClass}
                              value={r.base_cost_resource_id ?? ''}
                              onChange={(e) =>
                                updateField(
                                  'skills',
                                  row.id,
                                  'base_cost_resource_id',
                                  e.target.value
                                )
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
                                updateField(
                                  'skills',
                                  row.id,
                                  'base_cost_amount',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              className={inputClass}
                              inputMode="decimal"
                              value={r.cost_growth_factor ?? ''}
                              onChange={(e) =>
                                updateField(
                                  'skills',
                                  row.id,
                                  'cost_growth_factor',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              className={inputClass}
                              inputMode="numeric"
                              value={r.unlock_order ?? ''}
                              onChange={(e) =>
                                updateField(
                                  'skills',
                                  row.id,
                                  'unlock_order',
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="py-2">{actionButtons}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate('/game')}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-amber-400/60 text-amber-200 text-xs md:text-sm hover:bg-amber-500/10 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
          >
            Retour au jeu
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
