const core=globalThis.HoldMyPlaceCore;
const status=document.querySelector('#status');
const send=async msg=>{const r=await chrome.runtime.sendMessage(msg);if(r.error)throw new Error(r.error);return r;};
const action=(fn)=>async()=>{try{await fn();}catch(e){status.textContent=e.message;}};
function button(text,fn){const el=document.createElement('button');el.textContent=text;el.onclick=action(fn);return el;}
async function render(){
  const {places,settings}=await send({type:'state'});const list=document.querySelector('#places');list.replaceChildren();
  if(!places.length){const p=document.createElement('p');p.textContent='Nothing held yet. Open a page, then press Alt+H when you need a break.';list.append(p);}
  for(const p of places){
    const card=document.createElement('article');const title=document.createElement('h2');title.textContent=p.cue;
    const info=document.createElement('small');info.textContent=`${new URL(p.url).hostname} · ${new Date(p.created).toLocaleTimeString()} · ${p.source}`;
    const label=document.createElement('label');label.textContent='Your note';const note=document.createElement('textarea');note.maxLength=240;note.value=p.note||'';note.id='note-'+p.id;label.htmlFor=note.id;
    const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Inspect saved capture and AI preview';const saved=document.createElement('pre');saved.textContent=JSON.stringify(p,null,2);const preview=document.createElement('pre');preview.textContent=JSON.stringify(core.payload(p),null,2);const caption=document.createElement('p');caption.textContent='Only the following JSON goes to Cloudflare if you press Generate AI cue. Labels and notes may contain personal information: review first. URL, scroll position and field values are not sent.';details.append(summary,saved,caption,preview);
    card.append(title,info,button('Open',()=>chrome.tabs.create({url:p.url})),button('Delete',async()=>{await send({type:'delete',id:p.id});await render();}),label,note,button('Save note',async()=>{await send({type:'edit',id:p.id,note:note.value});await render();status.textContent='Note saved locally.';}),details);
    if(settings.ai && !core.sensitive(p)&&!core.dangerous(p))card.append(button('Generate AI cue',async()=>{status.textContent='Generating; your local cue remains available.';await send({type:'ai',id:p.id});await render();status.textContent='AI cue ready. You can edit it if it is wrong.';}));
    if(core.sensitive(p)) {const warn=document.createElement('p');warn.textContent='Sensitive page: cloud AI is blocked. This place stays local.';card.append(warn);}
    list.append(card);
    if(new URLSearchParams(location.search).get('edit')===p.id) note.focus();
  }
}
document.querySelector('#hold').onclick=action(async()=>{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});try{const r=await chrome.tabs.sendMessage(tab.id,{type:'capture'});if(r.error)throw new Error(r.error);await render();status.textContent='Place held on this device.';}catch{throw new Error('Open an ordinary website and reload it after installing. Browser settings and store pages cannot be captured.');}});
document.querySelector('#forget').onclick=action(async()=>{await send({type:'forget'});await render();status.textContent='All places, corrections and settings removed.';});
render().catch(e=>status.textContent=e.message);
