import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG } from '../src/data/catalog.js';
import { BINS } from '../src/config/levels.js';

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

describe('screen navigation', () => {
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
    expect(ui.innerHTML).toContain('<b>Olhe, escolha e separe.</b>');
    expect(ui.innerHTML).toContain('Arraste o resíduo da esteira até a lixeira.');
    expect(ui.innerHTML).toContain('Teclado: <kbd>1</kbd> a <kbd>5</kbd> escolhem a lixeira');
    expect(ui.innerHTML).toContain('data-action="tutorial">Treinar com o Eco</button>');
    expect(ui.innerHTML).toContain('data-action="map">Ver minha trilha</button>');
    expect(ui.innerHTML).toContain('data-action="menu">Voltar</button>');
    expect(ui.innerHTML).not.toContain('class="help-guide"');
    expect(ui.innerHTML).not.toContain('data-guide-item=');

    clickAction('menu');

    expect(ui.dataset.screen).toBe('menu');
    expect(ui.innerHTML).toContain('Jogar campanha');
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('renders the complete visual waste guide below the existing help controls', async () => {
    await import('../src/main.js');
    clickAction('help');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).toContain('<b>Olhe, escolha e separe.</b>');
    expect(ui.innerHTML).toContain('Arraste o resíduo da esteira até a lixeira.');
    expect(ui.innerHTML).toContain('Teclado: <kbd>1</kbd> a <kbd>5</kbd> escolhem a lixeira');
    expect(ui.innerHTML).toContain('Acertou três seguidos? Os pontos dobram!');
    expect(ui.innerHTML).toContain('data-action="tutorial">Treinar com o Eco</button>');
    expect(ui.innerHTML).toContain('data-action="map">Ver minha trilha</button>');
    expect(ui.innerHTML).toContain('data-action="menu">Voltar</button>');

    const guideStart = ui.innerHTML.indexOf('<section class="help-guide"');
    expect(guideStart).toBeGreaterThan(-1);
    for (const action of ['Treinar com o Eco', 'Ver minha trilha', 'Voltar']) {
      expect(ui.innerHTML.indexOf(`>${action}</button>`)).toBeLessThan(guideStart);
    }

    const categories = ['paper', 'plastic', 'glass', 'metal', 'reject'];
    const groups = [...ui.innerHTML.matchAll(/<section class="help-guide-group" data-guide-category="([^"]+)"[\s\S]*?<\/section>/g)];
    expect(groups.map(([, category]) => category)).toEqual(categories);
    const expectedItems = categories.flatMap(category => CATALOG.filter(item => item.category === category));
    const renderedItems = [...ui.innerHTML.matchAll(/<li class="help-guide-item" data-guide-item="([^"]+)">([\s\S]*?)<\/li>/g)];
    expect(renderedItems).toHaveLength(27);
    expect(renderedItems.map(([, id]) => id)).toEqual(expectedItems.map(item => item.id));
    expect([...ui.innerHTML.matchAll(/class="help-guide-bin-image"/g)]).toHaveLength(5);
    expect([...ui.innerHTML.matchAll(/class="help-guide-item-image"/g)]).toHaveLength(27);

    for (const [index, item] of expectedItems.entries()) {
      const [, , row] = renderedItems[index];
      expect(row).toContain(item.name);
      expect(row).toContain(item.tip);
      expect(row).toContain(`Lixeira ${BINS[item.category].name}`);
    }
    for (const [index, category] of categories.entries()) {
      const groupHTML = groups[index][0];
      expect(groupHTML).toContain(BINS[category].symbol);
    }

    clickAction('map');
    expect(ui.dataset.screen).toBe('map');
    clickAction('mapBack');
    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).toContain('class="help-guide"');
    clickAction('menu');
    expect(ui.dataset.screen).toBe('menu');
  });

  it('returns from map to help, then from help to menu', async () => {
    await import('../src/main.js');
    clickAction('play');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).not.toContain('class="help-guide"');
    expect(ui.innerHTML).toContain('data-action="map">Ver minha trilha</button>');

    clickAction('map');

    expect(ui.dataset.screen).toBe('map');
    expect(ui.innerHTML).toContain('data-action="mapBack">Voltar</button>');

    clickAction('mapBack');

    expect(ui.dataset.screen).toBe('help');
    expect(ui.innerHTML).not.toContain('class="help-guide"');
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

  it('returns directly to basic campaign help when abandoning the tutorial from pause', async () => {
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
    expect(modal.innerHTML).toContain('data-action="abandon">Voltar</button>');
    expect(modal.innerHTML).not.toContain('Voltar à trilha');

    const screenTransitions = [];
    Object.defineProperty(ui.dataset, 'screen', {
      configurable: true,
      get() { return this.currentScreen ?? 'play'; },
      set(value) {
        this.currentScreen = value;
        screenTransitions.push(value);
      },
    });
    clickAction('abandon');

    expect(ui.dataset.screen).toBe('help');
    expect(screenTransitions).toEqual(['help']);
    expect(ui.innerHTML).not.toContain('class="help-guide"');
    expect(ui.innerHTML).toContain('data-action="tutorial">Treinar com o Eco</button>');
    clickAction('map');
    expect(ui.dataset.screen).toBe('map');
    clickAction('mapBack');
    expect(ui.dataset.screen).toBe('help');
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(setItem).not.toHaveBeenCalled();
    expect(JSON.parse(memory.get(campaignKey))).toMatchObject({
      history: [],
      stars: {},
    });
  });

  it('keeps the normal campaign pause exit label and map destination', async () => {
    const campaignSave = JSON.stringify({
      version: 1,
      unlocked: 1,
      stars: {},
      history: [],
      settings: { sound: true, volume: 0.35 },
    });
    memory.set(campaignKey, campaignSave);

    await import('../src/main.js');
    clickAction('map');
    clickAction('level1');
    expect(ui.dataset.screen).toBe('play');
    window.listeners.keydown({ key: 'Escape', preventDefault() {} });

    expect(modal.innerHTML).toContain('data-action="abandon">Voltar à trilha</button>');

    clickAction('abandon');

    expect(ui.dataset.screen).toBe('map');
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(setItem).not.toHaveBeenCalled();
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

  it.each([
    ['menu', 'menu'],
    ['map', 'map'],
  ])('abandons paused review without recording an attempt and returns to %s', async (origin, expectedScreen) => {
    const campaignSave = JSON.stringify({
      version: 1,
      unlocked: 1,
      stars: {},
      history: [],
      settings: { sound: true, volume: 0.35 },
    });
    memory.set(campaignKey, campaignSave);

    await import('../src/main.js');
    clickAction('menu');
    if (origin === 'map') clickAction('map');
    expect(ui.dataset.screen).toBe(origin);
    clickAction('review');

    expect(ui.dataset.screen).toBe('play');
    window.listeners.keydown({ key: 'Escape', preventDefault() {} });
    expect(modal.innerHTML).toContain('data-action="abandon">Voltar</button>');
    expect(modal.innerHTML).not.toContain('Voltar à trilha');

    clickAction('abandon');

    expect(ui.dataset.screen).toBe(expectedScreen);
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(JSON.parse(memory.get(campaignKey)).history).toEqual([]);
    expect(setItem).not.toHaveBeenCalled();
  });

  it.each([
    ['menu', 'menu'],
    ['map', 'map'],
  ])('returns stats to %s without changing campaign progress', async (origin, expectedScreen) => {
    const campaignSave = JSON.stringify({
      version: 1,
      unlocked: 1,
      stars: {},
      history: [],
      settings: { sound: true, volume: 0.35 },
    });
    memory.set(campaignKey, campaignSave);

    await import('../src/main.js');
    clickAction('menu');
    if (origin === 'map') {
      clickAction('map');
      expect(ui.innerHTML).toContain('data-action="stats">Meu desempenho</button>');
    } else {
      expect(ui.innerHTML).toContain('data-action="stats">Resultados</button>');
    }
    expect(ui.dataset.screen).toBe(origin);

    clickAction('stats');

    expect(ui.dataset.screen).toBe('stats');
    expect(ui.innerHTML).toContain('data-action="export">Exportar CSV</button>');
    expect(ui.innerHTML).toContain('data-action="statsBack">Voltar</button>');

    clickAction('statsBack');

    expect(ui.dataset.screen).toBe(expectedScreen);
    expect(memory.get(campaignKey)).toBe(campaignSave);
    expect(setItem).not.toHaveBeenCalled();
  });
});
