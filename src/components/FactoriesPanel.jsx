import React, { useRef, useState } from 'react';
import { formatAmount, formatPerSecond } from '../utils/formatNumber';

const ASHKAR_FACTORY_BACKGROUNDS = {
  ASHKAR_F1: '/Assets/ASHKAR/Mine_scories.png',
  ASHKAR_F2: '/Assets/ASHKAR/Four_basalte.png',
  ASHKAR_F3: '/Assets/ASHKAR/Foreuse_magma.png',
  ASHKAR_F4: '/Assets/ASHKAR/Fonderie_cendres.png',
  ASHKAR_F5: '/Assets/ASHKAR/Extracteur_obsidienne.png',
  ASHKAR_F6: '/Assets/ASHKAR/Pyro_Forge.png',
  ASHKAR_F7: '/Assets/ASHKAR/Coeur_Volcanique.png',
};

// Mapping nom d'usine (normalisé) -> image dans public/Assets/AQUERUS
const AQUERUS_FACTORY_BACKGROUNDS_BY_NAME = {
  'foreuse marine': '/Assets/AQUERUS/Foreuse_marine.png',
  'distillateur noir': '/Assets/AQUERUS/Distillateur_noir.png',
  'puit profond': '/Assets/AQUERUS/Puit_profond.png',
  'puits profond': '/Assets/AQUERUS/Puit_profond.png',
  'extracteur du gouffre': '/Assets/AQUERUS/Extracteur_du_gouffre.png',
  'forge abyssale': '/Assets/AQUERUS/Forge_abyssale.png',
  'source abyssale': '/Assets/AQUERUS/Source_abyssale.png',
  'coeur abyssal': '/Assets/AQUERUS/Coeur_abyssal.png',
  'coeur de leviathan': '/Assets/AQUERUS/Coeur_de_leviathan.png',
  'coeur du leviathan': '/Assets/AQUERUS/Coeur_de_leviathan.png',
};

function normalizeFactoryName(name) {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[œ]/g, 'oe')
    .replace(/[æ]/g, 'ae')
    .replace(/[_-]+/g, ' ')
    .replace(/['’`]/g, '')
    .trim();
}

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
  const realmCostMultiplier = Number(factory.realm_cost_multiplier || 1);

  return baseCostWithLevel * costMultiplier * realmCostMultiplier;
}

export function computeFactoryCurrentProduction(factory, skills) {
  const level = Number(factory.level || 0);
  const baseProduction = Number(factory.base_production || 0);
  const factoryRealmId = factory.realm_id ?? factory.realmId ?? null;

  if (level <= 0 || baseProduction <= 0) return 0;

  let prodMultiplier = 1;
  let globalMultiplier = 1;

  (skills || []).forEach((skill) => {
    const skillLevel = Number(skill.level || 0);
    if (skillLevel <= 0) return;

    const skillRealmId = skill.realmId ?? skill.realm_id ?? null;
    if (
      skillRealmId !== null &&
      skillRealmId !== undefined &&
      factoryRealmId !== null &&
      factoryRealmId !== undefined &&
      Number(skillRealmId) !== Number(factoryRealmId)
    ) {
      return;
    }

    const value = Number(
      skill.effectValue ?? skill.effect_value ?? 0
    );
    const totalEffect = value * skillLevel;

    const effectType = skill.effectType ?? skill.effect_type;

    if (effectType === 'PROD_MULTIPLIER') {
      prodMultiplier += totalEffect;
    } else if (effectType === 'GLOBAL_MULTIPLIER') {
      globalMultiplier += totalEffect;
    }
  });

  const baseProdWithLevel = baseProduction * Math.pow(1.12, level - 1);

  // Bonus de paliers :
  // - tous les 50 niveaux  : x2
  // - tous les 100 niveaux : x3 (en plus)
  // - tous les 250 niveaux : x5 (en plus)
  const milestones50 = Math.floor(level / 50);   // 50, 100, 150, 200, ...
  const milestones100 = Math.floor(level / 100); // 100, 200, 300, ...
  const milestones250 = Math.floor(level / 250); // 250, 500, ...

  const milestoneBonusMultiplier =
    Math.pow(2, milestones50) *
    Math.pow(3, milestones100) *
    Math.pow(5, milestones250);


  const realmProductionMultiplier = Number(
    factory.realm_production_multiplier || 1
  );

  return (
    baseProdWithLevel *
    prodMultiplier *
    globalMultiplier *
    realmProductionMultiplier *
    milestoneBonusMultiplier
  );
}


function FactoriesPanel({
  factories,
  resources,
  skills,
  upgradingFactoryId,
  onUpgradeFactory,
}) {
  if (!factories) return null;

  // Mode d'achat : 1, 10, 100, ou 'MAX'
  const [upgradeMode, setUpgradeMode] = useState(1);

  // Timers pour le "clic maintenu" par usine
  const holdTimersRef = useRef({});

  const startHoldUpgrade = (factoryId, canAfford) => {
    if (!factoryId || !canAfford) return;

    // Si un timer existe déjà, on ne refait rien
    if (holdTimersRef.current[factoryId]) return;

    // Après 500ms de clic maintenu, on commence à spammer (x1)
    const timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        onUpgradeFactory(factoryId); // times par défaut = 1
      }, 300); // vitesse : 1 upgrade / 300ms

      holdTimersRef.current[factoryId] = {
        timeoutId: null,
        intervalId,
      };
    }, 500); // délai avant de démarrer le spam

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

  // Calcule combien de niveaux on peut payer avec le mode courant
  const computeAffordableUpgrades = (factory, factoryResource) => {
    const available = Number(factoryResource?.amount || 0);
    if (!Number.isFinite(available) || available <= 0) return 0;

    const target =
      upgradeMode === 'MAX'
        ? Number.MAX_SAFE_INTEGER
        : Number(upgradeMode || 1);

    let remaining = available;
    let level = Number(factory.level || 0);
    let count = 0;

    while (count < target) {
      const simulatedFactory = { ...factory, level };
      const cost = computeFactoryNextCost(simulatedFactory, skills);
      if (!Number.isFinite(cost) || cost <= 0 || remaining < cost) break;
      remaining -= cost;
      level += 1;
      count += 1;
    }

    return count;
  };

  // Ne montrer qu'une seule usine verrouillée à la fois :
  // la prochaine dans l'ordre, plus toutes les usines déjà débloquées.
  const sortedFactories = [...factories].sort(
    (a, b) => Number(a.unlock_order) - Number(b.unlock_order)
  );

  const nextLockedFactory = sortedFactories.find(
    (f) => Number(f.level || 0) <= 0
  );

  const visibleFactories = sortedFactories.filter((f) => {
    const isUnlocked = Number(f.level || 0) > 0;
    if (isUnlocked) return true;
    if (!nextLockedFactory) return false;
    return Number(f.factory_id) === Number(nextLockedFactory.factory_id);
  });

  return (
    <section className="bg-black/40 backdrop-blur-sm border border-sky-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(56,189,248,0.12)]">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
        <span className="inline-block h-1 w-6 bg-sky-400 rounded-full" />
        Usines
        <span
          className="ml-2 text-[10px] sm:text-xs text-slate-400 cursor-help"
          title="Tous les 50 niveaux, la production est multipliée par 2, et tous les 200 niveaux le palier applique un bonus x10."
        >
          ?
        </span>
      </h2>

      {/* Barre de sélection X1 / X10 / X100 / MAX */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
        <span className="text-slate-300 mr-1">Mode d&apos;amélioration :</span>
        {[
          { label: 'x1', value: 1 },
          { label: 'x10', value: 10 },
          { label: 'x100', value: 100 },
          { label: 'MAX', value: 'MAX' },
        ].map((opt) => {
          const active = upgradeMode === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => setUpgradeMode(opt.value)}
              className={`px-2 py-1 rounded-full border transition-colors ${active
                ? 'bg-sky-500 text-slate-900 border-sky-400'
                : 'bg-slate-900/60 text-slate-100 border-slate-600 hover:bg-slate-800'
                }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2 text-xs sm:text-sm">
        {visibleFactories.map((f) => {
          const level = Number(f.level || 0);
          const isUnlocked = level > 0;

          const factoryResource = resources.find(
            (r) => r.resource_id === f.resource_id
          );
          const nextCost = computeFactoryNextCost(f, skills);

          const affordableCount = computeAffordableUpgrades(f, factoryResource);
          const canAfford = affordableCount > 0;

          // Coût total pour les niveaux qu'on va effectivement acheter
          const totalCostForAffordable = (() => {
            if (!isUnlocked || !canAfford || affordableCount <= 1) {
              return nextCost;
            }
            let sum = 0;
            let currentLevel = level;
            for (let i = 0; i < affordableCount; i += 1) {
              const simulatedFactory = { ...f, level: currentLevel };
              const cost = computeFactoryNextCost(simulatedFactory, skills);
              if (!Number.isFinite(cost) || cost <= 0) break;
              sum += cost;
              currentLevel += 1;
            }
            return sum || nextCost;
          })();

          const currentProduction = computeFactoryCurrentProduction(f, skills);

          let background = ASHKAR_FACTORY_BACKGROUNDS[f.code];

          // Fallback : si le code exact ne matche pas,
          // on gère les variantes qui contiennent "PYRO"
          if (!background && f.code) {
            const upperCode = String(f.code).toUpperCase();
            if (upperCode.includes('PYRO')) {
              background = '/Assets/ASHKAR/Pyro_Forge.png';
            }
          }

          // Fallback Aquerus par nom (les fichiers portent le nom BDD)
          if (!background && f.name) {
            const normalized = normalizeFactoryName(f.name);
            background = AQUERUS_FACTORY_BACKGROUNDS_BY_NAME[normalized];
          }

          const itemStyle = background
            ? {
              backgroundImage: `url('${background}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
            : undefined;

          const isUpgrading = upgradingFactoryId === f.factory_id;

          let buttonLabel;
          if (isUpgrading) {
            buttonLabel = 'Amélioration...';
          } else if (!isUnlocked && canAfford) {
            buttonLabel = 'Débloquer';
          } else if (canAfford) {
            if (isUnlocked && affordableCount > 1) {
              buttonLabel = `Améliorer x${affordableCount}`;
            } else {
              buttonLabel = 'Améliorer';
            }
          } else {
            buttonLabel = 'Ressources insuffisantes';
          }

          return (
            <li
              key={f.factory_id}
              className="factory-gradient relative bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-700/40"
              style={itemStyle}
            >
              {/* Overlay cadenas pour les usines non débloquées */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-5xl sm:text-6xl text-slate-200/80 drop-shadow-lg">
                    🔒
                  </span>
                </div>
              )}

              {/* Contenu assombri quand non débloqué */}
              <div className={!isUnlocked ? 'opacity-40' : ''}>
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
                    {formatPerSecond(currentProduction, 2)}
                  </span>
                </p>

                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                  Coût prochain niveau :{' '}
                  <span
                    className={`font-mono ${canAfford ? 'text-emerald-300' : 'text-red-400'
                      }`}
                  >
                    {formatAmount(Math.round(nextCost))}
                  </span>{' '}
                  {factoryResource?.name && (
                    <span className="text-slate-500">
                      ({factoryResource.name})
                    </span>
                  )}
                </p>

                {isUnlocked && affordableCount > 1 && (
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                    Coût total (x{affordableCount}) :{' '}
                    <span
                      className={`font-mono ${canAfford ? 'text-emerald-300' : 'text-red-400'
                        }`}
                    >
                      {formatAmount(Math.round(totalCostForAffordable))}
                    </span>
                  </p>
                )}
              </div>

              {/* Bouton en dehors de l'opacité pour rester bien visible */}
              <button
                type="button"
                onClick={() => {
                  if (!canAfford) return;
                  // Déblocage = 1 niveau, sinon on utilise le nombre calculé
                  const count = isUnlocked ? affordableCount || 1 : 1;
                  onUpgradeFactory(f.factory_id, count);
                }}
                onMouseDown={() => startHoldUpgrade(f.factory_id, canAfford)}
                onMouseUp={() => stopHoldUpgrade(f.factory_id)}
                onMouseLeave={() => stopHoldUpgrade(f.factory_id)}

                disabled={isUpgrading || !canAfford}
                className="mt-2 inline-flex items-center rounded-md bg-sky-500/90 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
              >
                {buttonLabel}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default FactoriesPanel;





