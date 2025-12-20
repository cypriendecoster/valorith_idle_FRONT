export function applyOptimisticRowUpdate({
  type,
  id,
  nextRow,
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
}
