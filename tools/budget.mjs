import {readFile,readdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {resolve} from 'node:path';
const html=await readFile('dist/index.html','utf8');
const roots=[...html.matchAll(/<script[^>]*src="([^"]+)"/g),...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map(m=>m[1]);
const seen=new Set();
async function collect(url){const name=url.replace(/^\/henosis\//,'');if(seen.has(name)||!name.endsWith('.js'))return;seen.add(name);const text=await readFile(resolve('dist',name),'utf8');for(const match of text.matchAll(/(?:from\s*|import\s*)["'](\.\/[^"']+)["']/g)){await collect('/henosis/_astro/'+match[1].slice(2))}}
for(const url of roots)await collect(url);
let critical=0;const files=[];for(const name of seen){const data=await readFile('dist/'+name);const gzip=gzipSync(data).length;critical+=gzip;files.push({file:name,bytes:data.length,gzip})}
const gpuFiles=(await readdir('dist/_astro')).filter(name=>name.startsWith('gpu.')&&name.endsWith('.js'));const gpu=[];for(const name of gpuFiles){const data=await readFile('dist/_astro/'+name);gpu.push({file:name,gzip:gzipSync(data).length})}
const result={criticalGzip:critical,budget:100000,pass:critical<100000,criticalFiles:files,deferredGPU:gpu};await writeFile('docs/BUDGET.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.pass)process.exit(1);
