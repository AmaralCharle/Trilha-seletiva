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
