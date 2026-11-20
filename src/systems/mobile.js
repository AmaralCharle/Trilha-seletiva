// Pure geometry shared by pointer handling and its regression tests.
export function dragPosition(pointer, x, y, scale = 1, bounds) {
  const position={ x, y: y - (pointer.wasTouch ? Math.min(110, 48 / Math.max(.35, scale)) : 0) };
  if(pointer.wasTouch&&bounds){
    position.x=Math.max(bounds.left+73,Math.min(bounds.right-73,position.x));
    position.y=Math.max(bounds.top+80,Math.min(bounds.bottom-64,position.y));
  }
  return position;
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

// Presentation only: simulation, belt positions and drop zones stay in world units.
export function isCompactLandscape(width,height) {
  return width > height && height <= 540 && width / height >= 1.4;
}
export function gameViewport(width,height,compact=false) {
  if(!compact)return {width:1280,height:720,zoom:1,centerX:640,centerY:360,scrollX:0,scrollY:0};
  // Entire belt, RESTOS badges and generous bin zones: y=260..700.
  const zoom=Math.min(width/1280,height/440);
  return {width,height,zoom,centerX:640,centerY:480,
    scrollX:640-width/(2*zoom),scrollY:480-height/(2*zoom)};
}
