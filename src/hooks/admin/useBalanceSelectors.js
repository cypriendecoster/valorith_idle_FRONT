import { useMemo } from 'react';
import { matchesSearch as matchesSearchUtil } from '../../utils/tableHelpers';

export default function useBalanceSelectors({
  activeTab,
  search,
  realms,
  resources,
  factories,
  skills,
  realmUnlockCosts,
}) {
  const matchesSearch = useMemo(
    () => (row) => matchesSearchUtil(row, search),
    [search]
  );

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
  }, [activeTab, realms, realmUnlockCosts, resources, factories, skills, matchesSearch]);

  return {
    matchesSearch,
    realmUnlockCostsByRealmId,
    sortedRealms,
    sortedResources,
    visibleRows,
  };
}
