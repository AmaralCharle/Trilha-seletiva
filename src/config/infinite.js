export const INFINITE_CONFIG = Object.freeze({
  lives: 3,
  waveSize: 10,
  maxActive: 6,
  minSpacing: 150,
  maxSpeed: 240,
  minInterval: 1.1,
  categories: Object.freeze(['paper', 'plastic', 'glass', 'metal', 'reject']),
});

const STEPS = Object.freeze([
  [85, 2.5], [95, 2.3], [110, 2.1], [125, 1.9], [140, 1.7],
  [155, 1.5], [170, 1.4], [185, 1.3], [200, 1.2], [210, 1.1],
]);

export function waveName(wave) {
  if (wave >= 10) return 'Lenda da Reciclagem';
  if (wave >= 7) return 'Mestre da Triagem';
  if (wave >= 5) return 'Especialista';
  if (wave >= 3) return 'Operador';
  return 'Iniciante';
}

/** Bounded arcade progression; preparation and confusing materials enter gradually. */
export function getDifficulty(wave = 1) {
  const number = Number.isFinite(wave) ? Math.max(1, Math.floor(wave)) : 1;
  const [baseSpeed, interval] = STEPS[Math.min(number, 10) - 1];
  return {
    wave: number,
    name: waveName(number),
    speed: Math.min(INFINITE_CONFIG.maxSpeed, baseSpeed + Math.max(0, number - 10) * 5),
    interval: Math.max(INFINITE_CONFIG.minInterval, interval),
    trickyFraction: Math.min(0.5, Math.max(0, number - 2) * 0.065),
    prepFraction: Math.min(0.3, Math.max(0, number - 3) * 0.04),
    maxActive: INFINITE_CONFIG.maxActive,
    minSpacing: INFINITE_CONFIG.minSpacing,
  };
}

/* ───────────── Modo Desafios ───────────── */

/** Regras compartilhadas pelos 3 desafios (vidas, avanço de nível e pontuação vêm do arcade). */
export const CHALLENGE_RULES = Object.freeze({
  lives: INFINITE_CONFIG.lives,
  correctPerLevel: 10,
  maxActive: INFINITE_CONFIG.maxActive,
  minSpacing: INFINITE_CONFIG.minSpacing,
});

const ALL_BINS = INFINITE_CONFIG.categories;

/** Desafio 1 (Iniciante): 5 lixeiras sempre visíveis; os materiais entram nível a nível. */
const CHALLENGE_1 = Object.freeze({
  id: 1,
  title: 'Desafio 1',
  subtitle: 'Iniciante',
  description: 'As 5 lixeiras ficam na tela desde o início; um novo material entra na esteira a cada nível.',
  bins: ALL_BINS,
  targetLevel: 4,
  targetScore: 350,
  next: 2,
  levels: Object.freeze([
    Object.freeze({ speed: 80, interval: 2.5, categories: Object.freeze(['paper', 'plastic']), trickyFraction: 0, prepFraction: 0 }),
    Object.freeze({ speed: 85, interval: 2.4, categories: Object.freeze(['paper', 'plastic', 'glass']), trickyFraction: 0, prepFraction: 0 }),
    Object.freeze({ speed: 90, interval: 2.3, categories: Object.freeze(['paper', 'plastic', 'glass', 'metal']), trickyFraction: 0.2, prepFraction: 0.1 }),
    Object.freeze({ speed: 95, interval: 2.2, categories: ALL_BINS, trickyFraction: 0.25, prepFraction: 0.15 }),
  ]),
});

/** Registro dos desafios. Desafios 2 e 3 entram aqui com o mesmo formato. */
export const CHALLENGES = Object.freeze({ 1: CHALLENGE_1 });

export function getChallenge(id) {
  return CHALLENGES[id] ?? null;
}

/** Dificuldade de um nível do desafio, limitada ao intervalo 1..último nível. */
export function getChallengeLevel(challenge, level = 1) {
  const total = challenge.levels.length;
  const number = Number.isFinite(level) ? Math.min(total, Math.max(1, Math.floor(level))) : 1;
  const step = challenge.levels[number - 1];
  return {
    wave: number,
    level: number,
    name: `Nível ${number}${number === total ? ' (final)' : ''}`,
    speed: step.speed,
    interval: step.interval,
    categories: [...step.categories],
    bins: [...(step.bins ?? challenge.bins)],
    trickyFraction: step.trickyFraction,
    prepFraction: step.prepFraction,
    maxActive: CHALLENGE_RULES.maxActive,
    minSpacing: CHALLENGE_RULES.minSpacing,
  };
}
