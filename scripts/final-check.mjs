import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const base='https://holdmyplace.aifanatic.pro';
const paths=['/','/install','/privacy','/watch','/pitch','/evaluation','/downloads/hold-my-place.zip','/downloads/synthetic-results.csv','/media/hold-my-place-demo.mp4','/media/demo.vtt','/api/health'];
const results=[];
for(const path of paths){const r=await fetch(base+path,{method:'HEAD'});assert.equal(r.status,200,path);results.push({path,status:r.status,type:r.headers.get('content-type')});}
assert.match(results.find(r=>r.path.endsWith('.mp4')).type,/video/);
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/watch');await page.locator('video').evaluate(async v=>{v.muted=true;await v.play();});await page.waitForFunction(()=>document.querySelector('video').currentTime>0.2);
 const media=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.code||null}));assert.ok(media.duration>150);assert.equal(media.width,1440);assert.equal(media.error,null);
 await page.locator('video').evaluate(v=>{v.pause();v.currentTime=150;});await page.waitForTimeout(500);await page.screenshot({path:'artifacts/watch-live.png',fullPage:true});
 await page.goto(base+'/evaluation');assert.match(await page.locator('main').textContent(),/SYNTHETIC DATA/);await page.screenshot({path:'artifacts/evaluation-live.png',fullPage:true});
 await page.goto(base+'/?task=library');await page.locator('#hold').click();assert.match(await page.locator('#capture').textContent(),/Library membership/);await page.locator('#forget').click();
 assert.deepEqual(errors,[]);writeFileSync('artifacts/final-check.json',JSON.stringify({at:new Date().toISOString(),results,media,errors},null,2));console.log('Public pages, ZIP, captions, playable video, synthetic evaluation and library variant verified.');
}finally{await browser.close();}
