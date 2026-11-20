// Pure geometry shared by pointer handling and its regression tests.
export function dragPosition(pointer, x, y, scale = 1) {
  return { x, y: y - (pointer.wasTouch ? Math.min(110, 48 / Math.max(.35, scale)) : 0) };
}
export function findDropBin(bins, x, y) {
  return bins.find(({rect}) => x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height);
}
export function needsLandscape(width, height) {
  return width < height && width <= 1100;
}
export function renderResolution(ratio = 1) {
  return Math.max(1, Math.min(2, Number(ratio) || 1));
}
