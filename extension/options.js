const fields=['expiry','voice','ai','endpoint'];
chrome.runtime.sendMessage({type:'state'}).then(({settings})=>fields.forEach(k=>{const e=document.getElementById(k);if(k==='ai')e.checked=settings[k];else e.value=settings[k];}));
document.querySelector('form').onsubmit=async e=>{e.preventDefault();const status=document.querySelector('#status');try{
  const settings=Object.fromEntries(fields.map(k=>[k,k==='ai'?document.getElementById(k).checked:document.getElementById(k).value]));settings.expiry=Number(settings.expiry);
  if(settings.ai){const u=new URL(settings.endpoint);if(u.protocol!=='https:'||!(u.hostname==='holdmyplace.aifanatic.pro'||u.hostname.endsWith('.workers.dev')))throw new Error('Enter https://holdmyplace.aifanatic.pro or an HTTPS workers.dev endpoint.');const granted=await chrome.permissions.request({origins:[u.origin+'/*']});if(!granted)throw new Error('Network permission was not granted; AI remains disabled.');settings.endpoint=u.origin;}
  await chrome.runtime.sendMessage({type:'settings',settings});status.textContent='Saved. AI only runs when you explicitly request a cue.';
}catch(err){status.textContent=err.message;}};
