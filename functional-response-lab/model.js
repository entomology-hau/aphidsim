/* Deterministic design, trial timing and ecological reference models. No dependencies. */
(function (root) {
  'use strict';
  const species = {
    persicae: {common:'Peach–potato aphid', scientific:'Myzus persicae', crop:'potatoes & brassicas', image:'aphid-green.webp'},
    fabae: {common:'Black bean aphid', scientific:'Aphis fabae', crop:'field beans & sugar beet', image:'aphid-black.webp'},
    pisum: {common:'Pea aphid', scientific:'Acyrthosiphon pisum', crop:'peas & other legumes', image:'aphid-green.webp'}
  };
  const predators = {
    ladybird:{common:'Seven-spot ladybird larva',scientific:'Coccinella septempunctata',stage:'4th instar'},
    lacewing:{common:'Green lacewing larva',scientific:'Chrysoperla carnea group',stage:'3rd instar'}
  };
  const presets = {
    type1:{label:'Type I',handling:0,captureK:20},
    type2:{label:'Type II',handling:1,captureK:20},
    type3:{label:'Type III',handling:1,captureK:20}
  };
  const responseType=c=>c.response||(c.handling===0?'type1':'type2');
  function captureChance(c,n){return responseType(c)==='type3'?Math.max(0,n)/(Math.max(0,n)+c.captureK):1;}
  function rng(seed) { let a=seed>>>0; return () => {a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}; }
  function shuffle(a,random){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
  function validate(raw){
    const densities=String(raw.densities).split(',').map(x=>x.trim());
    if(densities.some(x=>!/^\d+$/.test(x))) throw new Error('Enter whole-number densities separated by commas, such as 5, 10, 20, 40, 80.');
    const values=densities.map(Number);
    if(values.length<2||values.length>8||values.some(x=>x<1||x>120)||new Set(values).size!==values.length) throw new Error('Use 2–8 different densities, each between 1 and 120 aphids.');
    const duration=Number(raw.duration), handling=Number(raw.handling), replicates=Number(raw.replicates);
    if(!Number.isInteger(duration)||duration<5||duration>120) throw new Error('Trial length must be a whole number from 5 to 120 seconds.');
    if(!Number.isFinite(handling)||String(raw.handling).trim()===''||handling<0||handling>10) throw new Error('Handling time must be from 0 to 10 seconds.');
    if(!Number.isInteger(replicates)||replicates<2||replicates>6) throw new Error('Choose 2–6 replicates per density.');
    const response=raw.response||(handling===0?'type1':'type2'),captureK=Number(raw.captureK??20);
    if(!presets[response])throw new Error('Choose a functional response preset.');
    if(response==='type1'&&handling!==0)throw new Error('Type I uses zero handling time. Choose Type II or III to add handling.');
    if(response!=='type1'&&handling<0.1)throw new Error('Type II and III use a handling time of at least 0.1 s. Choose Type I for no delay.');
    if(!Number.isInteger(captureK)||captureK<1||captureK>120)throw new Error('Half-success density must be a whole number from 1 to 120.');
    if(!species[raw.prey]||!predators[raw.predator]||!['depletion','replacement'].includes(raw.replacement)||!['random','clustered'].includes(raw.distribution)||!['plain','veined'].includes(raw.background)||!['standard','large'].includes(raw.target)) throw new Error('Choose valid experimental conditions.');
    return {...raw,response,captureK,densities:values.sort((a,b)=>a-b),duration,handling:Math.round(handling*10)/10,replicates,group:String(raw.group||'').trim().slice(0,30)};
  }
  function schedule(config,seed){const random=rng(seed);const rows=[];for(let rep=1;rep<=config.replicates;rep++)for(const density of shuffle(config.densities,random))rows.push({density,replicate:rep,order:rows.length+1});return rows;}
  function layout(seed,target,distribution){
    const random=rng(seed),cols=target==='large'?19:23,rows=target==='large'?11:13,diameter=target==='large'?40.95:32.85;
    const dx=840/(cols-1),dy=480/(rows-1),jx=Math.max(0,(dx-diameter)/2-.5),jy=Math.max(0,(dy-diameter)/2-.5);
    let cells=[];for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)cells.push({id:row*cols+col,x:30+col*dx+(random()*2-1)*jx,y:30+row*dy+(random()*2-1)*jy,angle:random()*360});
    cells=shuffle(cells,random);
    if(distribution==='clustered'){
      const centres=Array.from({length:3},()=>({x:100+random()*700,y:90+random()*360}));
      const rank=new Map(cells.map(p=>[p.id,Math.min(...centres.map(c=>(p.x-c.x)**2+(p.y-c.y)**2))+random()*3000]));
      cells.sort((a,b)=>rank.get(a.id)-rank.get(b.id));
    }
    return cells;
  }
  function typeII(n,a,h,t,mode){
    if(n<=0||a<=0||t<=0)return 0;
    if(mode==='replacement')return a*n*t/(1+a*h*n);
    if(h===0)return n*(-Math.expm1(-a*t));
    let lo=0,hi=Math.min(n,t/h);
    for(let i=0;i<70;i++){const m=(lo+hi)/2;const f=m-n*(-Math.expm1(-a*(t-h*m)));if(f>0)hi=m;else lo=m;}
    return (lo+hi)/2;
  }
  // Type III uses a(N) = a N/(N+K), matching the game's density-dependent
  // capture chance. Integrate depletion as N changes; do not freeze a at N0.
  function prediction(n,a,c){
    const type=responseType(c),h=type==='type1'?0:c.handling,t=c.duration;
    if(type!=='type3')return typeII(n,a,h,t,c.replacement);
    if(n<=0||a<=0||t<=0)return 0;
    const k=c.captureK;
    if(c.replacement==='replacement'){const effective=a*n/(n+k);return effective*n*t/(1+effective*h*n);}
    let lo=0,hi=Math.min(n,h>0?t/h:n);
    for(let i=0;i<70;i++){
      const eaten=(lo+hi)/2,left=n-eaten;
      const required=left<=0?Infinity:(-Math.log1p(-eaten/n)+k*eaten/(n*left))/a+h*eaten;
      if(required>t)hi=eaten;else lo=eaten;
    }
    return (lo+hi)/2;
  }
  function summary(trials,metric='eaten'){
    const groups=new Map();for(const r of trials){if(!groups.has(r.density))groups.set(r.density,[]);groups.get(r.density).push(metric==='rate'?r.eaten/r.duration:metric==='proportion'?r.eaten/r.density:r.eaten);}
    return [...groups].sort((a,b)=>a[0]-b[0]).map(([density,values])=>{const n=values.length,mean=values.reduce((s,x)=>s+x,0)/n;const sd=n>1?Math.sqrt(values.reduce((s,x)=>s+(x-mean)**2,0)/(n-1)):null;return{density,n,mean,sd,se:sd===null?null:sd/Math.sqrt(n)};});
  }
  // Counts only prey whose handling has finished by the fixed trial deadline.
  class TrialEngine{
    constructor(config,density,random=Math.random){this.config=config;this.random=random;this.density=density;this.eaten=0;this.remaining=density;this.attacks=0;this.failedAttacks=0;this.misses=0;this.pending=null;this.elapsed=0;this.finished=false;this.handlingSpent=0;this.events=[];this.attempts=[];}
    advance(elapsed){
      this.elapsed=Math.min(this.config.duration,Math.max(this.elapsed,elapsed));
      if(this.pending&&this.pending.end<=this.elapsed+1e-9&&this.pending.end<=this.config.duration+1e-9){
        const p=this.pending;this.eaten++;this.remaining--;if(this.config.replacement==='replacement')this.remaining++;
        this.handlingSpent+=this.config.handling;this.events.push({target:p.target,capture:p.start,completed:p.end});this.pending=null;
      }
      if(this.elapsed>=this.config.duration)this.finished=true;
      return this;
    }
    capture(target,elapsed){
      this.advance(elapsed);if(this.finished||this.pending||this.remaining<=0)return false;
      this.attacks++;const probability=captureChance(this.config,this.remaining),success=probability===1||this.random()<probability;
      this.attempts.push({target,time:this.elapsed,prey:this.remaining,probability,success});
      if(!success){this.failedAttacks++;return false;}
      this.pending={target,start:this.elapsed,end:this.elapsed+this.config.handling};this.advance(this.elapsed);return true;
    }
    result(){const partial=this.pending?Math.max(0,Math.min(this.config.duration-this.pending.start,this.config.handling)):0;return{eaten:this.eaten,attacks:this.attacks,failedAttacks:this.failedAttacks,misses:this.misses,unfinished:this.pending?1:0,handlingSpent:this.handlingSpent+partial,searchTime:Math.max(0,this.config.duration-this.handlingSpent-partial)};}
  }
  function csvCell(value){const s=value===null||value===undefined?'':String(value);const safe=/^[\s]*[=+@-]/.test(s)&&typeof value!=='number'?"'"+s:s;return /[",\r\n]/.test(safe)?'"'+safe.replace(/"/g,'""')+'"':safe;}
  function csv(rows){if(!rows.length)return '';const keys=Object.keys(rows[0]);return '\uFEFF'+[keys.map(csvCell).join(','),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\r\n');}
  const api={species,predators,presets,responseType,captureChance,rng,shuffle,validate,schedule,layout,typeII,prediction,summary,TrialEngine,csv};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FunctionalLab=api;
})(typeof window!=='undefined'?window:globalThis);
