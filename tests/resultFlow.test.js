import {describe,it,expect,vi} from 'vitest';
import {ResultFlow} from '../src/systems/ResultFlow.js';
import {InfiniteSession} from '../src/systems/infiniteSession.js';
import {Session} from '../src/systems/session.js';
import {CATALOG} from '../src/data/catalog.js';

describe('exactly-once result transitions',()=>{
 it('records the result immediately and shows it only once when animation is skipped or expires',()=>{const flow=new ResultFlow(),session={},save=vi.fn(),show=vi.fn(),cancel=vi.fn();let done;const options={defeat:true,onStart:save,onIntro:callback=>{done=callback;return cancel},onResult:show};expect(flow.start(session,options)).toBe(true);expect(save).toHaveBeenCalledTimes(1);expect(show).not.toHaveBeenCalled();flow.skip();done();flow.skip();expect(show).toHaveBeenCalledTimes(1);expect(cancel).toHaveBeenCalledTimes(1);expect(flow.start(session,options)).toBe(false);expect(save).toHaveBeenCalledTimes(1);});
 it('cancels a late intro callback after navigating away or restarting',()=>{const flow=new ResultFlow(),show=vi.fn();let oldDone;flow.start({},{defeat:true,onIntro:done=>{oldDone=done},onResult:show});flow.cancel();oldDone();expect(show).not.toHaveBeenCalled();flow.start({},{onResult:show});oldDone();expect(show).toHaveBeenCalledTimes(1);});
 it('keeps success and failure presentation mutually exclusive',()=>{const flow=new ResultFlow(),intro=vi.fn(),success=vi.fn(),session={};flow.start(session,{defeat:false,onIntro:intro,onResult:success});flow.start(session,{defeat:true,onIntro:intro});expect(intro).not.toHaveBeenCalled();expect(success).toHaveBeenCalledTimes(1);});
 it('keeps campaign timeout, missed quota and arcade lives as separate real end conditions',()=>{const c=new Session({id:2,target:.8,time:1},CATALOG.slice(0,4));c.tick(2);expect(c.result).toMatchObject({reason:'time',pass:false,missed:4});expect(c).not.toHaveProperty('lives');const d=new Session({id:1,target:.75},CATALOG.slice(0,3));d.deck.forEach(i=>d.resolve(i.uid,i,'wrong'));expect(d.result).toMatchObject({reason:'complete',pass:false,stars:0});const a=new InfiniteSession(CATALOG,{seed:3});for(let i=0;i<3;i++){const item=a.nextItem();a.resolve(item.uid,item,'wrong');}expect(a.result).toMatchObject({reason:'lives',lives:0,wrong:3,total:3});a.tick(500);expect(a.elapsed).toBe(0);});
});
