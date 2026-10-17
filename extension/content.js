(() => {
  const core=globalThis.HoldMyPlaceCore;
  let host, lastFocus, lastAnnounced;
  document.addEventListener('focusin', e=>{if(e.target!==host) lastFocus=e.target;},true);
  const label = el => core.clean(el.labels?.[0]?.textContent || el.getAttribute('aria-label') || el.getAttribute('placeholder') || (el.tagName==='BUTTON' ? el.textContent : '') || (el.type==='submit' ? 'Submit' : '') || el.name || el.id,70);
  const visible = el => !!el.getClientRects().length && getComputedStyle(el).visibility!=='hidden';
  function capture() {
    const fields=[...document.querySelectorAll('input,select,textarea')].filter(el=>visible(el)&&!['password','hidden','submit','button','reset'].includes(el.type)&&!el.disabled);
    const focus=lastFocus || document.activeElement;
    return {url:location.href.split('#')[0],title:core.clean(document.title),headings:[...document.querySelectorAll('h1,h2,h3')].filter(visible).slice(0,8).map(el=>core.clean(el.textContent)),fields:fields.slice(0,40).map((el,i)=>({key:String(i),label:label(el)||'Unlabelled field',required:el.required,filled:['checkbox','radio'].includes(el.type)?el.checked:!!el.value})),focused:{key:String(fields.indexOf(focus)),label:focus?label(focus):''},scroll:scrollY,step:core.clean(document.querySelector('[aria-current="step"]')?.textContent || ''),note:''};
  }
  function show(place,settings) {
    host?.remove();
    host=document.createElement('div');host.id='hold-my-place-banner';
    const shadow=host.attachShadow({mode:'open'});
    const style=document.createElement('style');style.textContent=':host{all:initial;position:fixed;top:16px;left:16px;right:16px;z-index:2147483647;font:16px/1.5 system-ui;color:#152c2a}section{max-width:900px;margin:auto;padding:20px;background:#fffdf7;border:2px solid #286459;border-radius:16px;box-shadow:0 8px 36px #0003}p{margin:0 0 12px;font-size:18px}button,a{font:inherit;margin:4px;padding:8px 14px;border:1px solid #286459;border-radius:8px;cursor:pointer;color:#153c35;background:white}button:first-of-type{background:#245b4f;color:white}a{display:inline-block}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}:focus-visible{outline:3px solid #b85e19;outline-offset:3px}';
    const section=document.createElement('section');section.setAttribute('aria-label','Your held place');
    const cue=document.createElement('p');cue.textContent=place.cue;
    if(settings.voice==='spoken') cue.className='sr';
    const live=document.createElement('p');live.className='sr';live.setAttribute('role','status');live.setAttribute('aria-live','polite');
    const next=document.createElement('button');next.textContent='Continue';next.onclick=()=>{
      const target=core.nextField(place);
      const fields=[...document.querySelectorAll('input,select,textarea')].filter(el=>visible(el)&&!['password','hidden','submit','button','reset'].includes(el.type)&&!el.disabled);
      const el=fields[Number(target?.key)];
      if(el && label(el)===target.label){el.scrollIntoView({block:'center',behavior:'instant'});el.focus({preventScroll:true});const previous=el.style.outline;el.style.outline='4px solid #b85e19';setTimeout(()=>el.style.outline=previous,4000);}
      else window.scrollTo({top:place.scroll,behavior:'instant'});
      host.remove();
    };
    const done=document.createElement('button');done.textContent='Done with this';done.onclick=async()=>{await chrome.runtime.sendMessage({type:'delete',id:place.id});host.remove();};
    const edit=document.createElement('a');edit.textContent="This isn't right";edit.href=chrome.runtime.getURL('popup.html')+'?edit='+encodeURIComponent(place.id);edit.target='_blank';edit.rel='noopener';
    section.append(cue,next,done,edit,live);shadow.append(style,section);document.documentElement.append(host);
    if(lastAnnounced!==place.id){
      setTimeout(()=>live.textContent=place.cue,100);lastAnnounced=place.id;
      if(settings.voice!=='text' && 'speechSynthesis' in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(place.cue));}
    }
  }
  async function resume(){if(document.hidden)return;try {const r=await chrome.runtime.sendMessage({type:'resume',url:location.href.split('#')[0]});if(r?.place)show(r.place,r.settings);else host?.remove();}catch{}}
  chrome.runtime.onMessage.addListener((msg,_,reply)=>{
    if(msg.type==='capture') {chrome.runtime.sendMessage({type:'save',capture:capture()}).then(r=>{if(r.place)show(r.place,r.settings);reply(r);});return true;}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)lastAnnounced=null;else resume();});
  chrome.storage.onChanged.addListener(()=>resume());
  resume();
})();
