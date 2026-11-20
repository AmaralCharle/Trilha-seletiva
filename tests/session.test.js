import { describe, expect, it } from 'vitest';
import { Session, buildDeck } from '../src/systems/session.js';

const level = { id: 1, count: 12, categories: ['paper', 'plastic'], time: null, target: 0.75 };
const items = (n = 12) => Array.from({ length: n }, (_, uid) => ({ uid, id: `item-${uid}`, category: uid % 2 ? 'plastic' : 'paper' }));
const answer = (session, uid, correct = true) => session.resolve(uid, session.deck[uid], correct ? session.deck[uid].category : 'reject', 2, true);

describe('Session rules', () => {
  it('gives 10,10,20 then 20 on consecutive successes and resets streak on error', () => {
    const s = new Session(level, items());
    expect([0, 1, 2, 3].map(uid => answer(s, uid).points)).toEqual([10, 10, 20, 20]);
    answer(s, 4, false);
    expect(answer(s, 5).points).toBe(10);
    expect(s.score).toBe(70);
  });
  it('resolves each deck index at most once and ignores forged or missing identities', () => {
    const s = new Session(level, items());
    answer(s, 0);
    expect(answer(s, 0).reason).toBe('ignored');
    expect(s.resolve(99, {}, 'paper').reason).toBe('ignored');
    expect(s.resolve('1', {}, 'plastic').reason).toBe('ignored');
    expect(s.correct).toBe(1);
    expect(s.resolve(1, { category: 'paper' }, 'paper').ok).toBe(false);
  });
  it('requires explicit preparation only when the deck item needs it', () => {
    const s = new Session(level, [{ id: 'jar', category: 'glass', needsPrep: true }]);
    expect(s.resolve(0, {}, 'glass', 1, false).reason).toBe('preparation');
    expect(s.result.pass).toBe(false);
    const ready = new Session(level, [{ id: 'jar', category: 'glass', needsPrep: true }]);
    expect(ready.resolve(0, {}, 'glass', 1, true).ok).toBe(true);
  });
  it('pauses elapsed time, deadline and classification', () => {
    const s = new Session({ ...level, time: 60 }, items());
    s.paused = true;
    s.tick(10);
    answer(s, 0);
    expect(s.remaining).toBe(60);
    expect(s.elapsed).toBe(0);
    expect(s.resolved.size).toBe(0);
    s.paused = false;
    s.tick(2);
    expect(s.remaining).toBe(58);
  });
  it('adds two seconds every five successes, subtracts three on errors and misses', () => {
    const s = new Session({ ...level, time: 60 }, items());
    for (let i = 0; i < 5; i++) answer(s, i);
    expect(s.remaining).toBe(62);
    answer(s, 5, false);
    s.miss(6);
    expect(s.remaining).toBe(56);
    expect(s.streak).toBe(0);
  });
  it('deadline counts unspawned items, clamps time, and cannot finish twice', () => {
    const s = new Session({ ...level, time: 2 }, items());
    answer(s, 0);
    s.tick(10);
    expect(s.remaining).toBe(0);
    expect(s.elapsed).toBe(2);
    expect(s.result).toMatchObject({ correct: 1, missed: 11, pass: false, stars: 0, total: 12 });
    const result = s.result;
    s.finish('complete');
    answer(s, 1);
    expect(s.result).toBe(result);
    expect(s.missed).toBe(11);
  });
  it.each([[8, false, 0], [9, true, 1], [11, true, 2], [12, true, 3]])('awards stars for %i of 12', (n, pass, stars) => {
    const s = new Session(level, items());
    for (let i = 0; i < 12; i++) answer(s, i, i < n);
    expect(s.result).toMatchObject({ pass, stars, precision: n / 12 });
  });
  it('normalizes percentage targets and defines empty-deck precision', () => {
    const s = new Session({ ...level, target: 75 }, items());
    for (let i = 0; i < 12; i++) answer(s, i, i < 9);
    expect(s.result.pass).toBe(true);
    const empty = new Session(level, []);
    expect(empty.finish()).toMatchObject({ precision: 0, pass: false, stars: 0 });
  });
  it('records decisions, category confusions and tricky recognition without claiming learning', () => {
    const s = new Session(level, [{ id: 'a', category: 'paper', tricky: true }, { id: 'b', category: 'glass', tricky: true }]);
    s.tick(10);
    answer(s, 0);
    answer(s, 1, false);
    expect(s.result).toMatchObject({ averageDecision: 2, errorsPerMinute: 6, errorsByCategory: { glass: 1 }, errorsByItem: { b: 1 }, classifications: { 'glass:reject': 1 }, trickyCorrect: 1, trickyTotal: 2 });
  });
  it('new sessions reset all state and review has no deadline', () => {
    const old = new Session(level, items());
    answer(old, 0);
    const s = new Session({ ...level, time: 55 }, items(), { review: true });
    expect(s.remaining).toBeNull();
    expect(s.score).toBe(0);
    expect(s.resolved.size).toBe(0);
  });
});

describe('buildDeck', () => {
  const catalog = [
    { id: 'a', category: 'paper' }, { id: 'b', category: 'plastic', needsPrep: true },
    { id: 'c', category: 'reject', tricky: true }, { id: 'd', category: 'paper', tricky: true },
  ];
  it('makes a seeded balanced beginner deck without tricky or prep demands', () => {
    const deck = buildDeck(catalog, level, [], false, { seed: 42 });
    expect(deck).toHaveLength(12);
    expect(deck.every(item => !item.tricky && !item.needsPrep)).toBe(true);
    expect(deck.filter(item => item.category === 'paper')).toHaveLength(6);
    expect(deck.map(item => item.uid)).toEqual([...Array(12).keys()]);
    expect(buildDeck(catalog, level, [], false, { seed: 42 })).toEqual(deck);
  });
  it('introduces tricky items at phase3 and preparation at phase4', () => {
    const phase3 = buildDeck(catalog, { ...level, id: 3, categories: ['paper', 'plastic', 'reject'] });
    expect(phase3.some(item => item.tricky)).toBe(true);
    expect(phase3.some(item => item.needsPrep)).toBe(false);
    expect(buildDeck(catalog, { ...level, id: 4 }).some(item => item.needsPrep)).toBe(true);
  });
  it('prioritizes individual past errors for review', () => {
    const deck = buildDeck(catalog, { ...level, id: 5, categories: ['paper', 'plastic', 'reject'] }, [{ errorsByItem: { c: 4, b: 2 } }], true);
    expect(deck.slice(0, 2).map(item => item.id)).toEqual(['c', 'b']);
  });
  it('lets a more recent correct decision clear a review priority so other difficulties can appear', () => {
    const history = [
      { errorsByItem: { c: 9, b: 2 }, decisions: [{ id: 'c', ok: false }, { id: 'b', ok: false }] },
      { errorsByItem: {}, decisions: [{ id: 'c', ok: true }] },
    ];
    const deck = buildDeck(catalog, { ...level, id: 5, categories: ['paper', 'plastic', 'reject'] }, history, true);
    expect(deck[0].id).toBe('b');
    expect(deck.some(item => item.id === 'c')).toBe(true);
  });
});
