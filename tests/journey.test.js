import { describe, it, expect } from 'vitest';
import { CATALOG } from '../src/data/catalog.js';
import { LEVELS } from '../src/config/levels.js';
import { buildDeck, Session } from '../src/systems/session.js';

describe('complete configured journey', () => {
  it('plays all five real decks with preparation and reaches three stars each', () => {
    const history = [];
    for (const level of LEVELS) {
      const deck = buildDeck(CATALOG, level, history);
      expect(deck).toHaveLength(level.count);
      expect(deck.every(item => level.categories.includes(item.category))).toBe(true);
      const session = new Session(level, deck);
      for (const item of session.deck) {
        session.tick(0.1);
        session.resolve(item.uid, item, item.category, 0.1, item.needsPrep);
      }
      expect(session.result).toMatchObject({ pass: true, stars: 3, precision: 1, total: level.count, wrong: 0, missed: 0 });
      history.push(session.result);
    }
    expect(history.map(attempt => attempt.level)).toEqual([1, 2, 3, 4, 5]);
  });
  it('counts all items when every item leaves the belt and awards no stars', () => {
    for (const level of LEVELS) {
      const session = new Session(level, buildDeck(CATALOG, level));
      for (const item of session.deck) session.miss(item.uid, item);
      expect(session.result).toMatchObject({ pass: false, stars: 0, precision: 0, missed: level.count });
      expect(session.correct + session.wrong + session.missed).toBe(level.count);
    }
  });
  it('phase3 includes confusing items and phase4 includes preparation tasks', () => {
    const phase3 = buildDeck(CATALOG, LEVELS[2]);
    expect(phase3.filter(item => item.tricky)).toHaveLength(Math.floor(20 * LEVELS[2].trickyFraction));
    const phase4 = buildDeck(CATALOG, LEVELS[3]);
    expect(phase4.some(item => item.needsPrep)).toBe(true);
    expect(phase3.some(item => item.needsPrep)).toBe(false);
  });
});
