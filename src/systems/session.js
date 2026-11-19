import { RULES } from '../config/rules.js';
export { RULES };

const threshold = value => value > 1 ? value / 100 : value;

/** Pure game rules. The deck index is the only trusted identity of an item. */
export class Session {
  constructor(level, deck, { now = () => new Date().toISOString(), review = false } = {}) {
    this.level = level;
    this.deck = deck.map((item, uid) => ({ ...item, uid }));
    this.now = now;
    this.review = review;
    this.score = this.streak = this.correct = this.wrong = this.missed = this.elapsed = 0;
    this.remaining = review || level.time == null || level.time === 0 ? null : level.time;
    this.resolved = new Map();
    this.paused = this.finished = false;
    this.result = null;
  }

  tick(dt) {
    if (this.paused || this.finished || !Number.isFinite(dt) || dt <= 0) return;
    const step = this.remaining == null ? dt : Math.min(dt, this.remaining);
    this.elapsed += step;
    if (this.remaining != null) {
      this.remaining = Math.max(0, this.remaining - step);
      if (this.remaining === 0) this.finish('time');
    }
  }

  resolve(uid, _item, choice, decisionSeconds = 0, prepared = false) {
    if (!this.canResolve(uid)) return { ok: false, reason: 'ignored', points: 0 };
    const item = this.deck[uid];
    const ok = choice === item.category && (!item.needsPrep || prepared);
    const reason = ok ? 'correct' : choice !== item.category ? 'category' : 'preparation';
    let points = 0;
    if (ok) {
      this.correct++;
      this.streak++;
      points = RULES.points * (this.streak >= RULES.multiplierFrom ? RULES.multiplier : 1);
      this.score += points;
      if (this.remaining != null && this.streak % RULES.bonusEvery === 0) this.remaining += RULES.bonusSeconds;
    } else {
      this.wrong++;
      this.streak = 0;
      if (this.remaining != null) this.remaining = Math.max(0, this.remaining - RULES.penalty);
    }
    this.resolved.set(uid, { uid, id: item.id, category: item.category, choice, ok, reason, tricky: !!item.tricky, decisionSeconds: Number.isFinite(decisionSeconds) ? Math.max(0, decisionSeconds) : 0 });
    this.checkEnd();
    return { ok, reason, points };
  }

  canResolve(uid) {
    return !this.paused && !this.finished && Number.isInteger(uid) && uid >= 0 && uid < this.deck.length && !this.resolved.has(uid);
  }

  miss(uid, _item) {
    if (!this.canResolve(uid)) return { ok: false, reason: 'ignored', points: 0 };
    this.recordMiss(uid);
    this.streak = 0;
    if (this.remaining != null) this.remaining = Math.max(0, this.remaining - RULES.penalty);
    this.checkEnd();
    return { ok: false, reason: 'missed', points: 0 };
  }

  recordMiss(uid) {
    const item = this.deck[uid];
    this.missed++;
    this.resolved.set(uid, { uid, id: item.id, category: item.category, choice: null, ok: false, reason: 'missed', tricky: !!item.tricky, decisionSeconds: null });
  }

  checkEnd() {
    if (this.resolved.size === this.deck.length) this.finish('complete');
    else if (this.remaining === 0) this.finish('time');
  }

  finish(reason = 'complete') {
    if (this.finished) return this.result;
    for (let uid = 0; uid < this.deck.length; uid++) if (!this.resolved.has(uid)) this.recordMiss(uid);
    this.finished = true;
    const decisions = [...this.resolved.values()];
    const acted = decisions.filter(d => d.decisionSeconds != null);
    const precision = this.deck.length ? this.correct / this.deck.length : 0;
    const pass = reason !== 'abort' && this.deck.length > 0 && precision >= threshold(this.level.target ?? 1);
    const errorsByCategory = {}, errorsByItem = {}, classifications = {};
    for (const d of decisions) if (!d.ok) {
      errorsByCategory[d.category] = (errorsByCategory[d.category] || 0) + 1;
      errorsByItem[d.id] = (errorsByItem[d.id] || 0) + 1;
      const key = `${d.category}:${d.choice ?? 'missed'}`;
      classifications[key] = (classifications[key] || 0) + 1;
    }
    this.result = {
      level: this.level.id, review: this.review, date: this.now(), reason,
      pass, precision, stars: !pass ? 0 : precision >= RULES.threeStars ? 3 : precision >= RULES.twoStars ? 2 : 1,
      score: this.score, correct: this.correct, wrong: this.wrong, missed: this.missed,
      total: this.deck.length, elapsed: this.elapsed,
      averageDecision: acted.length ? acted.reduce((sum, d) => sum + d.decisionSeconds, 0) / acted.length : 0,
      errorsPerMinute: this.elapsed > 0 ? (this.wrong + this.missed) * 60 / this.elapsed : 0,
      errorsByCategory, errorsByItem, classifications,
      trickyCorrect: decisions.filter(d => d.tricky && d.ok).length,
      trickyTotal: decisions.filter(d => d.tricky).length,
      decisions,
    };
    return this.result;
  }
}

/** Balanced, repeatable ordering, with category rounds and rotating examples. */
export function buildDeck(catalog, level, history = [], review = false) {
  const list = Array.isArray(catalog) ? catalog : Object.values(catalog);
  const categories = level.categories || [...new Set(list.map(item => item.category))];
  const eligible = list.filter(item => categories.includes(item.category) && (review || level.id >= 3 || !item.tricky));
  if (!eligible.length) return [];
  const errors = {};
  const lastDecision = {};
  for (const attempt of history) {
    for (const [id, n] of Object.entries(attempt.errorsByItem || {})) {
      errors[id] = (errors[id] || 0) + n;
      if (!Array.isArray(attempt.decisions)) lastDecision[id] = false;
    }
    for (const decision of attempt.decisions || []) lastDecision[decision.id] = !!decision.ok;
  }
  const pending = id => lastDecision[id] === false ? 1 : 0;
  const count = review ? Math.min(12, Math.max(6, eligible.length)) : level.count;
  const ordered = review
    ? [...eligible].sort((a, b) => pending(b.id) - pending(a.id) || (errors[b.id] || 0) - (errors[a.id] || 0) || a.id.localeCompare(b.id))
    : categories.flatMap((category, index) => eligible.filter(item => item.category === category).map((item, n) => ({ item, order: n * categories.length + index }))).sort((a, b) => a.order - b.order).map(entry => entry.item);
  const normal = ordered.filter(item => !item.tricky);
  const tricky = ordered.filter(item => item.tricky);
  const fraction = level.id >= 3 ? (level.trickyFraction ?? 0.3) : 0;
  let normalIndex = 0, trickyIndex = 0;
  const deck = [];
  for (let i = 0; i < count; i++) {
    const trickySlot = Math.floor((i + 1) * fraction) > Math.floor(i * fraction);
    const item = review ? ordered[i % ordered.length] : trickySlot && tricky.length ? tricky[trickyIndex++ % tricky.length] : normal.length ? normal[normalIndex++ % normal.length] : ordered[i % ordered.length];
    deck.push({ ...item, uid: i, needsPrep: !!item.needsPrep && (review || level.id >= 4) });
  }
  if (!review && level.id >= 4 && level.prepFraction != null) {
    const capable = deck.filter(item => item.needsPrep);
    const desired = Math.min(capable.length, Math.round(count * level.prepFraction));
    capable.forEach((item, index) => { item.needsPrep = index < desired; });
  }
  return deck;
}
