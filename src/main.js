import Phaser from 'phaser';
import {FactoryScene} from './scenes/FactoryScene.js';
import {CATALOG,LOCAL_NOTICE} from './data/catalog.js';
import {LEVELS,BINS} from './config/levels.js';
import {Session,buildDeck} from './systems/session.js';
import {loadProgress,saveAttempt,saveSettings,resetProgress,exportCSV} from './systems/storage.js';
import {ecoPoseSVG,itemSVG,binBodySVG,svgURL} from './ui/art.js';
import {ResultFlow} from './systems/ResultFlow.js';
import {InfiniteSession,ChallengeSession} from './systems/infiniteSession.js';
import {CHALLENGES,getChallenge} from './config/infinite.js';
import {loadChallengeProgress,registerChallengeVictory,saveChallengeScore} from './systems/challengeProgress.js';
import {loadLeaderboard,saveInfiniteResult,saveNicknameProgress,clearLeaderboard,normalizeNickname,findNicknameProfile} from './systems/leaderboard.js';
import {escapeHTML,hearts,arcadeIntroHTML,leaderboardHTML,arcadeResultHTML,challengeResultHTML,finalVictoryHTML} from './ui/arcade.js';
import {needsLandscape,isCompactLandscape} from './systems/mobile.js';
import './styles.css';
const ui=document.querySelector('#ui');let progress=loadProgress(),session,currentLevel,review=false,screen='menu',mapReturnScreen='menu',reviewReturnScreen='menu',statsReturnScreen='menu',leaderboardReturnScreen='menu',showWasteCatalogGuide=false,nickname='Jogador',bestBefore=0,recordShown=false,seenWave=1,pendingNicknameRestart=null;
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:1280,height:720,backgroundColor:'#102f35',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[FactoryScene],render:{antialias:true},input:{activePointers:1}});
const scene=()=>game.scene.getScene('Factory');
const resultFlow=new ResultFlow();let completedRanking=null;
const names={paper:'Papel',plastic:'Plástico',glass:'Vidro',metal:'Metal',reject:'Rejeito'};
const guideCategories=['paper','plastic','glass','metal','reject'];
const binColorNames={paper:'azul',plastic:'vermelha',glass:'verde',metal:'amarela',reject:'cinza'};
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
function map(){if(screen==='menu')mapReturnScreen='menu';screen='map';idleScene();progress=loadProgress();render(`<section class="panel wide trail-panel"><div class="eyebrow">CADA ETAPA É UMA NOVA DESCOBERTA</div><h2>Sua trilha para uma cidade viva</h2><p>Conquiste a meta de precisão para abrir o próximo desafio.</p><div class="trail">${LEVELS.map((l,i)=>`<button class="stage ${l.id>progress.unlocked?'locked':l.id===progress.unlocked?'current':'completed'}" style="--stage-index:${i}" data-level="${l.id}" ${l.id>progress.unlocked?'disabled':''}><span class="stage-number">${l.id>progress.unlocked?'×':String(l.id).padStart(2,'0')}</span><b>${l.title}</b><small>${l.count} itens · ${l.time?l.time+'s':'sem relógio'}</small>${stars(progress.stars[l.id]||0)}<span class="stage-status">${l.id>progress.unlocked?'A descobrir':progress.stars[l.id]?'Missão concluída':l.id===progress.unlocked?'Sua próxima missão':'Pronto para jogar'}</span></button>`).join('')}</div><div class="actions">${button('Revisar meus erros','review','primary')}${button('Meu desempenho','stats')}${button('Reiniciar Trilha','reset','danger')}${button('Voltar','mapBack')}</div></section>`);}
function helpGuideHTML(){return `<section class="help-guide" aria-labelledby="help-guide-title"><div class="help-guide-intro"><h3 id="help-guide-title">Guia visual dos resíduos</h3><p>Veja o destino de cada material. A aceitação pode variar conforme a coleta local.</p></div>${guideCategories.map(category=>{const bin=BINS[category],items=CATALOG.filter(item=>item.category===category);return `<section class="help-guide-group" data-guide-category="${category}" style="--guide-bin-color:${bin.color}" aria-labelledby="help-guide-${category}"><div class="help-guide-heading"><span class="help-guide-bin-symbol" aria-hidden="true">${escapeHTML(bin.symbol)}</span><img class="help-guide-bin-image" src="${svgURL(binBodySVG(category))}" alt=""><div><h4 id="help-guide-${category}">${escapeHTML(bin.name)}</h4><span class="help-guide-color">Lixeira ${binColorNames[category]}</span></div></div><ul class="help-guide-items">${items.map(item=>`<li class="help-guide-item" data-guide-item="${item.id}"><img class="help-guide-item-image" src="${svgURL(itemSVG(item.id))}" alt="${escapeHTML(item.name)}"><div class="help-guide-item-content"><div class="help-guide-item-meta"><strong>${escapeHTML(item.name)}</strong><span>Lixeira ${escapeHTML(bin.name)}</span></div><p>${escapeHTML(item.tip)}</p></div></li>`).join('')}</ul></section>`;}).join('')}</section>`;}
function returnToReviewOrigin(){if(reviewReturnScreen==='map')map();else menu();}
function help(showGuide=false){showWasteCatalogGuide=showGuide;mapReturnScreen='help';screen='help';idleScene();render(`<section class="panel help-panel"><div class="eyebrow">APRENDA FAZENDO</div><h2>Olá! Eu sou o Eco.</h2><div class="instruction">${eco('guide')}<div><p><b>Olhe, escolha e separe.</b> Arraste o resíduo da esteira até a lixeira. Você também pode clicar no item e depois na lixeira.</p><p>Teclado: <kbd>1</kbd> a <kbd>5</kbd> escolhem a lixeira, <kbd>Tab</kbd> muda o item, <kbd>E</kbd> retira restos e <kbd>Esc</kbd> pausa.</p><p>Acertou três seguidos? Os pontos dobram! Cinco acertos dão +2s nas fases com relógio.</p></div></div><p class="note">${LOCAL_NOTICE}</p><div class="actions help-actions">${button('Treinar com o Eco','tutorial','primary')}${button('Ver minha trilha','map')}${button('Voltar','menu')}</div>${showWasteCatalogGuide?helpGuideHTML():''}</section>`);}
function start(id,isReview=false,tutorial=false){resultFlow.cancel();currentLevel=LEVELS[id-1];review=isReview;const level={...currentLevel,...(isReview?{id:1,title:'Oficina de revisão',time:null,speed:55,count:12,target:1,categories:Object.keys(names)}:{}),...(tutorial?{count:3,time:null,speed:45,target:1,categories:['paper','plastic']}: {})};let deck=buildDeck(CATALOG,level,progress.history,isReview);if(tutorial)deck=[{...CATALOG.find(i=>i.category==='paper'&&!i.tricky),needsPrep:false},{...CATALOG.find(i=>i.category==='plastic'&&!i.tricky),needsPrep:false},{...CATALOG.find(i=>i.id==='jornal'),needsPrep:false}];session=new Session(level,deck,{review:isReview||tutorial});session.tutorial=tutorial;screen='play';render(`<section class="hud"><div><small>${tutorial?'TREINO COM ECO':isReview?'REVISÃO SEM RELÓGIO':`ETAPA ${id} / 5`}</small><h2>${level.title}</h2></div><div class="hud-stats"><div><small>PONTOS</small><strong id="score">0</strong></div><div><small>SEQUÊNCIA</small><strong id="streak">0</strong></div><div><small>ITENS</small><strong id="count">0 / ${deck.length}</strong></div><div><small>${level.time?'TEMPO':'PRECISÃO'}</small><strong id="timer">${level.time?level.time+'s':'0%'}</strong></div>${button('Pausar','pause')}</div></section><div class="mission"><span>META: ${Math.round(level.target*100)}% DE ACERTOS</span><div><i id="progress-bar"></i></div></div><div class="coach">${eco('guide')}<div><b>ECO · CENTRAL DE TRIAGEM</b><p id="feedback">${tutorial?'Primeiro: selecione o jornal e arraste até PAPEL (azul), ou pressione 1.':'Selecione um item e escolha a lixeira. A sequência começa com você!'}</p></div></div><div class="bottom-controls"><strong id="selected-item" aria-live="polite">Toque em um resíduo</strong><span><kbd>1–5</kbd> separar · <kbd>Tab</kbd> selecionar · <kbd>Esc</kbd> pausar</span>${button('Retirar restos','prepare','small')} ${button('Repetir dica','hint','small')}</div>`);scene().start(session,updateHUD,finish,feedback);beginMusic(isReview?'review':'phase'+id);syncViewport();if(tutorial){session.paused=true;scene().audio?.pause();scene().tweens.pauseAll();dialog('Vamos praticar?','O jornal é papel. Primeiro clique em “Começar treino”; depois arraste o jornal até a lixeira PAPEL. O treino tem três itens e não altera suas estrelas.',[['Começar treino','resume']]);}}
function updateHUD(s){
 if(screen!=='play')return;
 const selected=document.querySelector('#selected-item');if(selected)selected.textContent=scene().selected?.item.name||'Toque em um resíduo';
 const setValue=(id,value,animate=false)=>{const el=document.querySelector('#'+id);if(!el)return;const next=String(value);if(el.textContent!==next){el.textContent=next;if(animate){el.classList.remove('value-pop');void el.offsetWidth;el.classList.add('value-pop');}}};
 setValue('score',s.score,true);setValue('streak',s.streak+(s.streak>=3?' · '+(s.infinite?s.multiplier:2)+'×':''),true);
 if(s.challenge){updateChallengeHUD(s);return;}
 if(s.infinite){
  setValue('count',s.resolvedCount);setValue('wave',`Onda ${s.wave} · ${s.difficulty.name}`);
  updateLives(s);
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
  defeat:(ended.infinite&&result.reason!=='victory')||(!ended.infinite&&!result.pass),
  onStart:()=>{
   if(ended.infinite)completedRanking=saveInfiniteResult({
    ...result,
    challengeId:ended.challengeId??result.challengeId??1,
    wave:result.wave??ended.wave,
    level:result.level??ended.wave??result.wave,
   },nickname);
   if(ended.challenge)saveChallengeScore(ended.challenge.id,result.score);
   else if(!ended.tutorial)progress=saveAttempt(result);
   scene().audio?.playMusic((ended.infinite&&result.reason!=='victory')||(!ended.infinite&&!result.pass)?'gameover':'victory');
   if(result.reason==='victory')fx('victory');
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
function stats(final=false){statsReturnScreen=screen==='map'?'map':'menu';screen='stats';idleScene();progress=loadProgress();const h=progress.history,first=h[0],last=h.at(-1),errors={};h.forEach(r=>Object.entries(r.errorsByItem||{}).forEach(([id,n])=>errors[id]=(errors[id]||0)+n));const difficulties=Object.entries(errors).sort((a,b)=>b[1]-a[1]).slice(0,5);render(`<section class="panel wide ${final?'journey-complete':'stats-panel'}">${final?medal():''}<div class="eyebrow">${final?'JORNADA CONCLUÍDA':'SEU PROGRESSO FICA NESTE NAVEGADOR'}</div><h2>${final?'Missão cumprida, agente da mudança!':'Aprender também é olhar para o caminho.'}</h2>${final?'<p class="final-message">Cinco etapas. Muitos novos destinos. Leve esse cuidado para a sua cidade.</p>':''}<div class="result-grid"><div><strong>${h.length}</strong><small>tentativas</small></div><div><strong>${first?Math.round(first.precision*100)+'%':'—'}</strong><small>primeira tentativa</small></div><div><strong>${last?Math.round(last.precision*100)+'%':'—'}</strong><small>última tentativa</small></div><div><strong>${Object.values(progress.stars).reduce((a,b)=>a+b,0)}/15</strong><small>estrelas</small></div></div><p>Para revisar: ${difficulties.length?difficulties.map(([id,n])=>`${CATALOG.find(i=>i.id===id)?.name||id} (${n})`).join(' · '):'nenhum erro registrado ainda.'}</p><div class="comparison"><table><thead><tr><th>Etapa</th><th>Primeira</th><th>Última</th><th>Erros antes / agora</th><th>Domínio</th></tr></thead><tbody>${[1,2,3,4,5,'review'].map(id=>{const attempts=h.filter(r=>id==='review'?r.review:!r.review&&r.level===id),a=attempts[0],b=attempts.at(-1);return `<tr><td>${id==='review'?'Revisão':id}</td><td>${a?Math.round(a.precision*100)+'%':'—'}</td><td>${b?Math.round(b.precision*100)+'%':'—'}</td><td>${a?(a.wrong+a.missed)+' / '+(b.wrong+b.missed):'—'}</td><td>${b?(b.precision===1?'Consolidado':b.pass?'Em prática':'Revisar'):'A descobrir'}</td></tr>`;}).join('')}</tbody></table></div><div class="history">${h.slice(-6).reverse().map(r=>`<div><span>${r.review?'Revisão':'Etapa '+r.level}</span><b>${Math.round(r.precision*100)}% de precisão</b><span>${r.wrong+r.missed} erros · ${r.errorsPerMinute.toFixed(1)} / min</span></div>`).join('')}</div><p class="note">Comparações são descritivas; fases diferentes têm dificuldades diferentes. Melhora de aprendizagem depende de teste externo.</p><div class="actions">${button('Exportar CSV','export','primary')}${button('Revisar meus erros','review')}${button('Minha trilha','map')}${button('Voltar','statsBack')}</div></section>`);}
function settings(){screen='settings';idleScene();render(`<section class="panel audio-settings"><h2>Do seu jeito</h2><p>Sete trilhas originais, uma para cada fase, revisão e desafio. Sons começam após sua interação.</p><label for="music-volume">Música <input id="music-volume" type="range" min="0" max="1" step="0.01" value="${progress.settings.musicVolume}"><output id="music-value">${Math.round(progress.settings.musicVolume*100)}%</output></label><label for="effects-volume">Efeitos <input id="effects-volume" type="range" min="0" max="1" step="0.01" value="${progress.settings.effectsVolume}"><output id="effects-value">${Math.round(progress.settings.effectsVolume*100)}%</output></label><div class="actions">${button(progress.settings.sound?'Desligar sons':'Ligar sons','sound')}${button('Ouvir amostra','sampleMusic')}${button('Voltar','menu','primary')}</div><hr><p>Recomeçar apaga estrelas e histórico da campanha neste navegador. O ranking local permanece separado.</p><div class="actions">${button('Repetir tutorial','tutorial')}${button('Reiniciar Trilha','reset','danger')}</div></section>`);}
function credits(){screen='credits';idleScene();render(`<section class="panel"><h2>Feito para transformar</h2><p>Trilha Seletiva · Missão Reciclagem<br>Desafio P2 · Desenvolvimento de Jogos Digitais</p><p>Reconstrução em Phaser 3.90, JavaScript e Vite com assistência de IA (Codex/OpenAI). Cenário, robô e ilustrações vetoriais originais gerados em código. Sete músicas de modo, duas vinhetas de resultado e doze efeitos originais sintetizados em arquivos locais, com fonte reprodutível em tools/generate-audio.mjs. Sem downloads durante a partida.</p><p>Conteúdo: orientações oficiais de coleta seletiva de Vinhedo, USP e referências registradas em docs/CREDITOS.md. Classificação simplificada: a aceitação varia entre municípios.</p><p>Integrantes e matrículas: pendentes de preenchimento pelo grupo.</p>${button('Voltar à missão','menu','primary')}</section>`);}
function dialog(title,text,actions){document.querySelector('#modal')?.remove();const el=document.createElement('div');el.id='modal';el.className='modal';el.innerHTML=`<section class="panel" role="dialog" aria-modal="true" aria-label="${title}"><h2>${title}</h2><p>${text}</p><div class="actions">${actions.map(([t,a,cls])=>button(t,a,cls??(a==='resume'?'primary':''))).join('')}</div></section>`;ui.append(el);el.querySelector('button').focus();}
function pause(){if(screen!=='play'||session.paused)return;scene().cancelDrag();session.paused=true;scene().audio?.pause();scene().tweens.pauseAll();dialog('Uma pausa para respirar','A esteira e o relógio estão parados. Sua missão espera por você.',[['Continuar','resume'],[session.infinite?'Reiniciar desafio':'Reiniciar fase','restart'],[session.infinite||review||session.tutorial?'Voltar':'Voltar à trilha','abandon'],[progress.settings.sound?'Desligar sons':'Ligar sons','pauseSound'],...(document.fullscreenEnabled?[[document.fullscreenElement?'Sair da tela cheia':'Tela cheia','fullscreen']]:[])]);}
function resume(){if(needsLandscape(window.innerWidth,window.innerHeight)){toast('Gire o aparelho para continuar a missão.');return;}document.querySelector('#modal')?.remove();if(session){session.paused=false;scene().tweens.resumeAll();scene().audio?.resume();if(session.won)showNextChallengeButton();}}
function infiniteIntro(){pendingNicknameRestart=null;screen='arcade';session=null;idleScene();const rank=loadLeaderboard();render(arcadeIntroHTML(rank.entries,nickname,loadChallengeProgress(),CHALLENGES));if(rank.notice)toast(rank.notice);}
function arcadeHUD({challengeId,tag,title,countLabel,goal,message}){
 return `<section class="hud infinite-hud" data-challenge-id="${challengeId}"><div><small>${tag}</small><h2 id="wave">${title}</h2></div><div class="hud-stats"><div><small>PONTOS</small><strong id="score">0</strong></div><div><small>COMBO</small><strong id="streak">0</strong></div><div><small>${countLabel}</small><strong id="count">0</strong></div><div><small>VIDAS</small><span id="lives" data-value="3">${hearts(3)}</span></div>${button('Pausar','pause')}</div></section><div class="mission"><span id="wave-goal">${goal}</span><div><i id="progress-bar"></i></div></div><div id="wave-banner" role="status" aria-live="polite"></div><div class="coach">${eco('guide')}<div><b>ECO · CENTRAL DE TRIAGEM</b><p id="feedback">${message}</p></div></div><div class="bottom-controls"><strong id="selected-item" aria-live="polite">Toque em um resíduo</strong><span><kbd>1–5</kbd> separar · <kbd>Tab</kbd> selecionar · <kbd>Esc</kbd> pausar</span>${button('Retirar restos','prepare','small')}${button('Repetir dica','hint','small')}</div>`;
}
function startInfinite(challengeId=1,{skipNicknameConfirm=false}={}){
 const input=document.querySelector('#nickname');
 const chosenNickname=normalizeNickname(input?.value??nickname);
 if(!skipNicknameConfirm&&screen==='arcade'){
  const existing=findNicknameProfile(chosenNickname);
  if(existing.entry){
   pendingNicknameRestart=existing.stoppedChallengeId??1;
   nickname=chosenNickname;
   dialog('Apelido encontrado',`Deseja reiniciar o desafio ${pendingNicknameRestart}?`,[['SIM','confirmNicknameRestart','primary arcade-primary'],['NÃO','cancelNicknameRestart']]);
   return;
  }
 }
 const challenge=getChallenge(challengeId);
 if(challenge&&!loadChallengeProgress().unlocked.includes(challengeId)){infiniteIntro();return;}
 resultFlow.cancel();nickname=chosenNickname;
 progress=loadProgress();bestBefore=loadLeaderboard().entries[0]?.score??0;recordShown=false;seenWave=1;
 currentLevel=null;review=false;screen='play';
 if(challenge){
  session=new ChallengeSession(challenge,CATALOG);
  render(arcadeHUD({challengeId,tag:`${challenge.title} · ${challenge.subtitle}`.toUpperCase(),title:session.difficulty.name,countLabel:'ACERTOS',goal:challengeGoalText(session),message:challengeIntroMessage(session)}));
 }else{
  session=new InfiniteSession(CATALOG,{challengeId});
  render(arcadeHUD({challengeId,tag:'DESAFIO INFINITO',title:'Onda 1 · Iniciante',countLabel:'RESOLVIDOS',goal:'10 ITENS PARA A PRÓXIMA ONDA',message:'Três vidas, cinco destinos. Vamos construir sua melhor sequência!'}));
 }
 scene().start(session,updateHUD,finish,feedback);beginMusic('infinite');syncViewport();
}
/** Mensagem inicial do Eco; no Desafio 3 explica as lixeiras progressivas e a esteira dupla. */
const challengeIntroMessage=s=>s.challenge.dualBelt
 ?`${s.difficulty.name}: duas esteiras cruzadas! Só ${s.difficulty.bins.length>1?'as lixeiras':'a lixeira'} ${listNames(s.difficulty.bins)} ${s.difficulty.bins.length>1?'estão ativas':'está ativa'}. Deixe passar, sem perder vida, o que ainda não tem lixeira.`
 :`${s.difficulty.name}: ${listNames(s.difficulty.categories)} na esteira. As ${s.challenge.bins.length} lixeiras já estão prontas!`;
/** "Papel, Plástico e Vidro" a partir das categorias. */
const listNames=categories=>{const list=categories.map(c=>names[c]);return list.length>1?`${list.slice(0,-1).join(', ')} e ${list.at(-1)}`:list.join('');};
/** Próximo desafio só é jogável quando já está registrado em CHALLENGES (o último desafio não tem `next`). */
const playableNext=challenge=>challenge?.next&&getChallenge(challenge.next)?challenge.next:null;
function challengeGoalText(s){
 if(s.won)return 'DESAFIO VENCIDO · CONTINUE PONTUANDO';
 if(s.wave<s.maxLevel)return `${s.correctToNextLevel} ACERTOS PARA O NÍVEL ${s.wave+1}`;
 return `META: ${Math.min(s.score,s.challenge.targetScore)} / ${s.challenge.targetScore} PONTOS`;
}
function updateLives(s){
 const lives=document.querySelector('#lives');
 if(!lives||lives.dataset.value===String(s.lives))return;
 lives.dataset.value=s.lives;lives.innerHTML=hearts(s.lives);lives.classList.remove('life-pulse');void lives.offsetWidth;lives.classList.add('life-pulse');
}
function updateChallengeHUD(s){
 const setText=(id,value)=>{const el=document.querySelector('#'+id);if(el&&el.textContent!==String(value))el.textContent=value;};
 setText('count',s.correct);setText('wave',s.difficulty.name);setText('wave-goal',challengeGoalText(s));updateLives(s);
 const bar=document.querySelector('#progress-bar');
 if(bar)bar.style.width=(s.wave<s.maxLevel?(s.correct%10)*10:Math.min(100,s.score/s.challenge.targetScore*100))+'%';
 if(s.wave!==seenWave){
  const added=s.difficulty.categories.filter(c=>!s.challenge.levels[seenWave-1]?.categories.includes(c));
  const previousBins=s.challenge.levels[seenWave-1]?.bins??s.challenge.bins;
  const newBins=s.difficulty.bins.filter(c=>!previousBins.includes(c));
  seenWave=s.wave;fx('wave');scene().audio?.setIntensity(s.wave);waveBanner(`NÍVEL ${s.wave}`);
  feedback(true,newBins.length?`Nova lixeira liberada: ${newBins.map(c=>names[c]).join(', ')}! Agora esse material precisa ser separado.`:added.length?`Novo material na esteira: ${added.map(c=>names[c]).join(', ')}!`:`Novo nível! A esteira ficou ${s.difficulty.speedBoost?s.difficulty.speedBoost+'% ':''}mais rápida.`,'guide');
 }
 if(!recordShown&&bestBefore>0&&s.score>bestBefore){recordShown=true;fx('record');waveBanner('NOVO RECORDE!');}
 if(s.takeVictory())challengeVictory(s);
}
/** Vitória: libera o próximo desafio, salva o recorde e oferece Próximo desafio / Continuar. */
function challengeVictory(s){
 const next=s.challenge.next,playable=playableNext(s.challenge);
 registerChallengeVictory(s.challenge,s.score);
 scene().cancelDrag();scene().tweens.pauseAll();fx('unlock');waveBanner('DESAFIO VENCIDO!');
 const unlocked=next?` O Desafio ${next} foi liberado${playable?'':' e chega em breve'}.`:'';
 const question=playable?'Quer seguir para o próximo ou continuar acumulando pontos neste nível?':'Continue acumulando pontos neste nível.';
 dialog(`${s.challenge.title} vencido!`,`Você chegou ao Nível ${s.challenge.targetLevel} com ${s.score} pontos.${unlocked} ${question}`,[...(playable?[['Próximo desafio','nextChallenge','primary arcade-primary']]:[]),['Continuar','continueChallenge']]);
}
/** Botão fixo no canto inferior direito para avançar quando quiser após Continuar. */
function showNextChallengeButton(){
 if(!playableNext(session?.challenge)||ui.querySelector('.next-challenge-fab'))return;
 ui.insertAdjacentHTML('beforeend',button('Próximo desafio','nextChallenge','primary arcade-primary next-challenge-fab'));
}
/** Encerra a sessão atual (guardando o recorde) e inicia imediatamente o desafio seguinte. */
function nextChallenge(){
 const next=playableNext(session?.challenge);
 if(!next)return;
 if(!session.finished){saveChallengeScore(session.challenge.id,session.score);session.finish('abort');}
 document.querySelector('#modal')?.remove();
 const profile=saveNicknameProgress(nickname,next,1,1);
 if(profile.notice)toast(profile.notice);
 startInfinite(next,{skipNicknameConfirm:true});
}
function finishInfinite(result){
 const ranking=completedRanking;screen='arcade-result';
 const challenge=session?.challenge;
 if(challenge){
  if(result.reason==='victory'){
   render(finalVictoryHTML(result,challenge,ranking,medal()));
   document.querySelector('.final-victory [data-action=menu]')?.focus();
   if(ranking.notice)toast(ranking.notice);
   return;
  }
  render(challengeResultHTML(result,challenge,ranking,{nextUnlocked:!!playableNext(challenge)&&loadChallengeProgress().unlocked.includes(challenge.next)}));
  if(ranking.notice)toast(ranking.notice);
  return;
 }
 render(arcadeResultHTML(result,ranking,ranking.newRecord?medal():eco('error')));if(ranking.notice)toast(ranking.notice);
}
function leaderboard(){if(screen!=='leaderboard')leaderboardReturnScreen=screen==='arcade'?'arcade':'menu';screen='leaderboard';session=null;idleScene();const ranking=loadLeaderboard();render(leaderboardHTML(ranking.entries));if(ranking.notice)toast(ranking.notice);}
const actions={
 skipResult:()=>resultFlow.skip(),menu:()=>{if(screen==='play'){pause();return;}menu();},mapBack:()=>mapReturnScreen==='help'?help(showWasteCatalogGuide):menu(),play:()=>progress.history.length?map():help(false),map,help:()=>help(true),
 tutorial:()=>start(1,false,true),level1:()=>start(1),retry:()=>start(currentLevel.id,review,session.tutorial),next:()=>start(currentLevel.id+1),review:()=>{reviewReturnScreen=screen;start(1,true);},stats:()=>stats(),statsBack:()=>statsReturnScreen==='map'?map():menu(),final:()=>stats(true),credits,settings,pause,resume,
 infinite:infiniteIntro,beginInfinite:startInfinite,retryInfinite:()=>startInfinite(session?.challengeId??1),leaderboard,leaderboardBack:()=>leaderboardReturnScreen==='arcade'?infiniteIntro():menu(),
 continueChallenge:()=>resume(),nextChallenge,
 restart:()=>session.infinite?startInfinite(session.challengeId??1):start(currentLevel.id,review,session.tutorial),
 abandon:()=>{const arcade=session?.infinite,reviewSession=review,tutorialSession=session?.tutorial;session?.finish('abort');session=null;if(arcade)infiniteIntro();else if(reviewSession)returnToReviewOrigin();else if(tutorialSession)help(false);else map();},
 prepare:()=>scene().prepare(),hint:()=>feedback(true,'Arraste para a lixeira com o nome do material. Se houver RESTOS, use Retirar restos primeiro. Vidro não inclui espelho ou cerâmica. Consulte as regras locais.'+(session?.challenge?.dualBelt?' No Desafio 3, o que ainda não tem lixeira na tela pode passar direto, sem perder vida.':''),'guide'),
 sound:()=>{progress=saveSettings({...progress.settings,sound:!progress.settings.sound});scene().audio?.setSettings(progress.settings);fx('select');if(screen==='settings')settings();else document.querySelector('[data-action="sound"]').textContent=progress.settings.sound?'Som ligado':'Som desligado';},
 pauseSound:()=>{actions.sound();document.querySelector('[data-action=pauseSound]').textContent=progress.settings.sound?'Desligar sons':'Ligar sons';},
 sampleMusic:()=>{beginMusic('review');toast('Amostra da oficina de revisão. Ajuste os volumes acima.');},
 fullscreen:()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>toast('Tela cheia não disponível neste navegador.'));else document.exitFullscreen?.();},
 export:()=>{const blob=new Blob([exportCSV(progress.history)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='trilha-seletiva-resultados.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},
 clearRanking:()=>dialog('Limpar os recordes?','Somente as dez marcas do Desafio Infinito serão removidas. Sua campanha será preservada.',[['Cancelar','leaderboard'],['Limpar recordes','confirmClearRanking']]),
 confirmClearRanking:()=>{clearLeaderboard();leaderboard();},
 confirmNicknameRestart:()=>{const challengeId=pendingNicknameRestart;if(challengeId===null)return;pendingNicknameRestart=null;document.querySelector('#modal')?.remove();startInfinite(challengeId,{skipNicknameConfirm:true});},
 cancelNicknameRestart:()=>{pendingNicknameRestart=null;document.querySelector('#modal')?.remove();document.querySelector('#nickname')?.focus();},
 reset:()=>dialog('REINICIAR SUA JORNADA?','Todas as fases serão bloqueadas novamente e seu progresso na campanha será apagado. Você começará pela primeira fase. Deseja continuar?',[['CANCELAR','cancelReset'],['SIM, REINICIAR','confirmReset']]),
 cancelReset:()=>{document.querySelector('#modal')?.remove();document.querySelector('[data-action=reset]')?.focus();},
 confirmReset:()=>{resultFlow.cancel();session=null;progress=resetProgress();scene().audio?.setSettings(progress.settings);map();toast('Trilha reiniciada! Sua jornada começa na primeira fase.');}
};
ui.addEventListener('click',e=>{scene().audio?.unlock();const a=e.target.closest('[data-action]');if(a){e.preventDefault();if(a.dataset.challenge)actions[a.dataset.action]?.(Number(a.dataset.challenge));else actions[a.dataset.action]?.();}const l=e.target.closest('[data-level]');if(l&&!l.disabled)start(Number(l.dataset.level));});
ui.addEventListener('input',e=>{const keys={'music-volume':'musicVolume','effects-volume':'effectsVolume'},key=keys[e.target.id];if(key){progress=saveSettings({...progress.settings,[key]:Number(e.target.value)});scene().audio?.setSettings(progress.settings);document.querySelector(key==='musicVolume'?'#music-value':'#effects-value').textContent=Math.round(Number(e.target.value)*100)+'%';}});
window.addEventListener('keydown',e=>{const modal=document.querySelector('#modal');if(modal&&e.key==='Tab'){const controls=[...modal.querySelectorAll('button,input,a')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}if(!modal&&e.key==='Enter'&&screen==='arcade'&&e.target?.id==='nickname'){e.preventDefault();startInfinite(1);return;}if(screen==='result-intro'&&['Escape','Enter',' '].includes(e.key)){e.preventDefault();resultFlow.skip();return;}if(e.key==='Escape'&&document.querySelector('#modal')&&screen!=='play'){actions.cancelReset();return;}if(e.key==='Escape'&&screen==='play'){session.paused?resume():pause();}});
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
