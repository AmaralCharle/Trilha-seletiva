export const LEADERBOARD_KEY = 'trilha-seletiva-infinite-v1';
const LIMIT = 10;
/** O Desafio Infinito e os desafios progressivos compartilham o ranking local. */
const RANKED_MODES = Object.freeze(['infinite', 'challenge']);
let fallback = [];
let notice = '';
let memoryOnly = false;
let sequence = 0;
const clone = value => JSON.parse(JSON.stringify(value));
const integer = value => Number.isSafeInteger(value) && value >= 0;
const positiveInteger = value => Number.isSafeInteger(value) && value >= 1;
const validChallengeId = value => positiveInteger(value) && value <= 3;

export function normalizeNickname(value) {
  const text = typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim() : '';
  return [...text].slice(0, 15).join('') || 'Jogador';
}

export function isNicknameTaken(nickname, entries = loadLeaderboard()) {
  return Boolean(findNicknameEntry(nickname, entries));
}

export function findNicknameEntry(nickname, entries = loadLeaderboard()) {
  return findNicknameProfile(nickname, entries).entry;
}

export function findNicknameProfile(nickname, entries = loadLeaderboard()) {
  const rankingEntries = Array.isArray(entries) ? entries : entries.entries;
  const normalized = normalizeNickname(nickname).toLowerCase();
  const matches = rankingEntries.filter(entry => normalizeNickname(entry.nickname).toLowerCase() === normalized);
  const challengeIds = matches.flatMap(entry => [entry.stoppedChallengeId, entry.highestChallengeId, entry.challengeId].filter(validChallengeId));
  return {
    entry: matches[0] ?? null,
    entries: matches,
    stoppedChallengeId: challengeIds.length ? Math.max(...challengeIds) : 1,
  };
}

function validEntry(value) {
  return value && typeof value.id === 'string' && value.id.length <= 100 &&
    typeof value.nickname === 'string' && value.nickname === normalizeNickname(value.nickname) &&
    (value.challengeId === undefined || validChallengeId(value.challengeId)) &&
    (value.stoppedChallengeId === undefined || validChallengeId(value.stoppedChallengeId)) &&
    (value.highestChallengeId === undefined || validChallengeId(value.highestChallengeId)) &&
    (value.level === undefined || positiveInteger(value.level)) &&
    (value.stoppedWave === undefined || positiveInteger(value.stoppedWave)) &&
    (value.stoppedLevel === undefined || positiveInteger(value.stoppedLevel)) &&
    integer(value.score) && Number.isSafeInteger(value.wave) && value.wave >= 1 &&
    integer(value.maxStreak) && integer(value.correct) && integer(value.wrong) && integer(value.missed) &&
    integer(value.total) && value.total > 0 && value.correct + value.wrong + value.missed === value.total &&
    value.maxStreak <= value.correct && Number.isFinite(value.precision) &&
    Math.abs(value.precision - value.correct / value.total) < 1e-10 &&
    typeof value.date === 'string' && Number.isFinite(Date.parse(value.date));
}

/** Score, longest combo and wave break ties, then the earlier achievement wins. */
function order(entries) {
  return entries.sort((a, b) => b.score - a.score || b.maxStreak - a.maxStreak || b.wave - a.wave || Date.parse(a.date) - Date.parse(b.date) || a.id.localeCompare(b.id)).slice(0, LIMIT);
}

export function loadLeaderboard() {
  if (memoryOnly) return { entries: clone(fallback), notice };
  try {
    const raw = globalThis.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return { entries: clone(fallback), notice };
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !Array.isArray(parsed.entries)) throw new Error('Invalid leaderboard');
    const ids = new Set();
    fallback = order(parsed.entries.filter(entry => {
      if (!validEntry(entry) || ids.has(entry.id)) return false;
      ids.add(entry.id);return true;
    }));
  } catch {
    memoryOnly = true;
    notice = 'Não foi possível ler os recordes. O ranking continua apenas nesta sessão.';
  }
  return { entries: clone(fallback), notice };
}

function persist(entries) {
  fallback = clone(order(entries));
  try { globalThis.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify({ version: 1, entries: fallback })); }
  catch {
    memoryOnly = true;
    notice = 'Os recordes estão apenas nesta sessão; o navegador não permitiu salvá-los.';
  }
  return { entries: clone(fallback), notice };
}

function entryFromResult(result, nickname) {
  if (!result || !RANKED_MODES.includes(result.mode)) return null;
  const lost = result.reason === 'lives' && result.lives === 0 && result.wrong + result.missed === 3;
  // Vitória final do Desafio 3: a partida acaba com vidas sobrando, e cada vida perdida veio de um erro ou item perdido.
  const won = result.reason === 'victory' && result.won === true && result.lives > 0 && result.lives <= 3 && result.wrong + result.missed === 3 - result.lives;
  if (!lost && !won) return null;
  const challengeId = result.challengeId ?? 1;
  const level = result.level ?? result.wave;
  const entry = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2, 12)}`,
    nickname: normalizeNickname(nickname), challengeId, highestChallengeId: challengeId,
    stoppedChallengeId: challengeId, score: result.score, wave: result.wave, level,
    stoppedWave: result.wave, stoppedLevel: level,
    maxStreak: result.maxStreak, correct: result.correct, wrong: result.wrong,
    missed: result.missed, total: result.total, precision: result.precision, date: result.date,
  };
  return validEntry(entry) ? entry : null;
}

function updateStoppedProfile(entries, result) {
  const normalized = normalizeNickname(result.nickname).toLowerCase();
  let changed = false;
  const updatedEntries = entries.map(entry => {
    if (normalizeNickname(entry.nickname).toLowerCase() !== normalized) return entry;
    const highestChallengeId = Math.max(
      result.challengeId,
      ...[entry.challengeId, entry.stoppedChallengeId, entry.highestChallengeId].filter(validChallengeId),
    );
    const next = {
      ...entry,
      highestChallengeId,
      stoppedChallengeId: result.challengeId,
      stoppedWave: result.wave,
      stoppedLevel: result.level,
    };
    if (next.highestChallengeId !== entry.highestChallengeId ||
        next.stoppedChallengeId !== entry.stoppedChallengeId ||
        next.stoppedWave !== entry.stoppedWave ||
        next.stoppedLevel !== entry.stoppedLevel) changed = true;
    return next;
  });
  return { entries: updatedEntries, changed };
}

export function saveNicknameProgress(nickname, challengeId, wave = 1, level = wave) {
  if (!validChallengeId(challengeId) || !positiveInteger(wave) || !positiveInteger(level)) {
    throw new TypeError('Progresso de desafio inválido.');
  }
  const current = loadLeaderboard();
  const updated = updateStoppedProfile(current.entries, { nickname, challengeId, wave, level });
  if (!updated.changed) return { ...current, updated: false };
  return { ...persist(updated.entries), updated: true };
}

export function saveInfiniteResult(result, nickname) {
  const current = loadLeaderboard();
  const entry = entryFromResult(result, nickname);
  if (!entry) return { ...current, position: null, newRecord: false, status: 'invalid-result', saved: false };
  if (isNicknameTaken(entry.nickname, current.entries)) {
    const updated = updateStoppedProfile(current.entries, entry);
    const profile = updated.changed ? persist(updated.entries) : current;
    return { ...profile, position: null, newRecord: false, status: 'nickname-taken', saved: false };
  }
  const newRecord = entry.score > (current.entries[0]?.score ?? 0);
  const saved = persist([...current.entries, entry]);
  const index = saved.entries.findIndex(item => item.id === entry.id);
  const position = index < 0 ? null : index + 1;
  return { ...saved, position, newRecord, status: position === null ? 'not-ranked' : 'saved', saved: position !== null };
}

/** This never touches the campaign save or audio preferences. */
export function clearLeaderboard() {
  notice = '';
  memoryOnly = false;
  return persist([]);
}
