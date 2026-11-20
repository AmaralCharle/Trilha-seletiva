/** Seedable randomness is explicit in tests; ordinary sessions obtain fresh entropy. */
export function createSeededRandom(seed) {
  const value = String(seed);
  let state = 2166136261;
  for (let i = 0; i < value.length; i++) state = Math.imul(state ^ value.charCodeAt(i), 16777619);
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let next = Math.imul(state ^ state >>> 15, state | 1);
    next ^= next + Math.imul(next ^ next >>> 7, next | 61);
    return ((next ^ next >>> 14) >>> 0) / 4294967296;
  };
}

let entropyCounter = 0;
export function sessionRandom({ seed, rng } = {}) {
  if (typeof rng === 'function') return rng;
  if (seed !== undefined) return createSeededRandom(seed);
  const words = new Uint32Array(2);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(words);
  else { words[0] = Math.random() * 0x100000000; words[1] = Date.now(); }
  return createSeededRandom(`${words[0]}:${words[1]}:${++entropyCounter}`);
}

/** Non-mutating Fisher–Yates. rng must return values in [0, 1). */
export function fisherYates(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const index = Math.floor(rng() * (i + 1));
    [copy[i], copy[index]] = [copy[index], copy[i]];
  }
  return copy;
}

function repeatedPattern(category, recent) {
  const next = [...recent, category];
  for (let size = 2; size <= 5; size++) {
    if (next.length < size * 2) continue;
    const end = next.slice(-size * 2);
    if (end.slice(0, size).every((value, index) => value === end[index + size])) return true;
  }
  return false;
}

function runLength(recent, category) {
  let count = 0;
  for (let i = recent.length - 1; i >= 0 && recent[i] === category; i--) count++;
  return count;
}

/** Keeps a finite Fisher–Yates sample's quotas while avoiding category runs. */
export function constrainCategoryOrder(items, rng, previous = [], { shuffle = true } = {}) {
  const remaining = shuffle ? fisherYates(items, rng) : [...items];
  const result = [];
  const recent = [...previous].slice(-10);
  while (remaining.length) {
    let candidates = remaining.map((item, index) => ({ item, index }));
    const different = candidates.filter(({ item }) => runLength(recent, item.category) < 2);
    if (different.length) candidates = different;
    // Do not greedily use the last alternatives and strand a dominant category.
    const counts = {};
    for (const entry of remaining) counts[entry.category] = (counts[entry.category] || 0) + 1;
    const feasible = candidates.filter(({ item }) => {
      const total = remaining.length - 1;
      const newRun = runLength(recent, item.category) + 1;
      return Object.entries(counts).every(([category, amount]) => { const count=amount-(category===item.category?1:0); return count===0 || count <= 2 * (total - count + 1) - (category === item.category ? newRun : 0); });
    });
    if (feasible.length) candidates = feasible;
    const irregular = candidates.filter(({ item }) => !repeatedPattern(item.category, recent));
    if (irregular.length) candidates = irregular;
    let pick = candidates[0];
    if (result.length && candidates.length > 1) {
      const distinct = candidates.filter(({ item }) => item.id !== result.at(-1).id);
      if (distinct.length) pick = distinct[0];
    }
    remaining.splice(pick.index, 1);
    result.push(pick.item);
    recent.push(pick.item.category);
    if (recent.length > 10) recent.shift();
  }
  return result;
}

/** Endless, memory-bounded source. Difficulty changes which examples are sampled. */
export class WasteSequenceGenerator {
  constructor(catalog, options = {}) {
    this.catalog = Array.isArray(catalog) ? catalog : Object.values(catalog);
    this.rng = sessionRandom(options);
    this.recentCategories = [];
    this.recentIds = [];
  }

  next({ categories, trickyFraction = 0.3, prepFraction = 0 } = {}) {
    const allowed = categories || [...new Set(this.catalog.map(item => item.category))];
    const eligible = this.catalog.filter(item => allowed.includes(item.category));
    if (!eligible.length) return null;
    let pool = eligible;
    const last = this.recentCategories.at(-1);
    if (last && runLength(this.recentCategories, last) >= 2) {
      const alternatives = pool.filter(item => item.category !== last);
      if (alternatives.length) pool = alternatives;
    }
    const tricky = pool.filter(item => item.tricky);
    const easy = pool.filter(item => !item.tricky);
    const chosenDifficulty = this.rng() < Math.max(0, Math.min(1, trickyFraction));
    if (chosenDifficulty && tricky.length) pool = tricky;
    else if (!chosenDifficulty && easy.length) pool = easy;
    const irregular = pool.filter(item => !repeatedPattern(item.category, this.recentCategories));
    if (irregular.length) pool = irregular;
    const fresh = pool.filter(item => !this.recentIds.includes(item.id));
    if (fresh.length) pool = fresh;
    // Uniform category choice avoids overrepresenting a type just because it has more examples.
    const availableCategories = [...new Set(pool.map(item => item.category))];
    const category = availableCategories[Math.floor(this.rng() * availableCategories.length)];
    const examples = pool.filter(item => item.category === category);
    const item = examples[Math.floor(this.rng() * examples.length)];
    this.recentCategories.push(category);if (this.recentCategories.length > 10) this.recentCategories.shift();
    this.recentIds.push(item.id);if (this.recentIds.length > 5) this.recentIds.shift();
    return { ...item, needsPrep: !!item.needsPrep && this.rng() < Math.max(0, Math.min(1, prepFraction)) };
  }
}
