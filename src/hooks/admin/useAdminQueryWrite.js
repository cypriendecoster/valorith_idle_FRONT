import { useEffect } from 'react';

export default function useAdminQueryWrite({
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
  lastSyncedParamsKeyRef,
  ignoreNextUrlSyncRef,
  normalizeText,
}) {
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
    normalizeText,
    lastSyncedParamsKeyRef,
    ignoreNextUrlSyncRef,
  ]);
}
