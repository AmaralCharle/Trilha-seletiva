import Phaser from 'phaser';
import {FactoryScene} from './scenes/FactoryScene.js';
import {CATALOG,LOCAL_NOTICE} from './data/catalog.js';
import {LEVELS} from './config/levels.js';
import {Session,buildDeck} from './systems/session.js';
import {loadProgress,saveAttempt,saveSettings,resetProgress,exportCSV} from './systems/storage.js';
import {ecoPoseSVG,svgURL} from './ui/art.js';
import {ResultFlow} from './systems/ResultFlow.js';
import {InfiniteSession} from './systems/infiniteSession.js';
import {loadLeaderboard,saveInfiniteResult,clearLeaderboard,normalizeNickname,isNicknameTaken} from './systems/leaderboard.js';
import {hearts,arcadeIntroHTML,leaderboardHTML,arcadeResultHTML} from './ui/arcade.js';
import {needsLandscape,isCompactLandscape} from './systems/mobile.js';
import './styles.css';
const ui=document.querySelector('#ui');let progress=loadProgress(),session,currentLevel,review=false,screen='menu',nickname='Jogador',bestBefore=0,recordShown=false,seenWave=1;
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1280,height:720,backgroundColor:'#102f35',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[FactoryScene],render:{antialias:true},input:{activePointers:1}});
const scene=()=>game.scene.getScene('Factory');
const resultFlow=new ResultFlow();let completedRanking=null;
const names={paper:'Papel',plastic:'Plástico',glass:'Vidro',metal:'Metal',reject:'Rejeito'};
const nicknameTakenMessage='Este apelido já está no ranking. Escolha outro nome.';
const eco=(pose='idle')=>`<img class="eco" data-pose="${pose}" src="${svgURL(ecoPoseSVG(pose))}" alt="Eco, robô instrutor">`;
const starPath='M32 4 40.3 21 59 23.7 45.5 36.9 48.7 55.5 32 46.7 15.3 55.5 18.5 36.9 5 23.7 23.7 21Z';
const stars=(count,large=false)=>`<span class="stars${large?' large':''}" role="img" aria-label="${count} de 3 estrelas">${[0,1,2].map(i=>`<svg viewBox="0 0 64 64" aria-hidden="true" class="star ${i<count?'earned':'empty'}" style="--star-index:${i}"><path class="star-edge" d="${starPath}"/><path class="star-face" d="${starPath}"/><path class="star-shine" d="M31 12 35 23 24 24Z"/></svg>`).join('')}</span>`;
const medal=()=>`<div class="journey-medal" aria-hidden="true"><span></span><svg viewBox="0 0 64 64"><path d="${starPath}"/></svg></div>`;
const button=(text,action,cls='')=>`<button class="${cls}" data-action="${action}">${text}</button>`;
const header=()=>`<header><a href="#" data-action="menu" class="brand"><span class="brand-mark">TS</span> TRILHA SELETIVA <small>MISSÃO RECICLAGEM</small></a><nav>${button(progress.settings.sound?'Som ligado':'Som desligado','sound','quiet')}${document.fullscreenEnabled&&document.documentElement.requestFullscreen?button(document.fullscreenElement?'Sair da tela cheia':'Tela cheia','fullscreen','quiet'):''}</nav></header>`;
function render(html){ui.dataset.screen=screen;ui.innerHTML=header()+html;if(progress.notice)toast(progress.notice);syncViewport();}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),4200);}
function fx(key){scene().audio?.playEffect(key);}
function idleScene(){resultFlow.cancel();scene().showMenu();scene().audio?.stopMusic();scene().audio?.resume();}
function beginMusic(key){scene().audio?.setSettings(progress.settings);scene().audio?.resume();scene().audio?.setIntensity(1);scene().audio?.playMusic(key);}
function menu(){screen='menu';session=null;idleScene();progress=loadProgress();render(`<section class="hero menu-v3"><div class="eyebrow"><span></span> CAMPANHA EDUCATIVA + ARCADE</div><h1>Trilha<br><em>Seletiva</em></h1><div class="hero-subtitle">MISSÃO RECICLAGEM · 3.3</div><p>Aprenda na campanha. Supere seus limites no desafio.</p><div class="menu-modes">${button('Jogar campanha','play','primary')}${button('Desafio Infinito','infinite','arcade-primary')}${button('Revisão','review')}${button('Como jogar','help')}</div><div class="infinite-menu-caption">DESAFIO INFINITO — ATÉ ONDE VOCÊ CONSEGUE?</div></section><div class="eco-label"><b>Eco</b><span>Seu parceiro de missão</span></div><footer><span>CENTRAL DE TRIAGEM · CIDADE VIVA</span><div>${button('Minha trilha','map','quiet')}${button('Resultados','stats','quiet')}${button('Ranking local','leaderboard','quiet')}${button('Créditos','credits','quiet')}${button('Configurações','settings','quiet')}</div></footer>`);}
function map(){screen='map';idleScene();progress=loadProgress();render(`<section class="panel wide trail-panel"><div class="eyebrow">CADA ETAPA É UMA NOVA DESCOBERTA</div><h2>Sua trilha para uma cidade viva</h2><p>Conquiste a meta de precisão para abrir o próximo desafio.</p><div class="trail">${LEVELS.map((l,i)=>`<button class="stage ${l.id>progress.unlocked?'locked':l.id===progress.unlocked?'current':'completed'}" style="--stage-index:${i}" data-level="${l.id}" ${l.id>progress.unlocked?'disabled':''}><span class="stage-number">${l.id>progress.unlocked?'×':String(l.id).padStart(2,'0')}</span><b>${l.title}</b><small>${l.count} itens · ${l.time?l.time+'s':'sem relógio'}</small>${stars(progress.stars[l.id]||0)}<span class="stage-status">${l.id>progress.unlocked?'A descobrir':progress.stars[l.id]?'Missão concluída':l.id===progress.unlocked?'Sua próxima missão':'Pronto para jogar'}</span></button>`).join('')}</div><div class="actions">${button('Revisar meus erros','review','primary')}${button('Meu desempenho','stats')}${button('Reiniciar Trilha','reset','danger')}${button('Voltar','menu')}</div></section>`);}
function help(){screen='help';idleScene();render(`<section class="panel"><div class="eyebrow">APRENDA FAZENDO</div><h2>Olá! Eu sou o Eco.</h2><div class="instruction">${eco('guide')}<div><p><b>Olhe, escolha e separe.</b> Arraste o resíduo da esteira até a lixeira. Você também pode clicar no item e depois na lixeira.</p><p>Teclado: <kbd>1</kbd> a <kbd>5</kbd> escolhem a lixeira, <kbd>Tab</kbd> muda o item, <kbd>E</kbd> retira restos e <kbd>Esc</kbd> pausa.</p><p>Acertou três seguidos? Os pontos dobram! Cinco acertos dão +2s nas fases com relógio.</p></div></div><p class="note">${LOCAL_NOTICE}</p><div class="actions">${button('Treinar com o Eco','tutorial','primary')}${button('Ver minha trilha','map')}</div></section>`);}
function start(id,isReview=false,tutorial=false){resultFlow.cancel();currentLevel=LEVELS[id-1];review=isReview;const level={...currentLevel,...(isReview?{id:1,title:'Oficina de revisão',time:null,speed:55,count:12,target:1,categories:Object.keys(names)}:{}),...(tutorial?{count:3,time:null,speed:45,target:1,categories:['paper','plastic']}: {})};let deck=buildDeck(CATALOG,level,progress.history,isReview);if(tutorial)deck=[{...CATALOG.find(i=>i.category==='paper'&&!i.tricky),needsPrep:false},{...CATALOG.find(i=>i.category==='plastic'&&!i.tricky),needsPrep:false},{...CATALOG.find(i=>i.id==='jornal'),needsPrep:false}];session=new Session(level,deck,{review:isReview||tutorial});session.tutorial=tutorial;screen='play';render(`<section class="hud"><div><small>${tutorial?'TREINO COM ECO':isReview?'REVISÃO SEM RELÓGIO':`ETAPA ${id} / 5`}</small><h2>${level.title}</h2></div><div class="hud-stats"><div><small>PONTOS</small><strong id="score">0</strong></div><div><small>SEQUÊNCIA</small><strong id="streak">0</strong></div><div><small>ITENS</small><strong id="count">0 / ${deck.length}</strong></div><div><small>${level.time?'TEMPO':'PRECISÃO'}</small><strong id="timer">${level.time?level.time+'s':'0%'}</strong></div>${button('Pausar','pause')}</div></section><div class="mission"><span>META: ${Math.round(level.target*100)}% DE ACERTOS</span><div><i id="progress-bar"></i></div></div><div class="coach">${eco('guide')}<div><b>ECO · CENTRAL DE TRIAGEM</b><p id="feedback">${tutorial?'Primeiro: selecione o jornal e arraste até PAPEL (azul), ou pressione 1.':'Selecione um item e escolha a lixeira. A sequência começa com você!'}</p></div></div><div class="bottom-controls"><strong id="selected-item" aria-live="polite">Toque em um resíduo</strong><span><kbd>1–5</kbd> separar · <kbd>Tab</kbd> selecionar · <kbd>Esc</kbd> pausar</span>${button('Retirar restos','prepare','small')} ${button('Repetir dica','hint','small')}</div>`);scene().start(session,updateHUD,finish,feedback);beginMusic(isReview?'review':'phase'+id);syncViewport();if(tutorial){session.paused=true;scene().audio?.pause();scene().tweens.pauseAll();dialog('Vamos praticar?','O jornal é papel. Primeiro clique em “Começar treino”; depois arraste o jornal até a lixeira PAPEL. O treino tem três itens e não altera suas estrelas.',[['Começar treino','resume']]);}}
function updateHUD(s){
 if(screen!=='play')return;
 const selected=document.querySelector('#selected-item');if(selected)selected.textContent=scene().selected?.item.name||'Toque em um resíduo';
 const setValue=(id,value,animate=false)=>{const el=document.querySelector('#'+id);if(!el)return;const next=String(value);if(el.textContent!==next){el.textContent=next;if(animate){el.classList.remove('value-pop');void el.offsetWidth;el.classList.add('value-pop');}}};
 setValue('score',s.score,true);setValue('streak',s.streak+(s.streak>=3?' · '+(s.infinite?s.multiplier:2)+'×':''),true);
 if(s.infinite){
  setValue('count',s.resolvedCount);setValue('wave',`Onda ${s.wave} · ${s.difficulty.name}`);
  const lives=document.querySelector('#lives');if(lives.dataset.value!==String(s.lives)){lives.dataset.value=s.lives;lives.innerHTML=hearts(s.lives);lives.classList.remove('life-pulse');void lives.offsetWidth;lives.classList.add('life-pulse');}
  document.querySelector('#progress-bar').style.width=(s.resolvedCount%10*10)+'%';
  document.querySelector('#wave-goal').textContent=`${10-s.resolvedCount%10} ITENS PARA A PRÓXIMA ONDA`;
  if(s.wave!==seenWave){seenWave=s.wave;fx('wave');scene().audio?.setIntensity(s.wave);waveBanner(`ONDA ${s.wave} · ${s.difficulty.name}`);feedback(true,'Nova onda! Observe os materiais e mantenha seu ritmo.','guide');}
  if(!recordShown&&s.score>bestBefore){recordShown=true;fx('record');waveBanner('NOVO RECORDE!');feedback(true,'Novo recorde pessoal! Cada resíduo conta.','happy');}
 }else{
  setValue('count',`${s.resolved.size} / ${s.deck.length}`);
  setValue('timer',s.remaining==null?Math.round(s.correct/s.deck.length*100)+'%':Math.ceil(s.remaining)+'s',s.remaining!=null);
  document.querySelector('#timer').classList.toggle('urgent',s.remaining!=null&&s.remaining<=10);
  document.querySelector('#progress-bar').style.width=(s.resolved.size/s.deck.length*100)+'%';
 }
}
function waveBanner(text){const el=document.querySelector('#wave-banner');if(!el)return;el.textContent=text;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}

function feedback(ok,text,pose=ok?'happy':'error'){if(screen!=='play')return;document.querySelector('#feedback').textContent=text;const coach=document.querySelector('.coach');coach.classList.toggle('error',!ok);coach.classList.remove('react');void coach.offsetWidth;coach.classList.add('react');const mascot=coach.querySelector('.eco');mascot.src=svgURL(ecoPoseSVG(pose));mascot.dataset.pose=pose;}
function finish(result){
 const ended=session;
 resultFlow.start(ended,{
  defeat:ended.infinite||!result.pass,
  onStart:()=>{
   if(ended.infinite)completedRanking=saveInfiniteResult(result,nickname);
   else if(!ended.tutorial)progress=saveAttempt(result);
   scene().audio?.playMusic(ended.infinite||!result.pass?'gameover':'victory');
   if(!ended.infinite&&result.pass&&!review&&!ended.tutorial&&currentLevel.id<5)fx('unlock');
  },
  onIntro:done=>defeatIntro(result,done),
  onResult:()=>{if(session!==ended)return;ended.infinite?finishInfinite(result):finishCampaign(result);}
 });
}
function defeatIntro(result,done){
 screen='result-intro';
 const title=session.infinite?'GAME OVER':result.reason==='time'?'TEMPO ESGOTADO!':'DESAFIO NÃO CONCLUÍDO!';
 const text=session.infinite?'A central de reciclagem encerrou as operações!':result.reason==='time'?'O tempo acabou! Vamos tentar novamente?':'Você precisa melhorar sua precisão para avançar.';
 render(`<section class="defeat-intro" role="status"><div class="shutdown-mark"><span></span> OPERAÇÃO ENCERRADA</div>${eco('error')}<h2>${title}</h2><p>${text}</p>${button('Pular animação','skipResult','small')}</section>`);
 document.querySelector('[data-action=skipResult]')?.focus();
 return scene().presentDefeat(done);
}
function finishCampaign(result){
 screen='result';const tutorial=session.tutorial;render(`<section class="panel result ${result.pass?'victory':'try-again'}"><div class="eyebrow">${tutorial?'PRÁTICA CONCLUÍDA':review?'OFICINA DE REVISÃO':'RELATÓRIO DA MISSÃO'}</div><div class="result-award">${stars(result.stars,true)}</div><h2>${result.pass?'Mandou bem, agente!':result.reason==='time'?'TEMPO ESGOTADO!':'DESAFIO NÃO CONCLUÍDO!'}</h2><p>${result.pass?'Você deu um novo destino aos materiais.':result.reason==='time'?'O tempo acabou! Vamos tentar novamente?':'Você precisa melhorar sua precisão para avançar.'}</p><div class="result-grid"><div><strong>${Math.round(result.precision*100)}%</strong><small>precisão</small></div><div><strong>${result.correct}/${result.total}</strong><small>acertos</small></div><div><strong>${result.score}</strong><small>pontos</small></div><div><strong>${result.missed}</strong><small>perdidos</small></div></div><p class="note">${Object.entries(result.errorsByCategory).filter(([,v])=>v).map(([k,v])=>`${names[k]||k}: ${v} erro(s)`).join(' · ')||'Sem erros de classificação.'}</p>${!result.pass?`<p class="educational-tip">${CATALOG.find(i=>i.id===Object.entries(result.errorsByItem||{}).sort((a,b)=>b[1]-a[1])[0]?.[0])?.tip||'Observe o nome e o material antes de escolher o destino.'}</p>`:''}<p>Você praticou: ${session.level.categories.map(k=>names[k].toLowerCase()).join(', ')}. Embalagens devem ficar sem restos; consulte a coleta do seu município.</p><div class="actions">${button(tutorial?'Começar etapa 1':'Tentar novamente',tutorial?'level1':'retry','primary')}${result.pass&&!tutorial&&!review&&currentLevel.id<5?button('Próxima etapa','next'):''}${result.pass&&currentLevel.id===5&&!review?button('Concluir jornada','final','primary'):''}${button('Voltar ao mapa de fases','map')}${!result.pass?button('Menu principal','menu'):''}</div></section>`);}
function stats(final=false){screen='stats';idleScene();progress=loadProgress();const h=progress.history,first=h[0],last=h.at(-1),errors={};h.forEach(r=>Object.entries(r.errorsByItem||{}).forEach(([id,n])=>errors[id]=(errors[id]||0)+n));const difficulties=Object.entries(errors).sort((a,b)=>b[1]-a[1]).slice(0,5);render(`<section class="panel wide ${final?'journey-complete':'stats-panel'}">${final?medal():''}<div class="eyebrow">${final?'JORNADA CONCLUÍDA':'SEU PROGRESSO FICA NESTE NAVEGADOR'}</div><h2>${final?'Missão cumprida, agente da mudança!':'Aprender também é olhar para o caminho.'}</h2>${final?'<p class="final-message">Cinco etapas. Muitos novos destinos. Leve esse cuidado para a sua cidade.</p>':''}<div class="result-grid"><div><strong>${h.length}</strong><small>tentativas</small></div><div><strong>${first?Math.round(first.precision*100)+'%':'—'}</strong><small>primeira tentativa</small></div><div><strong>${last?Math.round(last.precision*100)+'%':'—'}</strong><small>última tentativa</small></div><div><strong>${Object.values(progress.stars).reduce((a,b)=>a+b,0)}/15</strong><small>estrelas</small></div></div><p>Para revisar: ${difficulties.length?difficulties.map(([id,n])=>`${CATALOG.find(i=>i.id===id)?.name||id} (${n})`).join(' · '):'nenhum erro registrado ainda.'}</p><div class="comparison"><table><thead><tr><th>Etapa</th><th>Primeira</th><th>Última</th><th>Erros antes / agora</th><th>Domínio</th></tr></thead><tbody>${[1,2,3,4,5,'review'].map(id=>{const attempts=h.filter(r=>id==='review'?r.review:!r.review&&r.level===id),a=attempts[0],b=attempts.at(-1);return `<tr><td>${id==='review'?'Revisão':id}</td><td>${a?Math.round(a.precision*100)+'%':'—'}</td><td>${b?Math.round(b.precision*100)+'%':'—'}</td><td>${a?(a.wrong+a.missed)+' / '+(b.wrong+b.missed):'—'}</td><td>${b?(b.precision===1?'Consolidado':b.pass?'Em prática':'Revisar'):'A descobrir'}</td></tr>`;}).join('')}</tbody></table></div><div class="history">${h.slice(-6).reverse().map(r=>`<div><span>${r.review?'Revisão':'Etapa '+r.level}</span><b>${Math.round(r.precision*100)}% de precisão</b><span>${r.wrong+r.missed} erros · ${r.errorsPerMinute.toFixed(1)} / min</span></div>`).join('')}</div><p class="note">Comparações são descritivas; fases diferentes têm dificuldades diferentes. Melhora de aprendizagem depende de teste externo.</p><div class="actions">${button('Exportar CSV','export','primary')}${button('Revisar meus erros','review')}${button('Minha trilha','map')}</div></section>`);}
function settings(){screen='settings';idleScene();render(`<section class="panel audio-settings"><h2>Do seu jeito</h2><p>Sete trilhas originais, uma para cada fase, revisão e desafio. Sons começam após sua interação.</p><label for="music-volume">Música <input id="music-volume" type="range" min="0" max="1" step="0.01" value="${progress.settings.musicVolume}"><output id="music-value">${Math.round(progress.settings.musicVolume*100)}%</output></label><label for="effects-volume">Efeitos <input id="effects-volume" type="range" min="0" max="1" step="0.01" value="${progress.settings.effectsVolume}"><output id="effects-value">${Math.round(progress.settings.effectsVolume*100)}%</output></label><div class="actions">${button(progress.settings.sound?'Desligar sons':'Ligar sons','sound')}${button('Ouvir amostra','sampleMusic')}${button('Voltar','menu','primary')}</div><hr><p>Recomeçar apaga estrelas e histórico da campanha neste navegador. O ranking local permanece separado.</p><div class="actions">${button('Repetir tutorial','tutorial')}${button('Reiniciar Trilha','reset','danger')}</div></section>`);}
function credits(){screen='credits';idleScene();render(`<section class="panel"><h2>Feito para transformar</h2><p>Trilha Seletiva · Missão Reciclagem<br>Desafio P2 · Desenvolvimento de Jogos Digitais</p><p>Reconstrução em Phaser 3.90, JavaScript e Vite com assistência de IA (Codex/OpenAI). Cenário, robô e ilustrações vetoriais originais gerados em código. Sete músicas de modo, duas vinhetas de resultado e doze efeitos originais sintetizados em arquivos locais, com fonte reprodutível em tools/generate-audio.mjs. Sem downloads durante a partida.</p><p>Conteúdo: orientações oficiais de coleta seletiva de Vinhedo, USP e referências registradas em docs/CREDITOS.md. Classificação simplificada: a aceitação varia entre municípios.</p><p>Integrantes e matrículas: pendentes de preenchimento pelo grupo.</p>${button('Voltar à missão','menu','primary')}</section>`);}
function dialog(title,text,actions){document.querySelector('#modal')?.remove();const el=document.createElement('div');el.id='modal';el.className='modal';el.innerHTML=`<section class="panel" role="dialog" aria-modal="true" aria-label="${title}"><h2>${title}</h2><p>${text}</p><div class="actions">${actions.map(([t,a])=>button(t,a,a==='resume'?'primary':'')).join('')}</div></section>`;ui.append(el);el.querySelector('button').focus();}
function pause(){if(screen!=='play'||session.paused)return;scene().cancelDrag();session.paused=true;scene().audio?.pause();scene().tweens.pauseAll();dialog('Uma pausa para respirar','A esteira e o relógio estão parados. Sua missão espera por você.',[['Continuar','resume'],[session.infinite?'Reiniciar desafio':'Reiniciar fase','restart'],[session.infinite?'Voltar ao menu':'Voltar à trilha','abandon'],[progress.settings.sound?'Desligar sons':'Ligar sons','pauseSound'],...(document.fullscreenEnabled?[[document.fullscreenElement?'Sair da tela cheia':'Tela cheia','fullscreen']]:[])]);}
function resume(){if(needsLandscape(window.innerWidth,window.innerHeight)){toast('Gire o aparelho para continuar a missão.');return;}document.querySelector('#modal')?.remove();if(session){session.paused=false;scene().tweens.resumeAll();scene().audio?.resume();}}
function validateNickname(input=document.querySelector('#nickname')){
 if(!input)return !isNicknameTaken(nickname);
 const taken=isNicknameTaken(input.value);
 const message=document.querySelector('#nickname-error');
 if(message){message.textContent=taken?nicknameTakenMessage:'';message.hidden=!taken;}
 input.setAttribute('aria-invalid',String(taken));
 const begin=document.querySelector('[data-action="beginInfinite"]');
 if(begin)begin.disabled=taken;
 return !taken;
}
function infiniteIntro(){screen='arcade';session=null;idleScene();const rank=loadLeaderboard();render(arcadeIntroHTML(rank.entries,nickname));validateNickname();if(rank.notice)toast(rank.notice);}
function startInfinite(){
 const input=document.querySelector('#nickname');
 const chosenNickname=normalizeNickname(input?.value??nickname);
 if(isNicknameTaken(chosenNickname)){
  if(input){validateNickname(input);input.focus();}
  else infiniteIntro();
  return;
 }
 resultFlow.cancel();nickname=chosenNickname;
 progress=loadProgress();bestBefore=loadLeaderboard().entries[0]?.score??0;recordShown=false;seenWave=1;
 session=new InfiniteSession(CATALOG);currentLevel=null;review=false;screen='play';
 render(`<section class="hud infinite-hud"><div><small>DESAFIO INFINITO</small><h2 id="wave">Onda 1 · Iniciante</h2></div><div class="hud-stats"><div><small>PONTOS</small><strong id="score">0</strong></div><div><small>COMBO</small><strong id="streak">0</strong></div><div><small>RESOLVIDOS</small><strong id="count">0</strong></div><div><small>VIDAS</small><span id="lives" data-value="3">${hearts(3)}</span></div>${button('Pausar','pause')}</div></section><div class="mission"><span id="wave-goal">10 ITENS PARA A PRÓXIMA ONDA</span><div><i id="progress-bar"></i></div></div><div id="wave-banner" role="status" aria-live="polite"></div><div class="coach">${eco('guide')}<div><b>ECO · CENTRAL DE TRIAGEM</b><p id="feedback">Três vidas, cinco destinos. Vamos construir sua melhor sequência!</p></div></div><div class="bottom-controls"><strong id="selected-item" aria-live="polite">Toque em um resíduo</strong><span><kbd>1–5</kbd> separar · <kbd>Tab</kbd> selecionar · <kbd>Esc</kbd> pausar</span>${button('Retirar restos','prepare','small')}${button('Repetir dica','hint','small')}</div>`);
 scene().start(session,updateHUD,finish,feedback);beginMusic('infinite');syncViewport();
}
function finishInfinite(result){
 const ranking=completedRanking;screen='arcade-result';
 render(arcadeResultHTML(result,ranking,ranking.newRecord?medal():eco('error')));if(ranking.notice)toast(ranking.notice);
}
function leaderboard(){screen='leaderboard';session=null;idleScene();const ranking=loadLeaderboard();render(leaderboardHTML(ranking.entries));if(ranking.notice)toast(ranking.notice);}
const actions={
 skipResult:()=>resultFlow.skip(),menu:()=>{if(screen==='play'){pause();return;}menu();},play:()=>progress.history.length?map():help(),map,help,
 tutorial:()=>start(1,false,true),level1:()=>start(1),retry:()=>start(currentLevel.id,review,session.tutorial),next:()=>start(currentLevel.id+1),review:()=>start(1,true),stats:()=>stats(),final:()=>stats(true),credits,settings,pause,resume,
 infinite:infiniteIntro,beginInfinite:startInfinite,retryInfinite:startInfinite,leaderboard,
 restart:()=>session.infinite?startInfinite():start(currentLevel.id,review,session.tutorial),
 abandon:()=>{const arcade=session?.infinite;session?.finish('abort');session=null;arcade?menu():map();},
 prepare:()=>scene().prepare(),hint:()=>feedback(true,'Arraste para a lixeira com o nome do material. Se houver RESTOS, use Retirar restos primeiro. Vidro não inclui espelho ou cerâmica. Consulte as regras locais.','guide'),
 sound:()=>{progress=saveSettings({...progress.settings,sound:!progress.settings.sound});scene().audio?.setSettings(progress.settings);fx('select');if(screen==='settings')settings();else document.querySelector('[data-action="sound"]').textContent=progress.settings.sound?'Som ligado':'Som desligado';},
 pauseSound:()=>{actions.sound();document.querySelector('[data-action=pauseSound]').textContent=progress.settings.sound?'Desligar sons':'Ligar sons';},
 sampleMusic:()=>{beginMusic('review');toast('Amostra da oficina de revisão. Ajuste os volumes acima.');},
 fullscreen:()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>toast('Tela cheia não disponível neste navegador.'));else document.exitFullscreen?.();},
 export:()=>{const blob=new Blob([exportCSV(progress.history)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='trilha-seletiva-resultados.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},
 clearRanking:()=>dialog('Limpar os recordes?','Somente as dez marcas do Desafio Infinito serão removidas. Sua campanha será preservada.',[['Cancelar','leaderboard'],['Limpar recordes','confirmClearRanking']]),
 confirmClearRanking:()=>{clearLeaderboard();leaderboard();},
 reset:()=>dialog('REINICIAR SUA JORNADA?','Todas as fases serão bloqueadas novamente e seu progresso na campanha será apagado. Você começará pela primeira fase. Deseja continuar?',[['CANCELAR','cancelReset'],['SIM, REINICIAR','confirmReset']]),
 cancelReset:()=>{document.querySelector('#modal')?.remove();document.querySelector('[data-action=reset]')?.focus();},
 confirmReset:()=>{resultFlow.cancel();session=null;progress=resetProgress();scene().audio?.setSettings(progress.settings);map();toast('Trilha reiniciada! Sua jornada começa na primeira fase.');}
};
ui.addEventListener('click',e=>{scene().audio?.unlock();const a=e.target.closest('[data-action]');if(a){e.preventDefault();actions[a.dataset.action]?.();}const l=e.target.closest('[data-level]');if(l&&!l.disabled)start(Number(l.dataset.level));});
ui.addEventListener('input',e=>{if(e.target.id==='nickname'){validateNickname(e.target);return;}const keys={'music-volume':'musicVolume','effects-volume':'effectsVolume'},key=keys[e.target.id];if(key){progress=saveSettings({...progress.settings,[key]:Number(e.target.value)});scene().audio?.setSettings(progress.settings);document.querySelector(key==='musicVolume'?'#music-value':'#effects-value').textContent=Math.round(Number(e.target.value)*100)+'%';}});
window.addEventListener('keydown',e=>{const modal=document.querySelector('#modal');if(modal&&e.key==='Tab'){const controls=[...modal.querySelectorAll('button,input,a')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}if(screen==='result-intro'&&['Escape','Enter',' '].includes(e.key)){e.preventDefault();resultFlow.skip();return;}if(e.key==='Escape'&&document.querySelector('#modal')&&screen!=='play'){actions.cancelReset();return;}if(e.key==='Escape'&&screen==='play'){session.paused?resume():pause();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',()=>pause());
window.addEventListener('pagehide',()=>pause());
let viewportFrame;
function syncViewport(){
 const viewportHeight=window.visualViewport?.height||window.innerHeight;
 document.documentElement.style.setProperty('--viewport-height',viewportHeight+'px');
 const portrait=needsLandscape(window.innerWidth,window.innerHeight);
 const playing=screen==='play';
 document.body.classList.toggle('playing',playing);
 const compact=playing&&isCompactLandscape(window.innerWidth,viewportHeight);
 document.body.classList.toggle('compact-play',compact);
 const coach=ui.querySelector('.coach'),controls=ui.querySelector('.bottom-controls');
 if(coach&&controls){
  if(compact&&coach.parentElement!==controls)controls.insertBefore(coach,controls.querySelector('button'));
  else if(!compact&&coach.parentElement===controls)ui.insertBefore(coach,controls);
 }
 const frame=document.querySelector('#game').getBoundingClientRect();
 const width=compact?Math.round(frame.width):1280,height=compact?Math.round(frame.height):720;
 if(game.scale.gameSize.width!==width||game.scale.gameSize.height!==height)game.scale.setGameSize(width,height);
 game.scale.refresh();
 if(scene()?.ready){
  scene().layoutViewport(width,height,compact);
 }
 const rotate=document.querySelector('#rotate-notice');
 rotate.hidden=!(playing&&portrait);
 if(playing&&portrait)pause();
}
function viewportChanged(){cancelAnimationFrame(viewportFrame);viewportFrame=requestAnimationFrame(()=>{syncViewport();scene().cancelDrag?.();game.scale.refresh();});}
window.addEventListener('resize',viewportChanged);
document.addEventListener('fullscreenchange',()=>{const b=document.querySelector('[data-action=fullscreen]');if(b)b.textContent=document.fullscreenElement?'Sair da tela cheia':'Tela cheia';viewportChanged();});
window.visualViewport?.addEventListener('resize',viewportChanged);
window.addEventListener('orientationchange',viewportChanged);
window.addEventListener('factory-ready',()=>{scene().audio?.setSettings(progress.settings);menu();});
window.addEventListener('asset-error',()=>toast('Uma ilustração não carregou. Recarregue o jogo para tentar novamente.'));
window.addEventListener('audio-error',e=>toast(e.detail||'Um áudio não carregou. Você pode continuar com o retorno visual.'));
