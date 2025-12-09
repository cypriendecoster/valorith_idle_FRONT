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

  // Ne montrer qu'un seul royaume verrouillé à la fois :
  // le prochain dans l'ordre, plus tous les royaumes déjà débloqués (ou gratuits).
  const sortedRealms = [...realms].sort(
    (a, b) => Number(a.realm_id) - Number(b.realm_id)
  );

  const nextLockedRealm = sortedRealms.find(
    (r) => !r.is_unlocked && !r.is_default_unlocked
  );

  const visibleRealms = sortedRealms.filter((r) => {
    if (r.is_unlocked || r.is_default_unlocked) return true;
    if (!nextLockedRealm) return false;
    return Number(r.realm_id) === Number(nextLockedRealm.realm_id);
  });

  return (
    <section className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(251,191,36,0.12)]">
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

      <ul className="space-y-2 text-xs sm:text-sm">
        {visibleRealms.map((realm) => {
          const unlockCosts = realm.unlockCosts || [];
          const isUnlocked = Boolean(realm.is_unlocked);
          const isActive = Boolean(realm.is_active);
          const isDefault = Boolean(realm.is_default_unlocked);
          const needsCost = !isDefault && !isUnlocked && unlockCosts.length > 0;
          const isLocked = !isUnlocked && !isDefault;

          // Pour chaque coût, on cherche la ressource du joueur
          const costWithResource = unlockCosts.map((cost) => {
            const res = resources?.find(
              (r) => Number(r.resource_id) === Number(cost.resourceId)
            );
            const playerAmount = Number(res?.amount ?? 0);
            const canPay = playerAmount >= Number(cost.amount || 0);
            return { cost, res, playerAmount, canPay };
          });

          // On peut débloquer si toutes les ressources requises sont suffisantes
          const hasAllResources =
            !needsCost || costWithResource.every((c) => c.canPay);

          const canUnlock = isUnlocked || isDefault || hasAllResources;

          // Libellé du bouton de déblocage
          let unlockLabel = 'Débloquer';
          if (unlockingRealmCode === realm.code) {
            unlockLabel = 'Déblocage...';
          } else if (!canUnlock && needsCost) {
            unlockLabel = 'Ressources insuffisantes';
          }

          return (
            <li
              key={realm.realm_id}
              className={`factory-gradient relative px-3 py-2 rounded-lg border w-full
              ${
                isActive
                  ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                  : isUnlocked
                  ? 'border-slate-700/40 bg-slate-900/60'
                  : 'border-slate-800 bg-slate-950/80'
              }`}
            >
              {/* Overlay cadenas pour les royaumes non débloqués (hors défaut) */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-5xl sm:text-6xl text-slate-200/80 drop-shadow-lg">
                   🔒
                  </span>
                </div>
              )}

              {/* Contenu assombri quand verrouillé */}
              <div className={isLocked ? 'opacity-40' : ''}>
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
                  <div className="text-[10px] sm:text-[11px] mt-1 space-y-0.5">
                    <p>Requiert :</p>
                    {costWithResource.map(
                      ({ cost, res, playerAmount, canPay }) => (
                        <p key={cost.resourceId}>
                          <span
                            className={
                              canPay ? 'text-emerald-300' : 'text-red-400'
                            }
                          >
                            {Number(cost.amount || 0).toLocaleString('fr-FR')}{' '}
                            {res?.name ||
                              cost.resourceName ||
                              cost.resourceCode}
                          </span>{' '}
                          <span className="text-slate-500">
                            ({playerAmount.toLocaleString('fr-FR')} dispo)
                          </span>
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Boutons (en dehors de l'opacité pour rester lisibles) */}
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
                    {unlockLabel}
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RealmsPanel;






