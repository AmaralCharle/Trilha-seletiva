import Phaser from 'phaser';
import {CATALOG} from '../data/catalog.js';
import {itemSVG,ecoPoseSVG,binBodySVG,binLidSVG,svgURL} from '../ui/art.js';
import {factorySVG,citySVG,gearSVG} from '../ui/factoryArt.js';
import {FactoryEnvironment} from '../entities/FactoryEnvironment.js';
import {AudioManager,preloadAudio} from '../systems/AudioManager.js';
import {dragPosition,findDropBin,renderResolution,gameViewport} from '../systems/mobile.js';

const BIN_NAMES={paper:'PAPEL',plastic:'PLÁSTICO',glass:'VIDRO',metal:'METAL',reject:'REJEITO'};
/** Esteira dupla (Desafio 3): faixa 0 = superior (esq → dir), faixa 1 = inferior (dir → esq). */
export const DUAL_BELT=Object.freeze({scale:.72,laneY:Object.freeze([290,412]),singleY:350,entryX:92,exitX:1195,mirror:1280});
const COLORS={paper:0x428ac9,plastic:0xd96557,glass:0x4e9d73,metal:0xd6a73f,reject:0x84918b};

export class FactoryScene extends Phaser.Scene {
  constructor(){super('Factory');this.activeItems=[];this.mode='menu';this.transients=new Set();}

  preload(){
    preloadAudio(this);
    for(const item of CATALOG)this.load.svg(item.id,svgURL(itemSVG(item.id)));
    for(const state of ['idle','happy','guide','error','blink'])this.load.svg(`eco-${state}`,svgURL(ecoPoseSVG(state)));
    for(const category of Object.keys(BIN_NAMES)){
      this.load.svg(`bin-${category}`,svgURL(binBodySVG(category)));
      this.load.svg(`lid-${category}`,svgURL(binLidSVG(category)));
    }
    this.load.svg('factory',svgURL(factorySVG));
    this.load.svg('city',svgURL(citySVG));
    this.load.svg('gear',svgURL(gearSVG));
    this.load.on('loaderror',file=>window.dispatchEvent(file.type==='audio'?new CustomEvent('audio-error',{detail:'Um áudio não carregou. O jogo continuará com retorno visual.'}):new Event('asset-error')));
  }

  create(){
    this.audio=new AudioManager(this,{onError:message=>window.dispatchEvent(new CustomEvent('audio-error',{detail:message}))});
    this.textResolution=renderResolution(globalThis.devicePixelRatio);
    this.drawFactory();
    this.input.setTopOnly(true);
    this.input.dragDistanceThreshold=6;
    this.input.on('gameout',()=>this.cancelDrag());
    this.input.on('pointerdown',()=>this.audio.unlock());
    this.input.on('dragstart',(p,obj)=>{
      if(this.mode!=='play'||this.session?.paused||this.dragged)return;
      this.dragged=obj;this.dragPointer=p.id;
      this.selected=obj;obj.dragging=true;obj.setScale(obj.baseScale*1.06);this.audio.playEffect('drag');obj.setDepth(12);
    });
    this.input.on('drag',(p,obj,x,y)=>{
      if(this.mode==='play'&&!this.session.paused&&this.dragged===obj&&this.dragPointer===p.id){
        const camera=this.cameras.main;
        const pos=dragPosition(p,x,y,camera.zoom/this.scale.displayScale.x,
          {left:camera.worldView.x,right:camera.worldView.right,top:camera.worldView.y,bottom:camera.worldView.bottom});
        obj.setPosition(pos.x,pos.y);
        const point=this.cameras.main.getWorldPoint(p.x,p.y);
        const bin=findDropBin(this.binZones,point.x,point.y);
        this.binZones.forEach(b=>b.hover.setVisible(b===bin));
      }
    });
    this.input.on('dragend',(p,obj)=>{
      if(this.dragged!==obj||this.dragPointer!==p.id)return;
      this.dragged=null;this.dragPointer=null;this.binZones.forEach(b=>b.hover.setVisible(false));
      obj.setScale(obj.baseScale);obj.dragging=false;obj.setDepth(5);
      if(this.mode!=='play'||this.session.paused||!this.activeItems.includes(obj))return;
      const point=this.cameras.main.getWorldPoint(p.x,p.y);
      const bin=findDropBin(this.binZones,point.x,point.y);
      if(bin)this.classify(bin.category,obj);
      else this.placeOnBelt(obj);
    });
    this.input.keyboard.on('keydown',e=>{
      if(this.mode!=='play'||this.session.paused)return;
      const n=Number(e.key);
      if(n>=1&&n<=5&&this.binZones[n-1])this.classify(this.binZones[n-1].category);
      if(e.key==='Tab'){
        e.preventDefault();const alive=this.activeItems;
        this.selected=alive[(alive.indexOf(this.selected)+1)%alive.length];
      }
      if(e.key.toLowerCase()==='e')this.prepare();
    });
    this.ready=true;window.dispatchEvent(new Event('factory-ready'));
  }

  drawFactory(){
    this.environment=new FactoryEnvironment(this);
    this.binLayer=this.add.container(0,0).setDepth(3);
    this.marker=this.add.graphics().setDepth(11);
  }

  layoutViewport(width,height,compact){
    const layout=gameViewport(width,height,compact,!!this.dual);
    this.cameras.main.setViewport(0,0,layout.width,layout.height)
      .setZoom(layout.zoom).centerOn(layout.centerX,layout.centerY);
    this.cameras.main.setBackgroundColor(compact?'#89a98c':'#102f35');
    return layout;
  }

  showMenu(){
    this.cancelDrag();
    this.clearShutdown();this.tweens.resumeAll();this.mode='menu';this.clearItems();this.clearEffects();
    this.dual=false;this.environment.setDualBelt(false);
    this.binLayer.removeAll(true);this.binZones=[];this.environment.showHero(true);this.marker.clear();
  }

  start(session,onUpdate,onFinish,onFeedback){
    this.cancelDrag();
    this.clearShutdown();this.tweens.resumeAll();this.clearItems();this.clearEffects();this.mode='play';
    this.environment.showHero(false);this.session=session;
    this.onUpdate=onUpdate;this.onFinish=onFinish;this.onFeedback=onFeedback;
    this.spawned=0;this.spawnClock=0;this.selected=null;
    this.binLayer.removeAll(true);this.binZones=[];
    this.dual=!!session.challenge?.dualBelt;this.environment.setDualBelt(this.dual);
    this.buildBins(session.level.categories,false);
    this.spawn();
  }

  /** Recria as lixeiras da cena; as que acabaram de entrar surgem com um fade-in. */
  buildBins(categories,animate){
    const known=new Set((this.binZones??[]).map(b=>b.category));
    this.binLayer.removeAll(true);this.binZones=[];
    categories.forEach((category,i)=>{
      const bin=this.createBin(category,i,categories.length);
      if(animate&&!known.has(category)&&!this.environment.reduced){
        bin.parts.forEach(part=>part.setAlpha(0));
        this.tweens.add({targets:bin.parts,alpha:1,duration:420,ease:'Sine.out'});
      }
    });
  }

  /** Lixeiras liberadas por nível (Desafio 3): reconstrói a fileira quando o conjunto muda. */
  syncBins(){
    const wanted=this.session?.level?.categories;
    if(this.mode!=='play'||!wanted||!this.binZones)return;
    if(this.binZones.length===wanted.length&&this.binZones.every((b,i)=>b.category===wanted[i]))return;
    this.buildBins(wanted,true);
  }

  /** Posição de um resíduo a partir do avanço `beltX`; a faixa inferior corre espelhada. */
  placeOnBelt(o){
    o.x=o.lane===1?DUAL_BELT.mirror-o.beltX:o.beltX;o.y=o.laneY;
  }

  createBin(category,index,count){
    const x=640+(index-(count-1)/2)*196,y=554;
    const shadow=this.add.ellipse(x,675,160,22,0x355c43,.19);
    const body=this.add.image(x,y+48,`bin-${category}`).setDisplaySize(151,130);
    const lid=this.add.image(x,y-5,`lid-${category}`).setDisplaySize(166,28);
    const label=this.add.text(x,y+63,BIN_NAMES[category],{resolution:this.textResolution,fontFamily:'Arial',fontStyle:'bold',fontSize:'24px',color:'#214a45'}).setOrigin(.5);
    const key=this.add.text(x-59,y+9,String(index+1),{resolution:this.textResolution,fontFamily:'Arial',fontStyle:'bold',fontSize:'14px',color:'#fff8e8',backgroundColor:'#244f47',padding:{x:6,y:3}}).setOrigin(.5);
    const zone=this.add.zone(x,y+47,192,174).setInteractive({useHandCursor:true});
    const hover=this.add.graphics().lineStyle(3,0xffedaa,.9).strokeRoundedRect(x-84,y-23,168,151,17).setVisible(false);
    zone.on('pointerover',()=>{if(this.mode==='play'&&!this.session.paused)hover.setVisible(true);});
    zone.on('pointerout',()=>hover.setVisible(false));
    zone.on('pointerdown',()=>{if(!this.dragged)this.classify(category);});
    this.binLayer.add([shadow,body,lid,label,key,hover,zone]);
    const bin={category,rect:new Phaser.Geom.Rectangle(x-96,y-36,192,174),x,y,body,lid,hover,parts:[shadow,body,lid,label,key]};
    this.binZones.push(bin);
    return bin;
  }

  cancelDrag(){
    const obj=this.dragged;
    if(obj?.active){obj.dragging=false;obj.setScale(obj.baseScale).setDepth(5);this.placeOnBelt(obj);}
    this.dragged=null;this.dragPointer=null;
    this.binZones?.forEach(b=>b.hover.setVisible(false));
  }

  presentDefeat(onReady){
    this.mode='defeat';this.clearItems();this.marker.clear();
    const shade=this.transient(this.add.rectangle(640,360,1280,720,0x123b36,1).setAlpha(0).setDepth(14));
    if(this.environment.reduced)shade.setAlpha(.24);
    else{
      this.tweens.add({targets:shade,alpha:.32,duration:650,ease:'Sine.out'});
      for(const lamp of this.environment.lamps)this.tweens.add({targets:lamp,alpha:.22,duration:210,yoyo:true,repeat:1});
    }
    const timer=this.time.delayedCall(1750,onReady);
    this.shutdownTimer=timer;
    return ()=>{timer.remove(false);if(this.shutdownTimer===timer)this.shutdownTimer=null;};
  }

  clearShutdown(){
    this.shutdownTimer?.remove(false);this.shutdownTimer=null;
    for(const lamp of this.environment?.lamps??[]){this.tweens.killTweensOf(lamp);lamp.alpha=1;}
  }

  clearItems(){
    this.activeItems.forEach(x=>{this.tweens.killTweensOf(x);x.destroy();});this.activeItems=[];
  }

  clearEffects(){
    this.transients.forEach(obj=>{this.tweens.killTweensOf(obj);obj.destroy();});this.transients.clear();
  }

  transient(obj){this.transients.add(obj);return obj;}
  destroyEffect(obj){this.transients.delete(obj);obj.destroy();}

  spawn(){
    let uid,item;
    if(this.session.infinite){item=this.session.nextItem();if(!item)return;uid=item.uid;}
    else{if(this.spawned>=this.session.deck.length)return;uid=this.spawned++;item=this.session.deck[uid];}
    const lane=item.lane??0,dual=this.dual;
    const o=this.add.container(lane===1?DUAL_BELT.mirror-DUAL_BELT.entryX:DUAL_BELT.entryX,dual?DUAL_BELT.laneY[lane]:DUAL_BELT.singleY);
    const plate=this.add.graphics();
    plate.fillStyle(0x315440,.14).fillRoundedRect(-63,-48,128,119,18);
    plate.fillStyle(0xfff8e5,.97).fillRoundedRect(-63,-56,126,118,16);
    plate.lineStyle(2,0x709a80,.75).strokeRoundedRect(-63,-56,126,118,16);
    plate.lineStyle(2,0xffffff,.8).lineBetween(-46,-49,43,-49);
    o.add(plate);
    o.shadow=this.add.ellipse(0,19,68,12,0x54755a,.14);o.add(o.shadow);
    o.sprite=this.add.image(0,-14,item.id).setDisplaySize(87,87);o.add(o.sprite);
    o.add(this.add.text(0,44,item.name,{resolution:this.textResolution,fontFamily:'Arial',fontStyle:'bold',fontSize:'14px',color:'#284e47',align:'center',wordWrap:{width:116}}).setOrigin(.5));
    if(item.needsPrep){
      o.badge=this.add.text(0,-68,'RESTOS',{resolution:this.textResolution,fontFamily:'Arial',fontStyle:'bold',fontSize:'12px',backgroundColor:'#f3cb68',color:'#27483c',padding:{x:9,y:4}}).setOrigin(.5);o.add(o.badge);
    }
    o.setDepth(5);o.setSize(146,138).setInteractive({useHandCursor:true});this.input.setDraggable(o);
    o.on('pointerdown',()=>{if(this.mode!=='play'||this.session.paused||this.dragged)return;this.selected=o;this.audio.playEffect('select');});
    o.lane=lane;o.laneY=dual?DUAL_BELT.laneY[lane]:DUAL_BELT.singleY;o.baseScale=dual?DUAL_BELT.scale:1;o.setScale(o.baseScale);
    o.uid=uid;o.item=item;o.born=this.session.elapsed;o.beltX=DUAL_BELT.entryX;
    this.activeItems.push(o);if(!this.selected)this.selected=o;
  }

  prepare(){
    const o=this.selected;if(!o||this.session.paused||!o.item.needsPrep)return;
    o.prepared=true;o.badge?.setText('SEM RESTOS').setBackgroundColor('#bde09e');
    this.onFeedback(true,'Restos retirados. Agora separe pelo material.');
  }

  animateBin(bin,ok){
    this.audio.playEffect('bin');
    if(this.environment.reduced)return;
    this.tweens.killTweensOf(bin.lid);bin.lid.setPosition(bin.x,bin.y-5).setAngle(0);
    this.tweens.add({targets:bin.lid,y:bin.y-22,angle:-5,duration:110,yoyo:true,hold:85,ease:'Sine.out'});
    if(!ok){this.tweens.killTweensOf(bin.body);bin.body.x=bin.x;this.tweens.add({targets:bin.body,x:bin.x+4,duration:45,yoyo:true,repeat:2,onComplete:()=>bin.body.x=bin.x});}
  }

  feedbackParticles(bin,ok){
    const glow=this.transient(this.add.graphics().setDepth(9));
    glow.lineStyle(ok?4:3,ok?0xe2f7a4:0xe59a6f,.9).strokeRoundedRect(bin.x-85,bin.y-24,170,153,18);
    this.tweens.add({targets:glow,alpha:0,duration:this.environment.reduced?120:450,onComplete:()=>this.destroyEffect(glow)});
    if(this.environment.reduced)return;
    const count=ok?8:3;
    for(let i=0;i<count;i++){
      const p=this.transient(ok?this.add.star(bin.x,bin.y-5,4,2.5,5.5,i%2?0xf7d16c:0xd4ed9a):this.add.circle(bin.x,bin.y,3.5,0xe8aa82));p.setDepth(10);
      this.tweens.add({targets:p,x:bin.x+Phaser.Math.Between(-63,63),y:bin.y-Phaser.Math.Between(35,83),angle:Phaser.Math.Between(-90,90),alpha:0,duration:ok?580:340,ease:'Quad.out',onComplete:()=>this.destroyEffect(p)});
    }
  }

  classify(category,obj=this.selected){
    if(this.mode!=='play'||this.session.paused||!obj||!this.activeItems.includes(obj))return;
    const r=this.session.resolve(obj.uid,obj.item,category,this.session.elapsed-obj.born,!!obj.prepared);
    if(r.reason==='ignored')return;
    const text=r.ok?`Boa! +${r.points} pontos${this.session.streak>=3?' · sequência 2×':''}`:(obj.item.needsPrep&&!obj.prepared?'Retire os restos antes de separar. ':'')+obj.item.tip;
    this.audio.playEffect(r.ok?'correct':'wrong');
    if(r.ok&&this.session.streak===3)this.audio.playEffect('combo3');
    if(r.ok&&this.session.streak%5===0)this.audio.playEffect('combo5');
    this.onFeedback(r.ok,text);
    const bin=this.binZones.find(b=>b.category===category);
    this.animateBin(bin,r.ok);this.feedbackParticles(bin,r.ok);
    this.activeItems=this.activeItems.filter(x=>x!==obj);this.selected=this.activeItems[0];
    this.transient(obj);
    this.tweens.add({targets:obj,x:bin.x,y:bin.y+18,scaleX:.1,scaleY:.1,alpha:0,duration:this.environment.reduced?80:270,ease:'Quad.in',onComplete:()=>this.destroyEffect(obj)});
    const caption=this.transient(this.add.text(bin.x,bin.y-27,r.ok?`+${r.points}`:'REVISE',{resolution:this.textResolution,fontFamily:'Arial',fontStyle:'bold',fontSize:r.ok?'25px':'16px',color:r.ok?'#2a7958':'#a64d36',stroke:'#fff4d8',strokeThickness:4}).setOrigin(.5).setDepth(11));
    this.tweens.add({targets:caption,y:bin.y-65,alpha:0,duration:750,onComplete:()=>this.destroyEffect(caption)});
    this.checkEnd();
  }

  checkEnd(){
    this.syncBins();
    this.onUpdate(this.session);
    if(this.session.finished&&this.mode==='play'){
      this.mode='result';this.marker.clear();this.clearItems();this.onFinish(this.session.result);
    }
  }

  update(t,ms){
    const dt=Math.min(ms/1000,.05);
    this.environment?.update(dt,(this.mode==='play'&&this.session?.paused)||(this.mode==='result'&&this.session?.infinite)||this.mode==='defeat');
    if(this.mode!=='play'||!this.session||this.session.paused)return;
    this.session.tick(dt);if(this.session.finished){this.checkEnd();return;}
    this.spawnClock+=dt;
    const maxActive=this.session.infinite?this.session.difficulty.maxActive:(this.session.review?1:6);
    const lane=this.session.nextLane??0;
    const room=!this.session.infinite||this.activeItems.filter(o=>o.lane===lane).every(o=>o.beltX-DUAL_BELT.entryX>=this.session.difficulty.minSpacing);
    if(this.spawnClock>=this.session.level.interval&&this.activeItems.length<maxActive&&room){
      this.spawnClock=0;this.spawn();
    }
    for(const o of [...this.activeItems]){
      o.beltX+=this.session.review?0:this.session.level.speed*dt;
      if(!o.dragging){this.placeOnBelt(o);
        if(!this.environment.reduced&&!this.session.review){o.sprite.y=-14+Math.sin(this.environment.clock*4+o.uid)*1.4;o.sprite.angle=Math.sin(this.environment.clock*2+o.uid)*.8;}
      }
      o.shadow.setScale(o.dragging?.82:1);o.shadow.alpha=o.dragging?.25:.14;
      if(o.beltX>DUAL_BELT.exitX){
        if(this.dragged===o)this.cancelDrag();
        const r=this.session.miss(o.uid,o.item);this.activeItems=this.activeItems.filter(x=>x!==o);
        if(this.selected===o)this.selected=this.activeItems[0];o.destroy();
        if(r.reason==='passed')this.onFeedback(true,`${o.item.name} ainda não tem lixeira neste nível. Deixar passar está certo!`,'guide');
        else{this.audio.playEffect('wrong');this.onFeedback(false,'Item perdido. Escolha o próximo com calma.');}
        if(this.session.finished){this.checkEnd();return;}
      }
    }
    this.marker.clear();
    if(this.selected){
      const k=this.selected.baseScale??1;
      this.marker.lineStyle(5,0xfff2b0,.9).strokeRoundedRect(this.selected.x-67*k,this.selected.y-60*k,134*k,126*k,19*k);
      this.marker.lineStyle(2,0x367d5e,1).strokeRoundedRect(this.selected.x-69*k,this.selected.y-62*k,138*k,130*k,20*k);
    }
    this.checkEnd();
  }
}
