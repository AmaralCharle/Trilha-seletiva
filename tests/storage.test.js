import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Session } from '../src/systems/session.js';

let memory;
beforeEach(() => {
  memory = new Map();
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) });
});
const result = (level = 1) => {
  const s = new Session({ id: level, target: 1 }, [{ id: 'paper', category: 'paper' }], { now: () => '2026-11-19T12:00:00.000Z' });
  s.resolve(0, {}, 'paper');
  return s.result;
};

describe('local persistence', () => {
  it('starts with only the first phase and no fabricated history', async () => {
    const { loadProgress } = await import('../src/systems/storage.js');
    expect(loadProgress()).toMatchObject({ unlocked: 1, history: [], stars: {} });
  });
  it('persists attempts and preserves best stars and unlocks', async () => {
    const { saveAttempt, loadProgress } = await import('../src/systems/storage.js');
    saveAttempt(result());
    expect(loadProgress()).toMatchObject({ unlocked: 2, stars: { 1: 3 } });
    expect(loadProgress().history).toHaveLength(1);
  });
  it('review does not unlock main phases and abort is not saved', async () => {
    const { saveAttempt, loadProgress } = await import('../src/systems/storage.js');
    saveAttempt({ ...result(5), review: true });
    saveAttempt({ ...result(), reason: 'abort' });
    expect(loadProgress()).toMatchObject({ unlocked: 1, stars: {} });
    expect(loadProgress().history).toHaveLength(1);
  });
  it('recovers from malformed local data and unavailable storage', async () => {
    memory.set('trilha-seletiva-v1', '{bad json');
    const { loadProgress, saveAttempt } = await import('../src/systems/storage.js');
    expect(loadProgress().notice).toContain('memória');
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('denied'); }, setItem: () => { throw Error('denied'); } });
    saveAttempt(result());
    expect(loadProgress().history).toHaveLength(1);
    expect(loadProgress().notice).toContain('sessão');
  });
  it('exports every required metric and quotes text safely', async () => {
    const { exportCSV } = await import('../src/systems/storage.js');
    const csv = exportCSV([{ ...result(), date: 'a"b', errorsByItem: { paper: 2 } }]);
    expect(csv).toContain('averageDecision;errorsPerMinute;trickyCorrect');
    expect(csv).toContain('"a""b"');
    expect(csv).toContain('{""paper"":2}');
    expect(csv.split('\r\n')).toHaveLength(2);
  });
  it('saves audio settings and resets progress', async () => {
    const { saveSettings, resetProgress, saveAttempt, loadProgress } = await import('../src/systems/storage.js');
    saveAttempt(result());
    saveSettings({ sound: false, volume: 9 });
    expect(loadProgress().settings).toMatchObject({ sound: false, volume: 1, musicVolume: 0.22, effectsVolume: 1 });
    resetProgress();
    expect(loadProgress()).toMatchObject({ unlocked: 1, stars: {}, history: [] });
  });
});
