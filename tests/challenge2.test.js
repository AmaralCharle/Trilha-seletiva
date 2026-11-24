import {describe,it,expect,beforeEach,vi} from 'vitest';
import {CATALOG} from '../src/data/catalog.js';
import {CHALLENGES,getChallenge,getChallengeLevel,percentSpeed} from '../src/config/infinite.js';
import {ChallengeSession} from '../src/systems/infiniteSession.js';
import {WasteSequenceGenerator} from '../src/systems/sequence.js';
import {arcadeIntroHTML} from '../src/ui/arcade.js';

const ALL=['paper','plastic','glass','metal','reject'];
const challenge=CHALLENGES[2];
const make=(seed='d2')=>new ChallengeSession(challenge,CATALOG,{seed,now:()=>'2026-11-23T12:00:00.000Z'});
const correct=s=>{const item=s.nextItem();return {item,result:s.resolve(item.uid,item,item.category,.4,true)};};
const wrong=s=>{const item=s.nextItem();return s.resolve(item.uid,item,item.category==='paper'?'glass':'paper',.4,true);};
const correctTimes=(s,n)=>Array.from({length:n},()=>correct(s));
const cardOf=(html,id)=>html.match(new RegExp(`<button[^>]*data-challenge="${id}"[^>]*>[\\s\\S]*?</button>`))[0];
const stubStorage=()=>{const memory=new Map();vi.resetModules();vi.stubGlobal('localStorage',{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)});return memory;};

describe('Desafio 2 — configuração',()=>{
 it('está registrado como Normal, com meta Nível 4 + 500 pontos e libera o Desafio 3',()=>{
  expect(getChallenge(2)).toBe(challenge);
  expect(challenge).toMatchObject({id:2,subtitle:'Normal',targetLevel:4,targetScore:500,next:3});
  expect(challenge.levels).toHaveLength(4);
 });
 it('mantém as 5 lixeiras e os 5 materiais em todos os níveis',()=>{
  for(let n=1;n<=4;n++){
   const d=getChallengeLevel(challenge,n);
   expect(d.bins).toEqual(ALL);expect(d.categories).toEqual(ALL);
   expect(d.trickyFraction).toBeGreaterThan(0);expect(d.prepFraction).toBeGreaterThan(0);
  }
 });
 it('os 27 resíduos (confundíveis e com restos incluídos) aparecem já no nível 1',()=>{
  const g=new WasteSequenceGenerator(CATALOG,{seed:'d2n1'}),d=getChallengeLevel(challenge,1);
  const drawn=Array.from({length:2000},()=>g.next(d));
  expect(new Set(drawn.map(i=>i.id)).size).toBe(27);
  expect(drawn.some(i=>i.tricky)).toBe(true);
  expect(drawn.some(i=>i.needsPrep)).toBe(true);
 });
 it('o ritmo de surgimento aumenta a cada nível',()=>{
  const intervals=challenge.levels.map(l=>l.interval);
  for(let i=1;i<intervals.length;i++)expect(intervals[i]).toBeLessThan(intervals[i-1]);
 });
});

describe('Desafio 2 — velocidade percentual (+15% por nível)',()=>{
 it('calcula 95, 109, 125 e 144 px/s nos 4 níveis',()=>{
  expect(challenge.levels.map(l=>l.speed)).toEqual([95,109,125,144]);
  expect([1,2,3,4].map(n=>getChallengeLevel(challenge,n).speed)).toEqual([95,109,125,144]);
 });
 it('cada nível fica 15% mais rápido que o anterior',()=>{
  expect([1,2,3,4].map(n=>getChallengeLevel(challenge,n).speedBoost)).toEqual([0,15,15,15]);
 });
 it('percentSpeed compõe o acréscimo, arredonda para baixo e limita o nível',()=>{
  expect([1,2,3,4].map(n=>percentSpeed(95,15,n))).toEqual([95,109,125,144]);
  expect(percentSpeed(100,10,3)).toBe(121);
  expect(percentSpeed(95,15,0)).toBe(95);
  expect(percentSpeed(95,15,NaN)).toBe(95);
 });
 it('a sessão acelera a esteira a cada 10 acertos e para no nível 4',()=>{
  const s=make();
  expect(s.level.speed).toBe(95);
  const speeds=[];
  for(let n=0;n<4;n++){correctTimes(s,10);s.paused=false;speeds.push(s.level.speed);}
  expect(speeds).toEqual([109,125,144,144]);
  expect(s.wave).toBe(4);
 });
});

describe('Desafio 2 — vitória (Nível 4 + 500 pontos)',()=>{
 it('não vence com 500+ pontos antes do nível 4',()=>{
  const s=make();correctTimes(s,29);
  expect(s.score).toBeGreaterThanOrEqual(500);expect(s.wave).toBe(3);expect(s.won).toBe(false);
 });
 it('não vence no nível 4 com menos de 500 pontos',()=>{
  const s=make();correctTimes(s,29);s.score=0;
  correctTimes(s,1);
  expect(s).toMatchObject({wave:4,score:30,won:false,paused:false});
 });
 it('a meta de 350 do Desafio 1 não basta no Desafio 2',()=>{
  const s=make();correctTimes(s,29);s.score=320;
  correctTimes(s,1);
  expect(s.score).toBe(350);expect(s.won).toBe(false);
 });
 it('vence ao atingir nível 4 e 500 pontos: pausa e sinaliza uma única vez',()=>{
  const s=make();correctTimes(s,29);s.score=470;
  correctTimes(s,1);
  expect(s).toMatchObject({wave:4,score:500,won:true,paused:true,finished:false});
  expect(s.takeVictory()).toBe(true);expect(s.takeVictory()).toBe(false);
  expect(s.nextItem()).toBe(null);
 });
 it('"Continuar" segue no nível 4 a 144 px/s sem repetir o aviso de vitória',()=>{
  const s=make();correctTimes(s,30);
  expect(s.won).toBe(true);s.takeVictory();s.paused=false;
  correctTimes(s,20);
  expect(s).toMatchObject({wave:4,won:true});expect(s.level.speed).toBe(144);expect(s.takeVictory()).toBe(false);
 });
 it('resultado final identifica o Desafio 2 vencido',()=>{
  const s=make();correctTimes(s,30);s.paused=false;
  for(let n=0;n<3;n++)wrong(s);
  expect(s.result).toMatchObject({mode:'challenge',challengeId:2,won:true,level:4,reason:'lives'});
 });
});

describe('Desafio 2 — card bloqueado/desbloqueado',()=>{
 it('começa bloqueado mostrando o requisito de conclusão do Desafio 1',()=>{
  const d2=cardOf(arcadeIntroHTML([],'Jogador',{unlocked:[1],best:{}},CHALLENGES),2);
  expect(d2).toContain('disabled');
  expect(d2).toContain('arcade-challenge-lock');
  expect(d2).toContain('Bloqueado (Vença o D1)');
  expect(d2).toContain('Requisito: Nível 4 + 350 pts no D1');
  expect(d2).not.toContain('Meta:');
 });
 it('depois do Desafio 1 fica liberado com a própria meta e o recorde',()=>{
  const d2=cardOf(arcadeIntroHTML([],'Jogador',{unlocked:[1,2],best:{2:410}},CHALLENGES),2);
  expect(d2).not.toContain('disabled');expect(d2).not.toContain('arcade-challenge-lock');
  expect(d2).toContain('Desafio 2 • Normal');
  expect(d2).toContain('Meta: Nível 4 + 500 pts · Recorde 410');
 });
 it('com o Desafio 2 liberado, o Desafio 3 mostra o requisito do Desafio 2',()=>{
  const d3=cardOf(arcadeIntroHTML([],'Jogador',{unlocked:[1,2],best:{}},CHALLENGES),3);
  expect(d3).toContain('disabled');
  expect(d3).toContain('Bloqueado (Vença o D2)');
  expect(d3).toContain('Requisito: Nível 4 + 500 pts no D2');
 });
 it('Desafio 3 liberado, mas ainda não registrado, fica desativado como "Em breve"',()=>{
  const only12={1:CHALLENGES[1],2:CHALLENGES[2]};
  const d3=cardOf(arcadeIntroHTML([],'Jogador',{unlocked:[1,2,3],best:{}},only12),3);
  expect(d3).toContain('disabled');expect(d3).toContain('Liberado · Em breve');
 });
});

describe('Desafio 2 — desbloqueio salvo no navegador',()=>{
 beforeEach(()=>{stubStorage();});
 it('começa bloqueado e é liberado pela vitória no Desafio 1',async()=>{
  let m=await import('../src/systems/challengeProgress.js');
  expect(m.isChallengeUnlocked(2)).toBe(false);
  m.registerChallengeVictory(CHALLENGES[1],360);
  vi.resetModules();m=await import('../src/systems/challengeProgress.js');
  expect(m.loadChallengeProgress()).toMatchObject({unlocked:[1,2],best:{1:360}});
  expect(m.isChallengeUnlocked(3)).toBe(false);
 });
 it('a vitória no Desafio 2 libera o Desafio 3 e guarda o recorde',async()=>{
  let m=await import('../src/systems/challengeProgress.js');
  m.unlockChallenge(2);
  const s=make('d2-save');correctTimes(s,30);
  expect(s.takeVictory()).toBe(true);
  m.registerChallengeVictory(s.challenge,s.score);
  vi.resetModules();m=await import('../src/systems/challengeProgress.js');
  expect(m.loadChallengeProgress().unlocked).toEqual([1,2,3]);
  expect(m.loadChallengeProgress().best[2]).toBe(s.score);
 });
});
