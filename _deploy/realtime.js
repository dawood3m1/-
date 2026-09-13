(function(){
  const KEY='asafni_live_v2',STORE='asafni_cases_v2';
  const bc=('BroadcastChannel' in window)?new BroadcastChannel('asafni_ch'):null;
  const subs={};
  let lastId='';
  let fbReady=false,fbRefs=null;
  const CFG=(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey)?window.FIREBASE_CONFIG:null;

  function fire(type,payload,msg){
    const fns=(subs[type]||[]).slice();
    for(const f of fns){try{f(payload,msg);}catch(e){}}
  }

  function handle(msg){
    if(!msg||!msg.type||!msg.id||msg.id===lastId)return;
    lastId=msg.id;
    const p=msg.payload;
    if(msg.type==='case-new'&&p&&p.id)upsertCase(p);
    else if(msg.type==='case-update'&&p&&p.id)upsertCase(p);
    else if(msg.type==='case-removed'&&p&&p.id)removeCaseStore(p.id);
    fire(msg.type,p,msg);
  }

  function emit(type,payload){
    const msg={type,payload,id:Math.random().toString(36).slice(2,10),ts:Date.now()};
    lastId=msg.id;
    if(fbReady){
      try{
        fbRefs.messages.push(msg);
        if(type==='amb-telemetry'&&payload&&payload.id)fbRefs.amb.child(payload.id).set(payload);
      }catch(e){}
      return;
    }
    try{localStorage.setItem(KEY,JSON.stringify(msg));}catch(e){}
    if(bc){try{bc.postMessage(msg);}catch(e){}}
  }

  function getCases(){try{return JSON.parse(localStorage.getItem(STORE)||'[]');}catch(_){return[];}}
  function setCases(a){try{localStorage.setItem(STORE,JSON.stringify(a));}catch(_){}}
  function removeCaseStore(id){setCases(getCases().filter(c=>c.id!==id));}
  function getCase(id){return getCases().find(c=>c.id===id)||null;}
  function upsertCase(c){const a=getCases();const i=a.findIndex(x=>x.id===c.id);if(i>=0){a[i]={...a[i],...c};}else{a.unshift(c);}setCases(a);}

  function syncFirebaseCase(c){if(fbReady&&c&&c.id){try{fbRefs.cases.child(c.id).set(c);}catch(e){}}}

  function addCase(c){upsertCase(c);emit('case-new',c);syncFirebaseCase(c);return c;}
  function updateCase(id,patch){const a=getCases();const i=a.findIndex(x=>x.id===id);if(i<0)return null;const c={...a[i],...patch};a[i]=c;setCases(a);emit('case-update',c);syncFirebaseCase(c);return c;}
  function removeCase(id){removeCaseStore(id);emit('case-removed',{id:id});if(fbReady){try{fbRefs.cases.child(id).remove();}catch(e){}}}

  // المحرك المحلي: قناة تبويب + مخزن تخزين
  if(bc){bc.onmessage=e=>handle(e.data);}
  window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{handle(JSON.parse(e.newValue));}catch(_){}}});
  setInterval(()=>{try{const raw=localStorage.getItem(KEY);if(raw)handle(JSON.parse(raw));}catch(_){}},350);

  // المحرك السحابي (Firebase Realtime Database) لربط أجهزة متعددة
  function bootFirebase(){
    try{
      firebase.initializeApp(CFG);
      fbRefs={messages:firebase.database().ref('messages'),cases:firebase.database().ref('cases'),amb:firebase.database().ref('amb')};
      fbReady=true;
      fbRefs.messages.on('child_added',snap=>{try{handle(snap.val());}catch(e){}});
      fbRefs.cases.once('value',snap=>{
        snap.forEach(ch=>{const c=ch.val();if(c&&c.id)upsertCase(c);});
        fire('case-sync',{count:getCases().length});
      });
      fbRefs.amb.once('value',snap=>{
        snap.forEach(ch=>{const t=ch.val();if(t&&t.id)fire('amb-telemetry',t);});
      });
    }catch(e){fbReady=false;}
  }
  if(CFG){
    let loaded=0;
    const onL=()=>{loaded++;if(loaded>=2){try{bootFirebase();}catch(e){}}};
    const s1=document.createElement('script');s1.src='https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js';
    const s2=document.createElement('script');s2.src='https://www.gstatic.com/firebasejs/10.12.5/firebase-database-compat.js';
    s1.onload=onL;s2.onload=onL;s1.onerror=()=>{};s2.onerror=()=>{};
    document.head.appendChild(s1);document.head.appendChild(s2);
  }

  const CRIT=['نزيف','إصابة رأس','مغمى عليه','ألم في الصدر','صعوبة تنفس','نوبة تشنجية'];
  const URGENT=['دوخة / دوار'];
  function priorityFor(conds){
    const list=conds||[];
    if(list.some(c=>CRIT.includes(c)))return 'crit';
    if(list.some(c=>URGENT.includes(c)))return 'urgent';
    return 'stable';
  }
  function timeAgo(ts){
    const d=Date.now()-ts;
    if(d<60000)return 'الآن';
    const m=Math.floor(d/60000);
    if(m<60)return 'قبل '+m+' دقيقة';
    const h=Math.floor(m/60);
    return 'قبل '+h+' ساعة';
  }

  function on(type,cb){(subs[type]=subs[type]||[]).push(cb);return function off(){const arr=subs[type]||[];const i=arr.indexOf(cb);if(i>=0)arr.splice(i,1);};}

  window.RT={KEY,STORE,on,emit,send:emit,getCases,setCases,getCase,upsertCase,addCase,updateCase,removeCase,priorityFor,timeAgo,getMode:()=>fbReady?'firebase':'local'};
})();