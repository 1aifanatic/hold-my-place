const core=globalThis.HoldMyPlaceCore;
const $=id=>document.getElementById(id);
const library=new URLSearchParams(location.search).get('task')==='library';
const taskTitle=library?'Library membership':'Licence renewal';
const storageKey=library?'hmp-demo-library':'hmp-demo';
if(library){document.title='Library membership · Hold My Place';document.querySelector('.form-panel').setAttribute('aria-label','Mock library membership');document.querySelector('.form-top strong').textContent='Community Library';$('form-help').textContent='Practice applying for a library card with made-up details.';}
let step=0,place,lastFocus;
const titles=['Let’s start with you.','Where do you live?','Add a recent photo.','Check your details.','One last little step.'];
const labels=['Your details','Address','Photo','Review','Finish'];
try{place=JSON.parse(localStorage.getItem(storageKey));if(place?.expires<Date.now()){localStorage.removeItem(storageKey);place=null;}}catch{place=null;}
function status(text){$('status').textContent=text;}
function save(){try{if(place)localStorage.setItem(storageKey,JSON.stringify(place));else localStorage.removeItem(storageKey);}catch{status('Storage is unavailable; this place lasts for this page visit only.');}}
function setStep(n){step=n;document.querySelectorAll('fieldset').forEach(el=>el.hidden=Number(el.dataset.step)!==n);[...$('steps').children].forEach((el,i)=>{el.removeAttribute('aria-current');if(i===n)el.setAttribute('aria-current','step');});$('step-count').textContent=`${n+1} / 5`;$('step-label').textContent=`STEP ${n+1} OF 5`;$('form-title').textContent=titles[n];$('back').disabled=!n;$('next').textContent=n===4?'Finish practice':'Next step →';}
function draw(){const has=!!place;$('break').disabled=!has;$('ai').disabled=!has;$('capture').textContent=has?JSON.stringify(place.capture,null,2):'No capture yet.';$('payload').textContent=has?JSON.stringify(core.payload(place.capture),null,2):'Hold a place first.';if(has){$('cue').textContent=place.cue;$('note').value=place.capture.note;}}
function resume(){if(!place)return;$('resume').hidden=false;draw();status('Your place is here. Continue whenever you’re ready.');if($('speak').checked&&'speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(place.cue));}}
$('renewal').addEventListener('focusin',e=>{lastFocus=e.target;});
$('renewal').onsubmit=e=>{e.preventDefault();const active=document.querySelector(`fieldset[data-step="${step}"]`);for(const el of active.querySelectorAll('input'))if(!el.reportValidity())return;if(step<4)setStep(step+1);else{$('form-status').textContent='Practice complete. No application was submitted.';$('next').disabled=true;} };
// ponytail: Validate only the visible step; hidden required fields belong to later steps.
$('renewal').noValidate=true;
$('back').onclick=()=>{if(step)setStep(step-1);};
$('hold').onclick=()=>{const elements=[...document.querySelector(`fieldset[data-step="${step}"]`).querySelectorAll('input')];const c={url:location.href.split('#')[0],title:taskTitle,headings:[taskTitle,titles[step]],fields:elements.map(el=>({key:el.id,label:el.labels[0].textContent.trim(),required:el.required,filled:el.type==='checkbox'?el.checked:!!el.value})),focused:{key:lastFocus?.id||'',label:lastFocus?.labels?.[0]?.textContent.trim()||lastFocus?.textContent?.trim()||''},step:`Step ${step+1} of 5: ${labels[step]}`,scroll:scrollY,note:$('note').value.trim()};place={capture:c,cue:core.fallback(c),step,expires:Date.now()+86400000};save();draw();$('resume').hidden=true;status('Held on this device. Go ahead, take your break.');};
$('break').onclick=()=>$('pause').showModal();$('return').onclick=()=>{$('pause').close();resume();};
$('continue').onclick=()=>{setStep(place.step);const target=core.nextField(place.capture);const el=document.getElementById(target?.key);if(el){el.scrollIntoView({block:'center'});el.focus({preventScroll:true});el.classList.add('highlight');setTimeout(()=>el.classList.remove('highlight'),4000);}$('resume').hidden=true;status('Right here. One step at a time.');};
function forget(){place=null;save();try{localStorage.removeItem('hmp-demo');localStorage.removeItem('hmp-demo-library');}catch{}$('resume').hidden=true;$('note').value='';draw();speechSynthesis?.cancel();status('Everything held in this demo has been forgotten.');}
$('done').onclick=forget;$('forget').onclick=forget;
$('save-note').onclick=()=>{if(!place){status('Hold a place first, or keep this note ready for your next capture.');return;}place.capture.note=$('note').value.trim();place.cue=core.fallback(place.capture);save();draw();status('Your note is saved on this device.');};
$('correct').onclick=()=>{$('note').focus();status('Edit your note, then choose Save note.');};
$('ai').onclick=async()=>{if(!place)return;const current=place;$('ai').disabled=true;status('Asking Cloudflare AI. Your local cue is already saved.');try{const r=await fetch('/api/cue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(core.payload(current.capture)),signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok||!core.validCue(data.cue))throw new Error();if(place!==current)return;place.cue=data.cue;save();resume();status('Cloudflare AI cue ready. Check it, and edit anything that isn’t right.');}catch{status('AI is unavailable. Your local cue still works.');}finally{$('ai').disabled=!place;}};
document.addEventListener('keydown',e=>{if(e.altKey&&e.key.toLowerCase()==='h'){e.preventDefault();$('hold').click();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&place)resume();});
setStep(0);draw();if(place)resume();
