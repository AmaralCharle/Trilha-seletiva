import {MUSIC_KEYS,EFFECT_KEYS} from '../data/audioManifest.js';
export {preloadAudio} from '../data/audioManifest.js';

/** One music voice, fade-out before replacement. No sound is started without a gesture. */
export class AudioManager {
 constructor(scene,{settings={},onError=()=>{}}={}){
  this.scene=scene;this.onError=onError;this.settings={sound:true,musicVolume:.22,effectsVolume:.35,...settings};
  this.unlocked=false;this.paused=false;this.current=null;this.currentKey=null;this.desiredKey=null;
  this.transition=null;this.generation=0;this.intensity=1;this.effects=new Set();this.lastEffect=new Map();this.warned=new Set();
 }
 unlock(){
  this.unlocked=true;
  try{if(this.scene.sound.locked)this.scene.sound.unlock();const resume=this.scene.sound.context?.resume?.();resume?.catch?.(()=>{});}catch{this.warn('O áudio não pôde ser ativado. Você pode continuar sem som.');}
  this.pump();
 }
 warn(message){if(!this.warned.has(message)){this.warned.add(message);this.onError(message);}}
 available(key){return this.scene.cache.audio.exists(key);}
 targetVolume(){return Math.min(1,this.settings.musicVolume*this.intensity);}
 playMusic(key){
  if(!MUSIC_KEYS.includes(key))return;
  this.desiredKey=key;this.pump();
 }
 pump(){
  if(!this.unlocked||this.paused||this.transition)return;
  if(this.current&&this.currentKey===this.desiredKey)return;
  if(this.current){this.fadeOut();return;}
  if(!this.desiredKey)return;
  const key=this.desiredKey;
  if(!this.available(`music-${key}`)){this.warn(`A trilha ${key} não carregou. O jogo continua sem essa música.`);this.desiredKey=null;return;}
  try{
   const sound=this.scene.sound.add(`music-${key}`,{loop:!['gameover','victory'].includes(key),volume:0,mute:!this.settings.sound});
   this.current=sound;this.currentKey=key;
   if(['gameover','victory'].includes(key))sound.once('complete',()=>{if(this.current!==sound)return;this.cancelTransition();if(this.desiredKey===key)this.desiredKey=null;this.disposeCurrent();this.pump();});
   sound.play();
   const generation=++this.generation;
   this.transition=this.scene.tweens.add({targets:sound,volume:this.targetVolume(),duration:550,onComplete:()=>{
    if(generation!==this.generation)return;this.transition=null;sound.setVolume(this.targetVolume());this.pump();
   }});
  }catch{this.disposeCurrent();this.desiredKey=null;this.warn('Não foi possível reproduzir a trilha. A partida continua sem música.');}
 }
 fadeOut(){
  const sound=this.current,generation=++this.generation;
  this.transition=this.scene.tweens.add({targets:sound,volume:0,duration:250,onComplete:()=>{
   if(generation!==this.generation)return;this.transition=null;this.disposeCurrent();this.pump();
  }});
 }
 disposeCurrent(){
  if(this.current){this.current.stop();this.current.destroy();}
  this.current=null;this.currentKey=null;
 }
 stopMusic(){
  this.desiredKey=null;
  if(this.paused){this.cancelTransition();this.disposeCurrent();return;}
  if(this.transition){this.cancelTransition();}
  if(this.current)this.fadeOut();
 }
 cancelTransition(){this.generation++;this.transition?.stop?.();this.transition=null;}
 pause(){
  if(this.paused)return;this.paused=true;this.transition?.pause?.();this.current?.pause();
  for(const sound of this.effects){sound.stop();sound.destroy();}this.effects.clear();
 }
 resume(){
  if(!this.paused)return;this.paused=false;this.transition?.resume?.();
  if(this.current){this.current.setMute(!this.settings.sound);this.current.resume();}
  this.pump();
 }
 setSettings(settings){
  if(typeof settings.sound==='boolean')this.settings.sound=settings.sound;
  for(const key of ['musicVolume','effectsVolume'])if(Number.isFinite(settings[key]))this.settings[key]=Math.max(0,Math.min(1,settings[key]));
  this.current?.setMute(!this.settings.sound);
  if(this.current&&!this.transition)this.current.setVolume(this.targetVolume());
  for(const sound of this.effects){sound.setMute(!this.settings.sound);sound.setVolume(this.settings.effectsVolume*.55);}
 }
 setIntensity(wave=1){this.intensity=1+Math.min(.14,Math.max(0,wave-1)*.014);if(this.current&&!this.transition)this.current.setVolume(this.targetVolume());}
 playEffect(key){
  if(!this.unlocked||this.paused||!this.settings.sound||this.settings.effectsVolume<=0||!EFFECT_KEYS.includes(key))return;
  const now=this.scene.time?.now??Date.now();if(now-(this.lastEffect.get(key)??-Infinity)<70)return;
  this.lastEffect.set(key,now);
  if(!this.available(`fx-${key}`)){this.warn(`O efeito ${key} não carregou. O retorno visual continua disponível.`);return;}
  if(this.effects.size>=6)return;
  try{
   const sound=this.scene.sound.add(`fx-${key}`,{volume:this.settings.effectsVolume*.55});this.effects.add(sound);
   sound.once('complete',()=>{this.effects.delete(sound);sound.destroy();});sound.play();
  }catch{this.warn('Um efeito de áudio não pôde ser reproduzido.');}
 }
 destroy(){this.cancelTransition();this.disposeCurrent();for(const sound of this.effects){sound.stop();sound.destroy();}this.effects.clear();this.desiredKey=null;}
}
