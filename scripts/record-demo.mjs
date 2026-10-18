import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const base='https://holdmyplace.aifanatic.pro';
const lines=JSON.parse(readFileSync('artifacts/narration-timing.json','utf8'));
mkdirSync('artifacts/raw',{recursive:true});
const context=await chromium.launchPersistentContext('',{headless:true,channel:'chromium',args:[`--disable-extensions-except=${resolve('extension')}`,`--load-extension=${resolve('extension')}`],viewport:{width:1440,height:1000},recordVideo:{dir:'artifacts/raw',size:{width:1440,height:1000}}});
const page=await context.newPage();
const sw=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const id=new URL(sw.url()).host;
const video=page.video();const timeline=[];
const captions=['A pause shouldn’t mean starting over.','Five steps. One everyday task.','Hold → step away → return → continue.','Remember the structure. Never the answers.','Cloudflare Workers + optional Workers AI.','A real Chrome / Edge extension.','Your memory aid. Your rules.','Synthetic illustration only. No measured participant benefits.'];
async function caption(text){await page.evaluate(text=>{document.getElementById('record-caption')?.remove();const el=document.createElement('div');el.id='record-caption';el.textContent=text;el.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#183c34;color:#fff;padding:17px 28px;font:600 21px system-ui;z-index:2147483647;text-align:center;border-top:3px solid #c6d2ac';document.body.append(el);},text);}
const wait=ms=>page.waitForTimeout(ms);
const show=async selector=>{await page.locator(selector).scrollIntoViewIfNeeded();};
const origin=Date.now();
async function scene(index,fn){const start=(Date.now()-origin)/1000;await caption(captions[index]);await fn();const duration=lines[index].duration+2;await wait(Math.max(0,duration*1000-(Date.now()-origin-start*1000)));timeline.push({...lines[index],start,end:(Date.now()-origin)/1000});console.log(`Recorded ${index+1}`);}
try{
await page.goto(base);await wait(500);
await scene(0,async()=>{await page.evaluate(()=>scrollTo(0,0));});
await scene(1,async()=>{await show('#demo');await page.locator('#full-name').fill('Alex Taylor');await wait(600);await page.locator('#email').fill('alex@example.com');await page.locator('#next').click();await page.locator('#street').fill('12 Maple Street');await page.locator('#city').fill('Charlotte');await page.locator('#postal').fill('28211');await wait(500);await page.locator('#next').click();});
await scene(2,async()=>{await page.locator('#photo').focus();await page.locator('#hold').click();await wait(2200);await page.locator('#break').click();await wait(3000);await page.locator('#return').click();await wait(2500);await page.locator('#continue').click();});
await scene(3,async()=>{await page.getByText('What’s remembered?',{exact:true}).click();await show('#capture');await wait(4000);await page.locator('#note').fill('Waiting for my new photo');await page.locator('#save-note').click();await page.locator('#speak').check();await wait(2500);await page.getByText('What’s remembered?',{exact:true}).click();await page.locator('#note').fill('');await page.locator('#save-note').click();});
await scene(4,async()=>{await page.getByText('Optional Cloudflare AI',{exact:true}).click();await show('#payload');await wait(2500);const response=page.waitForResponse(r=>r.url().endsWith('/api/cue'));await page.locator('#ai').click();const r=await response;assert.equal(r.status(),200);const data=await r.json();assert.equal(data.source,'Cloudflare Workers AI');await show('#resume');await wait(3500);await page.locator('#forget').click();await page.getByText('Optional Cloudflare AI',{exact:true}).click();});
await scene(5,async()=>{await page.locator('#photo').focus();await sw.evaluate(async()=>{const [t]=await chrome.tabs.query({active:true,lastFocusedWindow:true});const r=await chrome.tabs.sendMessage(t.id,{type:'capture'});if(r.error)throw new Error(r.error);});await wait(4500);await page.locator('#hold-my-place-banner').getByRole('button',{name:'Continue',exact:true}).click();await wait(1800);await page.goto(`chrome-extension://${id}/popup.html`);await caption(captions[5]);await page.addStyleTag({content:'body{margin:60px auto;max-width:800px;width:800px}'});await page.locator('textarea').fill('Waiting for my new photo');await page.getByRole('button',{name:'Save note',exact:true}).click();});
await scene(6,async()=>{await page.goto(`chrome-extension://${id}/options.html`);await page.addStyleTag({content:'body{margin:40px auto;max-width:900px;width:900px}'});await caption(captions[6]);await page.locator('#voice').selectOption('both');await page.locator('#endpoint').fill(base);await page.getByRole('button',{name:'Save settings',exact:true}).click();await wait(5000);await page.locator('#expiry').selectOption('168');await wait(2000);await page.locator('#expiry').selectOption('24');});
await scene(7,async()=>{await sw.evaluate(()=>chrome.storage.local.clear());await page.goto(base+'/evaluation');await caption(captions[7]);});
writeFileSync('artifacts/recording-timeline.json',JSON.stringify(timeline,null,2));
}finally{await context.close();}
const path=await video.path();writeFileSync('artifacts/recording-source.txt',path);console.log(path);
