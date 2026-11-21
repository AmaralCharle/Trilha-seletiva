import { INFINITE_CONFIG, getDifficulty } from '../config/infinite.js';
import { classifyWaste } from './classification.js';
import { WasteSequenceGenerator } from './sequence.js';

/** Infinite mode owns only bounded pending items, never an ever-growing deck/history. */
export class InfiniteSession {
  constructor(catalog, { seed, now = () => new Date().toISOString(), challengeId = 1 } = {}) {
    if (!Array.isArray(catalog) || !catalog.length) throw new Error('O catálogo do desafio está vazio.');
    this.infinite = true;
    this.review = false;
    this.challengeId = challengeId;
    this.now = now;
    this.generator = new WasteSequenceGenerator(catalog, { seed });
    this.pending = new Map();
    this.nextUid = 0;
    this.score = this.streak = this.maxStreak = this.elapsed = 0;
    this.correct = this.wrong = this.missed = this.resolvedCount = 0;
    this.lives = INFINITE_CONFIG.lives;
    this.wave = 1;
    this.remaining = null;
    this.paused = this.finished = false;
    this.result = null;
    this.level = { id: 'infinite', title: 'Desafio Infinito', categories: [...INFINITE_CONFIG.categories] };
    this.applyDifficulty();
  }

  get precision() { return this.resolvedCount ? this.correct / this.resolvedCount : 0; }
  get multiplier() { return this.streak >= 10 ? 3 : this.streak >= 3 ? 2 : 1; }

  applyDifficulty() {
    this.difficulty = getDifficulty(this.wave);
    Object.assign(this.level, { speed: this.difficulty.speed, interval: this.difficulty.interval });
  }

  nextItem() {
    if (this.paused || this.finished || this.pending.size >= INFINITE_CONFIG.maxActive) return null;
    const source = this.generator.next({ categories: this.level.categories, trickyFraction: this.difficulty.trickyFraction, prepFraction: this.difficulty.prepFraction });
    if (!source) return null;
    const item = { ...source, uid: this.nextUid++ };
    this.pending.set(item.uid, item);
    return item;
  }

  tick(dt) {
    if (!this.paused && !this.finished && Number.isFinite(dt) && dt > 0) this.elapsed += dt;
  }

  canResolve(uid) {
    return !this.paused && !this.finished && Number.isInteger(uid) && this.pending.has(uid);
  }

  resolve(uid, _item, choice, _decisionSeconds = 0, prepared = false) {
    if (!this.canResolve(uid)) return { ok: false, reason: 'ignored', points: 0, waveChanged: false };
    const verdict = classifyWaste(this.pending.get(uid), choice, prepared);
    this.pending.delete(uid);
    let points = 0;
    if (verdict.ok) {
      this.correct++;
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      points = 10 * this.multiplier;
      this.score = Math.min(Number.MAX_SAFE_INTEGER, this.score + points);
    } else {
      this.wrong++;
      this.loseLife();
    }
    return { ...verdict, points, waveChanged: this.completeDecision() };
  }

  miss(uid, _item) {
    if (!this.canResolve(uid)) return { ok: false, reason: 'ignored', points: 0, waveChanged: false };
    this.pending.delete(uid);
    this.missed++;
    this.loseLife();
    return { ok: false, reason: 'missed', points: 0, waveChanged: this.completeDecision() };
  }

  loseLife() {
    this.streak = 0;
    this.lives = Math.max(0, this.lives - 1);
  }

  completeDecision() {
    this.resolvedCount++;
    const previous = this.wave;
    this.wave = 1 + Math.floor(this.resolvedCount / INFINITE_CONFIG.waveSize);
    this.applyDifficulty();
    if (this.lives === 0) this.finish('lives');
    return previous !== this.wave;
  }

  finish(reason = 'lives') {
    if (this.finished) return this.result;
    if (reason !== 'abort' && this.lives > 0) return null;
    this.finished = true;
    this.result = {
      mode: 'infinite', score: this.score, wave: this.wave, maxStreak: this.maxStreak,
      correct: this.correct, wrong: this.wrong, missed: this.missed,
      total: this.resolvedCount, precision: this.precision,
      date: this.now(), elapsed: this.elapsed, reason,
      pendingCount: this.pending.size, lives: this.lives,
    };
    this.pending.clear();
    return this.result;
  }
}
