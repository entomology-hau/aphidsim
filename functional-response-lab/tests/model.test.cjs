'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../model.js');
const base={prey:'persicae',predator:'ladybird',duration:20,handling:1,replicates:3,densities:'5,10,20,40,80',replacement:'depletion',distribution:'random',background:'plain',target:'standard',group:''};
test('complete randomised replicate blocks contain each density once',()=>{const c=M.validate(base),s=M.schedule(c,42);assert.equal(s.length,15);assert.deepEqual(s,M.schedule(c,42));for(let i=0;i<3;i++)assert.deepEqual(s.slice(i*5,i*5+5).map(r=>r.density).sort((a,b)=>a-b),c.densities);assert.notDeepEqual(s,M.schedule(c,43));});
test('invalid designs cannot silently change density or trial duration',()=>{for(const x of ['5,5','0,10','1,121','1,2.5','5,',''])assert.throws(()=>M.validate({...base,densities:x}));assert.throws(()=>M.validate({...base,duration:5.5}));assert.throws(()=>M.validate({...base,handling:''}));});
test('all placement modes keep target circles inside arena and separated',()=>{for(const target of ['standard','large'])for(const distribution of ['random','clustered'])for(const seed of [1,42,1234]){const p=M.layout(seed,target,distribution).slice(0,120),d=target==='large'?40.95:32.85;assert.equal(p.length,120);for(let i=0;i<p.length;i++){assert.ok(p[i].x>=d/2&&p[i].x<=900-d/2&&p[i].y>=d/2&&p[i].y<=540-d/2);for(let j=0;j<i;j++)assert.ok(Math.hypot(p[i].x-p[j].x,p[i].y-p[j].y)>=d);}}});
test('capture blocks during handling and consumes once at completion',()=>{const e=new M.TrialEngine(base,5);assert.equal(e.capture(1,.1),true);assert.equal(e.eaten,0);assert.equal(e.capture(2,.5),false);e.advance(1.1);assert.equal(e.eaten,1);assert.equal(e.remaining,4);e.advance(2);assert.equal(e.eaten,1);assert.equal(e.capture(2,2),true);});
test('unfinished handling is excluded at timeout; delayed frame includes timely completion',()=>{const e=new M.TrialEngine(base,5);e.capture(1,19.5);e.advance(20.2);assert.equal(e.eaten,0);assert.equal(e.result().unfinished,1);assert.equal(e.result().handlingSpent,.5);assert.equal(e.result().searchTime,19.5);assert.equal(e.capture(2,21),false);const f=new M.TrialEngine(base,5);f.capture(1,18.9);f.advance(22);assert.equal(f.eaten,1);assert.equal(f.result().unfinished,0);});
test('zero handling, prey depletion, replacement and boundary completion',()=>{const e=new M.TrialEngine({...base,handling:0},1);e.capture(1,0);assert.equal(e.eaten,1);assert.equal(e.capture(2,1),false);const r=new M.TrialEngine({...base,handling:0,replacement:'replacement'},1);for(let i=0;i<10;i++)assert.equal(r.capture(i,i),true);assert.equal(r.eaten,10);assert.equal(r.remaining,1);const b=new M.TrialEngine(base,3);b.capture(1,19);b.advance(20);assert.equal(b.eaten,1);});
test('Rogers solution satisfies equation and obeys prey/time bounds',()=>{for(const n of [1,5,80,120])for(const h of [0,.2,1,10])for(const a of [.001,.12,5]){const x=M.typeII(n,a,h,20,'depletion');assert.ok(x>=0&&x<=n+1e-8);if(h>0)assert.ok(x<=20/h+1e-8);assert.ok(Math.abs(x-n*(1-Math.exp(-a*(20-h*x))))<1e-7);assert.ok(x<=M.typeII(n,a,h,20,'replacement')+1e-7);}});
test('Holling reference, sample SD, SE and single observations are correct',()=>{assert.equal(M.typeII(10,.1,1,20,'replacement'),10);const s=M.summary([{density:10,eaten:2},{density:10,eaten:4},{density:5,eaten:1}]);assert.equal(s[0].se,null);assert.equal(s[1].mean,3);assert.ok(Math.abs(s[1].sd-Math.SQRT2)<1e-12);assert.equal(s[1].se,1);});
test('CSV preserves rows, quotes labels and neutralises spreadsheet formulas',()=>{const csv=M.csv([{label:'=1+1',value:2},{label:'a,"b"',value:null}]);assert.ok(csv.includes("'=1+1,2"));assert.ok(csv.includes('"a,""b""",'));assert.ok(csv.startsWith('\uFEFF'));});
test('response presets and validation keep the mechanisms consistent',()=>{
  assert.equal(M.presets.type1.handling,0);assert.equal(M.presets.type2.handling,1);assert.equal(M.presets.type3.handling,1);
  assert.equal(M.validate({...base,handling:0}).response,'type1');
  for(const c of [{response:'type1',handling:1},{response:'type2',handling:0},{response:'type3',captureK:0},{response:'type3',captureK:20.5}])assert.throws(()=>M.validate({...base,...c}));
});
test('Type III capture failures do not consume prey or initiate handling; chance follows depletion',()=>{
  const c={...base,response:'type3',captureK:20};
  assert.equal(M.captureChance(c,5),.2);assert.equal(M.captureChance(c,20),.5);assert.equal(M.captureChance(c,80),.8);
  const draws=[.9,.1,.49],e=new M.TrialEngine(c,20,()=>draws.shift());
  assert.equal(e.capture(1,0),false);assert.equal(e.pending,null);assert.equal(e.eaten,0);assert.equal(e.failedAttacks,1);
  assert.equal(e.capture(1,.2),true);assert.equal(e.capture(2,.3),false);assert.equal(e.attacks,2);
  e.advance(1.2);assert.equal(e.remaining,19);assert.equal(e.capture(2,1.3),false);assert.equal(e.failedAttacks,2);
  assert.equal(e.attempts.length,3);assert.equal(e.attempts[2].probability,19/39);
  const a=new M.TrialEngine(c,20,M.rng(4)),b=new M.TrialEngine(c,20,M.rng(4));for(let i=0;i<10;i++){a.capture(i,i*2);b.capture(i,i*2);}assert.deepEqual(a.attempts,b.attempts);
});
test('reference curves use each preset and Type III integrates changing density',()=>{
  const c={...base,response:'type3',captureK:20};
  for(const n of [1,5,20,80,120])for(const a of [.001,.12,5])for(const h of [.1,1,10]){
    const config={...c,handling:h},x=M.prediction(n,a,config),left=n-x;
    assert.ok(x>=0&&x<n&&x<=20/h+1e-8);
    const elapsed=(-Math.log1p(-x/n)+20*x/(n*left))/a+h*x;
    assert.ok(Math.abs(elapsed-20)<1e-7);
    assert.ok(x<=M.prediction(n,a,{...config,replacement:'replacement'})+1e-8);
  }
  assert.equal(M.prediction(10,.1,{...base,response:'type1',handling:0,replacement:'replacement'}),20);
  assert.equal(M.prediction(10,.1,{...base,response:'type2',replacement:'replacement'}),10);
  assert.equal(M.prediction(20,.1,{...c,replacement:'replacement'}),10);
  const y=n=>M.prediction(n,.12,{...c,replacement:'replacement'});
  assert.ok(y(2)-y(1)>y(1)-y(0));assert.ok(y(80)-y(79)<y(40)-y(39));
});
