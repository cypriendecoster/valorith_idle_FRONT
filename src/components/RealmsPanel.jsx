import React from 'react';

function RealmsPanel({
  realms,
  resources,
  unlockingRealmCode,
  activatingRealmId,
  onUnlockRealm,
  onActivateRealm,
}) {
  if (!realms) return null;

  // Royaume actif (ou par défaut)
  const activeRealm =
    realms?.find((r) => r.is_active) ||
    realms?.find((r) => r.is_default_unlocked) ||
    null;

  // Ressources connues
  const charcoal = resources?.find((r) => r.code === 'CHARBON_GUERRE');
  const essence = resources?.find((r) => r.code === 'ESSENCE_ABYSSALE');

  const charcoalAmount = Number(charcoal?.amount ?? 0);
  const essenceAmount = Number(essence?.amount ?? 0);

  // Si Aquerus est actif, on affiche Essence Abyssale, sinon Charbon
  const isAquerusActive = activeRealm?.code === 'AQUERUS';

  const mainResourceLabel = isAquerusActive
    ? 'Essence Abyssale'
    : 'Charbon de guerre';

  const mainResourceAmount = isAquerusActive
    ? essenceAmount
    : charcoalAmount;

  return (
    <section className="bg-black/30 border border-amber-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(251,191,36,0.12)]">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
        <span className="inline-block h-1 w-6 bg-amber-400 rounded-full" />
        Royaumes
      </h2>

      <p className="text-[11px] sm:text-xs text-slate-400 mb-3">
        {mainResourceLabel} :{' '}
        <span className="font-mono text-amber-300">
          {mainResourceAmount.toLocaleString('fr-FR')}
        </span>
      </p>

      <div className="flex flex-wrap gap-3">
        {realms.map((realm) => {
          const unlockCost = Number(realm.unlock_amount || 0);
          const isUnlocked = Boolean(realm.is_unlocked);
          const isActive = Boolean(realm.is_active);
          const isDefault = Boolean(realm.is_default_unlocked);
          const needsCost = !isDefault && !isUnlocked;

          // Le coût de déblocage reste en Charbon de guerre
          const canUnlock =
            isUnlocked || isDefault || charcoalAmount >= unlockCost;

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
                    onClick={() => onUnlockRealm(realm.code)}
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
                    onClick={() => onActivateRealm(realm.realm_id)}
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
  );
}

export default RealmsPanel;

