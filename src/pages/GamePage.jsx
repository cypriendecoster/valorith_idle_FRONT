import { useEffect, useState } from 'react';
import { playerService } from '../services/PlayerService';

const REFRESH_INTERVAL_MS = 10000; // 10s
const MAX_EVENTS = 20;

function computeFactoryNextCost(factory, skills) {
  const baseCost = Number(factory.base_cost || 0);
  const nextLevel = Number(factory.level || 0) + 1;

  let costMultiplier = 1;

  const costSkills =
    skills?.filter(
      (s) =>
        s.effectType === 'COST_REDUCTION' &&
        (s.realmId === null || s.realmId === undefined)
    ) || [];

  for (const skill of costSkills) {
    const level = Number(skill.level || 0);
    const value = Number(skill.effectValue || 0);
    costMultiplier += value * level;
  }

  if (costMultiplier < 0.1) {
    costMultiplier = 0.1;
  }

  const baseCostWithLevel = baseCost * Math.pow(1.18, nextLevel - 1);
  return baseCostWithLevel * costMultiplier;
}

function GamePage({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradingFactoryId, setUpgradingFactoryId] = useState(null);
  const [unlockingRealmCode, setUnlockingRealmCode] = useState(null);
  const [activatingRealmId, setActivatingRealmId] = useState(null);
  const [upgradingSkillId, setUpgradingSkillId] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const [events, setEvents] = useState([]);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    setError('');
    playerService
      .getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Erreur de chargement du profil');
      })
      .finally(() => setLoading(false));
  }, []);

  // Refresh idle toutes les X secondes
  useEffect(() => {
    const intervalId = setInterval(() => {
      playerService
        .getProfile()
        .then((res) => setProfile(res.data))
        .catch((err) => {
          console.error('Erreur refresh idle:', err);
        });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  // Auto-hide du toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const refreshProfile = async () => {
    const res = await playerService.getProfile();
    setProfile(res.data);
  };

  const pushEvent = (message) => {
    setEvents((prev) => {
      const next = [{ id: Date.now(), message }, ...prev];
      return next.slice(0, MAX_EVENTS);
    });
  };

  const showSuccess = (message) => {
    setToast({ type: 'success', message });
  };

  const showError = (message) => {
    setToast({ type: 'error', message });
  };

  const handleUpgradeFactory = async (factoryId) => {
    if (!factoryId) return;
    setUpgradingFactoryId(factoryId);

    try {
      const res = await playerService.upgradeFactory(factoryId);
      const data = res.data;
      await refreshProfile();
      showSuccess(data.message || 'Usine améliorée');
      pushEvent(
        `Usine #${factoryId} montée au niveau ${data.newLevel ?? '?'} (coût ${Math.round(
          data.cost ?? 0
        ).toLocaleString('fr-FR')}).`
      );
    } catch (err) {
      console.error(err);
      showError(
        err.response?.data?.message || "Erreur lors de l'amélioration de l'usine"
      );
    } finally {
      setUpgradingFactoryId(null);
    }
  };

  const handleUnlockRealm = async (realmCode) => {
    if (!realmCode) return;
    setUnlockingRealmCode(realmCode);

    try {
      const res = await playerService.unlockRealm(realmCode);
      const data = res.data;
      await refreshProfile();
      if (data.alreadyUnlocked) {
        showSuccess('Royaume déjà débloqué.');
        pushEvent(`Royaume ${realmCode} déjà débloqué.`);
      } else {
        showSuccess('Nouveau royaume débloqué !');
        pushEvent(`Royaume ${realmCode} vient d’être débloqué.`);
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Erreur lors du déblocage du royaume');
    } finally {
      setUnlockingRealmCode(null);
    }
  };

  const handleActivateRealm = async (realmId) => {
    if (!realmId) return;
    setActivatingRealmId(realmId);

    try {
      const res = await playerService.activateRealm(realmId);
      const data = res.data;
      await refreshProfile();
      showSuccess(data.message || 'Royaume activé');
      pushEvent(`Royaume #${realmId} activé.`);
    } catch (err) {
      console.error(err);
      showError(
        err.response?.data?.message || "Erreur lors de l’activation du royaume"
      );
    } finally {
      setActivatingRealmId(null);
    }
  };

  const handleUpgradeSkill = async (skillId) => {
    if (!skillId) return;
    setUpgradingSkillId(skillId);

    try {
      const res = await playerService.upgradeSkill(skillId);
      const data = res.data;
      await refreshProfile();
      showSuccess(data.message || 'Compétence améliorée');
      pushEvent(
        `Compétence #${skillId} montée au niveau ${data.newLevel ?? '?'} (coût ${Math.round(
          data.cost ?? 0
        ).toLocaleString('fr-FR')}).`
      );
    } catch (err) {
      console.error(err);
      showError(
        err.response?.data?.message ||
          "Erreur lors de l'amélioration de la compétence"
      );
    } finally {
      setUpgradingSkillId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-amber-100">
        <p className="text-xl animate-pulse">Chargement du forge-monde…</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-100">
        Profil introuvable.
      </div>
    );

  const { user, resources, factories, realms, stats, skills } = profile;
  const charcoal = resources.find((r) => r.code === 'CHARBON_GUERRE');
  const charcoalAmount = Number(charcoal?.amount || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-slate-100 relative">
      {/* TOAST */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-xs">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg text-sm break-words ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-slate-900'
                : 'bg-red-500 text-slate-900'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <header className="border-b border-amber-500/30 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">
              ASHKAR <span className="text-amber-400">FORGE</span> IDLE
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Forgeron : <span className="text-amber-300">{user.username}</span>
            </p>
          </div>

          <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-2 sm:gap-4">
            {stats && (
              <div className="flex gap-3 sm:gap-4 text-[11px] sm:text-xs md:text-sm text-slate-300">
                <div>
                  <p className="uppercase tracking-widest text-slate-500">
                    Niveau max usine
                  </p>
                  <p className="font-semibold text-amber-300">
                    {stats.max_factory_level_reached ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-slate-500">
                    Royaume max
                  </p>
                  <p className="font-semibold text-amber-300">
                    {stats.max_realm_unlocked ?? '-'}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-widest text-slate-500">
                    Sessions
                  </p>
                  <p className="font-semibold text-amber-300">
                    {stats.login_count ?? '-'}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="text-xs sm:text-sm px-3 py-1 rounded-md border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-colors self-end sm:self-auto"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Royaumes */}
        {realms && (
          <section className="bg-black/30 border border-amber-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(251,191,36,0.12)]">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block h-1 w-6 bg-amber-400 rounded-full" />
              Royaumes
            </h2>

            <p className="text-[11px] sm:text-xs text-slate-400 mb-3">
              Charbon de guerre :{' '}
              <span className="font-mono text-amber-300">
                {charcoalAmount.toLocaleString('fr-FR')}
              </span>
            </p>

            <div className="flex flex-wrap gap-3">
              {realms.map((realm) => {
                const unlockCost = Number(realm.unlock_amount || 0);
                const isUnlocked = Boolean(realm.is_unlocked);
                const isActive = Boolean(realm.is_active);
                const isDefault = Boolean(realm.is_default_unlocked);
                const needsCost = !isDefault && !isUnlocked;
                const canUnlock =
                  isUnlocked ||
                  isDefault ||
                  charcoalAmount >= unlockCost;

                return (
                  <div
                    key={realm.realm_id}
                    className={`px-3 py-2 rounded-lg border text-xs sm:text-sm w-full sm:w-auto
                    ${
                      isActive
                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                        : isUnlocked
                        ? 'border-slate-600 bg-slate-900/60'
                        : 'border-slate-800 bg-slate-950/80'
                    }`}
                  >
                    <p className="font-semibold flex items-center gap-1">
                      {realm.name}
                      {isActive && (
                        <span className="text-amber-300 text-[10px] sm:text-xs ml-1">
                          (Actif)
                        </span>
                      )}
                      {!isUnlocked && isDefault && (
                        <span className="text-emerald-300 text-[9px] sm:text-[10px] ml-1 uppercase tracking-widest">
                          Déblocage gratuit
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      {realm.description}
                    </p>

                    {!isUnlocked && needsCost && (
                      <p className="text-[10px] sm:text-[11px] mt-1">
                        Requiert{' '}
                        <span
                          className={
                            charcoalAmount >= unlockCost
                              ? 'text-emerald-300'
                              : 'text-red-400'
                          }
                        >
                          {unlockCost.toLocaleString('fr-FR')} Charbon de guerre
                        </span>
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {!isUnlocked && (
                        <button
                          type="button"
                          onClick={() => handleUnlockRealm(realm.code)}
                          disabled={
                            unlockingRealmCode === realm.code || !canUnlock
                          }
                          className="inline-flex items-center rounded-md bg-amber-500/90 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
                        >
                          {unlockingRealmCode === realm.code
                            ? 'Déblocage...'
                            : canUnlock
                            ? 'Débloquer'
                            : 'Charbon insuffisant'}
                        </button>
                      )}

                      {isUnlocked && !isActive && (
                        <button
                          type="button"
                          onClick={() => handleActivateRealm(realm.realm_id)}
                          disabled={activatingRealmId === realm.realm_id}
                          className="inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
                        >
                          {activatingRealmId === realm.realm_id
                            ? 'Activation...'
                            : 'Activer'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          {/* Ressources */}
          <section className="bg-black/30 border border-emerald-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block h-1 w-6 bg-emerald-400 rounded-full" />
              Ressources
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm">
              {resources.map((r) => (
                <li
                  key={r.resource_id}
                  className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/40"
                >
                  <span className="text-slate-200">{r.name}</span>
                  <span className="font-mono text-emerald-300">
                    {Number(r.amount).toLocaleString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Usines */}
          <section className="bg-black/30 border border-sky-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(56,189,248,0.12)]">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block h-1 w-6 bg-sky-400 rounded-full" />
              Usines
            </h2>

            <ul className="space-y-2 text-xs sm:text-sm">
              {factories.map((f) => {
                const factoryResource = resources.find(
                  (r) => r.resource_id === f.resource_id
                );
                const nextCost = computeFactoryNextCost(f, skills);
                const resourceAmount = Number(factoryResource?.amount || 0);
                const canAfford = resourceAmount >= nextCost;

                return (
                  <li
                    key={f.factory_id}
                    className="bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100">
                        {f.name}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400">
                        Niveau{' '}
                        <span className="font-semibold text-sky-300">
                          {f.level}
                        </span>
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                      Production actuelle :{' '}
                      <span className="text-sky-300 font-mono">
                        {Number(f.current_production || 0).toLocaleString(
                          'fr-FR'
                        )}
                      </span>
                    </p>

                    <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                      Coût prochain niveau :{' '}
                      <span
                        className={`font-mono ${
                          canAfford ? 'text-emerald-300' : 'text-red-400'
                        }`}
                      >
                        {Math.round(nextCost).toLocaleString('fr-FR')}
                      </span>{' '}
                      {factoryResource?.name && (
                        <span className="text-slate-500">
                          ({factoryResource.name})
                        </span>
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleUpgradeFactory(f.factory_id)}
                      disabled={upgradingFactoryId === f.factory_id || !canAfford}
                      className="mt-2 inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
                    >
                      {upgradingFactoryId === f.factory_id
                        ? 'Amélioration...'
                        : canAfford
                        ? 'Améliorer'
                        : 'Ressources insuffisantes'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Skills */}
        {skills && (
          <section className="bg-black/30 border border-violet-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(139,92,246,0.18)]">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block h-1 w-6 bg-violet-400 rounded-full" />
              Compétences
            </h2>

            <ul className="grid gap-3 sm:gap-4 md:grid-cols-2 text-[11px] sm:text-sm">
              {skills.map((skill) => {
                const level = Number(skill.level || 0);
                const maxLevel = Number(skill.maxLevel || skill.max_level || 0);
                const nextCost = skill.nextCost ?? skill.next_cost ?? null;
                const isLocked = Boolean(skill.isLocked);
                const isMax = level >= maxLevel || nextCost === null;

                return (
                  <li
                    key={skill.skillId}
                    className="rounded-lg border px-3 py-2 bg-slate-900/60 border-slate-700/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-100">
                        {skill.name}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400">
                        Niveau{' '}
                        <span className="font-semibold text-violet-300">
                          {level}/{maxLevel}
                        </span>
                      </span>
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-400 mb-1">
                      {skill.description}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Effet :{' '}
                      <span className="text-violet-300 font-mono">
                        {skill.effectType} {skill.effectValue}
                      </span>
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      {isMax ? (
                        <span className="text-emerald-300">
                          Niveau maximal atteint
                        </span>
                      ) : (
                        <>
                          Coût prochain niveau :{' '}
                          <span className="font-mono text-amber-300">
                            {Math.round(nextCost).toLocaleString('fr-FR')}
                          </span>
                        </>
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleUpgradeSkill(skill.skillId)}
                      disabled={isLocked || isMax || upgradingSkillId === skill.skillId}
                      className="mt-2 inline-flex items-center rounded-md bg-violet-500/90 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
                    >
                      {isLocked
                        ? 'Royaume non débloqué'
                        : isMax
                        ? 'Niveau max'
                        : upgradingSkillId === skill.skillId
                        ? 'Amélioration...'
                        : 'Améliorer'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Journal d'événements */}
        {events.length > 0 && (
          <section className="bg-black/30 border border-slate-700/60 rounded-xl p-3 sm:p-4 md:p-5">
            <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block h-1 w-6 bg-slate-400 rounded-full" />
              Chronique de la forge
            </h2>
            <ul className="text-[10px] sm:text-xs text-slate-300 space-y-1 max-h-40 overflow-y-auto">
              {events.map((e) => (
                <li key={e.id} className="font-mono">
                  {e.message}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default GamePage;


