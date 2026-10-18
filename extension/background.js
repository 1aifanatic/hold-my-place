import './core.js';
const core = globalThis.HoldMyPlaceCore;
const defaults = {expiry:24, voice:'text', ai:false, endpoint:'https://holdmyplace.aifanatic.pro'};
async function state() {
  const s = await chrome.storage.local.get(['places','settings']);
  const places = (s.places || []).filter(p => p.expires > Date.now());
  if (places.length !== (s.places || []).length) await chrome.storage.local.set({places});
  return {places, settings:{...defaults,...s.settings}};
}
// ponytail: Serialize local mutations to keep simultaneous tabs from losing saves.
let queue = Promise.resolve();
function mutate(fn) {const job = queue.then(fn); queue = job.catch(() => {}); return job;}
chrome.alarms.create('expiry', {periodInMinutes:1});
chrome.alarms.onAlarm.addListener(() => mutate(state));
chrome.commands.onCommand.addListener(async name => {
  if(name !== 'hold-place') return;
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if(tab?.id) chrome.tabs.sendMessage(tab.id,{type:'capture'}).catch(()=>{});
});
chrome.runtime.onMessage.addListener((msg,sender,respond) => {
  const fromPage = !sender.url?.startsWith(chrome.runtime.getURL(''));
  if(fromPage && !['save','resume','delete'].includes(msg.type)) {respond({error:'Not allowed'});return;}
  const run = async () => {
    const s = await state();
    if(msg.type === 'state') return s;
    if(msg.type === 'resume') return {place:s.places.find(p=>p.url===msg.url),settings:s.settings};
    if(msg.type === 'save') {
      const capture = msg.capture;
      if (!capture || capture.url !== sender.url?.split('#')[0]) throw new Error('Page changed. Try holding again.');
      const p = {...capture,id:crypto.randomUUID(),created:Date.now(),expires:Date.now()+s.settings.expiry*3600000,cue:core.fallback(capture),source:'Local rules'};
      s.places = s.places.filter(x=>x.url!==p.url); s.places.unshift(p);
      await chrome.storage.local.set({places:s.places.slice(0,100)});
      return {place:p,settings:s.settings};
    }
    if(msg.type === 'delete') {
      s.places = s.places.filter(p=>p.id!==msg.id || (fromPage && p.url !== sender.url?.split('#')[0]));
      await chrome.storage.local.set({places:s.places});return {ok:true};
    }
    if(msg.type === 'forget') {await chrome.storage.local.clear(); return {ok:true};}
    if(msg.type === 'settings') {await chrome.storage.local.set({settings:{...s.settings,...msg.settings}});return {ok:true};}
    const p = s.places.find(p=>p.id===msg.id);
    if(!p) throw new Error('Place expired or removed.');
    if(msg.type === 'edit') {p.note=core.clean(msg.note,240);p.cue=core.fallback(p);p.source='Your note';p.corrections=(p.corrections||0)+1;}
    if(msg.type === 'ai') {
      if(!s.settings.ai || core.sensitive(p) || core.dangerous(p)) throw new Error('Cloud AI is disabled for this place. Local cue retained.');
      const endpoint = new URL(s.settings.endpoint);
      if(endpoint.protocol!=='https:' || !(endpoint.hostname==='holdmyplace.aifanatic.pro'||endpoint.hostname.endsWith('.workers.dev'))) throw new Error('Use https://holdmyplace.aifanatic.pro or an HTTPS workers.dev endpoint.');
      const r=await fetch(endpoint.origin+'/api/cue',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(core.payload(p)),signal:AbortSignal.timeout(12000)});
      if(!r.ok) throw new Error('AI unavailable. Your local cue is still saved.');
      const data=await r.json();if(!core.validCue(data.cue)) throw new Error('Invalid AI response. Local cue retained.');
      p.cue=data.cue;p.source='Cloudflare Workers AI';
    }
    await chrome.storage.local.set({places:s.places});return {place:p};
  };
  mutate(run).then(respond,e=>respond({error:e.message})); return true;
});


