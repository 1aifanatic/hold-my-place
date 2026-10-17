import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const config=JSON.parse(readFileSync(join(homedir(),'.mmx/config.json'),'utf8'));
const voice='moss_audio_ff64ff57-9268-11f1-834d-364bc9e5c396';
const lines=JSON.parse(readFileSync('artifacts/narration.json','utf8'));
mkdirSync('artifacts/voice',{recursive:true});
for(const line of lines){
 const path=`artifacts/voice/${line.id}.mp3`;
 if(!existsSync(path)){
  const r=await fetch(`${config.base_url||(config.region==='cn'?'https://api.minimaxi.com':'https://api.minimax.io')}/v1/t2a_v2`,{method:'POST',headers:{Authorization:`Bearer ${config.api_key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'speech-2.8-hd',text:line.text,stream:false,language_boost:'English',output_format:'hex',voice_setting:{voice_id:voice,speed:1.05,vol:1,pitch:0},audio_setting:{sample_rate:44100,bitrate:128000,format:'mp3',channel:1}}),signal:AbortSignal.timeout(120000)});
  const result=await r.json();if(!r.ok||result.base_resp?.status_code!==0)throw new Error(JSON.stringify(result.base_resp||{status:r.status}));
  writeFileSync(path,Buffer.from(result.data.audio,'hex'));writeFileSync(`artifacts/voice/${line.id}.receipt.json`,JSON.stringify({voice,model:'speech-2.8-hd',text:line.text,trace_id:result.trace_id},null,2));
 }
 line.duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',path],{encoding:'utf8'}).trim());
 console.log(`${line.id}: ${line.duration}s`);
}
writeFileSync('artifacts/narration-timing.json',JSON.stringify(lines,null,2));
