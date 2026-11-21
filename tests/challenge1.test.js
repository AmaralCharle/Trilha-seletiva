import {describe,it,expect,beforeEach,vi} from 'vitest';
import {CATALOG} from '../src/data/catalog.js';
import {CHALLENGES,getChallenge,getChallengeLevel} from '../src/config/infinite.js';
import {ChallengeSession} from '../src/systems/infiniteSession.js';
import {WasteSequenceGenerator} from '../src/systems/sequence.js';
import {arcadeIntroHTML} from '../src/ui/arcade.js';

const ALL=['paper','plastic','glass','metal','reject'];
const challenge=CHALLENGES[1];
const make=(seed='d1')=>new ChallengeSession(challenge,CATALOG,{seed,now:()=>'2026-11-21T12:00:00.000Z'});
const correct=s=>{const item=s.nextItem();return {item,result:s.resolve(item.uid,item,item.category,.4,true)};};
const wrong=s=>{const item=s.nextItem();return s.resolve(item.uid,item,item.category==='paper'?'glass':'paper',.4,true);};
const correctTimes=(s,n)=>Array.from({length:n},()=>correct(s));

describe('Desafio 1 — configuração',()=>{
 it('tem 4 níveis com velocidades 80, 85, 90 e 95 px/s e meta Nível 4 + 350 pontos',()=>{
  expect(getChallenge(1)).toBe(challenge);
  expect(challenge.levels.map(l=>l.speed)).toEqual([80,85,90,95]);
  expect(challenge).toMatchObject({targetLevel:4,targetScore:350,next:2});
 });
 it('introduz os materiais progressivamente e mantém as 5 lixeiras em todos os níveis',()=>{
  expect(challenge.levels.map(l=>[...l.categories])).toEqual([
   ['paper','plastic'],['paper','plastic','glass'],['paper','plastic','glass','metal'],ALL]);
  for(let n=1;n<=4;n++)expect(getChallengeLevel(challenge,n).bins).toEqual(ALL);
 });
 it('limita o nível ao intervalo 1..4',()=>{
  expect(getChallengeLevel(challenge,0).level).toBe(1);
  expect(getChallengeLevel(challenge,99)).toMatchObject({level:4,speed:95});
  expect(getChallengeLevel(challenge,NaN).level).toBe(1);
 });
 it('no nível 4 todos os 27 resíduos podem aparecer',()=>{
  const d=getChallengeLevel(challenge,4),g=new WasteSequenceGenerator(CATALOG,{seed:'n4'});
  const ids=new Set(Array.from({length:1500},()=>g.next(d).id));
  expect(ids.size).toBe(27);
 });
});

describe('Desafio 1 — bloqueio de resíduos de níveis futuros',()=>{
 it.each([1,2,3])('nível %i só sorteia categorias liberadas',level=>{
  const d=getChallengeLevel(challenge,level),g=new WasteSequenceGenerator(CATALOG,{seed:`lvl${level}`});
  const seen=new Set(Array.from({length:400},()=>g.next(d).category));
  expect([...seen].sort()).toEqual([...d.categories].sort());
 });
 it('a sessão começa no nível 1 com 5 lixeiras, 80 px/s e apenas papel/plástico na esteira',()=>{
  const s=make();
  expect(s).toMatchObject({lives:3,wave:1,score:0,won:false});
  expect(s.level.categories).toEqual(ALL);
  expect(s.level.speed).toBe(80);
  const items=correctTimes(s,9).map(r=>r.item.category);
  expect(items.every(c=>c==='paper'||c==='plastic')).toBe(true);
 });
});

describe('Desafio 1 — avanço de nível',()=>{
 it('sobe 1 nível a cada 10 acertos e atualiza a velocidade',()=>{
  const s=make();
  correctTimes(s,9);expect(s.wave).toBe(1);
  correctTimes(s,1);expect(s.wave).toBe(2);expect(s.level.speed).toBe(85);
  correctTimes(s,10);expect(s.wave).toBe(3);expect(s.level.speed).toBe(90);
 });
 it('erros não contam para o avanço de nível e zeram o combo',()=>{
  const s=make();
  correctTimes(s,5);wrong(s);
  expect(s).toMatchObject({wave:1,streak:0,lives:2,correctToNextLevel:5});
  correctTimes(s,5);expect(s.wave).toBe(2);
 });
 it('perde vida por item que sai da esteira e termina com 3 erros',()=>{
  const s=make();
  for(let n=0;n<3;n++){const i=s.nextItem();s.miss(i.uid,i);}
  expect(s.result).toMatchObject({mode:'challenge',challengeId:1,reason:'lives',won:false,level:1});
 });
});

describe('Desafio 1 — vitória (Nível 4 + 350 pontos)',()=>{
 it('não vence com 350+ pontos antes do nível 4',()=>{
  const s=make();correctTimes(s,29);
  expect(s.score).toBeGreaterThanOrEqual(350);expect(s.wave).toBe(3);expect(s.won).toBe(false);
 });
 it('não vence no nível 4 com menos de 350 pontos',()=>{
  const s=make();correctTimes(s,29);s.score=0;
  correctTimes(s,1);
  expect(s.wave).toBe(4);expect(s.score).toBe(30);expect(s.won).toBe(false);expect(s.paused).toBe(false);
 });
 it('vence ao atingir nível 4 e 350 pontos: pausa e sinaliza uma única vez',()=>{
  const s=make();correctTimes(s,29);s.score=320;
  correctTimes(s,1);
  expect(s).toMatchObject({wave:4,won:true,paused:true,finished:false});
  expect(s.score).toBe(350);
  expect(s.takeVictory()).toBe(true);
  expect(s.takeVictory()).toBe(false);
  expect(s.nextItem()).toBe(null);
 });
 it('"Continuar" retoma no último nível e segue pontuando sem novo aviso de vitória',()=>{
  const s=make();correctTimes(s,30);s.takeVictory();
  s.paused=false;
  correctTimes(s,40);
  expect(s.wave).toBe(4);expect(s.level.speed).toBe(95);expect(s.won).toBe(true);expect(s.takeVictory()).toBe(false);
 });
 it('resultado final informa que o desafio foi vencido',()=>{
  const s=make();correctTimes(s,30);s.paused=false;
  for(let n=0;n<3;n++)wrong(s);
  expect(s.result).toMatchObject({mode:'challenge',challengeId:1,won:true,level:4,reason:'lives'});
 });
});

describe('Desafio 1 — card de seleção',()=>{
 const button=(html,id)=>html.match(new RegExp(`<button[^>]*data-challenge="${id}"[^>]*>[\\s\\S]*?</button>`))[0];
 it('o card do Desafio 1 começa liberado e mostra a meta e o recorde',()=>{
  const html=arcadeIntroHTML([],'Jogador',{unlocked:[1],best:{1:120}},CHALLENGES);
  const d1=button(html,1);
  expect(d1).not.toContain('disabled');expect(d1).toContain('Desafio 1 • Iniciante');
  expect(d1).toContain('Meta: Nível 4 + 350 pts · Recorde 120');
  expect(button(html,2)).toContain('disabled');expect(button(html,2)).toContain('Bloqueado (Vença o D1)');
 });
 it('libera o card do Desafio 2 depois da vitória no Desafio 1',()=>{
  const html=arcadeIntroHTML([],'Jogador',{unlocked:[1,2],best:{}},CHALLENGES);
  expect(button(html,2)).not.toContain('disabled');
  expect(button(html,3)).toContain('Bloqueado (Vença o D2)');
 });
});

describe('Desafio 1 — progresso salvo no navegador',()=>{
 let memory;
 beforeEach(()=>{memory=new Map();vi.resetModules();vi.stubGlobal('localStorage',{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)});});
 it('começa só com o Desafio 1 liberado e persiste o desbloqueio do Desafio 2',async()=>{
  let m=await import('../src/systems/challengeProgress.js');
  expect(m.loadChallengeProgress().unlocked).toEqual([1]);
  m.unlockChallenge(2);
  vi.resetModules();m=await import('../src/systems/challengeProgress.js');
  expect(m.loadChallengeProgress().unlocked).toEqual([1,2]);
  expect(m.isChallengeUnlocked(2)).toBe(true);expect(m.isChallengeUnlocked(3)).toBe(false);
 });
 it('mantém só o melhor recorde e ignora valores inválidos',async()=>{
  const m=await import('../src/systems/challengeProgress.js');
  m.saveChallengeScore(1,300);m.saveChallengeScore(1,200);m.saveChallengeScore(1,-5);m.saveChallengeScore(9,999);
  expect(m.loadChallengeProgress().best).toEqual({1:300});
 });
 it('ignora save corrompido e nunca perde o Desafio 1',async()=>{
  memory.set('trilha-seletiva-desafios-v1',JSON.stringify({version:1,unlocked:[7,'x'],best:{1:'a'}}));
  const m=await import('../src/systems/challengeProgress.js');
  expect(m.loadChallengeProgress()).toMatchObject({unlocked:[1],best:{}});
 });
});

describe('Desafio 1 — ranking local',()=>{
 let memory;
 beforeEach(()=>{memory=new Map();vi.resetModules();vi.stubGlobal('localStorage',{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)});});
 it('o fim da partida do desafio entra no ranking com o nível alcançado',async()=>{
  const lb=await import('../src/systems/leaderboard.js');
  const s=make('ranking');
  for(let n=0;n<35;n++){s.paused=false;correct(s);}
  for(let n=0;n<3;n++)wrong(s);
  const saved=lb.saveInfiniteResult(s.result,'Serjao');
  expect(saved).toMatchObject({saved:true,position:1});
  expect(lb.loadLeaderboard().entries[0]).toMatchObject({nickname:'Serjao',score:s.result.score,wave:4});
 });
 it('partida abandonada do desafio continua fora do ranking',async()=>{
  const lb=await import('../src/systems/leaderboard.js');
  const s=make();correctTimes(s,5);
  expect(lb.saveInfiniteResult(s.finish('abort'),'Serjao').saved).toBe(false);
 });
});
