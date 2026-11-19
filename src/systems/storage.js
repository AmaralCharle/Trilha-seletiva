const KEY = 'trilha-seletiva-v1';
const fresh = () => ({ version: 1, unlocked: 1, stars: {}, history: [], settings: { sound: true, volume: 0.35 } });
let fallback = fresh();
let storageNotice = '';
let memoryOnly = false;
const clone = value => JSON.parse(JSON.stringify(value));

function validResult(result) {
  return result && Number.isInteger(result.level) && result.level >= 1 && result.level <= 5 && Number.isFinite(result.precision) && result.precision >= 0 && result.precision <= 1 && Number.isInteger(result.stars) && result.stars >= 0 && result.stars <= 3 && Number.isInteger(result.correct) && result.correct >= 0 && Number.isInteger(result.wrong) && result.wrong >= 0 && Number.isInteger(result.missed) && result.missed >= 0 && result.correct + result.wrong + result.missed === result.total;
}

export function loadProgress() {
  if (memoryOnly) return { ...clone(fallback), notice: storageNotice };
  try {
    const raw = globalThis.localStorage.getItem(KEY);
    if (!raw) return { ...clone(fallback), notice: storageNotice };
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !Array.isArray(parsed.history)) throw new Error('invalid save');
    const history = parsed.history.filter(validResult).slice(-500);
    const progress = fresh();
    progress.history = history;
    // Rebuild unlocks and stars from validated attempts instead of trusting counters.
    for (const attempt of history) {
      if (!attempt.review && attempt.pass && attempt.reason !== 'abort') {
        progress.stars[attempt.level] = Math.max(progress.stars[attempt.level] || 0, attempt.stars);
        progress.unlocked = Math.max(progress.unlocked, Math.min(5, attempt.level + 1));
      }
    }
    progress.settings.sound = parsed.settings?.sound !== false;
    const volume = parsed.settings?.volume;
    progress.settings.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0.35;
    fallback = clone(progress);
    return { ...progress, notice: storageNotice };
  } catch {
    memoryOnly = true;
    storageNotice = 'O navegador não permitiu ler o progresso salvo. Esta sessão continua na memória.';
    return { ...clone(fallback), notice: storageNotice };
  }
}

function persist(progress) {
  delete progress.notice;
  fallback = clone(progress);
  try { globalThis.localStorage.setItem(KEY, JSON.stringify(progress)); }
  catch { memoryOnly = true; storageNotice = 'O progresso está salvo apenas nesta sessão. Exporte os resultados antes de sair.'; }
  return { ...clone(progress), notice: storageNotice };
}

export function saveAttempt(result) {
  const progress = loadProgress();
  if (!validResult(result) || result.reason === 'abort') return progress;
  progress.history.push(clone(result));
  progress.history = progress.history.slice(-500);
  if (result.pass && !result.review) {
    progress.stars[result.level] = Math.max(progress.stars[result.level] || 0, result.stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(5, result.level + 1));
  }
  return persist(progress);
}

export function saveSettings(settings) {
  const progress = loadProgress();
  if (typeof settings.sound === 'boolean') progress.settings.sound = settings.sound;
  if (Number.isFinite(settings.volume)) progress.settings.volume = Math.max(0, Math.min(1, settings.volume));
  return persist(progress);
}

export function resetProgress() {
  storageNotice = '';
  memoryOnly = false;
  return persist(fresh());
}

const cell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
export function exportCSV(history = loadProgress().history) {
  const columns = ['date', 'level', 'review', 'pass', 'correct', 'wrong', 'missed', 'total', 'precision', 'score', 'stars', 'elapsed', 'averageDecision', 'errorsPerMinute', 'trickyCorrect', 'trickyTotal', 'errorsByCategory', 'errorsByItem', 'classifications'];
  return '\uFEFF' + [columns.join(';'), ...history.map(attempt => columns.map(key => cell(typeof attempt[key] === 'object' ? JSON.stringify(attempt[key]) : attempt[key])).join(';'))].join('\r\n');
}
