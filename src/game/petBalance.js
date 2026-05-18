/**
 * Economia e balanceamento do pet — fonte única de verdade.
 *
 * Ciclo típico (1 pomodoro + pausa): ~-4 energia, ~-3 fome | +17 moedas, +100 XP
 * Loja: ~1 item a cada 1–2 sessões se o pet precisar de cuidados.
 */

export const STATUS_MAX = 100;

// Decaimento offline (máx. 12h contabilizadas por login)
export const IDLE_DECAY_CAP_HOURS = 12;
export const IDLE_ENERGY_PER_HOUR = 1.5;
export const IDLE_HUNGER_PER_HOUR = 2;

// Custo de uma sessão de foco (25 min) — energia cai mais que fome
export const FOCUS_ENERGY_COST = 8;
export const FOCUS_HUNGER_COST = 5;

// Recuperação ao concluir pausa (5 min)
export const BREAK_ENERGY_RESTORE = 4;
export const BREAK_HUNGER_RESTORE = 2;

// Recompensas
export const REWARD_COINS_FOCUS = 15;
export const REWARD_XP_FOCUS = 80;
export const REWARD_COINS_BREAK = 2;
export const REWARD_XP_BREAK = 20;

export const XP_PER_LEVEL = 250;
export const MAX_LEVEL = 20;

export const SHOP_CATALOG = [
  {
    id: 'marmita',
    name: 'Marmita Caseira',
    price: 25,
    restore: 25,
    type: 'hunger',
    desc: '+25 Fome',
  },
  {
    id: 'energetico',
    name: 'Energético Monster',
    price: 15,
    restore: 15,
    type: 'energy',
    desc: '+15 Energia',
  },
];

export function clampStatus(value) {
  return Math.max(0, Math.min(STATUS_MAX, Math.round(value)));
}

export function applyIdleDecay(energy, hunger, hoursPassed) {
  const hours = Math.min(Math.max(0, hoursPassed), IDLE_DECAY_CAP_HOURS);
  return {
    energy: clampStatus((energy ?? STATUS_MAX) - hours * IDLE_ENERGY_PER_HOUR),
    hunger: clampStatus((hunger ?? STATUS_MAX) - hours * IDLE_HUNGER_PER_HOUR),
  };
}

export function applyFocusSession(energy, hunger) {
  return {
    energy: clampStatus((energy ?? STATUS_MAX) - FOCUS_ENERGY_COST),
    hunger: clampStatus((hunger ?? STATUS_MAX) - FOCUS_HUNGER_COST),
  };
}

export function applyBreakRecovery(energy, hunger) {
  return {
    energy: clampStatus((energy ?? STATUS_MAX) + BREAK_ENERGY_RESTORE),
    hunger: clampStatus((hunger ?? STATUS_MAX) + BREAK_HUNGER_RESTORE),
  };
}

export function getLevelFromXp(xp = 0) {
  const xpSafe = Math.max(0, xp);
  const nivel = Math.min(MAX_LEVEL, 1 + Math.floor(xpSafe / XP_PER_LEVEL));
  let evolution = 'Ovo';
  if (nivel >= 12) evolution = 'Lendário';
  else if (nivel >= 7) evolution = 'Adulto';
  else if (nivel >= 4) evolution = 'Jovem';
  else if (nivel >= 2) evolution = 'Filhote';
  return { nivel, evolution, xp: xpSafe };
}

/** Compara XP antes/depois de uma recompensa para detetar subida de nível. */
export function didLevelUp(xpBefore, xpAfter) {
  return getLevelFromXp(xpAfter).nivel > getLevelFromXp(xpBefore).nivel;
}
