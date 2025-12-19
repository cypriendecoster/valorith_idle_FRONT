import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';
import AdminHeader from '../components/admin/layout/AdminHeader';
import AdminTabs from '../components/admin/layout/AdminTabs';
import BalanceSubTabs from '../components/admin/layout/BalanceSubTabs';
import CreateBalanceForm from '../components/admin/balance/CreateBalanceForm';
import BalanceList from '../components/admin/balance/BalanceList';
import AdminPlayersSection from '../components/admin/sections/AdminPlayersSection';
import AdminSupportSection from '../components/admin/sections/AdminSupportSection';
import AdminEndgameSection from '../components/admin/sections/AdminEndgameSection';
import usePlayersState from '../hooks/admin/usePlayersState';
import useSupportState from '../hooks/admin/useSupportState.jsx';
import useEndgameState from '../hooks/admin/useEndgameState.jsx';
import AdminToolbar from '../components/admin/layout/AdminToolbar';
import AdminSectionTitle from '../components/admin/layout/AdminSectionTitle';
import InfoBanner from '../components/ui/InfoBanner';
import { adminService } from '../services/AdminService';
import { authService } from '../services/AuthService';
import { normalizeText, toNumberOrNull, toNonNegativeIntOrNull, toBooleanInt, formatDurationSeconds, clampInt, normalizeSortDir, parseBigIntLoose, formatIntegerFull, formatIntegerCompact } from '../utils/adminFormatters';


function AdminPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const lastSyncedParamsKeyRef = useRef('');
  const ignoreNextUrlSyncRef = useRef(false);
  const [urlHydrated, setUrlHydrated] = useState(false);

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
  const [playersTotal, setPlayersTotal] = useState(0);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersPrefetched, setPlayersPrefetched] = useState(false);
  const [playersPage, setPlayersPage] = useState(0);
  const [playersLimit, setPlayersLimit] = useState(50);
  const [playersSortBy, setPlayersSortBy] = useState('id');
  const [playersSortDir, setPlayersSortDir] = useState('DESC');
  const [playersSearch, setPlayersSearch] = useState('');
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
  const [supportCategory, setSupportCategory] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportTicketsTotal, setSupportTicketsTotal] = useState(0);
  const [supportTicketsLoading, setSupportTicketsLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [supportBulkClosing, setSupportBulkClosing] = useState(false);
  const [supportPage, setSupportPage] = useState(0);
  const [supportLimit, setSupportLimit] = useState(200);
  const [supportSortDir, setSupportSortDir] = useState('DESC');

  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPrefetched, setLogsPrefetched] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsActionType, setLogsActionType] = useState('');
  const [logsTargetTable, setLogsTargetTable] = useState('');
  const [logsUserId, setLogsUserId] = useState('');
  const [logsPage, setLogsPage] = useState(0);
  const [logsLimit, setLogsLimit] = useState(200);
  const [logsSortDir, setLogsSortDir] = useState('DESC');

  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceRetryAfter, setMaintenanceRetryAfter] = useState('');

  const [endgameRequirements, setEndgameRequirements] = useState([]);
  const [endgameRankings, setEndgameRankings] = useState([]);
  const [endgameLoading, setEndgameLoading] = useState(false);
  const [endgameFeedback, setEndgameFeedback] = useState('');

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
  const [confirmDetails, setConfirmDetails] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    if (ignoreNextUrlSyncRef.current) {
      ignoreNextUrlSyncRef.current = false;
      lastSyncedParamsKeyRef.current = searchParamsKey;
      setUrlHydrated(true);
      return;
    }

    setUrlHydrated(true);
    if (searchParamsKey === lastSyncedParamsKeyRef.current) return;

    const nextTab = String(searchParams.get('tab') || '').trim();
    const allowedTabs = new Set([
      'realms',
      'realm_unlock_costs',
      'resources',
      'factories',
      'skills',
      'players',
      'support',
      'endgame',
    ]);

    if (nextTab && allowedTabs.has(nextTab)) {
      setActiveTab(nextTab);
    }

    const nextSearch = searchParams.get('q');
    if (nextSearch != null) setSearch(nextSearch);

    const nextPlayersSearch = searchParams.get('pQ');
    if (nextPlayersSearch != null) setPlayersSearch(nextPlayersSearch);
    else if (nextSearch != null && nextTab === 'players') setPlayersSearch(nextSearch);

    const nextPlayersPage = searchParams.get('pPage');
    if (nextPlayersPage != null) setPlayersPage(clampInt(nextPlayersPage, { min: 0 }));
    const nextPlayersLimit = searchParams.get('pLimit');
    if (nextPlayersLimit != null)
      setPlayersLimit(clampInt(nextPlayersLimit, { min: 1, max: 200 }));
    const nextPlayersSortBy = searchParams.get('pSortBy');
    if (nextPlayersSortBy != null) setPlayersSortBy(nextPlayersSortBy || 'id');
    const nextPlayersSortDir = searchParams.get('pSortDir');
    if (nextPlayersSortDir != null)
      setPlayersSortDir(normalizeSortDir(nextPlayersSortDir, 'DESC'));

    const nextSupportTab = searchParams.get('sTab');
    if (nextSupportTab === 'tickets' || nextSupportTab === 'logs') {
      setSupportTab(nextSupportTab);
    }
    const nextSupportStatus = searchParams.get('sStatus');
    if (nextSupportStatus != null) setSupportStatus(nextSupportStatus);
    const nextSupportSearch = searchParams.get('sQ');
    if (nextSupportSearch != null) setSupportSearch(nextSupportSearch);
    const nextSupportCategory = searchParams.get('sCat');
    if (nextSupportCategory != null) setSupportCategory(nextSupportCategory);
    const nextSupportPage = searchParams.get('sPage');
    if (nextSupportPage != null) setSupportPage(clampInt(nextSupportPage, { min: 0 }));
    const nextSupportLimit = searchParams.get('sLimit');
    if (nextSupportLimit != null)
      setSupportLimit(clampInt(nextSupportLimit, { min: 1, max: 500 }));
    const nextSupportSortDir = searchParams.get('sSortDir');
    if (nextSupportSortDir != null)
      setSupportSortDir(normalizeSortDir(nextSupportSortDir, 'DESC'));

    const nextLogsActionType = searchParams.get('lActionType');
    if (nextLogsActionType != null) setLogsActionType(nextLogsActionType);
    const nextLogsTargetTable = searchParams.get('lTargetTable');
    if (nextLogsTargetTable != null) setLogsTargetTable(nextLogsTargetTable);
    const nextLogsUserId = searchParams.get('lUserId');
    if (nextLogsUserId != null) setLogsUserId(nextLogsUserId);
    const nextLogsPage = searchParams.get('lPage');
    if (nextLogsPage != null) setLogsPage(clampInt(nextLogsPage, { min: 0 }));
    const nextLogsLimit = searchParams.get('lLimit');
    if (nextLogsLimit != null)
      setLogsLimit(clampInt(nextLogsLimit, { min: 1, max: 500 }));
    const nextLogsSortDir = searchParams.get('lSortDir');
    if (nextLogsSortDir != null) setLogsSortDir(normalizeSortDir(nextLogsSortDir, 'DESC'));

    const nextLogsLocalSearch = searchParams.get('lQ');
    if (nextLogsLocalSearch != null) setLogsSearch(nextLogsLocalSearch);

    setLogsPrefetched(false);

    const nextEndgameTab = searchParams.get('eTab');
    if (nextEndgameTab === 'requirements' || nextEndgameTab === 'rankings') {
      setEndgameTab(nextEndgameTab);
    }

    lastSyncedParamsKeyRef.current = searchParamsKey;
    setUrlHydrated(true);
  }, [isAdmin, searchParams, searchParamsKey]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!endgameFeedback) return;
    const id = setTimeout(() => setEndgameFeedback(''), 3000);
    return () => clearTimeout(id);
  }, [endgameFeedback]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!urlHydrated) return;

    const next = new URLSearchParams();
    next.set('tab', activeTab);

    if (activeTab !== 'players' && normalizeText(search)) next.set('q', search);
    if (activeTab === 'players' && normalizeText(playersSearch)) next.set('pQ', playersSearch);

    if (playersPage) next.set('pPage', String(playersPage));
    if (playersLimit !== 50) next.set('pLimit', String(playersLimit));
    if (playersSortBy !== 'id') next.set('pSortBy', String(playersSortBy));
    if (playersSortDir !== 'DESC') next.set('pSortDir', String(playersSortDir));

    if (activeTab === 'players' && selectedPlayerId) {
      next.set('playerId', String(selectedPlayerId));
    }

    if (supportTab !== 'tickets') next.set('sTab', supportTab);
    if (supportStatus !== 'OPEN') next.set('sStatus', supportStatus);
    if (normalizeText(supportSearch)) next.set('sQ', supportSearch);
    if (normalizeText(supportCategory)) next.set('sCat', supportCategory);
    if (supportPage) next.set('sPage', String(supportPage));
    if (supportLimit !== 200) next.set('sLimit', String(supportLimit));
    if (supportSortDir !== 'DESC') next.set('sSortDir', String(supportSortDir));

    if (activeTab === 'support' && supportTab === 'tickets' && selectedTicketId) {
      next.set('ticketId', String(selectedTicketId));
    }

    if (normalizeText(logsSearch)) next.set('lQ', logsSearch);
    if (normalizeText(logsActionType)) next.set('lActionType', logsActionType);
    if (normalizeText(logsTargetTable)) next.set('lTargetTable', logsTargetTable);
    if (normalizeText(logsUserId)) next.set('lUserId', logsUserId);
    if (logsPage) next.set('lPage', String(logsPage));
    if (logsLimit !== 200) next.set('lLimit', String(logsLimit));
    if (logsSortDir !== 'DESC') next.set('lSortDir', String(logsSortDir));

    if (endgameTab !== 'requirements') next.set('eTab', endgameTab);

    const nextKey = next.toString();
    if (nextKey === searchParamsKey) return;

    ignoreNextUrlSyncRef.current = true;
    lastSyncedParamsKeyRef.current = nextKey;
    setSearchParams(next, { replace: true });
  }, [
    isAdmin,
    urlHydrated,
    activeTab,
    search,
    playersSearch,
    playersPage,
    playersLimit,
    playersSortBy,
    playersSortDir,
    selectedPlayerId,
    supportTab,
    supportStatus,
    supportSearch,
    supportCategory,
    supportPage,
    supportLimit,
    supportSortDir,
    selectedTicketId,
    logsSearch,
    logsActionType,
    logsTargetTable,
    logsUserId,
    logsPage,
    logsLimit,
    logsSortDir,
    endgameTab,
    searchParamsKey,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;

    let cancelled = false;
    setMaintenanceLoading(true);
    adminService
      .getMaintenance()
      .then((res) => {
        if (cancelled) return;
        setMaintenanceEnabled(!!res?.data?.enabled);
        setMaintenanceMessage(res?.data?.message || '');
        setMaintenanceRetryAfter(
          res?.data?.retryAfterSeconds != null
            ? String(res.data.retryAfterSeconds)
            : ''
        );
      })
      .catch((err) => {
        console.error(err);
        if (cancelled) return;
        setToast({
          type: 'error',
          message:
            err?.response?.data?.message ||
            'Erreur lors de la r�cup�ration du mode maintenance.',
        });
      })
      .finally(() => {
        if (cancelled) return;
        setMaintenanceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isAdmin]);

  const saveMaintenance = async (enabledOverride = null) => {
    const enabled =
      enabledOverride == null ? !!maintenanceEnabled : !!enabledOverride;

    const retryAfterSeconds = toNonNegativeIntOrNull(maintenanceRetryAfter);

    setMaintenanceSaving(true);
    try {
      const res = await adminService.setMaintenance({
        enabled,
        message: normalizeText(maintenanceMessage) || null,
        retryAfterSeconds,
      });
      setMaintenanceEnabled(!!res?.data?.enabled);
      setMaintenanceMessage(res?.data?.message || '');
      setMaintenanceRetryAfter(
        res?.data?.retryAfterSeconds != null
          ? String(res.data.retryAfterSeconds)
          : ''
      );

      setToast({
        type: 'success',
        message: enabled ? 'Maintenance activ�e.' : 'Maintenance d�sactiv�e.',
      });
    } catch (err) {
      console.error(err);
      rollbackOptimistic?.();
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Erreur lors de la mise � jour de la maintenance.',
      });
    } finally {
      setMaintenanceSaving(false);
    }
  };

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
      adminService.getPlayers({
        search: '',
        limit: 50,
        offset: 0,
        sortBy: 'id',
        sortDir: 'DESC',
      }),
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
        setPlayersTotal(Number(playersRes.value?.data?.total ?? 0));
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
                  ? { label: 'Co�ts royaumes', err: realmUnlockCostsRes.reason }
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

    const q = normalizeText(playersSearch);
    const isDefaultQuery =
      !q &&
      playersPage === 0 &&
      playersLimit === 50 &&
      playersSortBy === 'id' &&
      playersSortDir === 'DESC';

    if (playersPrefetched && isDefaultQuery) {
      setPlayersPrefetched(false);
      return;
    }

    let cancelled = false;
    setPlayersLoading(true);

    const offset = Math.max(0, playersPage) * Math.max(1, playersLimit);
    const id = setTimeout(() => {
      adminService
        .getPlayers({
          search: q,
          limit: playersLimit,
          offset,
          sortBy: playersSortBy,
          sortDir: playersSortDir,
        })
        .then((res) => {
          if (cancelled) return;
          setPlayers(res?.data?.items ?? []);
          setPlayersTotal(Number(res?.data?.total ?? 0));
        })
        .catch((err) => {
          console.error(err);
          if (cancelled) return;
          setToast({
            type: 'error',
            message:
              err?.response?.data?.message ||
              'Erreur lors de la r�cup�ration des joueurs.',
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
  }, [
    activeTab,
    isAdmin,
    playersSearch,
    playersPage,
    playersLimit,
    playersSortBy,
    playersSortDir,
  ]);

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
    if (activeTab !== 'players') return;

    const nextIdRaw = searchParams.get('playerId');
    if (nextIdRaw == null) {
      setSelectedPlayerId((prev) => (prev != null ? null : prev));
      return;
    }
    const nextId = clampInt(nextIdRaw, { min: 1 });
    if (!nextId) return;
    setSelectedPlayerId((prev) =>
      Number(prev) === Number(nextId) ? prev : nextId
    );
  }, [activeTab, isAdmin, searchParamsKey]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;
    if (supportTab !== 'tickets') return;

    let cancelled = false;
    setSupportTicketsLoading(true);

    const status = String(supportStatus ?? '').trim();
    const q = normalizeText(supportSearch);
    const category = normalizeText(supportCategory);
    const offset = Math.max(0, supportPage) * Math.max(1, supportLimit);

    const id = setTimeout(() => {
      adminService
        .getSupportTickets({
          status,
          search: q,
          category,
          limit: supportLimit,
          offset,
          sortDir: supportSortDir,
        })
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
  }, [
    activeTab,
    isAdmin,
    supportTab,
    supportStatus,
    supportSearch,
    supportCategory,
    supportPage,
    supportLimit,
    supportSortDir,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;
    if (supportTab !== 'tickets') return;

    const nextIdRaw = searchParams.get('ticketId');
    if (nextIdRaw == null) {
      setSelectedTicketId((prev) => (prev != null ? null : prev));
      return;
    }
    const nextId = clampInt(nextIdRaw, { min: 1 });
    if (!nextId) return;
    setSelectedTicketId((prev) =>
      Number(prev) === Number(nextId) ? prev : nextId
    );
  }, [activeTab, isAdmin, supportTab, searchParamsKey]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;
    if (supportTab === 'logs') return;
    if (logsPrefetched) return;

    let cancelled = false;

    adminService
      .getAdminLogs({
        limit: 1,
        offset: 0,
        actionType: normalizeText(logsActionType),
        targetTable: normalizeText(logsTargetTable),
        userId: normalizeText(logsUserId),
        sortDir: logsSortDir,
      })
      .then((res) => {
        if (cancelled) return;
        setLogsTotal(Number(res?.data?.total ?? 0));
        setLogsPrefetched(true);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    isAdmin,
    supportTab,
    logsPrefetched,
    logsActionType,
    logsTargetTable,
    logsUserId,
    logsSortDir,
  ]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab !== 'support') return;
    if (supportTab !== 'logs') return;

    let cancelled = false;
    setLogsLoading(true);

    const offset = Math.max(0, logsPage) * Math.max(1, logsLimit);
    const id = setTimeout(() => {
      adminService
        .getAdminLogs({
          limit: logsLimit,
          offset,
          actionType: normalizeText(logsActionType),
          targetTable: normalizeText(logsTargetTable),
          userId: normalizeText(logsUserId),
          sortDir: logsSortDir,
        })
        .then((res) => {
          if (cancelled) return;
          setLogs(res?.data?.items ?? []);
          setLogsTotal(Number(res?.data?.total ?? 0));
          setLogsPrefetched(true);
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
    logsPage,
    logsLimit,
    logsSortDir,
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
              'Erreur lors du chargement des r�gles endgame.',
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
      setSelectedTicketIds([]);
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
    details = null,
    action,
  }) => {
    setConfirmTitle(title || 'Confirmation');
    setConfirmMessage(message || '');
    setConfirmLabel(nextConfirmLabel);
    setConfirmDanger(danger);
    setConfirmExpectedText(expectedText);
    setConfirmDetails(details);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const copyToClipboard = async (value) => {
    const text = String(value ?? '');
    if (!text) return false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fall back below
    }

    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', 'true');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  };

  const copyWithToast = async (value, label = 'Valeur') => {
    const ok = await copyToClipboard(value);
    setToast(
      ok
        ? { type: 'success', message: `${label} copi�.` }
        : { type: 'error', message: `Impossible de copier ${label}.` }
    );
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmDetails(null);
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
        err?.response?.data?.message || "Action impossible. R�essaie."
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

  const getRowDiffs = (type, row) => {
    const id = row?.id;
    if (id == null) return [];
    const key = `${type}:${id}`;
    const rowEdits = edits[key];
    if (!rowEdits) return [];
    const merged = mergedRow(type, row);
    return Object.keys(rowEdits)
      .map((field) => {
        const before = row?.[field];
        const after = merged?.[field];
        const beforeText = normalizeText(before);
        const afterText = normalizeText(after);
        if (beforeText === afterText) return null;
        return {
          field,
          before: beforeText || '-',
          after: afterText || '-',
        };
      })
      .filter(Boolean);
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

  const supportCategoryOptions = useMemo(() => {
    const set = new Set();
    for (const t of supportTickets || []) {
      const category = normalizeText(t?.category);
      if (category) set.add(category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr-FR'));
  }, [supportTickets]);

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
      const prevRow = (endgameRequirements || [].find(
        (r) => Number(r.id) === numericId
      ));
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
    if (!rowEdits || Object.keys(rowEdits).length === 0 || getRowDiffs(type, row).length === 0) {
      setToast({ type: 'success', message: 'Aucune modification � sauvegarder.' });
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
      setToast({ type: 'success', message: 'Mise � jour enregistr�e.' });
      return true;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Impossible d'enregistrer la mise � jour.",
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
    if (!rowEdits || Object.keys(rowEdits).length === 0 || getRowDiffs(type, row).length === 0) {
      setToast({ type: 'success', message: 'Aucune modification � sauvegarder.' });
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
              'Impossible : ressource d�j� cr��e pour ce royaume. Effectuez une modification.',
          });
          return;
        }

        await adminService.createRealmUnlockCost(payload);
        const refreshed = await adminService.getRealmUnlockCosts({ limit: 1000 });
        setRealmUnlockCosts(refreshed?.data?.items ?? []);
      }

      setToast({ type: 'success', message: 'Cr�ation effectu�e.' });
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de cr�er l'�l�ment.",
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
      message: `Attention, supprimer est d�finitif. Cette action est irr�versible.\n\nConfirmer la suppression de #${id}${label} ?`,
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
      setToast({ type: 'success', message: 'Suppression effectu�e.' });
      return true;
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de supprimer l'�l�ment.",
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
      setToast({ type: 'success', message: 'Ressource ajout�e.' });
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
      setToast({ type: 'success', message: 'Ressource ajout�e.' });
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
      setToast({ type: 'success', message: 'Ressource retir�e.' });
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
      setToast({ type: 'error', message: 'Le montant doit �tre = 0.' });
      return;
    }

    try {
      setPlayerResourceSaving(true);
      await adminService.setPlayerResource(selectedPlayerId, {
        resourceId,
        amount,
      });
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Ressource mise � jour.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || 'Impossible de mettre � jour la ressource.',
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
      setToast({ type: 'success', message: 'Royaume d�bloqu�.' });
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message || "Impossible de d�bloquer le royaume.",
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
      setToast({ type: 'success', message: 'Royaume activ�.' });
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
      setToast({ type: 'success', message: 'Niveau usine mis � jour.' });
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
      setToast({ type: 'success', message: 'Niveau skill mis � jour.' });
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
      title: 'R�initialisation',
      message: `Attention, r�initialiser est d�finitif.\n\nR�initialiser la progression de ${selectedPlayer.username} (#${selectedPlayer.id}) ?`,
      confirmLabel: 'R�initialiser',
      danger: true,
      action: async () => {
        try {
          setPlayerDangerLoading(true);
          await adminService.resetPlayer(selectedPlayerId);
          await refreshSelectedPlayer();
          setToast({ type: 'success', message: 'Progression r�initialis�e.' });
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
      message: `Attention, supprimer est d�finitif.\n\nTape SUPPRIMER pour confirmer la suppression du compte ${selectedPlayer.username} (#${selectedPlayer.id}).`,
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
          setToast({ type: 'success', message: 'Compte supprim�.' });
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
      false && (
        `R�initialiser la progression de ${selectedPlayer.username} (#${selectedPlayer.id}) ?`
      )
    ) {
      return;
    }

    try {
      setPlayerDangerLoading(true);
      await adminService.resetPlayer(selectedPlayerId);
      await refreshSelectedPlayer();
      setToast({ type: 'success', message: 'Progression r�initialis�e.' });
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
    const confirmText = null;
    if (confirmText !== 'SUPPRIMER') return;

    try {
      setPlayerDangerLoading(true);
      await adminService.deletePlayer(selectedPlayerId);
      setPlayers((prev) => prev.filter((p) => Number(p.id) !== Number(selectedPlayerId)));
      setSelectedPlayerId(null);
      setSelectedPlayer(null);
      setSelectedPlayerResources([]);
      setToast({ type: 'success', message: 'Compte supprim�.' });
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
      const offset = Math.max(0, supportPage) * Math.max(1, supportLimit);
      const res = await adminService.getSupportTickets({
        status: normalizeText(supportStatus),
        search: normalizeText(supportSearch),
        limit: supportLimit,
        offset,
        sortDir: supportSortDir,
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
      setToast({ type: 'success', message: 'Ticket mis � jour.' });
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

  const handleCloseSelectedTickets = async () => {
    if (!selectedTicketIds.length) return;
    setSupportBulkClosing(true);
    try {
      await Promise.all(
        selectedTicketIds.map((id) =>
          adminService.updateSupportTicketStatus(id, 'CLOSED')
        )
      );
      setToast({
        type: 'success',
        message: ${selectedTicketIds.length} ticket(s) cloture(s).,
      });
      setSelectedTicketIds([]);
      await refreshSupportTickets();
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Impossible de clore la selection.',
      });
    } finally {
      setSupportBulkClosing(false);
    }
  };

  const refreshAdminLogs = async () => {
    try {
      setLogsLoading(true);
      const offset = Math.max(0, logsPage) * Math.max(1, logsLimit);
      const res = await adminService.getAdminLogs({
        limit: logsLimit,
        offset,
        actionType: normalizeText(logsActionType),
        targetTable: normalizeText(logsTargetTable),
        userId: normalizeText(logsUserId),
        sortDir: logsSortDir,
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
          "Erreur lors du rafra�chissement de l'endgame.",
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

      const exists = (endgameRequirements || [].some(
        (r) => Number(r.resource_id) === Number(payload.resource_id)
      ));
      if (exists) {
        setToast({
          type: 'error',
          message: 'Cette ressource est d�j� pr�sente dans les r�gles endgame.',
        });
        return;
      }

      await adminService.createEndgameRequirement(payload);
      const reqRes = await adminService.getEndgameRequirements();
      setEndgameRequirements(reqRes?.data ?? []);
      setToast({ type: 'success', message: 'R�gle cr��e.' });
      setCreateOpen(false);
      setCreateDraft({});
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          "Impossible de cr�er la r�gle endgame.",
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
    { key: 'endgame', label: 'Endgame', hint: 'R�gles + classement' },
    { key: 'players', label: 'Joueurs', hint: `${playersTotal || players.length} joueurs` },
    { key: 'support', label: 'Support & Logs', hint: 'Ops + audit' },
  ];

  const balanceTabs = [
    { key: 'realms', label: 'Royaumes', count: realms.length },
    { key: 'realm_unlock_costs', label: 'Co�ts royaumes', count: realmUnlockCosts.length },
    { key: 'resources', label: 'Ressources', count: resources.length },
    { key: 'factories', label: 'Usines', count: factories.length },
    { key: 'skills', label: 'Skills', count: skills.length },
  ];

  const title =
    activeTab === 'realms'
      ? 'Balance � Royaumes'
      : activeTab === 'realm_unlock_costs'
        ? 'Balance � Co�ts royaumes'
        : activeTab === 'resources'
          ? 'Balance � Ressources'
          : activeTab === 'factories'
            ? 'Balance � Usines'
            : activeTab === 'skills'
              ? 'Balance � Skills'
              : activeTab === 'players'
                ? 'Joueurs'
                : activeTab === 'support'
                  ? supportTab === 'tickets'
                    ? 'Support � Tickets'
                    : 'Audit � Logs admin'
                  : endgameTab === 'requirements'
                    ? 'Endgame � R�gles'
                    : 'Endgame � Classement';

  const inputClass =
    'w-full rounded-md bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70';

  const dirtyInfo = useMemo(() => {
    const balanceTypes = new Set([
      'realms',
      'realm_unlock_costs',
      'resources',
      'factories',
      'skills',
    ]);

    const type =
      activeTab === 'endgame'
        ? endgameTab === 'requirements'
          ? 'endgame_requirements'
          : null
        : balanceTypes.has(activeTab)
          ? activeTab
          : null;

    if (!type) return { rows: 0, fields: 0 };

    const list =
      type === 'endgame_requirements'
        ? endgameRequirements
        : type === 'realms'
          ? realms
          : type === 'realm_unlock_costs'
            ? realmUnlockCosts
            : type === 'resources'
              ? resources
              : type === 'factories'
                ? factories
                : type === 'skills'
                  ? skills
                  : [];

    const byId = new Map((list || []).map((row) => [String(row?.id), row]));
    let rows = 0;
    let fields = 0;

    for (const key of Object.keys(edits || {})) {
      if (!key.startsWith(`${type}:`)) continue;
      const id = key.slice(type.length + 1);
      const row = byId.get(String(id));
      if (!row) continue;
      const diffs = getRowDiffs(type, row);
      if (diffs.length === 0) continue;
      rows += 1;
      fields += diffs.length;
    }

    return { rows, fields };
  }, [
    activeTab,
    endgameTab,
    edits,
    endgameRequirements,
    factories,
    realmUnlockCosts,
    realms,
    resources,
    skills,
  ]);

  const playersOffset = Math.max(0, playersPage) * Math.max(1, playersLimit);
  const playersFrom = playersTotal ? playersOffset + 1 : 0;
  const playersTo = playersTotal
    ? Math.min(playersOffset + (players?.length ?? 0), playersTotal)
    : 0;
  const playersMaxPage = Math.max(
    0,
    Math.ceil(Math.max(0, playersTotal) / Math.max(1, playersLimit)) - 1
  );

  const supportOffset = Math.max(0, supportPage) * Math.max(1, supportLimit);
  const supportFrom = supportTicketsTotal ? supportOffset + 1 : 0;
  const supportTo = supportTicketsTotal
    ? Math.min(supportOffset + (supportTickets?.length ?? 0), supportTicketsTotal)
    : 0;
  const supportMaxPage = Math.max(
    0,
    Math.ceil(Math.max(0, supportTicketsTotal) / Math.max(1, supportLimit)) - 1
  );

  const logsOffset = Math.max(0, logsPage) * Math.max(1, logsLimit);
  const logsFrom = logsTotal ? logsOffset + 1 : 0;
  const logsTo = logsTotal ? Math.min(logsOffset + (logs?.length ?? 0), logsTotal) : 0;
  const logsMaxPage = Math.max(
    0,
    Math.ceil(Math.max(0, logsTotal) / Math.max(1, logsLimit)) - 1
  );

  const { listProps: playersListProps, detailsProps: playersDetailsProps } = usePlayersState({
    players,
    playersLoading,
    playersFrom,
    playersTo,
    playersTotal,
    playersSortBy,
    playersSortDir,
    playersLimit,
    playersPage,
    playersMaxPage,
    selectedPlayerId,
    setPlayersSortBy,
    setPlayersPage,
    setPlayersSortDir,
    setPlayersLimit,
    setSelectedPlayerId,
    setPlayerResourceId,
    setPlayerResourceAmount,
    setPlayerRealmCode,
    setPlayerRealmActivateId,
    setPlayerFactoryId,
    setPlayerFactoryLevel,
    setPlayerSkillId,
    setPlayerSkillLevel,
    setSelectedPlayerFactories,
    setSelectedPlayerSkills,
    selectedPlayer,
    refreshSelectedPlayer,
    inputClass,
    realms,
    factories,
    skills,
    resources,
    playerRealmCode,
    playerRealmActivateId,
    playerFactoryId,
    playerFactoryLevel,
    playerFactoryLevelById,
    playerSkillId,
    playerSkillLevel,
    playerSkillLevelById,
    playerResourceId,
    playerResourceAmount,
    playerResourceSaving,
    handlePlayerUnlockRealm,
    handlePlayerActivateRealm,
    handlePlayerSetFactoryLevel,
    handlePlayerSetSkillLevel,
    handlePlayerAddResource,
    handlePlayerRemoveResource,
    handlePlayerSet,
    selectedPlayerResources,
    formatIntegerFull,
    formatIntegerCompact,
    playerDangerLoading,
    requestPlayerReset,
    requestPlayerDelete,
  });

  const {
    supportMaintenance,
    supportTicketsToolbar,
    supportLogsToolbar,
    supportTicketsContent,
    supportLogsContent,
  } = useSupportState({
    maintenanceLoading,
    maintenanceSaving,
    maintenanceMessage,
    setMaintenanceMessage,
    maintenanceRetryAfter,
    setMaintenanceRetryAfter,
    maintenanceEnabled,
    saveMaintenance,
    supportStatus,
    setSupportStatus,
    supportCategory,
    setSupportCategory,
    supportCategoryOptions,
    supportSearch,
    setSupportSearch,
    supportSortDir,
    setSupportSortDir,
    supportLimit,
    setSupportLimit,
    supportTicketsLoading,
    supportTicketsTotal,
    supportPage,
    supportMaxPage,
    supportFrom,
    supportTo,
    setSupportPage,
    refreshSupportTickets,
    logsSearch,
    setLogsSearch,
    logsActionType,
    setLogsActionType,
    logsTargetTable,
    setLogsTargetTable,
    logsUserId,
    setLogsUserId,
    logsSortDir,
    setLogsSortDir,
    logsLimit,
    setLogsLimit,
    logsLoading,
    logsTotal,
    logsPage,
    logsMaxPage,
    logsFrom,
    logsTo,
    setLogsPage,
    refreshAdminLogs,
    setLogsPrefetched,
    supportTickets,
    selectedTicketId,
    setSelectedTicketId,
    selectedTicketIds,
    setSelectedTicketIds,
    onCloseSelected: handleCloseSelectedTickets,
    supportBulkClosing,
    selectedTicket,
    normalizeText,
    copyWithToast,
    setToast,
    handleTicketStatus,
    filteredLogs,
  });

  const {
    endgameCreateForm,
    endgameRequirementsContent,
    endgameRankingsContent,
  } = useEndgameState({
    endgameTab,
    createOpen,
    inputClass,
    createDraft,
    setCreateDraft,
    sortedResources,
    createSaving,
    setCreateOpen,
    handleCreateEndgameRequirement,
    endgameLoading,
    endgameRequirements,
    matchesSearch,
    mergedRow,
    isRowSaving,
    getRowDiffs,
    updateField,
    requestSave,
    requestDelete,
    endgameRankings,
    formatDurationSeconds,
  });
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100">
      <Toast toast={toast} />

      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        danger={confirmDanger}
        confirmLabel={confirmLabel}
        expectedText={confirmExpectedText}
        inputValue={confirmInput}
        onInputChange={setConfirmInput}
        details={confirmDetails}
        loading={confirmLoading}
        error={confirmError}
        onCancel={closeConfirm}
        onConfirm={submitConfirm}
      />

      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <AdminHeader onHome={() => navigate('/')} />

        <div className="rounded-2xl border border-amber-500/30 bg-black/50 shadow-[0_0_40px_rgba(251,191,36,0.18)] px-4 py-5 md:px-6 md:py-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <AdminTabs
              tabs={mainTabs}
              activeKey={activeMainTab}
              onSelect={(key) => {
                if (key === 'balance') setActiveTab(balanceTab);
                else setActiveTab(key);
              }}
            />

            {activeMainTab === 'balance' && (
              <BalanceSubTabs
                tabs={balanceTabs}
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key)}
              />
            )}

            <AdminToolbar
              dirtyCount={dirtyInfo.rows}
              searchValue={activeTab === 'players' ? playersSearch : search}
              searchAriaLabel={
                activeTab === 'players'
                  ? 'Rechercher un joueur'
                  : 'Rechercher dans le tableau'
              }
              searchPlaceholder={
                activeTab === 'players'
                  ? 'Rechercher (id, pseudo, email...)'
                  : 'Rechercher (id, code, nom...)'
              }
              onSearchChange={(value) => {
                if (activeTab === 'players') {
                  setPlayersSearch(value);
                  setPlayersPage(0);
                } else {
                  setSearch(value);
                }
              }}
              showCreate={isBalanceTab}
              onCreate={openCreate}
              createLabel="Creer"
              onReset={() => {
                if (activeTab === 'players') {
                  setPlayersSearch('');
                  setPlayersPage(0);
                } else {
                  setSearch('');
                }
              }}
              resetAriaLabel="Reinitialiser la recherche"
            />
          </div>

          <div className="border-t border-slate-800/70 pt-4">
            <AdminSectionTitle>{title}</AdminSectionTitle>

            {dirtyInfo.rows > 0 ? (
              <InfoBanner tone="warning">
                Modifications non sauvegardees : {dirtyInfo.rows} ligne(s), {dirtyInfo.fields} champ(s).
              </InfoBanner>
            ) : null}

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
              onCreate={handleCreate}
              onCancel={() => setCreateOpen(false)}
            />

            {activeTab === 'players' ? (
              <AdminPlayersSection
                selectedPlayerId={selectedPlayerId}
                listProps={playersListProps}
                detailsProps={playersDetailsProps}
              />
            ) : activeTab === 'support' ? (
              <AdminSupportSection
                supportTab={supportTab}
                onTabChange={(tab) => {
                  setSupportTab(tab);
                  setSelectedTicketId(null);
                  setSelectedTicketIds([]);
                  if (tab === 'tickets') {
                    setSupportPage(0);
                  } else {
                    setLogsPage(0);
                  }
                }}
                ticketsCount={supportTicketsTotal}
                logsCount={logsTotal}
                maintenance={supportMaintenance}
                ticketsToolbar={supportTicketsToolbar}
                logsToolbar={supportLogsToolbar}
                ticketsContent={supportTicketsContent}
                logsContent={supportLogsContent}
              />
            ) : activeTab === 'endgame' ? (
              <AdminEndgameSection
                endgameTab={endgameTab}
                onTabChange={setEndgameTab}
                requirementsCount={endgameRequirements.length}
                rankingsCount={endgameRankings.length}
                onCreateRequirement={openEndgameCreate}
                onRefresh={refreshEndgame}
                loading={endgameLoading}
                createForm={endgameCreateForm}
                requirementsContent={endgameRequirementsContent}
                rankingsContent={endgameRankingsContent}
                feedback={endgameFeedback}
              />
            ) : (
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






















