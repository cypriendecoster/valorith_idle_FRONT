import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import Toast from '../components/Toast';
import ActionMenu from '../components/ui/ActionMenu';
import A11yDetails from '../components/ui/A11yDetails';
import A11yDetailsWrap from '../components/ui/A11yDetailsWrap';
import ConfirmModal from '../components/ui/ConfirmModal';
import CopyButton from '../components/ui/CopyButton';
import Badge from '../components/ui/Badge';
import KeyValueRow from '../components/ui/KeyValueRow';
import PaginationControls from '../components/ui/PaginationControls';
import TableShell from '../components/ui/TableShell';
import SkeletonCards from '../components/ui/SkeletonCards';
import SkeletonTable from '../components/ui/SkeletonTable';
import StatusBadge from '../components/ui/StatusBadge';
import AdminHeader from '../components/admin/layout/AdminHeader';
import AdminTabs from '../components/admin/layout/AdminTabs';
import BalanceSubTabs from '../components/admin/layout/BalanceSubTabs';
import BalanceList from '../components/admin/balance/BalanceList';
import AdminToolbar from '../components/admin/layout/AdminToolbar';
import AdminSectionTitle from '../components/admin/layout/AdminSectionTitle';
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

function toNonNegativeIntOrNull(value) {
  const n = toNumberOrNull(value);
  if (n == null) return null;
  if (n < 0) return null;
  return Math.floor(n);
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

function clampInt(value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  const i = Math.trunc(n);
  return Math.min(max, Math.max(min, i));
}

function normalizeSortDir(value, fallback = 'DESC') {
  const dir = String(value ?? '').trim().toUpperCase();
  return dir === 'ASC' || dir === 'DESC' ? dir : fallback;
}

function parseBigIntLoose(value) {
  if (value == null) return null;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return BigInt(Math.trunc(value));
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const sign = raw.startsWith('-') ? '-' : '';
  const digitsOnly = raw.replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  try {
    return BigInt(`${sign}${digitsOnly}`);
  } catch {
    return null;
  }
}

function formatIntegerFull(value, locale = 'fr-FR') {
  const n = parseBigIntLoose(value);
  if (n == null) return String(value ?? '-');
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return n.toString();
  }
}

function formatIntegerCompact(value, locale = 'fr-FR') {
  const n = parseBigIntLoose(value);
  if (n == null) return '-';
  const sign = n < 0n ? '-' : '';
  const abs = n < 0n ? -n : n;
  const thousand = 1000n;
  const units = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
  let unitIndex = 0;
  let div = 1n;
  while (unitIndex < units.length - 1 && abs >= div * thousand) {
    div *= thousand;
    unitIndex += 1;
  }
  if (unitIndex === 0) return formatIntegerFull(abs, locale);

  const scaledTimes10 = (abs * 10n) / div;
  const whole = scaledTimes10 / 10n;
  const dec = scaledTimes10 % 10n;
  const decSep = locale.startsWith('fr') ? ',' : '.';
  const wholeStr = formatIntegerFull(whole, locale);
  const decStr = dec === 0n ? '' : `${decSep}${dec.toString()}`;
  return `${sign}${wholeStr}${decStr}${units[unitIndex]}`;
}

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
            'Erreur lors de la récupération du mode maintenance.',
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
        message: enabled ? 'Maintenance activée.' : 'Maintenance désactivée.',
      });
    } catch (err) {
      console.error(err);
      rollbackOptimistic?.();
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          'Erreur lors de la mise à jour de la maintenance.',
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
        ? { type: 'success', message: `${label} copié.` }
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
      setToast({ type: 'success', message: 'Aucune modification à sauvegarder.' });
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
    if (!rowEdits || Object.keys(rowEdits).length === 0 || getRowDiffs(type, row).length === 0) {
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
      false && (
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
    const confirmText = null;
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

      const exists = (endgameRequirements || [].some(
        (r) => Number(r.resource_id) === Number(payload.resource_id)
      ));
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
    { key: 'players', label: 'Joueurs', hint: `${playersTotal || players.length} joueurs` },
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
              createLabel="Créer"
              onReset={() => {
                if (activeTab === 'players') {
                  setPlayersSearch('');
                  setPlayersPage(0);
                } else {
                  setSearch('');
                }
              }}
              resetAriaLabel="Réinitialiser la recherche"
            />
          </div>

          <div className="border-t border-slate-800/70 pt-4">
            <AdminSectionTitle>{title}</AdminSectionTitle>

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
                <div
                  className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 ${selectedPlayerId ? 'hidden lg:block' : ''
                    }`}
                >
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-300">Liste des joueurs</p>
                        <span className="px-2 py-0.5 rounded-full border border-slate-700 text-[10px] text-slate-300">
                          Recherche serveur
                        </span>
                      </div>
                      {playersLoading && (
                        <p className="text-[11px] text-slate-500">Chargement...</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-400">
                        {playersFrom}-{playersTo} / {playersTotal}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={playersSortBy}
                          aria-label="Trier les joueurs par"
                          onChange={(e) => {
                            setPlayersSortBy(e.target.value);
                            setPlayersPage(0);
                          }}
                          className="rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                        >
                          <option value="id">ID</option>
                          <option value="last_login_at">Dernière connexion</option>
                          <option value="created_at">Création</option>
                          <option value="username">Pseudo</option>
                          <option value="email">Email</option>
                          <option value="role">Rôle</option>
                        </select>

                        <button
                          type="button"
                          aria-label="Inverser le sens du tri des joueurs"
                          onClick={() => {
                            setPlayersSortDir((p) => (p === 'ASC' ? 'DESC' : 'ASC'));
                            setPlayersPage(0);
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                        >
                          {playersSortDir === 'ASC' ? 'Asc' : 'Desc'}
                        </button>

                        <select
                          value={playersLimit}
                          aria-label="Nombre de joueurs par page"
                          onChange={(e) => {
                            setPlayersLimit(Number(e.target.value));
                            setPlayersPage(0);
                          }}
                          className="rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={200}>200</option>
                        </select>

                        <PaginationControls
                          disabled={playersLoading || playersTotal <= 0}
                          page={playersPage}
                          maxPage={playersMaxPage}
                          onPrev={() => setPlayersPage((p) => Math.max(0, p - 1))}
                          onNext={() =>
                            setPlayersPage((p) => Math.min(playersMaxPage, p + 1))
                          }
                          ariaPrev="Page précédente joueurs"
                          ariaNext="Page suivante joueurs"
                        />


                      </div>
                    </div>
                  </div>

                  {playersLoading ? (
                    <div className="space-y-3" aria-busy="true">
                      <div className="md:hidden">
                        <SkeletonCards items={6} />
                      </div>
                      <div className="hidden md:block">
                        <SkeletonTable rows={8} cols={5} titleWidth="w-32" />
                      </div>
                    </div>
                  ) : players.length === 0 ? (
                    <p className="text-sm text-slate-300">Aucun joueur.</p>
                  ) : (
                    <>
                      <div className="md:hidden space-y-2">
                        {players.map((p) => {
                          const selected = Number(selectedPlayerId) === Number(p.id);
                          return (
                            <button
                              key={`player-card-${p.id}`}
                              type="button"
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
                              className={`w-full text-left rounded-lg border p-3 transition-colors ${selected
                                ? 'border-amber-400/50 bg-amber-500/10'
                                : 'border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40'
                                } focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm text-slate-100 font-semibold">
                                    {p.username || '(sans pseudo)'}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {p.email || '-'}
                                  </p>
                                </div>
                                <p className="text-[11px] text-amber-300 font-mono">
                                  #{p.id}
                                </p>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <p className="uppercase tracking-widest text-slate-500">
                                    Rôle
                                  </p>
                                  <Badge className="mt-0.5">{p.role || '-'}</Badge>
                                </div>
                                <div>
                                  <p className="uppercase tracking-widest text-slate-500">
                                    Dernière connexion
                                  </p>
                                  <p className="text-slate-300">
                                    {p.last_login_at
                                      ? new Date(p.last_login_at).toLocaleString('fr-FR')
                                      : '-'}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <TableShell className="hidden md:block" asChild>
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
                              const selectPlayer = () => {
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
                              };
                              return (
                                <tr
                                  key={`player-${p.id}`}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`Ouvrir le joueur #${p.id}`}
                                  aria-selected={selected}
                                  className={`border-b border-slate-800/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${selected
                                    ? 'bg-amber-500/10'
                                    : 'hover:bg-slate-900/40'
                                    }`}
                                  onClick={selectPlayer}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      selectPlayer();
                                    }
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
                                    <Badge>{p.role || '-'}</Badge>
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
                      </TableShell>
                    </>
                  )}
                </div>

                <div
                  className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-3 ${selectedPlayerId ? '' : 'hidden lg:block'
                    }`}
                >
                  <div className="sticky top-0 z-20 -mx-3 px-3 py-3 bg-slate-950/85 backdrop-blur border-b border-slate-800/70">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {selectedPlayerId ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPlayerId(null)}
                            className="lg:hidden mb-2 px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                          >
                            {'<'} Retour
                          </button>
                        ) : null}
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
                        {selectedPlayer ? (
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
                            <p className="truncate">
                              <span className="text-slate-500">Email:</span>{' '}
                              <span className="text-slate-200">
                                {selectedPlayer.email || '-'}
                              </span>
                            </p>
                            <p className="truncate">
                              <span className="text-slate-500">Role:</span>{' '}
                              <span className="text-slate-200">
                                {selectedPlayer.role || '-'}
                              </span>
                            </p>
                            <p className="col-span-2 truncate">
                              <span className="text-slate-500">Derniere connexion:</span>{' '}
                              <span className="text-slate-200">
                                {selectedPlayer.last_login_at
                                  ? new Date(
                                    selectedPlayer.last_login_at
                                  ).toLocaleString('fr-FR')
                                  : '-'}
                              </span>
                            </p>
                          </div>
                        ) : null}
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
                          Niveaux usines / compétences
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

                      <div className="min-w-0 max-w-full rounded-lg border border-slate-800 bg-slate-950/30 p-2 max-h-80 overflow-y-auto overflow-x-auto">
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
                                <td className="py-2 pr-3 font-mono text-slate-100 tabular-nums whitespace-nowrap">
                                  <span title={formatIntegerFull(r.amount, 'fr-FR')}>
                                    {formatIntegerCompact(r.amount, 'fr-FR')}
                                  </span>
                                </td>
                                <td className="py-2 font-mono text-slate-300 tabular-nums whitespace-nowrap">
                                  <span
                                    title={formatIntegerFull(
                                      r.lifetime_amount,
                                      'fr-FR'
                                    )}
                                  >
                                    {formatIntegerCompact(
                                      r.lifetime_amount,
                                      'fr-FR'
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <A11yDetailsWrap
                        className="pt-2 border-t border-slate-800/70"
                        summaryClassName="rounded-md"
                      >
                        <summary className="cursor-pointer select-none px-1 py-2 text-xs font-semibold text-red-200 flex items-center justify-between gap-3">
                          <span>Actions dangereuses</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            Reset / suppression
                          </span>
                        </summary>
                        <div className="flex flex-wrap gap-2 justify-end pt-1">
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
                      </A11yDetailsWrap>
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'support' ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/20 bg-black/40 p-4 shadow-[0_0_40px_rgba(251,191,36,0.10)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
                        Système
                      </p>
                      <h2 className="text-lg font-heading text-slate-100">
                        Maintenance
                      </h2>
                      <p className="text-xs text-slate-400 max-w-xl">
                        Active/désactive l’accès à l’API pour les joueurs. Les admins restent autorisés.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={maintenanceLoading || maintenanceSaving}
                        onClick={() => saveMaintenance(true)}
                        className="px-3 py-2 rounded-md border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                      >
                        Activer
                      </button>
                      <button
                        type="button"
                        disabled={maintenanceLoading || maintenanceSaving}
                        onClick={() => saveMaintenance(false)}
                        className="px-3 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-white/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                      >
                        Désactiver
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] uppercase tracking-widest text-slate-400 mb-1">
                        Message (optionnel)
                      </label>
                      <input
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="Serveur en maintenance. Merci de réessayer plus tard."
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                        disabled={maintenanceLoading || maintenanceSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-slate-400 mb-1">
                        Réessayer dans (s)
                      </label>
                      <input
                        value={maintenanceRetryAfter}
                        onChange={(e) => setMaintenanceRetryAfter(e.target.value)}
                        placeholder="ex: 60"
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                        disabled={maintenanceLoading || maintenanceSaving}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      État :{' '}
                      <span
                        className={
                          maintenanceEnabled
                            ? 'text-amber-200'
                            : 'text-emerald-200'
                        }
                      >
                        {maintenanceEnabled ? 'activée' : 'désactivée'}
                      </span>
                    </p>
                    <button
                      type="button"
                      disabled={maintenanceLoading || maintenanceSaving}
                      onClick={() => saveMaintenance()}
                      className="px-3 py-2 rounded-md border border-amber-400/60 text-amber-200 hover:bg-amber-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                    >
                      {maintenanceSaving ? '...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSupportTab('tickets');
                        setSupportPage(0);
                      }}
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${supportTab === 'tickets'
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
                      onClick={() => {
                        setSupportTab('logs');
                        setLogsPage(0);
                      }}
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${supportTab === 'logs'
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
                        aria-label="Filtrer les tickets par statut"
                        onChange={(e) => {
                          setSupportStatus(e.target.value);
                          setSupportPage(0);
                        }}
                        className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="">ALL</option>
                      </select>
                      {supportStatus !== 'OPEN' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSupportStatus('OPEN');
                            setSupportPage(0);
                          }}
                          className="px-3 py-2 rounded-lg border border-amber-500/50 text-amber-200 hover:bg-amber-500/10 transition-colors text-xs"
                        >
                          OPEN only
                        </button>
                      ) : null}
                      <div className="flex items-center gap-2">
                        <input
                          list="support-category-list"
                          value={supportCategory}
                          aria-label="Filtrer les tickets par catégorie"
                          onChange={(e) => {
                            setSupportCategory(e.target.value);
                            setSupportPage(0);
                          }}
                          placeholder="Catégorie"
                          className="w-40 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                        />
                        <datalist id="support-category-list">
                          {supportCategoryOptions.map((cat) => (
                            <option key={`support-cat-${cat}`} value={cat} />
                          ))}
                        </datalist>
                      </div>
                      <input
                        value={supportSearch}
                        aria-label="Rechercher un ticket"
                        onChange={(e) => {
                          setSupportSearch(e.target.value);
                          setSupportPage(0);
                        }}
                        placeholder="Rechercher ticket (email, pseudo, sujet...)"
                        className="flex-1 min-w-0 md:flex-none md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <select
                        value={supportSortDir}
                        aria-label="Trier les tickets"
                        onChange={(e) => {
                          setSupportSortDir(e.target.value);
                          setSupportPage(0);
                        }}
                        className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      >
                        <option value="DESC">Récents</option>
                        <option value="ASC">Anciens</option>
                      </select>
                      <select
                        value={supportLimit}
                        aria-label="Nombre de tickets par page"
                        onChange={(e) => {
                          setSupportLimit(Number(e.target.value));
                          setSupportPage(0);
                        }}
                        className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={500}>500</option>
                      </select>
                      <button
                        type="button"
                        onClick={refreshSupportTickets}
                        aria-label="Rafraîchir les tickets"
                        disabled={supportTicketsLoading}
                        className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {supportTicketsLoading ? '...' : 'Rafraîchir'}
                      </button>
                      <PaginationControls
                        disabled={supportTicketsLoading || supportTicketsTotal <= 0}
                        page={supportPage}
                        maxPage={supportMaxPage}
                        mode="range"
                        from={supportFrom}
                        to={supportTo}
                        total={supportTicketsTotal}
                        onPrev={() => setSupportPage((p) => Math.max(0, p - 1))}
                        onNext={() =>
                          setSupportPage((p) => Math.min(supportMaxPage, p + 1))
                        }
                        ariaPrev="Page précédente tickets"
                        ariaNext="Page suivante tickets"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={logsSearch}
                        aria-label="Filtrer les logs (local)"
                        onChange={(e) => setLogsSearch(e.target.value)}
                        placeholder="Filtre local (description/table...)"
                        className="flex-1 min-w-0 md:flex-none md:w-72 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <input
                        value={logsActionType}
                        aria-label="Filtrer logs par actionType"
                        onChange={(e) => {
                          setLogsActionType(e.target.value);
                          setLogsPage(0);
                          setLogsPrefetched(false);
                        }}
                        placeholder="actionType"
                        className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <input
                        value={logsTargetTable}
                        aria-label="Filtrer logs par targetTable"
                        onChange={(e) => {
                          setLogsTargetTable(e.target.value);
                          setLogsPage(0);
                          setLogsPrefetched(false);
                        }}
                        placeholder="targetTable"
                        className="w-32 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <input
                        value={logsUserId}
                        aria-label="Filtrer logs par userId"
                        onChange={(e) => {
                          setLogsUserId(e.target.value);
                          setLogsPage(0);
                          setLogsPrefetched(false);
                        }}
                        placeholder="userId"
                        className="w-24 rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      />
                      <select
                        value={logsSortDir}
                        aria-label="Trier les logs"
                        onChange={(e) => {
                          setLogsSortDir(e.target.value);
                          setLogsPage(0);
                        }}
                        className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      >
                        <option value="DESC">Récents</option>
                        <option value="ASC">Anciens</option>
                      </select>
                      <select
                        value={logsLimit}
                        aria-label="Nombre de logs par page"
                        onChange={(e) => {
                          setLogsLimit(Number(e.target.value));
                          setLogsPage(0);
                        }}
                        className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={500}>500</option>
                      </select>
                      <button
                        type="button"
                        onClick={refreshAdminLogs}
                        aria-label="Rafraichir les logs"
                        disabled={logsLoading}
                        className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {logsLoading ? '...' : 'Rafraîchir'}
                      </button>
                      <PaginationControls
                        disabled={logsLoading || logsTotal <= 0}
                        page={logsPage}
                        maxPage={logsMaxPage}
                        mode="range"
                        from={logsFrom}
                        to={logsTo}
                        total={logsTotal}
                        onPrev={() => setLogsPage((p) => Math.max(0, p - 1))}
                        onNext={() =>
                          setLogsPage((p) => Math.min(logsMaxPage, p + 1))
                        }
                        ariaPrev="Page précédente logs"
                        ariaNext="Page suivante logs"
                      />

                    </div>
                  )}
                </div>

                {supportTab === 'tickets' ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div
                      className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 ${selectedTicketId ? 'hidden lg:block' : ''
                        }`}
                    >
                      {supportTicketsLoading ? (
                        <div className="space-y-3" aria-busy="true">
                          <div className="md:hidden">
                            <SkeletonCards items={6} />
                          </div>
                          <div className="hidden md:block">
                            <SkeletonTable rows={8} cols={5} titleWidth="w-28" />
                          </div>
                        </div>
                      ) : supportTickets.length === 0 ? (
                        <p className="text-sm text-slate-300">Aucun ticket.</p>
                      ) : (
                        <>
                          <div className="md:hidden space-y-2">
                            {supportTickets.map((t) => {
                              const selected =
                                Number(selectedTicketId) === Number(t.id);
                              return (
                                <button
                                  key={`ticket-card-${t.id}`}
                                  type="button"
                                  onClick={() => setSelectedTicketId(t.id)}
                                  className={`w-full text-left rounded-lg border p-3 transition-colors ${selected
                                    ? 'border-amber-400/50 bg-amber-500/10'
                                    : 'border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40'
                                    } focus:outline-none focus-visible:ring focus-visible:ring-amber-400/70`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-[11px] text-amber-300 font-mono">
                                      #{t.id}
                                    </p>
                                    <p className="text-[11px] text-slate-300">
                                      {t.created_at
                                        ? new Date(t.created_at).toLocaleString('fr-FR')
                                        : '-'}
                                    </p>
                                  </div>

                                  <p className="mt-1 text-sm text-slate-100 font-semibold">
                                    {t.subject || t.category || '(sans sujet)'}
                                  </p>
                                  <p className="mt-1 text-[11px] text-slate-300">
                                    {t.username || t.email || '-'}
                                  </p>

                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                                      <span>Status:</span> <StatusBadge status={t.status} />
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      {t.category || ''}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <TableShell className="hidden md:block" asChild>
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
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`Ouvrir le ticket #${t.id}`}
                                      aria-selected={selected}
                                      className={`border-b border-slate-800/60 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${selected
                                        ? 'bg-amber-500/10'
                                        : 'hover:bg-slate-900/40'
                                        }`}
                                      onClick={() => setSelectedTicketId(t.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          setSelectedTicketId(t.id);
                                        }
                                      }}
                                    >
                                      <td className="py-2 pr-3 font-mono text-amber-300">
                                        {t.id}
                                      </td>
                                      <td className="py-2 pr-3 text-slate-200">
                                        <StatusBadge status={t.status} />
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
                          </TableShell>
                        </>
                      )}
                    </div>

                    <div
                      className={`min-w-0 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 space-y-3 ${selectedTicketId ? '' : 'hidden lg:block'
                        }`}
                    >
                      {selectedTicketId ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTicketId(null)}
                          className="lg:hidden px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                        >
                          {'<'} Retour
                        </button>
                      ) : null}
                      <p className="text-xs text-slate-300">Détail du ticket</p>
                      {selectedTicket ? (
                        <>
                          <div className="text-sm text-slate-100">
                            <p className="font-semibold flex flex-wrap items-center gap-2">
                              <span className="font-mono text-amber-300">
                                #{selectedTicket.id}
                              </span>
                              <StatusBadge status={selectedTicket.status} />
                            </p>


                            <p className="text-xs text-slate-400 mt-1">
                              {selectedTicket.username || '-'} ·{' '}
                              {selectedTicket.email || '-'}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <ActionMenu
                                ariaLabel="Actions rapides ticket"
                                triggerLabel="Copier"
                                items={[
                                  {
                                    key: 'copy-id',
                                    label: `Copier ID (#${selectedTicket.id})`,
                                    onClick: () => copyWithToast(selectedTicket.id, 'ID'),
                                  },
                                  {
                                    key: 'copy-email',
                                    label: 'Copier email',
                                    disabled: !normalizeText(selectedTicket.email),
                                    onClick: () => copyWithToast(selectedTicket.email, 'Email'),
                                  },
                                  {
                                    key: 'copy-ip',
                                    label: 'Copier IP',
                                    disabled: !normalizeText(selectedTicket.ip_address),
                                    onClick: () => copyWithToast(selectedTicket.ip_address, 'IP'),
                                  },
                                  {
                                    key: 'copy-ua',
                                    label: 'Copier User-Agent',
                                    disabled: !normalizeText(selectedTicket.user_agent),
                                    onClick: () =>
                                      copyWithToast(selectedTicket.user_agent, 'User-Agent'),
                                  },
                                  {
                                    key: 'copy-page',
                                    label: 'Copier URL page',
                                    disabled: !normalizeText(selectedTicket.page_url),
                                    onClick: () => copyWithToast(selectedTicket.page_url, 'URL page'),
                                  },
                                  {
                                    key: 'open-page',
                                    label: 'Ouvrir page',
                                    disabled: !normalizeText(selectedTicket.page_url),
                                    onClick: () => {
                                      if (!normalizeText(selectedTicket.page_url)) return;
                                      window.open(
                                        selectedTicket.page_url,
                                        '_blank',
                                        'noopener,noreferrer'
                                      );
                                    },
                                  },
                                ]}
                              />
                              {selectedTicket.page_url ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    window.open(
                                      selectedTicket.page_url,
                                      '_blank',
                                      'noopener,noreferrer'
                                    )
                                  }
                                  className="px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                                >
                                  Ouvrir page
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <div className="rounded-lg border border-slate-800/70 bg-black/20 p-3 space-y-2">
                            <p className="text-xs text-slate-300 font-semibold">
                              Infos techniques
                            </p>
                            <dl className="grid gap-2 sm:grid-cols-2 text-[11px] text-slate-300">
                              <div>
                                <dt className="uppercase tracking-widest text-slate-500">
                                  Catégorie
                                </dt>
                                <dd className="mt-0.5 text-slate-200">
                                  {selectedTicket.category || '-'}
                                </dd>
                              </div>

                              <div>
                                <dt className="uppercase tracking-widest text-slate-500">
                                  Date serveur
                                </dt>
                                <dd className="mt-0.5 text-slate-200 font-mono">
                                  {selectedTicket.created_at
                                    ? new Date(selectedTicket.created_at).toLocaleString(
                                      'fr-FR'
                                    )
                                    : '-'}
                                </dd>
                              </div>

                              <div>
                                <dt className="uppercase tracking-widest text-slate-500">
                                  IP
                                </dt>
                                <dd className="mt-0.5 text-slate-200 font-mono">
                                  {selectedTicket.ip_address || '-'}
                                </dd>
                              </div>

                              <div>
                                <dt className="uppercase tracking-widest text-slate-500">
                                  Heure client
                                </dt>
                                <dd
                                  className="mt-0.5 text-slate-200 font-mono"
                                  title={selectedTicket.client_time_iso || ''}
                                >
                                  {selectedTicket.client_time_iso
                                    ? new Date(
                                      selectedTicket.client_time_iso
                                    ).toLocaleString('fr-FR')
                                    : '-'}
                                </dd>
                              </div>

                              <div className="sm:col-span-2">
                                <dt className="uppercase tracking-widest text-slate-500">
                                  Page
                                </dt>
                                <dd className="mt-0.5 text-slate-200 break-all">
                                  {selectedTicket.page_url ? (
                                    <div className="flex items-start justify-between gap-2">
                                      <a
                                        href={selectedTicket.page_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-amber-200 hover:text-amber-100 underline underline-offset-2 break-all"
                                        title={selectedTicket.page_url}
                                      >
                                        {selectedTicket.page_url}
                                      </a>
                                      <div className="shrink-0 flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            window.open(
                                              selectedTicket.page_url,
                                              '_blank',
                                              'noopener,noreferrer'
                                            )
                                          }
                                          className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                                        >
                                          Ouvrir
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            copyWithToast(selectedTicket.page_url, 'URL page')
                                          }
                                          className="px-2 py-1 rounded-md border border-slate-700 text-[11px] text-slate-200 hover:border-amber-400 hover:text-amber-200 transition-colors"
                                        >
                                          Copier
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    '-'
                                  )}
                                </dd>
                              </div>

                              <div className="sm:col-span-2">
                                <KeyValueRow
                                  label="User-Agent"
                                  value={selectedTicket.user_agent || '-'}
                                  mono
                                  actions={
                                    <CopyButton
                                      value={selectedTicket.user_agent}
                                      label="Copier UA"
                                      ariaLabel="Copier User-Agent"
                                      disabled={!normalizeText(selectedTicket.user_agent)}
                                      className="px-2 py-1 rounded-md text-[11px]"
                                      onCopied={(ok) =>
                                        setToast(
                                          ok
                                            ? {
                                              type: 'success',
                                              message: 'User-Agent copié.',
                                            }
                                            : {
                                              type: 'error',
                                              message:
                                                'Impossible de copier User-Agent.',
                                            }
                                        )
                                      }
                                    />
                                  }
                                />
                              </div>


                            </dl>

                            {selectedTicket.client_meta ? (
                              <A11yDetails
                                className="pt-1"
                                summary="Client meta"
                                summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-slate-300 hover:text-slate-200"
                              >
                                <pre className="mt-2 whitespace-pre-wrap text-[11px] text-slate-200 font-mono rounded-md border border-slate-800/70 bg-slate-950/40 p-2 max-h-48 overflow-y-auto">
                                  {typeof selectedTicket.client_meta === 'string'
                                    ? selectedTicket.client_meta
                                    : JSON.stringify(
                                      selectedTicket.client_meta,
                                      null,
                                      2
                                    )}
                                </pre>
                              </A11yDetails>
                            ) : null}
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
                      <div className="space-y-3" aria-busy="true">
                        <div className="md:hidden">
                          <SkeletonCards items={6} />
                        </div>
                        <div className="hidden md:block">
                          <SkeletonTable rows={10} cols={6} titleWidth="w-24" />
                        </div>
                      </div>
                    ) : filteredLogs.length === 0 ? (
                      <p className="text-sm text-slate-300">Aucun log.</p>
                    ) : (
                      <>
                        <div className="md:hidden space-y-2">
                          {filteredLogs.map((l) => (
                            <div
                              key={`log-card-${l.id}`}
                              className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {l.created_at
                                    ? new Date(l.created_at).toLocaleString('fr-FR')
                                    : '-'}
                                </p>
                                <p className="text-[11px] text-slate-300 font-mono">
                                  user:{' '}
                                  <span className="text-slate-200">
                                    {l.user_id ?? '-'}
                                  </span>
                                </p>
                              </div>

                              <p className="mt-1 text-sm text-slate-100 font-semibold">
                                {l.action_type || '-'}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-300">
                                {l.target_table || '-'}{' '}
                                <span className="text-slate-500 font-mono">
                                  #{l.target_id ?? '-'}
                                </span>
                              </p>

                              {l.description ? (
                                <p className="mt-2 text-[11px] text-slate-200 whitespace-pre-wrap">
                                  {l.description}
                                </p>
                              ) : (
                                <p className="mt-2 text-[11px] text-slate-400">-</p>
                              )}
                            </div>
                          ))}
                        </div>

                        <TableShell className="hidden md:block" asChild>
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
                        </TableShell>
                      </>
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
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${endgameTab === 'requirements'
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
                      className={`px-3 py-1 rounded-md border text-xs transition-colors ${endgameTab === 'rankings'
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
                  <div className="space-y-3" aria-busy="true">
                    <div className="md:hidden">
                      <SkeletonCards items={6} />
                    </div>
                    <div className="hidden md:block">
                      <SkeletonTable rows={8} cols={5} titleWidth="w-32" />
                    </div>
                  </div>
                ) : endgameTab === 'requirements' ? (
                  (endgameRequirements || []).filter(matchesSearch).length === 0 ? (
                    <p className="text-sm text-slate-300">Aucun résultat.</p>
                  ) : (
                    <>
                      <div className="md:hidden space-y-2">
                        {(endgameRequirements || []
                          .filter(matchesSearch)
                          .map((row) => {
                            const type = 'endgame_requirements';
                            const r = mergedRow(type, row);
                            const busy = isRowSaving(type, row.id);
                            const canSave = getRowDiffs(type, row).length > 0;

                            return (
                              <div
                                key={`endgame-req-card-${row.id}`}
                                className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[11px] text-amber-300 font-mono">
                                    #{row.id}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] uppercase tracking-widest text-slate-400">
                                    Ressource
                                  </p>
                                  <select
                                    className={inputClass}
                                    value={r.resource_id ?? ''}
                                    onChange={(e) =>
                                      updateField(type, row.id, 'resource_id', e.target.value)
                                    }
                                  >
                                    <option value="">Ressource</option>
                                    {sortedResources.map((res) => (
                                      <option
                                        key={`endgame-req-res-mobile-${row.id}-${res.id}`}
                                        value={res.id}
                                      >
                                        {res.code} - {res.name} (#{res.id})
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
                                      updateField(type, row.id, 'amount', e.target.value)
                                    }
                                  />
                                </div>

                                <div className="flex flex-wrap gap-2 justify-end pt-1">
                                  <button
                                    type="button"
                                    disabled={busy || !canSave}
                                    onClick={() => requestSave(type, row)}
                                    className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors text-xs"
                                  >
                                    {busy ? 'Sauvegarde…' : 'Sauvegarder'}
                                  </button>
                                  <ActionMenu
                                    ariaLabel="Actions"
                                    items={[
                                      {
                                        key: 'delete',
                                        label: 'Supprimer',
                                        danger: true,
                                        onClick: () => requestDelete(type, row),
                                      },
                                    ]}
                                  />
                                </div>
                              </div>
                            );
                          }))}
                      </div>

                      <TableShell className="hidden md:block" asChild>
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
                            {(endgameRequirements || []
                              .filter(matchesSearch)
                              .map((row) => {
                                const type = 'endgame_requirements';
                                const r = mergedRow(type, row);
                                const busy = isRowSaving(type, row.id);
                                const canSave = getRowDiffs(type, row).length > 0;

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
                                          disabled={busy || !canSave}
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
                              }))}
                          </tbody>
                        </table>
                      </TableShell>
                    </>
                  )
                ) : (
                  <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
                    {(endgameRankings || []).filter(matchesSearch).length === 0 ? (
                      <p className="text-sm text-slate-300">Aucun résultat.</p>
                    ) : (
                      <>
                        <div className="md:hidden space-y-2">
                          {(endgameRankings || [])
                            .filter(matchesSearch)
                            .map((row, idx) => (
                              <A11yDetails
                                key={`endgame-rank-card-${row?.id ?? idx}`}
                                className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3"
                                summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none"
                                summary={
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm text-slate-100 font-semibold">
                                        {row?.username
                                          ? `${row.username} (#${row.user_id})`
                                          : row?.user_id ?? '-'}
                                      </p>
                                      <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                                        #{row?.id ?? '-'}
                                      </p>
                                    </div>
                                    <p className="text-[11px] text-slate-300">
                                      {formatDurationSeconds(
                                        row?.completion_seconds ?? row?.playtime_seconds
                                      )}
                                    </p>
                                  </div>
                                }
                              >

                                <div className="pt-3 space-y-2 text-[11px] text-slate-300">
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    <div>
                                      <p className="uppercase tracking-widest text-slate-500">
                                        Complété le
                                      </p>
                                      <p className="text-slate-200 font-mono">
                                        {row?.completed_at
                                          ? new Date(row.completed_at).toLocaleString('fr-FR')
                                          : '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="uppercase tracking-widest text-slate-500">
                                        Temps (s)
                                      </p>
                                      <p className="text-slate-200 font-mono">
                                        {row?.completion_seconds != null
                                          ? `${row.completion_seconds}s`
                                          : row?.playtime_seconds != null
                                            ? `${row.playtime_seconds}s`
                                            : '-'}
                                      </p>
                                    </div>
                                  </div>

                                  <A11yDetailsWrap summaryClassName="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-slate-200">
                                    <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                                      Données (JSON)
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-5 rounded-md border border-slate-800/70 bg-slate-950/40 p-2 max-h-60 overflow-y-auto">
                                      {JSON.stringify(row, null, 2)}
                                    </pre>
                                  </A11yDetailsWrap>
                                </div>
                              </A11yDetails>
                            ))}
                        </div>

                        <TableShell className="hidden md:block" asChild>
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
                                      {row?.username ? `${row.username} (#${row.user_id})` : row?.user_id ?? '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-slate-300">
                                      {row?.completed_at
                                        ? new Date(row.completed_at).toLocaleString('fr-FR')
                                        : '-'}
                                    </td>
                                    <td className="py-2 pr-3 text-slate-300 font-mono">
                                      {formatDurationSeconds(
                                        row?.completion_seconds ?? row?.playtime_seconds
                                      )}
                                      {row?.completion_seconds != null
                                        ? ` (${row.completion_seconds}s)`
                                        : row?.playtime_seconds != null
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
                        </TableShell>
                      </>
                    )}
                  </div>
                )}
              </div>
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











