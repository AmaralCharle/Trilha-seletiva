import {describe,it,expect} from 'vitest';
import {dragPosition,findDropBin,needsLandscape,renderResolution,isCompactLandscape,gameViewport} from '../src/systems/mobile.js';

describe('mobile input geometry',()=>{
  const bins=Array.from({length:5},(_,i)=>({category:i,rect:{x:150+i*196,y:518,width:192,height:174}}));
  it('chooses one unambiguous bin, with small gaps and generous vertical bounds',()=>{
    for(let i=0;i<5;i++){
      expect(findDropBin(bins,246+i*196,520)?.category).toBe(i);
      expect(findDropBin(bins,246+i*196,690)?.category).toBe(i);
    }
    expect(findDropBin(bins,344,600)).toBeUndefined();
    expect(findDropBin(bins,246,500)).toBeUndefined();
    expect(findDropBin(bins,-20,600)).toBeUndefined();
  });
  it('lifts touch graphics without changing the finger-based destination',()=>{
    expect(dragPosition({wasTouch:false},246,560,.5)).toEqual({x:246,y:560});
    const displayed=dragPosition({wasTouch:true},246,560,.5);
    expect(displayed).toEqual({x:246,y:464});
    expect(findDropBin(bins,246,560)?.category).toBe(0);
    expect(findDropBin(bins,displayed.x,displayed.y)).toBeUndefined();
    expect(dragPosition({wasTouch:true},0,200,.1).y).toBe(90);
  });
  it('requests landscape for phones and portrait tablets, capping high-density buffers',()=>{
    expect(needsLandscape(390,844)).toBe(true);
    expect(needsLandscape(1024,1366)).toBe(true);
    expect(needsLandscape(844,390)).toBe(false);
    expect(renderResolution(3)).toBe(2);
    expect(renderResolution(1)).toBe(1);
    expect(renderResolution(undefined)).toBe(1);
  });
  it('frames the whole belt and all enlarged bin zones across landscape viewports',()=>{
    for(const [width,height] of [[800,360],[844,390],[915,412],[960,440],[1280,480]]){
      expect(isCompactLandscape(width,height)).toBe(true);
      const frame=gameViewport(width,height-94,true);
      const projected=(x,y)=>({x:(x-frame.scrollX)*frame.zoom,y:(y-frame.scrollY)*frame.zoom});
      for(const [x,y] of [[0,260],[1280,260],[0,700],[1280,700]]){
        const p=projected(x,y);
        expect(p.x).toBeGreaterThanOrEqual(-.001);
        expect(p.x).toBeLessThanOrEqual(width+.001);
        expect(p.y).toBeGreaterThanOrEqual(-.001);
        expect(p.y).toBeLessThanOrEqual(height-94+.001);
      }
      expect(1280*frame.zoom/width).toBeGreaterThan(width===1280?.85:.96);
      // Camera projection must round-trip the same classification coordinates.
      for(const bin of bins){const p=projected(bin.rect.x+96,600);
        expect(findDropBin(bins,p.x/frame.zoom+frame.scrollX,p.y/frame.zoom+frame.scrollY)).toBe(bin);}
    }
  });
  it('keeps desktop and tablet camera framing unchanged',()=>{
    for(const [width,height] of [[1280,720],[1600,900],[1024,768],[390,844]])expect(isCompactLandscape(width,height)).toBe(false);
    expect(gameViewport(1280,720,false)).toMatchObject({width:1280,height:720,zoom:1,scrollX:0,scrollY:0,centerY:360});
  });
  it('keeps lifted touch graphics and RESTOS badges inside the camera view',()=>{
    const bounds={left:0,right:1280,top:260,bottom:700};
    const first=dragPosition({wasTouch:true},92,350,.6,bounds);
    expect(first.y-80).toBeGreaterThanOrEqual(bounds.top);
    const bottom=dragPosition({wasTouch:true},1300,900,.6,bounds);
    expect(bottom.x+73).toBeLessThanOrEqual(bounds.right);
    expect(bottom.y+64).toBeLessThanOrEqual(bounds.bottom);
    expect(dragPosition({wasTouch:false},92,350,.6,bounds)).toEqual({x:92,y:350});
  });
});
