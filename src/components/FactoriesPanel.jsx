import React, { useRef } from 'react';

const ASHKAR_FACTORY_BACKGROUNDS = {
  MINE_SCORIES: "/Assets/ASHKAR/Mine_scories.png",
  FOUR_BASALTE: "/Assets/ASHKAR/Four_basalte.png",
  FONDERIE_CENDRES: "/Assets/ASHKAR/Fonderie_cendres.png",
  FOREUSE_MAGMA: "/Assets/ASHKAR/Foreuse_magma.png",
  EXTRACTEUR_OBSIDIENNE: "/Assets/ASHKAR/Extracteur_obsidienne.png",
  COEUR_VOLCANIQUE: "/Assets/ASHKAR/Coeur_Volcanique.png",
  PYRO_FORGE: "/Assets/ASHKAR/Pyro_Forge.png",
};

function computeFactoryNextCost(factory, skills) {
  const baseCost = Number(factory.base_cost || 0);
  const nextLevel = Number(factory.level || 0) + 1;

  let costMultiplier = 1;

  const costSkills =
    (skills || []).filter(
      (s) =>
        s.effectType === 'COST_REDUCTION' &&
        (s.realmId === null ||
          s.realmId === undefined ||
          Number(s.realmId) === Number(factory.realm_id))
    );

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

function computeFactoryCurrentProduction(factory, skills) {
  const level = Number(factory.level || 0);
  const baseProduction = Number(factory.base_production || 0);

  if (level <= 0 || baseProduction <= 0) return 0;

  let prodMultiplier = 1;
  let globalMultiplier = 1;

  (skills || []).forEach((skill) => {
    const skillLevel = Number(skill.level || 0);
    if (skillLevel <= 0) return;

    const value = Number(skill.effectValue || 0);
    const totalEffect = value * skillLevel;

    if (skill.effectType === 'PROD_MULTIPLIER') {
      prodMultiplier += totalEffect;
    } else if (skill.effectType === 'GLOBAL_MULTIPLIER') {
      globalMultiplier += totalEffect;
    }
    // IMPORTANT : on ne met plus IDLE_BONUS ici
  });

  const baseProdWithLevel = baseProduction * Math.pow(1.15, level - 1);
  return baseProdWithLevel * prodMultiplier * globalMultiplier;
}

function FactoriesPanel({
  factories,
  resources,
  skills,
  upgradingFactoryId,
  onUpgradeFactory,
}) {
  if (!factories) return null;

  // Timers pour le "clic maintenu" par usine
  const holdTimersRef = useRef({});

  const startHoldUpgrade = (factoryId, canAfford) => {
    if (!factoryId || !canAfford) return;

    // On améliore une fois immédiatement (en plus du onClick si tu le gardes)
    onUpgradeFactory(factoryId);

    // On évite de recréer un timer si déjà en cours
    if (holdTimersRef.current[factoryId]) return;

    // Petit délai avant de démarrer le spam (pour éviter les fautes de clic)
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        onUpgradeFactory(factoryId);
      }, 150); // vitesse de spam en ms

      holdTimersRef.current[factoryId] = {
        timeoutId: null,
        intervalId,
      };
    }, 300);

    holdTimersRef.current[factoryId] = {
      timeoutId,
      intervalId: null,
    };
  };

  const stopHoldUpgrade = (factoryId) => {
    const timers = holdTimersRef.current[factoryId];
    if (!timers) return;

    if (timers.timeoutId) {
      clearTimeout(timers.timeoutId);
    }
    if (timers.intervalId) {
      clearInterval(timers.intervalId);
    }

    delete holdTimersRef.current[factoryId];
  };

  return (
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

          const currentProduction = computeFactoryCurrentProduction(f, skills);

          let ashkarBackground = ASHKAR_FACTORY_BACKGROUNDS[f.code];

          // Fallback : si le code exact ne matche pas,
          // on gère les variantes qui contiennent "PYRO"
          if (!ashkarBackground && f.code) {
            const upperCode = String(f.code).toUpperCase();
            if (upperCode.includes('PYRO')) {
              ashkarBackground = "/Assets/ASHKAR/Pyro_Forge.png";
            }
          }

          const itemStyle = ashkarBackground
            ? {
                backgroundImage: `url('${ashkarBackground}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined;

          const isUpgrading = upgradingFactoryId === f.factory_id;

          return (
            <li
              key={f.factory_id}
              className="factory-gradient bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/40"
              style={itemStyle}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">{f.name}</span>
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
                  {Math.round(currentProduction).toLocaleString('fr-FR')}
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
                onClick={() => onUpgradeFactory(f.factory_id)}
                onMouseDown={() => startHoldUpgrade(f.factory_id, canAfford)}
                onMouseUp={() => stopHoldUpgrade(f.factory_id)}
                onMouseLeave={() => stopHoldUpgrade(f.factory_id)}
                // Optionnel pour mobile :
                // onTouchStart={() => startHoldUpgrade(f.factory_id, canAfford)}
                // onTouchEnd={() => stopHoldUpgrade(f.factory_id)}
                disabled={isUpgrading || !canAfford}
                className="mt-2 inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
              >
                {isUpgrading
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
  );
}

export default FactoriesPanel;




