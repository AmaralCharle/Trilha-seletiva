import {describe,it,expect} from 'vitest';
import {CATALOG} from '../src/data/catalog.js';
import {itemSVG,ecoPoseSVG,binBodySVG,binLidSVG,svgURL} from '../src/ui/art.js';
import {factorySVG,citySVG,gearSVG} from '../src/ui/factoryArt.js';

describe('local visual asset contract',()=>{
 it('gives every catalogue entry a distinct, self-contained illustration',()=>{
  const sprites=CATALOG.map(item=>itemSVG(item.id));
  expect(sprites).toHaveLength(27);expect(new Set(sprites).size).toBe(27);
  for(const svg of sprites){expect(svg).toMatch(/<svg/);expect(svg).not.toMatch(/(?:href|src)=["']https?:/);expect(svg).toContain('</svg>');}
 });
 it('keeps four distinct Eco poses and independently animated bin lids',()=>{
  const poses=['idle','happy','guide','error'].map(ecoPoseSVG);
  expect(new Set(poses).size).toBe(4);
  const cats=['paper','plastic','glass','metal','reject'];
  expect(new Set(cats.map(binBodySVG)).size).toBe(5);
  for(const category of cats){expect(binLidSVG(category)).toMatch(/<svg/);expect(binBodySVG(category)).not.toBe(binLidSVG(category));}
 });
 it('encodes Unicode safely and supplies all local environment layers',()=>{
  const svg='<svg xmlns="http://www.w3.org/2000/svg"><title>Plástico e revisão</title></svg>';
  expect(new TextDecoder().decode(Uint8Array.from(atob(svgURL(svg).split(',')[1]),c=>c.charCodeAt(0)))).toBe(svg);
  for(const layer of [factorySVG,citySVG,gearSVG]){expect(layer).toMatch(/<svg/);expect(layer).not.toMatch(/(?:href|src)=["']https?:/);}
 });
});
