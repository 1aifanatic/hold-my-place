import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const timeline=JSON.parse(readFileSync('artifacts/recording-timeline.json','utf8'));
const source=readFileSync('artifacts/recording-source.txt','utf8').trim();
mkdirSync('public/media',{recursive:true});
const format=(n,sep=',')=>{const ms=Math.round(n*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}${sep}${String(ms%1000).padStart(3,'0')}`;};
let srt='',vtt='WEBVTT\n\n',index=0;
for(const line of timeline){const words=line.text.split(/\s+/);for(let i=0;i<words.length;i+=10){const start=line.start+line.duration*i/words.length;const end=line.start+line.duration*Math.min(i+10,words.length)/words.length;const caption=words.slice(i,i+10).join(' ');srt+=`${++index}\n${format(start)} --> ${format(end)}\n${caption}\n\n`;vtt+=`${format(start,'.')} --> ${format(end,'.')}\n${caption}\n\n`;}}
writeFileSync('artifacts/demo.srt',srt);writeFileSync('public/media/demo.vtt',vtt);
const args=['-y','-i',source];for(const line of timeline)args.push('-i',`artifacts/voice/${line.id}.mp3`);
const filters=timeline.map((line,i)=>`[${i+1}:a]adelay=${Math.round(line.start*1000)}:all=1[a${i}]`);
filters.push(timeline.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${timeline.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]`);
args.push('-filter_complex',filters.join(';'),'-map','0:v','-map','[a]','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-t',String(timeline.at(-1).end),'-movflags','+faststart','public/media/hold-my-place-demo.mp4');
execFileSync('ffmpeg',args,{stdio:'inherit'});
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json','public/media/hold-my-place-demo.mp4'],{encoding:'utf8'}));
writeFileSync('artifacts/video-check.json',JSON.stringify(probe,null,2));
execFileSync('ffmpeg',['-y','-ss','3','-i','public/media/hold-my-place-demo.mp4','-frames:v','1','public/media/poster.jpg'],{stdio:'inherit'});
console.log(`Final video: ${probe.format.duration} seconds; ${probe.format.size} bytes.`);
