import React from 'react';
import { formatAmount } from '../utils/formatNumber';

// Mapping nom de compétence (normalisé) -> image dans public/Assets/ASHKAR
const SKILL_BACKGROUNDS = {
  'souffle des forges': '/Assets/ASHKAR/Souffle_des_forges.png',
  'optimisation des fours': '/Assets/ASHKAR/Optimisation_des_fours.png',
  'brasiers persistants': '/Assets/ASHKAR/Brasiers_persistants.png',
  'maitrise pyroclastique': '/Assets/ASHKAR/Maitre_pyroclastique.png',
  'coeur dashkar': '/Assets/ASHKAR/Coeur_ashkar.png',

  // AQUERUS
  'coeur abyssal': '/Assets/AQUERUS/Coeur_abyssal.png',
  'coeur des abysses': '/Assets/AQUERUS/Coeur_abyssal.png',
  'coeur des abymes': '/Assets/AQUERUS/Coeur_abyssal.png',
  'coeur de leviathan': '/Assets/AQUERUS/Coeur_de_leviathan.png',
  'courants profonds': '/Assets/AQUERUS/Courants_profonds.png',
  'flux persistant': '/Assets/AQUERUS/Flux_persistant.png',
  'pression optimale': '/Assets/AQUERUS/Pression_optimale.png',
  'saturation abyssale': '/Assets/AQUERUS/Saturation_abyssale.png',
  'source abyssale': '/Assets/AQUERUS/Source_abyssale.png',
};

function normalizeSkillName(name) {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[œ]/g, 'oe')
    .replace(/[æ]/g, 'ae')
    .replace(/['’`]/g, '')
    .trim();
}

function SkillsPanel({ skills, upgradingSkillId, onUpgradeSkill }) {
  if (!skills) return null;

  return (
    <section className="bg-black/40 backdrop-blur-sm border border-violet-500/20 rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(139,92,246,0.18)]">
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

          const normalizedName = normalizeSkillName(skill.name);
          let bg = SKILL_BACKGROUNDS[normalizedName];
          if (!bg && normalizedName.includes('ashkar')) {
            bg = '/Assets/ASHKAR/Coeur_ashkar.png';
          }

          const itemStyle = bg
            ? {
              backgroundImage: `url('${bg}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
            : undefined;

          const isUpgrading = upgradingSkillId === skill.skillId;

          return (
            <li
              key={skill.skillId}
              className="relative rounded-lg border px-3 py-2 bg-slate-900/60 border-slate-700/40 flex flex-col"
              style={itemStyle}
            >
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-5xl sm:text-6xl text-slate-200/80 drop-shadow-lg">
                    🔒
                  </span>
                </div>
              )}

              <div className={`${isLocked ? 'opacity-40' : ''} relative flex flex-col h-full`}>
                {/* Titre + niveau */}
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-amber-50 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
                    {skill.name}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-amber-100 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
                    Niveau{' '}
                    <span className="font-semibold text-violet-200">
                      {level}/{maxLevel}
                    </span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-amber-100 mb-2 drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">
                  {skill.description}
                </p>

                {/* Coût ou niveau max */}
                {isMax ? (
                  <p className="text-[11px] text-emerald-300 mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">
                    Niveau maximal atteint
                  </p>
                ) : (
                  <>
                    <p className="text-[11px] text-amber-50 mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">
                      Coût du prochain niveau :
                    </p>
                    <p className="text-[11px] text-amber-200 font-mono drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">
                      {formatAmount(Math.round(nextCost))}
                    </p>
                  </>
                )}
              </div>

              {/* Bouton, toujours en bas de la carte */}
              <button
  type="button"
  onClick={() => onUpgradeSkill(skill.skillId)}
  disabled={isLocked || isMax || isUpgrading}
  className="mt-2 inline-flex self-start items-center rounded-md bg-violet-500/90 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-[11px] sm:text-xs font-semibold px-3 py-1 transition-colors"
>
  {isLocked
    ? 'Royaume non débloqué'
    : isMax
    ? 'Niveau max'
    : isUpgrading
    ? 'Amélioration...'
    : 'Améliorer'}
</button>

            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default SkillsPanel;



