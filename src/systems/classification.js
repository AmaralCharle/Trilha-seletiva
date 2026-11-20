/** Shared educational rule. Both campaign and arcade use the same classification. */
export function classifyWaste(item, choice, prepared = false) {
  if (!item || choice !== item.category) return { ok: false, reason: 'category' };
  if (item.needsPrep && !prepared) return { ok: false, reason: 'preparation' };
  return { ok: true, reason: 'correct' };
}
