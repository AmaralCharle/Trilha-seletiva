import {describe,it,expect} from 'vitest';
import {dragPosition,findDropBin,needsLandscape,renderResolution} from '../src/systems/mobile.js';

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
});
