import { useEffect } from 'react';

export default function useAdminQueryRead({
  isAdmin,
  activeTab,
  supportTab,
  searchParams,
  searchParamsKey,
  lastSyncedParamsKeyRef,
  ignoreNextUrlSyncRef,
  setUrlHydrated,
  setActiveTab,
  setSearch,
  setPlayersSearch,
  setPlayersPage,
  setPlayersLimit,
  setPlayersSortBy,
  setPlayersSortDir,
  setSelectedPlayerId,
  setSupportTab,
  setSupportStatus,
  setSupportSearch,
  setSupportCategory,
  setSupportPage,
  setSupportLimit,
  setSupportSortDir,
  setSelectedTicketId,
  setLogsActionType,
  setLogsTargetTable,
  setLogsUserId,
  setLogsPage,
  setLogsLimit,
  setLogsSortDir,
  setLogsSearch,
  setLogsPrefetched,
  setEndgameTab,
  normalizeSortDir,
  clampInt,
}) {
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
  }, [
    isAdmin,
    searchParams,
    searchParamsKey,
    setActiveTab,
    setSearch,
    setPlayersSearch,
    setPlayersPage,
    setPlayersLimit,
    setPlayersSortBy,
    setPlayersSortDir,
    setSupportTab,
    setSupportStatus,
    setSupportSearch,
    setSupportCategory,
    setSupportPage,
    setSupportLimit,
    setSupportSortDir,
    setLogsActionType,
    setLogsTargetTable,
    setLogsUserId,
    setLogsPage,
    setLogsLimit,
    setLogsSortDir,
    setLogsSearch,
    setLogsPrefetched,
    setEndgameTab,
    setUrlHydrated,
    clampInt,
    normalizeSortDir,
    lastSyncedParamsKeyRef,
    ignoreNextUrlSyncRef,
  ]);

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
  }, [activeTab, isAdmin, searchParams, searchParamsKey, setSelectedPlayerId, clampInt]);

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
  }, [
    activeTab,
    isAdmin,
    supportTab,
    searchParams,
    searchParamsKey,
    setSelectedTicketId,
    clampInt,
  ]);
}
