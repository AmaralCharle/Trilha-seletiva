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

/**
 * Velocidade com acréscimo percentual composto a cada nível, arredondada para baixo
 * (95 px/s com +15% → 95, 109, 125, 144). O nível é limitado a >= 1.
 */
export function percentSpeed(base, percent, level = 1) {
  const number = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  // A tolerância evita que 95 × 1,15 (109,2499…) ou valores exatos caiam um inteiro abaixo.
  return Math.floor(base * (1 + percent / 100) ** (number - 1) + 1e-9);
}

/** Desafio 2 (Normal): 5 lixeiras e os 27 resíduos desde o Nível 1; esteira +15% por nível. */
const CHALLENGE_2_SPEED = Object.freeze({ base: 95, percentPerLevel: 15 });
const CHALLENGE_2_INTERVALS = Object.freeze([2.2, 2.0, 1.8, 1.6]);
const CHALLENGE_2 = Object.freeze({
  id: 2,
  title: 'Desafio 2',
  subtitle: 'Normal',
  description: 'Todas as lixeiras e os 27 resíduos desde o início; a esteira fica 15% mais rápida a cada nível.',
  bins: ALL_BINS,
  targetLevel: 4,
  targetScore: 500,
  next: 3,
  speed: CHALLENGE_2_SPEED,
  levels: Object.freeze(CHALLENGE_2_INTERVALS.map((interval, index) => Object.freeze({
    speed: percentSpeed(CHALLENGE_2_SPEED.base, CHALLENGE_2_SPEED.percentPerLevel, index + 1),
    interval,
    categories: ALL_BINS,
    trickyFraction: 0.3,
    prepFraction: 0.25,
  }))),
});

/**
 * Desafio 3 (Avançado — final): esteira dupla cruzada, os 27 resíduos desde o Nível 1 e lixeiras
 * liberadas uma a uma (Papel → Plástico → Vidro → Metal → Rejeito). Resíduos cuja lixeira ainda não
 * entrou na cena devem passar pela esteira sem penalidade. `inactiveShare` é a fração dos itens
 * sorteados que pertencem a lixeiras ainda ausentes (limitada a 50% para não arrastar o ritmo).
 */
const CHALLENGE_3_SPEEDS = Object.freeze([125, 130, 135, 140, 145]);
const CHALLENGE_3_INTERVALS = Object.freeze([1.9, 1.8, 1.7, 1.6, 1.5]);
const CHALLENGE_3_TRICKY = Object.freeze([0.3, 0.3, 0.35, 0.35, 0.4]);
const CHALLENGE_3_PREP = Object.freeze([0.2, 0.25, 0.25, 0.3, 0.3]);
const CHALLENGE_3 = Object.freeze({
  id: 3,
  title: 'Desafio 3',
  subtitle: 'Avançado',
  description: 'Duas esteiras cruzadas e os 27 resíduos desde o início; as lixeiras entram uma a uma a cada nível.',
  bins: ALL_BINS,
  targetLevel: 5,
  targetScore: 650,
  next: null,
  final: true,
  dualBelt: true,
  levels: Object.freeze(CHALLENGE_3_SPEEDS.map((speed, index) => {
    const bins = Object.freeze(ALL_BINS.slice(0, index + 1));
    return Object.freeze({
      speed,
      interval: CHALLENGE_3_INTERVALS[index],
      categories: ALL_BINS,
      bins,
      inactiveShare: Math.min(0.5, (ALL_BINS.length - bins.length) / ALL_BINS.length),
      trickyFraction: CHALLENGE_3_TRICKY[index],
      prepFraction: CHALLENGE_3_PREP[index],
    });
  })),
});

/** Registro dos desafios. */
export const CHALLENGES = Object.freeze({ 1: CHALLENGE_1, 2: CHALLENGE_2, 3: CHALLENGE_3 });

export function getChallenge(id) {
  return CHALLENGES[id] ?? null;
}

/** Dificuldade de um nível do desafio, limitada ao intervalo 1..último nível. */
export function getChallengeLevel(challenge, level = 1) {
  const total = challenge.levels.length;
  const number = Number.isFinite(level) ? Math.min(total, Math.max(1, Math.floor(level))) : 1;
  const step = challenge.levels[number - 1];
  const previous = challenge.levels[number - 2];
  return {
    wave: number,
    level: number,
    name: `Nível ${number}${number === total ? ' (final)' : ''}`,
    speed: step.speed,
    /** Aumento de velocidade em relação ao nível anterior, em % inteiro (0 no Nível 1). */
    speedBoost: previous ? Math.round((step.speed / previous.speed - 1) * 100) : 0,
    interval: step.interval,
    categories: [...step.categories],
    bins: [...(step.bins ?? challenge.bins)],
    inactiveShare: step.inactiveShare ?? 0,
    trickyFraction: step.trickyFraction,
    prepFraction: step.prepFraction,
    maxActive: CHALLENGE_RULES.maxActive,
    minSpacing: CHALLENGE_RULES.minSpacing,
  };
}
