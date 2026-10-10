import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';

const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const base=process.env.UI_LIVE_URL||'https://samirneo.github.io/henosis/';
const output=process.env.UI_QA_DIR||'test-results/ui';
const dist=path.resolve('dist'),files=await readdir(dist,{recursive:true,withFileTypes:true});
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
const results=[];
for(const file of files.filter(entry=>entry.isFile())){
  const filename=path.join(file.parentPath,file.name),relative=path.relative(dist,filename).split(path.sep).join('/');
  const response=await fetch(new URL(relative+'?verify='+commit,base));
  if(!response.ok)throw new Error(`${relative}: HTTP ${response.status}`);
  let local=await readFile(filename),remote=Buffer.from(await response.arrayBuffer());
  const text=/\.(html|svg)$/.test(relative);
  if(text){local=Buffer.from(local.toString().replaceAll('\r\n','\n'));remote=Buffer.from(remote.toString().replaceAll('\r\n','\n'));}
  if(hash(local)!==hash(remote))throw new Error(`${relative}: les fichiers diffèrent`);
  results.push({file:relative,status:response.status,sha256:hash(local),normalization:text?'LF':'none'});
}
await mkdir(output,{recursive:true});
await writeFile(path.join(output,'henosis-ui-skills-live.json'),JSON.stringify({url:base,commit,date:new Date().toISOString(),files:results},null,2));
console.log(`${results.length} fichiers publics vérifiés : HTTP 200 et empreintes SHA-256 identiques (fins de ligne HTML/SVG normalisées).`);
