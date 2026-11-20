/** Coordinates one result presentation per session. Skip and late callbacks are idempotent. */
export class ResultFlow {
 constructor(){this.sessions=new WeakSet();this.generation=0;this.cancelIntro=null;this.finishIntro=null;this.state='idle';}
 start(session,{defeat=false,onStart=()=>{},onIntro=done=>{done();},onResult=()=>{}}={}){
  if(this.sessions.has(session))return false;
  this.cancel();this.sessions.add(session);const generation=this.generation;this.state=defeat?'intro':'result';onStart();
  let shown=false;
  const done=()=>{if(shown||generation!==this.generation)return;shown=true;this.cancelIntro?.();this.cancelIntro=null;this.finishIntro=null;this.state='result';onResult();};
  if(defeat){this.finishIntro=done;const cancel=onIntro(done);if(!shown&&generation===this.generation)this.cancelIntro=cancel??null;}
  else done();return true;
 }
 skip(){this.finishIntro?.();}
 cancel(){this.generation++;this.cancelIntro?.();this.cancelIntro=null;this.finishIntro=null;this.state='idle';}
}
