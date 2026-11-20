import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('phaser', () => ({
  default: {
    AUTO: 'AUTO',
    Scale: { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' },
    Game: class {
      constructor() {
        this.scene = {
          getScene: () => ({
            ready: false,
            showMenu() {},
            start() {},
            cancelDrag() {},
            tweens: { pauseAll() {}, resumeAll() {} },
            audio: {
              unlock() {},
              stopMusic() {},
              resume() {},
              setSettings() {},
              setIntensity() {},
              playMusic() {},
              pause() {},
            },
          }),
        };
        this.scale = {
          gameSize: { width: 1280, height: 720 },
          setGameSize(width, height) { this.gameSize = { width, height }; },
          refresh() {},
        };
      }
    },
  },
}));

vi.mock('../src/scenes/FactoryScene.js', () => ({ FactoryScene: class {} }));

const campaignKey = 'trilha-seletiva-v1';
let memory;
let setItem;
let ui;
let modal;

function clickAction(action) {
  ui.listeners.click({
    target: {
      closest(selector) {
        return selector === '[data-action]' ? { dataset: { action } } : null;
      },
    },
    preventDefault() {},
  });
}

describe('help screen navigation', () => {
  beforeEach(() => {
    memory = new Map();
    modal = null;
    vi.resetModules();
    setItem = vi.fn((key, value) => memory.set(key, value));
    vi.stubGlobal('localStorage', {
      getItem: key => memory.get(key) ?? null,
      setItem,
    });

    ui = {
      dataset: {},
      innerHTML: '',
      listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
      append(element) { modal = element; },
      querySelector() { return null; },
    };
    const gameElement = { getBoundingClientRect: () => ({ width: 1280, height: 720 }) };
    const rotateNotice = { hidden: true };
    vi.stubGlobal('document', {
      querySelector(selector) {
        if (selector === '#ui') return ui;
        if (selector === '#game') return gameElement;
        if (selector === '#rotate-notice') return rotateNotice;
        if (selector === '#modal') return modal;
        return null;
      },
      createElement() {
        return {
          querySelector() { return { focus() {} }; },
          remove() { modal = null; },
        };
      },
      addEventListener() {},
      body: { classList: { toggle() {} } },
      documentElement: { style: { setProperty() {} } },
      fullscreenEnabled: false,
    });
    vi.stubGlobal('window', {
      innerWidth: 1280,
      innerHeight: 720,
      listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders Voltar and returns to menu without changing campaign progress', async () => {
    const campaignSave = JSON.stringify({
      version: 1,
      unlocked: 1,
      stars: {},
      history: [],
      settings: { sound: true, volume: 0.35 },
    });
    memory.set(campaignKey, campaignSave);

    await import('../src/main.js');
    clickAction('play');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).toContain('data-action="menu">Voltar</button>');

    clickAction('menu');

    expect(ui.dataset.screen).toBe('menu');
    expect(ui.innerHTML).toContain('Jogar campanha');
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('returns from map to help, then from help to menu', async () => {
    await import('../src/main.js');
    clickAction('play');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).toContain('data-action="map">Ver minha trilha</button>');

    clickAction('map');

    expect(ui.dataset.screen).toBe('map');
    expect(ui.innerHTML).toContain('data-action="mapBack">Voltar</button>');

    clickAction('mapBack');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).toContain('data-action="menu">Voltar</button>');

    clickAction('menu');

    expect(ui.dataset.screen).toBe('menu');
  });

  it('returns directly from map to menu when opened from menu', async () => {
    await import('../src/main.js');
    clickAction('play');
    clickAction('menu');

    expect(ui.dataset.screen).toBe('menu');
    expect(ui.innerHTML).toContain('data-action="map">Minha trilha</button>');

    clickAction('map');

    expect(ui.dataset.screen).toBe('map');
    expect(ui.innerHTML).toContain('data-action="mapBack">Voltar</button>');

    clickAction('mapBack');

    expect(ui.dataset.screen).toBe('menu');
  });

  it('keeps help as map return after abandoning the tutorial from pause', async () => {
    const campaignSave = JSON.stringify({
      version: 1,
      unlocked: 1,
      stars: {},
      history: [],
      settings: { sound: true, volume: 0.35 },
    });
    memory.set(campaignKey, campaignSave);

    await import('../src/main.js');
    clickAction('play');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).toContain('data-action="tutorial">Treinar com o Eco</button>');

    clickAction('tutorial');
    expect(ui.dataset.screen).toBe('play');
    clickAction('resume');
    window.listeners.keydown({ key: 'Escape', preventDefault() {} });
    expect(modal.innerHTML).toContain('data-action="abandon">Voltar à trilha</button>');

    clickAction('abandon');

    expect(ui.dataset.screen).toBe('map');
    expect(ui.innerHTML).toContain('data-action="mapBack">Voltar</button>');
    clickAction('mapBack');

    expect(ui.dataset.screen).toBe('help');
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(setItem).not.toHaveBeenCalled();
    expect(JSON.parse(memory.get(campaignKey))).toMatchObject({
      history: [],
      stars: {},
    });
  });

  it('uses Voltar in the infinite pause and returns to its intro without saving ranking', async () => {
    const rankingKey = 'trilha-seletiva-infinite-v1';
    const rankingSave = JSON.stringify({ version: 1, entries: [] });
    memory.set(rankingKey, rankingSave);

    await import('../src/main.js');
    clickAction('menu');
    clickAction('infinite');
    clickAction('beginInfinite');
    window.listeners.keydown({ key: 'Escape', preventDefault() {} });

    expect(modal.innerHTML).toContain('data-action="abandon">Voltar</button>');
    expect(modal.innerHTML).not.toContain('Voltar ao menu');

    clickAction('abandon');

    expect(ui.dataset.screen).toBe('arcade');
    expect(ui.innerHTML).toContain('data-action="beginInfinite"');
    expect(ui.innerHTML).toContain('Começar desafio');
    expect(memory.get(rankingKey)).toBe(rankingSave);
    expect(setItem).not.toHaveBeenCalled();
  });
});
