import {describe,it,expect,beforeEach,vi} from 'vitest';
import {CATALOG} from '../src/data/catalog.js';
import {LEVELS} from '../src/config/levels.js';
import {buildDeck,Session} from '../src/systems/session.js';
import {WasteSequenceGenerator,createSeededRandom,fisherYates} from '../src/systems/sequence.js';
import {InfiniteSession} from '../src/systems/infiniteSession.js';
import {getDifficulty} from '../src/config/infinite.js';
const signature=deck=>deck.map(i=>i.id+':'+i.needsPrep).join('|');

describe('unpredictable but reproducible waste sequences',()=>{
 it('reproduces an explicit seed, while changing seeds and ordinary games varies the order',()=>{
  const level=LEVELS[0];expect(signature(buildDeck(CATALOG,level,[],false,{seed:42}))).toBe(signature(buildDeck(CATALOG,level,[],false,{seed:42})));
  expect(new Set(Array.from({length:30},(_,seed)=>signature(buildDeck(CATALOG,level,[],false,{seed})))).size).toBeGreaterThan(25);
  expect(new Set(Array.from({length:10},()=>signature(buildDeck(CATALOG,level)))).size).toBe(10);
 });
 it('preserves all level quotas and valid categories over many seeds without mutating the catalogue',()=>{
  const original=JSON.stringify(CATALOG);
  for(let seed=0;seed<80;seed++)for(const level of LEVELS){
   const deck=buildDeck(CATALOG,level,[],false,{seed});expect(deck).toHaveLength(level.count);
   expect(deck.every(i=>level.categories.includes(i.category))).toBe(true);
   expect(new Set(deck.map(i=>i.uid)).size).toBe(level.count);
   expect(deck.every((item,n)=>n<2||item.category!==deck[n-1].category||item.category!==deck[n-2].category)).toBe(true);
   if(level.id<3)expect(deck.some(i=>i.tricky)).toBe(false);
   if(level.id<4)expect(deck.some(i=>i.needsPrep)).toBe(false);
   if(level.id>=3)expect(deck.filter(i=>i.tricky)).toHaveLength(Math.floor(level.count*level.trickyFraction));
  }
  expect(JSON.stringify(CATALOG)).toBe(original);
 });
 it('does not generate the previous fixed category carousel and yields varied examples',()=>{
  const deck=buildDeck(CATALOG,LEVELS[4],[],false,{seed:'variety'});
  expect(deck.some((i,n)=>n>0&&i.category===deck[n-1].category)).toBe(true);
  expect(new Set(deck.map(i=>i.id)).size).toBeGreaterThan(14);
  const generator=new WasteSequenceGenerator(CATALOG,{seed:'endless'}),items=Array.from({length:300},()=>generator.next({trickyFraction:.4,prepFraction:.3}));
  expect(new Set(items.map(i=>i.category)).size).toBe(5);expect(new Set(items.map(i=>i.id)).size).toBe(27);
  for(let n=2;n<items.length;n++)expect(items[n].category===items[n-1].category&&items[n].category===items[n-2].category).toBe(false);
  expect(generator.recentCategories.length).toBeLessThanOrEqual(10);expect(generator.recentIds.length).toBeLessThanOrEqual(5);
 });
 it('Fisher–Yates preserves elements without mutating the source',()=>{const a=[1,2,3,4,5];const b=fisherYates(a,createSeededRandom('x'));expect([...b].sort()).toEqual(a);expect(a).toEqual([1,2,3,4,5]);});
});

describe('infinite rules',()=>{
 const make=()=>new InfiniteSession(CATALOG,{seed:'test',now:()=> '2026-11-19T23:00:00.000Z'});
 const correct=s=>{const item=s.nextItem();return s.resolve(item.uid,item,item.category,.5,true);};
 it('starts with three lives, all bins, no global timer and specified wave1',()=>{const s=make();expect(s).toMatchObject({lives:3,wave:1,score:0,remaining:null});expect(s.level).toMatchObject({speed:85,interval:2.5});expect(s.level.categories).toHaveLength(5);});
 it('scores 10,20,30 at the exact combo thresholds and never awards lives',()=>{const s=make(),points=Array.from({length:11},()=>correct(s).points);expect(points).toEqual([10,10,20,20,20,20,20,20,20,30,30]);expect(s.score).toBe(220);expect(s.lives).toBe(3);expect(s.maxStreak).toBe(11);expect(s.wave).toBe(2);});
 it('charges one life per failed item and ignores duplicates and spoofed item arguments',()=>{const s=make();correct(s);const i=s.nextItem();expect(s.resolve(i.uid,{category:'fake'},'fake').ok).toBe(false);expect(s.lives).toBe(2);expect(s.streak).toBe(0);s.miss(i.uid,i);s.resolve(i.uid,i,i.category);expect(s.lives).toBe(2);expect(s.resolvedCount).toBe(2);});
 it('ends exactly at zero lives and reports remaining objects without additional penalties',()=>{const s=make();const items=Array.from({length:6},()=>s.nextItem());for(let n=0;n<3;n++)s.miss(items[n].uid,items[n]);expect(s.result).toMatchObject({reason:'lives',lives:0,missed:3,total:3,pendingCount:3,precision:0});expect(s.nextItem()).toBe(null);s.miss(items[3].uid);expect(s.result.total).toBe(3);expect(s.pending.size).toBe(0);});
 it('pauses decisions, spawning and active time, and restarts independently',()=>{const s=make(),i=s.nextItem();s.paused=true;s.tick(8);s.miss(i.uid);expect(s.nextItem()).toBe(null);expect(s.elapsed).toBe(0);expect(s.lives).toBe(3);s.paused=false;correct(s);expect(make()).toMatchObject({score:0,lives:3,wave:1});});
 it('advances each ten resolutions and caps speed, interval and memory on long runs',()=>{const s=make();for(let i=0;i<1400;i++)correct(s);expect(s.wave).toBe(141);expect(s.level.speed).toBe(240);expect(s.level.interval).toBe(1.1);expect(s.pending.size).toBe(0);expect(s.generator.recentIds.length).toBeLessThanOrEqual(5);expect(s).not.toHaveProperty('deck');});
 it('uses exact wave table and gradual challenging material mixture',()=>{const values=[[85,2.5],[95,2.3],[110,2.1],[125,1.9],[140,1.7],[155,1.5],[170,1.4],[185,1.3],[200,1.2],[210,1.1]];values.forEach(([speed,interval],i)=>expect(getDifficulty(i+1)).toMatchObject({speed,interval}));expect(getDifficulty(1000).speed).toBe(240);expect(getDifficulty(1).trickyFraction).toBe(0);expect(getDifficulty(10).trickyFraction).toBeGreaterThan(0);});
 it('shares classification and preparation with the campaign',()=>{const s=make();const i=s.nextItem();s.pending.set(i.uid,{...i,needsPrep:true});expect(s.resolve(i.uid,i,i.category,.1,false)).toMatchObject({ok:false,reason:'preparation'});const c=new Session({id:4,target:1},[{...i,needsPrep:true}]);expect(c.resolve(0,i,i.category,.1,false)).toMatchObject({ok:false,reason:'preparation'});});
 it('bounds concurrent pending items to six and never grants a score for abort',()=>{const s=make();for(let i=0;i<6;i++)expect(s.nextItem()).not.toBe(null);expect(s.nextItem()).toBe(null);expect(s.finish('abort').reason).toBe('abort');expect(s.score).toBe(0);});
});
