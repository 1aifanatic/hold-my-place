import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const base=process.env.BASE_URL||'http://localhost:8787';
mkdirSync('artifacts',{recursive:true});
const context=await chromium.launchPersistentContext('',{headless:true,channel:'chromium',args:[`--disable-extensions-except=${resolve('extension')}`,`--load-extension=${resolve('extension')}`],viewport:{width:1440,height:1000}});
try{
const sw=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const id=new URL(sw.url()).host;
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});
await page.locator('#full-name').fill('PRIVATE TEST NAME');await page.locator('#email').fill('private@example.test');await page.locator('#next').click();
await page.locator('#street').fill('SECRET STREET');await page.locator('#city').fill('Charlotte');await page.locator('#postal').fill('28211');await page.locator('#next').click();
await page.locator('#photo').focus();
const popup=await context.newPage();await popup.goto(`chrome-extension://${id}/popup.html`);
// Drive the actual content-script capture message through the extension service worker.
await page.bringToFront();
const captureMilliseconds=await sw.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});const start=performance.now();const r=await chrome.tabs.sendMessage(tab.id,{type:'capture'});if(r.error)throw new Error(r.error);return performance.now()-start;});
assert.ok(captureMilliseconds<1000,`Capture took ${captureMilliseconds} ms`);
let saved=await sw.evaluate(()=>chrome.storage.local.get());assert.equal(saved.places.length,1);
assert.ok(saved.places[0].fields.some(f=>f.label==='Upload a photo'&&!f.filled));
for(const value of ['PRIVATE TEST NAME','private@example.test','SECRET STREET'])assert.ok(!JSON.stringify(saved).includes(value),'Captured a field value');
await page.bringToFront();await page.locator('#hold-my-place-banner').getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.evaluate(()=>document.activeElement.id),'photo');
await popup.reload();await popup.locator('textarea').fill('Waiting for a new photo');await popup.getByRole('button',{name:'Save note',exact:true}).click();await popup.getByText('Note saved locally.').waitFor();
saved=await sw.evaluate(()=>chrome.storage.local.get());assert.equal(saved.places[0].note,'Waiting for a new photo');
await popup.screenshot({path:'artifacts/extension-places.png'});
await popup.getByRole('button',{name:'Forget everything',exact:true}).click();await popup.getByText('All places, corrections and settings removed.').waitFor();assert.deepEqual((await sw.evaluate(()=>chrome.storage.local.get())).places||[],[]);
await page.bringToFront();await page.locator('#hold').click();await page.locator('#break').click();await page.locator('#return').click();assert.match(await page.locator('#cue').textContent(),/photo/i);await page.locator('#continue').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'photo');
await page.locator('#hold').click();await page.locator('#note').fill('Find a brighter photo');await page.locator('#save-note').click();assert.match(await page.locator('#capture').textContent(),/Find a brighter/);
await page.screenshot({path:'artifacts/demo-desktop.png',fullPage:true});
await page.locator('#forget').click();assert.equal(await page.evaluate(()=>localStorage.getItem('hmp-demo')),null);
// A focused submission control must never turn into a retry instruction.
await page.locator('#next').focus();
await sw.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});await chrome.tabs.sendMessage(tab.id,{type:'capture'});});
// Use an actual Submit control to exercise the guarded branch, without submitting.
await page.evaluate(()=>{const b=document.createElement('button');b.id='submit-check';b.textContent='Submit application';document.body.append(b);b.focus();});
await sw.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});await chrome.tabs.sendMessage(tab.id,{type:'capture'});});
saved=await sw.evaluate(()=>chrome.storage.local.get());assert.match(saved.places[0].cue,/^Check whether this was already submitted/);
// Expiry is checked when reading, including after a browser has been closed.
await sw.evaluate(async()=>{const {places}=await chrome.storage.local.get('places');places[0].expires=Date.now()-1;await chrome.storage.local.set({places});});
await popup.reload();await popup.getByText(/Nothing held yet/).waitFor();assert.equal((await sw.evaluate(()=>chrome.storage.local.get('places'))).places.length,0);
await page.bringToFront();
// Default capture remains usable offline and never invokes the optional AI route.
await context.setOffline(true);await page.locator('#photo').focus();
await sw.evaluate(async()=>{const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});const r=await chrome.tabs.sendMessage(tab.id,{type:'capture'});if(r.error)throw new Error(r.error);});
saved=await sw.evaluate(()=>chrome.storage.local.get());assert.equal(saved.places[0].source,'Local rules');await context.setOffline(false);await sw.evaluate(()=>chrome.storage.local.clear());
await page.setViewportSize({width:390,height:844});await page.goto(base);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
assert.deepEqual(errors,[]);writeFileSync('artifacts/browser-check.json',JSON.stringify({base,at:new Date().toISOString(),captureMilliseconds,passed:['extension capture','no typed values stored','return banner','continue focuses next field','note edit','wipe','demo hold/break/return','submit protection','expiry cleanup','offline capture','mobile no horizontal overflow','no page errors']},null,2));console.log('Browser and installed extension checks passed.');
}finally{await context.close();}

