/** Reproducible original compositions for Trilha Seletiva. Node.js standard library only. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const destination=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public/assets/audio');
fs.mkdirSync(destination,{recursive:true});
const SR=22050,TAU=Math.PI*2;
const midi=n=>440*2**((n-69)/12);
let randomState=90210;
const random=()=>{randomState=(1664525*randomState+1013904223)>>>0;return randomState/4294967296;};
function addTone(out,start,length,note,volume=.2,voice='pluck',pan=0){
 const count=Math.floor(length*SR),freq=midi(note),first=Math.floor(start*SR);
 for(let n=0;n<count;n++){
  const t=n/SR,p=n/count,attack=Math.min(1,t/.009),release=Math.min(1,(length-t)/.045),phase=TAU*freq*t;
  let sample;
  if(voice==='bell')sample=Math.sin(phase)*Math.exp(-p*4)+.24*Math.sin(phase*2.01)*Math.exp(-p*9)+.08*Math.sin(phase*3)*Math.exp(-p*12);
  else if(voice==='pad')sample=(Math.sin(phase)+.16*Math.sin(phase*2)+.1*Math.sin(phase*3))*Math.sin(Math.PI*p)**.5;
  else if(voice==='chip')sample=(Math.sin(phase)+.28*Math.sin(phase*3)+.12*Math.sin(phase*5))*Math.exp(-p*2.4);
  else if(voice==='bass')sample=(Math.sin(phase)+.18*Math.sin(phase*2))*Math.exp(-p*2.5);
  else sample=(Math.sin(phase)+.2*Math.sin(phase*2)+.09*Math.sin(phase*4))*Math.exp(-p*4.3);
  out[(first+n)%out.length]+=sample*attack*release*volume;
 }
}
function drum(out,start,kind,volume){
 const duration=kind==='hat'?.055:kind==='kick'?.22:.12,count=Math.floor(SR*duration),first=Math.floor(start*SR);
 for(let n=0;n<count;n++){
  const t=n/SR,p=n/count,noise=(random()*2-1);
  const sample=kind==='kick'?Math.sin(TAU*(45*t+40*.035*(1-Math.exp(-t/.035))))*Math.exp(-p*6):kind==='hat'?noise*Math.exp(-p*9):(.7*noise+.3*Math.sin(TAU*185*t))*Math.exp(-p*7);
  out[(first+n)%out.length]+=sample*volume*Math.min(1,n/25);
 }
}
function wav(name,samples,{loop=false}={}){
 const echo=loop?new Float64Array(samples.length):null;
 if(echo){for(let i=0;i<samples.length;i++){echo[(i+Math.floor(SR*.19))%samples.length]+=samples[i]*.11;echo[(i+Math.floor(SR*.38))%samples.length]+=samples[i]*.045;}for(let i=0;i<samples.length;i++)samples[i]+=echo[i];}
 const mean=samples.reduce((s,n)=>s+n,0)/samples.length;let peak=0;for(let i=0;i<samples.length;i++){samples[i]-=mean;peak=Math.max(peak,Math.abs(samples[i]));}
 const gain=peak?(.72/peak):1,b=Buffer.alloc(44+samples.length*2);
 b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);
 for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]*gain))*32767),44+i*2);
 fs.writeFileSync(path.join(destination,name+'.wav'),b);
 return {name,duration:Number((samples.length/SR).toFixed(3)),bytes:b.length};
}
const pieces=[
 {key:'phase1',bpm:92,bars:8,chords:[60,65,67,60],voice:'pluck',scale:[0,2,4,7,9],melody:[0,2,1,4,2,1,0,3],density:2,drums:.1},
 {key:'phase2',bpm:108,bars:8,chords:[62,67,69,62],voice:'bell',scale:[0,2,4,7,9],melody:[0,3,2,4,1,2,3,1],density:4,drums:.15},
 {key:'phase3',bpm:116,bars:8,chords:[57,53,60,55],voice:'chip',scale:[0,3,5,7,10],melody:[0,2,4,2,1,3,2,4],density:4,drums:.18},
 {key:'phase4',bpm:124,bars:12,chords:[65,60,62,58],voice:'pluck',scale:[0,2,4,7,9],melody:[2,0,3,1,4,2,3,0],density:4,drums:.2},
 {key:'phase5',bpm:144,bars:12,chords:[62,58,65,60],voice:'chip',scale:[0,2,3,7,10],melody:[0,3,1,4,2,3,4,1],density:8,drums:.24},
 {key:'review',bpm:74,bars:8,chords:[55,60,57,62],voice:'bell',scale:[0,2,4,7,9],melody:[0,1,3,2,4,3,1,0],density:2,drums:0},
 {key:'infinite',bpm:136,bars:12,chords:[52,55,50,57],voice:'chip',scale:[0,3,5,7,10],melody:[0,4,2,3,1,3,4,2],density:8,drums:.22},
];
const report=[];
for(const piece of pieces){
 randomState=90210+piece.bpm;const beat=60/piece.bpm,total=piece.bars*4*beat,out=new Float64Array(Math.round(total*SR));
 for(let bar=0;bar<piece.bars;bar++){
  const root=piece.chords[bar%piece.chords.length],minor=['phase3','phase5','infinite'].includes(piece.key);
  [0,minor?3:4,7].forEach((interval,index)=>addTone(out,bar*4*beat,4*beat,root+interval,.042+(index===0?.01:0),'pad'));
  for(let b=0;b<4;b++){
   addTone(out,(bar*4+b)*beat,beat*.78,root-12+(b===2?7:0),piece.key==='review'?.075:.125,'bass');
   if(piece.drums){drum(out,(bar*4+b)*beat,'kick',piece.drums*(b%2?.62:1));drum(out,(bar*4+b+.5)*beat,'hat',piece.drums*.2);if(b%2)drum(out,(bar*4+b)*beat,'snare',piece.drums*.35);}
  }
  for(let n=0;n<piece.density;n++){
   const slot=piece.melody[(bar*piece.density+n)%piece.melody.length],offset=piece.scale[slot];
   const spacing=4/piece.density,delay=piece.key==='infinite'&&n%4===2?.12:0;
   addTone(out,(bar*4+n*spacing+delay)*beat,beat*Math.min(1.6,spacing*.85),root+12+offset,piece.key==='review'?.1:.115,piece.voice);
   if(piece.key==='phase2'&&n%2===1)addTone(out,(bar*4+n*spacing+.4)*beat,beat*.25,root+19,.035,'bell');
  }
 }
 report.push(wav(piece.key,out,{loop:true}));
}
// Original non-looping result themes, with a soft tail before silence.
for(const [key,duration,notes] of [['gameover',6.4,[76,74,71,67,64,60]],['victory',5.2,[60,64,67,72,76,79]]]){
 const out=new Float64Array(Math.floor(SR*duration));
 notes.forEach((note,i)=>{addTone(out,.22+i*.64,1.05,note,.13,key==='gameover'?'pluck':'bell');if(i%2===0)addTone(out,.22+i*.64,1.3,note-12,.07,'pad');});
 report.push(wav(key,out));
}
const fx={
 select:{duration:.11,notes:[[0,.09,78,.16,'pluck']]},
 drag:{duration:.16,notes:[[0,.13,67,.11,'bell'],[.035,.1,74,.06,'pluck']]},
 correct:{duration:.3,notes:[[0,.16,79,.16,'bell'],[.09,.18,84,.14,'bell']]},
 wrong:{duration:.28,notes:[[0,.15,50,.16,'bass'],[.1,.16,45,.14,'bass']]},
 bin:{duration:.14,notes:[[0,.09,55,.13,'pluck']]},
 combo3:{duration:.4,notes:[[0,.14,72,.13,'bell'],[.09,.14,76,.13,'bell'],[.18,.2,79,.14,'bell']]},
 combo5:{duration:.58,notes:[[0,.18,76,.12,'bell'],[.09,.18,79,.12,'bell'],[.18,.2,84,.13,'bell'],[.3,.25,88,.12,'bell']]},
 unlock:{duration:.75,notes:[[0,.2,67,.12,'bell'],[.13,.2,72,.12,'bell'],[.26,.2,76,.12,'bell'],[.4,.32,79,.13,'bell']]},
 victory:{duration:1.18,notes:[[0,.23,72,.13,'bell'],[.17,.23,76,.13,'bell'],[.34,.25,79,.13,'bell'],[.55,.55,84,.15,'bell'],[.55,.55,76,.08,'pad']]},
 defeat:{duration:.9,notes:[[0,.28,64,.12,'bell'],[.2,.28,60,.12,'bell'],[.4,.44,55,.13,'bell']]},
 record:{duration:1.2,notes:[[0,.18,72,.13,'chip'],[.1,.18,76,.13,'chip'],[.2,.18,79,.13,'chip'],[.3,.2,84,.13,'chip'],[.48,.2,88,.13,'bell'],[.67,.45,91,.13,'bell']]},
 wave:{duration:.6,notes:[[0,.14,67,.12,'chip'],[.1,.14,72,.12,'chip'],[.2,.14,74,.12,'chip'],[.3,.25,79,.13,'chip']]},
};
for(const [key,definition] of Object.entries(fx)){const out=new Float64Array(Math.floor(SR*definition.duration));for(const event of definition.notes)addTone(out,...event);report.push(wav('fx-'+key,out));}
fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify({sampleRate:SR,channels:1,bits:16,tracks:report},null,2)+'\n');
console.log(JSON.stringify({files:report.length,bytes:report.reduce((sum,f)=>sum+f.bytes,0),music:report.slice(0,7)},null,2));
