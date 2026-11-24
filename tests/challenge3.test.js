import {describe,it,expect,beforeEach,vi} from 'vitest';
import {CATALOG} from '../src/data/catalog.js';
import {CHALLENGES,getChallenge,getChallengeLevel} from '../src/config/infinite.js';
import {ChallengeSession} from '../src/systems/infiniteSession.js';
import {WasteSequenceGenerator} from '../src/systems/sequence.js';
import {arcadeIntroHTML,finalVictoryHTML,FINAL_VICTORY_MESSAGE} from '../src/ui/arcade.js';
import {gameViewport} from '../src/systems/mobile.js';

const ALL=['paper','plastic','glass','metal','reject'];
const challenge=CHALLENGES[3];
const make=(seed='d3')=>new ChallengeSession(challenge,CATALOG,{seed,now:()=>'2026-11-24T12:00:00.000Z'});
const cardOf=(html,id)=>html.match(new RegExp(`<button[^>]*data-challenge="${id}"[^>]*>[\\s\\S]*?</button>`))[0];

/** Sorteia até achar um resíduo que satisfaça `want`; os demais são descartados sem afetar placar nem vidas. */
function draw(s,want=()=>true){
 for(let n=0;n<500;n++){
  const item=s.nextItem();
  if(want(item,s))return item;
  s.pending.delete(item.uid);
 }
 throw new Error('item não encontrado');
}
const withBin=(item,s)=>!s.isInactive(item);
const withoutBin=(item,s)=>s.isInactive(item);
/** Joga certo: separa o que tem lixeira e deixa passar o que não tem. */
function solve(s){
 const item=s.nextItem();
 return s.isInactive(item)?s.miss(item.uid,item):s.resolve(item.uid,item,item.category,.3,true);
}
/** Faz `n` acertos reais (itens com lixeira), deixando passar os demais. */
function hits(s,n){for(let done=0;done<n;){const r=solve(s);if(r.reason==='correct')done++;}}

describe('Desafio 3 — configuração',()=>{
 it('está registrado como Avançado, é o desafio final e tem meta Nível 5 + 650 pontos',()=>{
  expect(getChallenge(3)).toBe(challenge);
  expect(challenge).toMatchObject({id:3,subtitle:'Avançado',targetLevel:5,targetScore:650,next:null,final:true,dualBelt:true});
  expect(challenge.levels).toHaveLength(5);
 });
 it('as velocidades vão de 125 a 145 px/s (a partir do Nível 3 do Desafio 2)',()=>{
  expect(challenge.levels.map(l=>l.speed)).toEqual([125,130,135,140,145]);
  expect(CHALLENGES[2].levels[2].speed).toBe(challenge.levels[0].speed);
 });
 it('libera as lixeiras uma a uma: Papel, Plástico, Vidro, Metal e Rejeito',()=>{
  expect(challenge.levels.map(l=>[...l.bins])).toEqual([
   ['paper'],['paper','plastic'],['paper','plastic','glass'],['paper','plastic','glass','metal'],ALL]);
  for(let n=1;n<=5;n++)expect(getChallengeLevel(challenge,n).bins).toHaveLength(n);
 });
 it('limita o nível ao intervalo 1..5',()=>{
  expect(getChallengeLevel(challenge,0).level).toBe(1);
  expect(getChallengeLevel(challenge,99)).toMatchObject({level:5,speed:145,name:'Nível 5 (final)'});
 });
 it('os 27 resíduos podem aparecer já no Nível 1 e em todos os níveis',()=>{
  for(let n=1;n<=5;n++){
   const s=make(`todos${n}`);s.wave=n;s.applyDifficulty();
   const ids=new Set();
   for(let i=0;i<4000;i++){const item=s.nextItem();ids.add(item.id);s.pending.clear();}
   expect(ids.size).toBe(27);
  }
 });
 it('o sorteio puro dos 27 itens também respeita o catálogo completo',()=>{
  const g=new WasteSequenceGenerator(CATALOG,{seed:'cat'});
  const d=getChallengeLevel(challenge,1);
  expect(new Set(Array.from({length:3000},()=>g.next(d).id)).size).toBe(27);
 });
 it('o ritmo de surgimento aumenta a cada nível',()=>{
  const intervals=challenge.levels.map(l=>l.interval);
  for(let i=1;i<intervals.length;i++)expect(intervals[i]).toBeLessThan(intervals[i-1]);
 });
 it('metade (no máximo) dos sorteios vem de lixeiras ausentes e some no Nível 5',()=>{
  expect(challenge.levels.map(l=>l.inactiveShare)).toEqual([.5,.5,.4,.2,0]);
 });
});

describe('Desafio 3 — lixeiras dinâmicas por nível',()=>{
 it('a cena recebe 1 a 5 lixeiras conforme o nível (level.categories)',()=>{
  const s=make();
  expect(s.level.categories).toEqual(['paper']);
  for(let n=2;n<=5;n++){hits(s,10);expect(s.wave).toBe(n);expect(s.level.categories).toEqual(ALL.slice(0,n));}
 });
 it('a velocidade acompanha os níveis conforme os acertos',()=>{
  const s=make();const speeds=[s.level.speed];
  for(let n=2;n<=5;n++){hits(s,10);speeds.push(s.level.speed);}
  expect(speeds).toEqual([125,130,135,140,145]);
 });
 it('só os acertos contam para subir de nível (passar itens não conta)',()=>{
  const s=make();
  for(let n=0;n<20;n++){const i=draw(s,withoutBin);s.miss(i.uid,i);}
  expect(s.wave).toBe(1);expect(s.correct).toBe(0);expect(s.correctToNextLevel).toBe(10);
 });
});

describe('Desafio 3 — isenção de penalidade (itens sem lixeira ativa)',()=>{
 it.each([1,2,3,4])('no nível %i deixar passar um item sem lixeira não custa vida',level=>{
  const s=make(`pen${level}`);s.wave=level;s.applyDifficulty();
  const item=draw(s,withoutBin);
  expect(ALL.slice(0,level)).not.toContain(item.category);
  const r=s.miss(item.uid,item);
  expect(r).toMatchObject({ok:true,reason:'passed',points:0});
  expect(s.lives).toBe(3);expect(s.missed).toBe(0);expect(s.passed).toBe(1);expect(s.pending.has(item.uid)).toBe(false);
 });
 it('passar por um item sem lixeira preserva o combo e não pontua',()=>{
  const s=make();hits(s,4);
  const streak=s.streak,score=s.score,resolved=s.resolvedCount;
  const item=draw(s,withoutBin);s.miss(item.uid,item);
  expect(s).toMatchObject({streak,score,resolvedCount:resolved,lives:3});
 });
 it('o item que passou não entra na precisão nem no resultado como perdido',()=>{
  const s=make();hits(s,3);
  const already=s.passed;
  for(let n=0;n<5;n++){const i=draw(s,withoutBin);s.miss(i.uid,i);}
  expect(s.precision).toBe(1);
  s.finish('abort');
  expect(s.result).toMatchObject({passed:already+5,missed:0,wrong:0,precision:1});
 });
 it('no nível 5 todas as lixeiras estão ativas: nenhum item é isento',()=>{
  const s=make();s.wave=5;s.applyDifficulty();
  for(const item of CATALOG)expect(s.isInactive(item)).toBe(false);
  const item=s.nextItem();
  expect(s.miss(item.uid,item)).toMatchObject({reason:'missed'});
  expect(s.lives).toBe(2);
 });
});

describe('Desafio 3 — penalidade normal para lixeiras ativas',()=>{
 it('item cuja lixeira já está ativa que sai da esteira custa 1 vida e zera o combo',()=>{
  const s=make();hits(s,4);
  const passed=s.passed;
  const item=draw(s,withBin);
  const r=s.miss(item.uid,item);
  expect(r).toMatchObject({ok:false,reason:'missed'});
  expect(s).toMatchObject({lives:2,streak:0,missed:1,passed});
 });
 it('nível novo muda a regra: o material que ganhou lixeira passa a custar vida',()=>{
  const s=make();
  const before=draw(s,i=>i.category==='plastic');
  expect(s.miss(before.uid,before)).toMatchObject({reason:'passed'});
  hits(s,10);expect(s.wave).toBe(2);
  const after=draw(s,i=>i.category==='plastic');
  expect(s.miss(after.uid,after)).toMatchObject({reason:'missed'});
  expect(s.lives).toBe(2);
 });
 it('jogar na lixeira errada custa 1 vida',()=>{
  const s=make();
  const item=draw(s,withBin);
  const r=s.resolve(item.uid,item,'plastic',.3,true);
  expect(r.ok).toBe(false);expect(s.lives).toBe(2);expect(s.streak).toBe(0);expect(s.wrong).toBe(1);
 });
 it('jogar um item sem lixeira em uma lixeira ativa também é erro',()=>{
  const s=make();
  const item=draw(s,withoutBin);
  const r=s.resolve(item.uid,item,'paper',.3,true);
  expect(r).toMatchObject({ok:false,reason:'category'});expect(s.lives).toBe(2);
 });
 it('descartar item com restos sem preparar custa 1 vida; preparado acerta',()=>{
  const s=make();s.wave=5;s.applyDifficulty();
  const first=draw(s,i=>i.needsPrep);
  expect(s.resolve(first.uid,first,first.category,.3,false)).toMatchObject({ok:false,reason:'preparation'});
  expect(s.lives).toBe(2);
  const second=draw(s,i=>i.needsPrep);
  expect(s.resolve(second.uid,second,second.category,.3,true)).toMatchObject({ok:true});
 });
 it('3 vidas perdidas encerram a partida sem vitória',()=>{
  const s=make();
  for(let n=0;n<3;n++){const i=draw(s,withBin);s.miss(i.uid,i);}
  expect(s.finished).toBe(true);
  expect(s.result).toMatchObject({mode:'challenge',challengeId:3,reason:'lives',won:false,level:1});
 });
});

describe('Desafio 3 — esteira dupla cruzada',()=>{
 it('alterna as faixas: superior (0, esq → dir) e inferior (1, dir → esq)',()=>{
  const s=make();
  const lanes=Array.from({length:6},()=>s.nextItem().lane);
  expect(lanes).toEqual([0,1,0,1,0,1]);
  expect(s.nextLane).toBe(0);
 });
 it('equilibra as faixas quando uma delas esvazia',()=>{
  const s=make();
  const a=s.nextItem(),b=s.nextItem();
  s.pending.delete(b.uid);
  expect(s.nextLane).toBe(1);
  s.pending.delete(a.uid);
 });
 it('os Desafios 1 e 2 continuam com uma única esteira (faixa 0)',()=>{
  for(const id of [1,2]){
   const s=new ChallengeSession(CHALLENGES[id],CATALOG,{seed:`single${id}`});
   expect(CHALLENGES[id].dualBelt).toBeUndefined();
   expect(s.nextLane).toBe(0);
   expect(Array.from({length:5},()=>s.nextItem().lane)).toEqual([0,0,0,0,0]);
  }
 });
 it('o limite de itens simultâneos continua valendo nas duas faixas',()=>{
  const s=make();
  for(let n=0;n<10;n++)s.nextItem();
  expect(s.pending.size).toBe(6);
 });
 it('o resultado de um item na faixa inferior é idêntico ao da superior',()=>{
  const s=make();
  const a=draw(s,(i,x)=>!x.isInactive(i)&&i.lane===0),b=draw(s,(i,x)=>!x.isInactive(i)&&i.lane===1);
  expect(s.resolve(a.uid,a,a.category,.3,true).ok||a.needsPrep).toBe(true);
  expect(s.resolve(b.uid,b,b.category,.3,true).ok||b.needsPrep).toBe(true);
 });
});

describe('Desafio 3 — vitória final (Nível 5 + 650 pontos)',()=>{
 /** Leva a sessão ao Nível 4 com 39 acertos para controlar o último acerto. */
 const atLevel4Edge=(score,seed)=>{
  const s=make(seed);hits(s,39);
  expect(s.wave).toBe(4);s.score=score;return s;
 };
 it('não vence com 650+ pontos antes do Nível 5',()=>{
  const s=make('nao5');hits(s,30);
  expect(s.score).toBeGreaterThanOrEqual(650);expect(s.wave).toBe(4);expect(s.won).toBe(false);expect(s.finished).toBe(false);
 });
 it('não vence no Nível 5 com menos de 650 pontos',()=>{
  const s=atLevel4Edge(0,'abaixo');
  hits(s,1);
  expect(s.wave).toBe(5);expect(s.score).toBeLessThan(650);expect(s.won).toBe(false);expect(s.finished).toBe(false);
 });
 it('vence ao atingir Nível 5 e 650 pontos: encerra a partida, sem pausa nem Continuar',()=>{
  const s=atLevel4Edge(640,'vence');
  s.streak=0;hits(s,1);
  expect(s.wave).toBe(5);expect(s.score).toBeGreaterThanOrEqual(650);
  expect(s).toMatchObject({won:true,finished:true,victoryPending:false});
  expect(s.nextItem()).toBe(null);
 });
 it('o resultado traz reason "victory", nível 5, vidas restantes e won',()=>{
  const s=atLevel4Edge(645,'result');
  hits(s,1);
  expect(s.result).toMatchObject({mode:'challenge',challengeId:3,reason:'victory',won:true,level:5});
  expect(s.result.score).toBeGreaterThanOrEqual(650);
  expect(s.result.lives).toBe(3);
 });
 it('vence já no Nível 5 quando o acerto que sobe o nível atinge a meta',()=>{
  const s=atLevel4Edge(640,'exato');
  s.streak=0;hits(s,1);
  expect(s.score).toBe(650);expect(s.won).toBe(true);expect(s.finished).toBe(true);
 });
 it('vence mesmo com poucas vidas, desde que ainda reste uma',()=>{
  const s=atLevel4Edge(650,'vida');
  s.lives=1;hits(s,1);
  expect(s.result).toMatchObject({reason:'victory',won:true,lives:1});
 });
 it('depois da vitória nenhuma ação altera o resultado',()=>{
  const s=atLevel4Edge(650,'depois');hits(s,1);
  const result=s.result;
  expect(s.finish('lives')).toBe(result);
  expect(s.resolve(0,null,'paper')).toMatchObject({reason:'ignored'});
 });
 it('jogando bem do início ao fim, a sessão termina em vitória',()=>{
  const s=make('completo');
  for(let n=0;n<2000&&!s.finished;n++)solve(s);
  expect(s.result).toMatchObject({reason:'victory',won:true,level:5});
 });
});

describe('Desafio 3 — cartão e tela final',()=>{
 it('o card do Desafio 3 começa bloqueado com o requisito do Desafio 2',()=>{
  const html=arcadeIntroHTML([],'Jogador',{unlocked:[1],best:{}},CHALLENGES);
  const d3=cardOf(html,3);
  expect(d3).toContain('disabled');expect(d3).toContain('Desafio 3 • Avançado');
  expect(d3).toContain('Bloqueado (Vença o D2)');expect(d3).toContain('Requisito: Nível 4 + 500 pts no D2');
 });
 it('o Desafio 3 continua bloqueado se só o Desafio 2 estiver liberado',()=>{
  const html=arcadeIntroHTML([],'Jogador',{unlocked:[1,2],best:{}},CHALLENGES);
  expect(cardOf(html,3)).toContain('disabled');
 });
 it('o card libera depois de vencer o Desafio 2 e mostra meta e recorde',()=>{
  const html=arcadeIntroHTML([],'Jogador',{unlocked:[1,2,3],best:{3:480}},CHALLENGES);
  const d3=cardOf(html,3);
  expect(d3).not.toContain('disabled');expect(d3).toContain('Meta: Nível 5 + 650 pts · Recorde 480');
 });
 it('a tela final tem a mensagem exata e só o botão "Voltar ao menu principal"',()=>{
  const s=make('tela');s.score=650;
  const result={...s.finish('victory'),score:650};
  const html=finalVictoryHTML(result,challenge,{position:1},'<div class="journey-medal"></div>');
  expect(FINAL_VICTORY_MESSAGE).toBe('Parabéns, você venceu os 3 desafios!');
  expect(html).toContain('Parabéns, você venceu os 3 desafios!');
  expect(html).toContain('data-action="menu"');expect(html).toContain('Voltar ao menu principal');
  expect(html).not.toContain('Próximo desafio');expect(html).not.toContain('Continuar');
  expect(html.match(/<button/g)).toHaveLength(1);
 });
});

describe('Desafio 3 — viewport compacto com a esteira superior',()=>{
 it('esteira simples mantém o recorte y=260..700',()=>{
  const v=gameViewport(1280,400,true);
  expect(v.scrollY+400/v.zoom).toBeCloseTo(700,5);expect(v.scrollY).toBeCloseTo(260,5);
 });
 it('esteira dupla amplia o recorte para y=220..700',()=>{
  const v=gameViewport(1280,400,true,true);
  expect(v.scrollY).toBeCloseTo(220,5);expect(v.scrollY+400/v.zoom).toBeCloseTo(700,5);
 });
 it('fora do modo compacto nada muda',()=>{
  expect(gameViewport(1280,720,false,true)).toEqual(gameViewport(1280,720,false,false));
 });
});

describe('Desafio 3 — progresso salvo',()=>{
 let memory;
 beforeEach(()=>{memory=new Map();vi.resetModules();vi.stubGlobal('localStorage',{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)});});
 it('o Desafio 3 só existe como liberado depois de vencer o Desafio 2',async()=>{
  const m=await import('../src/systems/challengeProgress.js');
  expect(m.isChallengeUnlocked(3)).toBe(false);
  m.registerChallengeVictory(CHALLENGES[2],520);
  expect(m.isChallengeUnlocked(3)).toBe(true);
  expect(m.loadChallengeProgress().best[2]).toBe(520);
 });
 it('vencer o Desafio 3 guarda o recorde sem liberar nenhum desafio novo',async()=>{
  const m=await import('../src/systems/challengeProgress.js');
  m.registerChallengeVictory(CHALLENGES[2],520);
  const before=m.loadChallengeProgress().unlocked;
  m.registerChallengeVictory(challenge,700);
  expect(m.loadChallengeProgress()).toMatchObject({unlocked:before,best:{2:520,3:700}});
 });
 it('a vitória final entra no ranking local como resultado de desafio',async()=>{
  const lb=await import('../src/systems/leaderboard.js');
  const s=make('rank');s.score=640;hits(s,39);s.score=650;hits(s,1);
  const saved=lb.saveInfiniteResult(s.result,'Lucas');
  expect(saved).toMatchObject({saved:true,position:1});
  expect(lb.loadLeaderboard().entries[0]).toMatchObject({nickname:'Lucas',wave:5});
 });
 it('o ranking rejeita vitória forjada (vidas inconsistentes ou sem vitória)',async()=>{
  const lb=await import('../src/systems/leaderboard.js');
  const s=make('forja');s.score=640;hits(s,39);s.score=650;hits(s,1);
  const real=s.result;
  expect(lb.saveInfiniteResult({...real,lives:2},'A').saved).toBe(false);
  expect(lb.saveInfiniteResult({...real,won:false},'B').saved).toBe(false);
  expect(lb.saveInfiniteResult({...real,reason:'abort'},'C').saved).toBe(false);
  expect(lb.saveInfiniteResult(real,'D').saved).toBe(true);
 });
});
