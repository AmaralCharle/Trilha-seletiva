/** Desbloqueios e recordes do Modo Desafios. Chave própria: não toca campanha nem ranking infinito. */
export const CHALLENGE_PROGRESS_KEY = 'trilha-seletiva-desafios-v1';
const MAX_CHALLENGE = 3;

const fresh = () => ({ version: 1, unlocked: [1], best: {} });
const validId = id => Number.isInteger(id) && id >= 1 && id <= MAX_CHALLENGE;
const validScore = score => Number.isSafeInteger(score) && score >= 0;

let fallback = fresh();
let notice = '';
let memoryOnly = false;

function sanitize(raw) {
  if (!raw || raw.version !== 1 || !Array.isArray(raw.unlocked)) throw new Error('invalid save');
  const unlocked = [...new Set([1, ...raw.unlocked.filter(validId)])].sort((a, b) => a - b);
  const best = Object.fromEntries(
    Object.entries(raw.best ?? {}).filter(([id, score]) => validId(Number(id)) && validScore(score)),
  );
  return { version: 1, unlocked, best };
}

const snapshot = progress => ({ ...progress, unlocked: [...progress.unlocked], best: { ...progress.best }, notice });

export function loadChallengeProgress() {
  if (memoryOnly) return snapshot(fallback);
  try {
    const raw = globalThis.localStorage.getItem(CHALLENGE_PROGRESS_KEY);
    fallback = raw ? sanitize(JSON.parse(raw)) : fresh();
  } catch {
    memoryOnly = true;
    notice = 'O navegador não permitiu ler o progresso dos desafios. Esta sessão continua na memória.';
  }
  return snapshot(fallback);
}

function persist(progress) {
  fallback = { version: 1, unlocked: [...progress.unlocked], best: { ...progress.best } };
  if (!memoryOnly) {
    try { globalThis.localStorage.setItem(CHALLENGE_PROGRESS_KEY, JSON.stringify(fallback)); }
    catch { memoryOnly = true; notice = 'O progresso dos desafios está salvo apenas nesta sessão.'; }
  }
  return snapshot(fallback);
}

export function isChallengeUnlocked(id, progress = loadChallengeProgress()) {
  return progress.unlocked.includes(id);
}

export function unlockChallenge(id) {
  const progress = loadChallengeProgress();
  if (!validId(id) || progress.unlocked.includes(id)) return progress;
  return persist({ ...progress, unlocked: [...progress.unlocked, id].sort((a, b) => a - b) });
}

export function saveChallengeScore(id, score) {
  const progress = loadChallengeProgress();
  if (!validId(id) || !validScore(score) || score <= (progress.best[id] ?? 0)) return progress;
  return persist({ ...progress, best: { ...progress.best, [id]: score } });
}

/** Vitória de um desafio: libera o próximo (quando houver) e guarda o recorde, num único passo. */
export function registerChallengeVictory(challenge, score) {
  if (challenge?.next) unlockChallenge(challenge.next);
  return saveChallengeScore(challenge?.id, score);
}

export function resetChallengeProgress() {
  notice = '';
  memoryOnly = false;
  return persist(fresh());
}
