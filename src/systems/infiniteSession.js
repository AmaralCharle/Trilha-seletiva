import { INFINITE_CONFIG, CHALLENGE_RULES, getDifficulty, getChallengeLevel } from '../config/infinite.js';
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

  /** Categorias elegíveis para o próximo resíduo sorteado. */
  itemCategories() { return this.difficulty.categories ?? this.level.categories; }

  nextItem() {
    if (this.paused || this.finished || this.pending.size >= INFINITE_CONFIG.maxActive) return null;
    const source = this.generator.next({ categories: this.itemCategories(), trickyFraction: this.difficulty.trickyFraction, prepFraction: this.difficulty.prepFraction });
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
    if (reason !== 'abort' && reason !== 'victory' && this.lives > 0) return null;
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

/**
 * Sessão de um desafio do Modo Desafios. Reaproveita vidas, combo e classificação do arcade,
 * mas o nível sobe a cada 10 acertos (limitado ao último nível) e os resíduos sorteados são
 * filtrados pelo nível atual, mantendo as lixeiras do desafio na cena. Ao bater nível + meta
 * de pontos, pausa e sinaliza a vitória.
 */
export class ChallengeSession extends InfiniteSession {
  constructor(challenge, catalog, options = {}) {
    if (!challenge?.levels?.length) throw new Error('Desafio inválido.');
    super(catalog, { ...options, challengeId: challenge.id });
    this.challenge = challenge;
    this.won = false;
    this.victoryPending = false;
    this.passed = 0;
    this.lastLane = 1;
    this.level = { id: `challenge-${challenge.id}`, title: `${challenge.title} · ${challenge.subtitle}`, categories: [...challenge.bins] };
    this.applyDifficulty();
  }

  get maxLevel() { return this.challenge.levels.length; }
  get correctToNextLevel() {
    return this.wave >= this.maxLevel ? 0 : CHALLENGE_RULES.correctPerLevel - (this.correct % CHALLENGE_RULES.correctPerLevel);
  }

  applyDifficulty() {
    // O construtor da classe base chama este método antes de `challenge` existir.
    if (!this.challenge) return super.applyDifficulty();
    this.difficulty = getChallengeLevel(this.challenge, this.wave);
    Object.assign(this.level, { speed: this.difficulty.speed, interval: this.difficulty.interval, categories: this.difficulty.bins });
  }

  /** Lixeiras que estão na cena no nível atual. */
  get activeBins() { return this.difficulty.bins; }

  /** Resíduo cuja lixeira ainda não entrou na cena (só existe no desafio com lixeiras progressivas). */
  isInactive(item) { return !!item && !this.activeBins.includes(item.category); }

  /** Faixa do próximo resíduo: 0 = esteira superior (esq → dir), 1 = inferior (dir → esq). */
  get nextLane() {
    if (!this.challenge?.dualBelt) return 0;
    const count = lane => [...this.pending.values()].filter(item => item.lane === lane).length;
    const [top, bottom] = [count(0), count(1)];
    return top === bottom ? 1 - this.lastLane : top < bottom ? 0 : 1;
  }

  /**
   * Parte dos sorteios vem de lixeiras ainda ausentes (`inactiveShare`); os 27 resíduos continuam
   * possíveis em qualquer nível, mas o jogador não passa o nível inteiro só deixando itens passarem.
   */
  itemCategories() {
    const { categories, bins, inactiveShare = 0 } = this.difficulty;
    if (!this.challenge || !inactiveShare) return categories;
    const absent = categories.filter(c => !bins.includes(c));
    if (!absent.length) return categories;
    return this.generator.rng() < inactiveShare ? absent : bins;
  }

  nextItem() {
    const lane = this.nextLane;
    const item = super.nextItem();
    if (!item) return null;
    item.lane = lane;
    this.lastLane = lane;
    return item;
  }

  /**
   * Item que saiu pela borda. Se a lixeira dele ainda não está ativa, passar é o comportamento
   * correto: sem perda de vida, sem zerar o combo e sem contar para o avanço de nível.
   */
  miss(uid, item) {
    if (this.canResolve(uid) && this.isInactive(this.pending.get(uid))) {
      this.pending.delete(uid);
      this.passed++;
      return { ok: true, reason: 'passed', points: 0, waveChanged: false };
    }
    return super.miss(uid, item);
  }

  completeDecision() {
    this.resolvedCount++;
    const previous = this.wave;
    this.wave = Math.min(this.maxLevel, 1 + Math.floor(this.correct / CHALLENGE_RULES.correctPerLevel));
    this.applyDifficulty();
    if (this.lives === 0) this.finish('lives');
    else this.checkVictory();
    return previous !== this.wave;
  }

  /** Vitória = último nível do desafio E pontuação meta. Dispara uma única vez. */
  checkVictory() {
    if (this.won || this.finished) return false;
    if (this.wave < this.challenge.targetLevel || this.score < this.challenge.targetScore) return false;
    this.won = true;
    // Último desafio: a partida encerra de vez (sem Continuar nem Próximo desafio).
    if (this.challenge.final) { this.finish('victory'); return true; }
    this.victoryPending = true;
    this.paused = true;
    return true;
  }

  /** Consome o aviso de vitória (a UI mostra o modal uma única vez). */
  takeVictory() {
    const pending = this.victoryPending;
    this.victoryPending = false;
    return pending;
  }

  finish(reason = 'lives') {
    const result = super.finish(reason);
    if (!result || result.mode === 'challenge') return result;
    this.result = { ...result, mode: 'challenge', challengeId: this.challenge.id, level: this.wave, won: this.won, passed: this.passed };
    return this.result;
  }
}
