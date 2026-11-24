/** Presentation only: static illustrations rasterized once, a few moving parts each frame. */
export class FactoryEnvironment {
  constructor(scene) {
    this.scene=scene;
    this.reduced=(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false)||(globalThis.navigator?.hardwareConcurrency>0&&globalThis.navigator.hardwareConcurrency<=4);
    this.clock=0;
    scene.add.image(640,360,'factory').setDepth(-10);
    this.city=scene.add.image(674,240,'city').setDisplaySize(610,201).setDepth(-9);
    const mask=scene.make.graphics({x:0,y:0,add:false});
    mask.fillStyle(0xffffff).fillRoundedRect(361,132,627,210,{tl:60,tr:60,bl:0,br:0});
    this.city.setMask(mask.createGeometryMask());
    const frame=scene.add.graphics().setDepth(-8);
    frame.lineStyle(8,0x507e6a).lineBetween(362,243,987,243).lineBetween(571,138,571,341).lineBetween(783,138,783,341);
    frame.lineStyle(2,0xc5d5ae).lineBetween(362,239,987,239).lineBetween(568,138,568,341).lineBetween(780,138,780,341);
    // Gears live behind the conveyor entry and exit modules.
    this.gears=[scene.add.image(241,365,'gear').setDisplaySize(66,66).setDepth(-7),scene.add.image(1065,366,'gear').setDisplaySize(52,52).setDepth(-7)];
    this.rollerShines=Array.from({length:35},(_,i)=>scene.add.rectangle(62+i*34,426,4,41,0xecf4d9,.28).setDepth(-6));
    this.chevrons=Array.from({length:14},(_,i)=>{const g=scene.add.graphics().setDepth(-6);g.lineStyle(2,0xe3efc8,.42).beginPath().moveTo(-4,-3).lineTo(1,0).lineTo(-4,3).strokePath();g.y=465;g.x=90+i*80;return g;});
    this.pipeLights=[scene.add.circle(213,229,3,0xf3e6a0).setDepth(-5),scene.add.circle(1102,252,3,0xf3e6a0).setDepth(-5)];
    this.lamps=[scene.add.circle(43,374,3,0xebffb5).setDepth(-5),scene.add.circle(1237,374,3,0xebffb5).setDepth(-5)];
    this.buildUpperBelt(scene);
    this.hero=scene.add.container(0,0).setDepth(2);
    this.heroShadow=scene.add.ellipse(977,531,231,35,0x31583f,.18);this.hero.add(this.heroShadow);
    const halo=scene.add.graphics().fillStyle(0xf1f6cb,.33).fillCircle(980,373,156).lineStyle(2,0xf5f8de,.6).strokeCircle(980,373,146);this.hero.add(halo);
    this.eco=scene.add.image(980,379,'eco-idle').setDisplaySize(310,310);this.hero.add(this.eco);
    this.heroItems=[];
    ['garrafa_pet','lata_refri','jornal'].forEach((id,i)=>{const x=[811,1152,1116][i],y=[360,429,249][i];const shadow=scene.add.ellipse(x,y+46,60,12,0x365d44,.13);const item=scene.add.image(x,y,id).setDisplaySize(91,91).setAngle([-13,14,10][i]);this.hero.add([shadow,item]);this.heroItems.push({item,y});});
  }
  /** Segunda esteira (Desafio 3), acima da original: oculta fora do desafio dual. */
  buildUpperBelt(scene){
    const belt=scene.add.graphics().setDepth(-6);
    belt.fillStyle(0x3f6e63).fillRoundedRect(17,302,1246,56,24).lineStyle(3,0x2c5653).strokeRoundedRect(17,302,1246,56,24);
    belt.fillStyle(0x284b48).fillRoundedRect(28,309,1224,42,18).fillStyle(0x34605a).fillRoundedRect(38,316,1204,28,12);
    for(let i=0;i<35;i++)belt.fillStyle(0x8fb09c,.55).fillRoundedRect(50+i*34,318,22,24,8);
    belt.fillStyle(0xeff2d4).fillRect(57,352,1166,4);
    this.upperChevrons=Array.from({length:14},(_,i)=>{const g=scene.add.graphics().setDepth(-5);g.lineStyle(2,0xe3efc8,.5).beginPath().moveTo(-4,-4).lineTo(1,0).lineTo(-4,4).strokePath();g.y=330;g.x=90+i*80;return g;});
    this.upperBelt=[belt,...this.upperChevrons];
    this.setDualBelt(false);
  }
  /** Liga a esteira superior e inverte o sentido da original (dir → esq). */
  setDualBelt(on){
    this.dual=!!on;
    this.upperBelt.forEach(part=>part.setVisible(this.dual));
    this.chevrons.forEach(g=>g.scaleX=this.dual?-1:1);
  }
  showHero(visible){this.hero.setVisible(visible);}
  update(dt,paused=false){
    if(paused)return;
    this.clock+=dt;
    if(this.reduced)return;
    const t=this.clock;
    this.city.x=674+Math.sin(t*.17)*3;
    this.gears.forEach((gear,i)=>gear.angle+=(i?-1:1)*dt*23);
    this.rollerShines.forEach((r,i)=>{r.x=62+i*34+Math.sin(t*4.3+i*.2)*7;r.alpha=.14+(Math.cos(t*4.3+i*.2)+1)*.11;});
    this.chevrons.forEach((r,i)=>{const run=(i*80+t*30)%1120;r.x=this.dual?1198-run:78+run;});
    if(this.dual)this.upperChevrons.forEach((r,i)=>r.x=78+((i*80+t*30)%1120));
    this.lamps.forEach((lamp,i)=>lamp.alpha=.65+Math.sin(t*2+i)*.25);
    this.pipeLights.forEach((lamp,i)=>lamp.alpha=.4+(Math.sin(t*1.7+i)+1)*.25);
    this.eco.setTexture(t%4.4<.14?'eco-blink':t%10>9.2?'eco-guide':'eco-idle');
    this.eco.y=379+Math.sin(t*1.5)*5;
    this.eco.angle=Math.sin(t*.8)*1.4;
    this.heroShadow.scaleX=1+Math.sin(t*1.5)*.025;
    this.heroItems.forEach(({item,y},i)=>item.y=y+Math.sin(t*1.15+i*2)*5);
  }
}
