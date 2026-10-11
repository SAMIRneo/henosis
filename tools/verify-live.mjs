import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin='https://samirneo.github.io/henosis/';
const output=process.env.HENOSIS_OUTPUT||'work/qa';await mkdir(output,{recursive:true});
const hash=data=>createHash('sha256').update(data).digest('hex');
async function walk(dir,prefix=''){const result=[];for(const item of await readdir(dir,{withFileTypes:true})){const name=prefix+item.name;if(item.isDirectory())result.push(...await walk(dir+'/'+item.name,name+'/'));else if(/\.(html|json|xml|txt)$/.test(name))result.push(name)}return result}
const paths=await walk('dist');
const entries=[];
for(const path of paths){const local=await readFile('dist/'+path);const response=await fetch(origin+path+'?verification='+Date.now(),{signal:AbortSignal.timeout(30000)});const live=Buffer.from(await response.arrayBuffer());entries.push({path,status:response.status,match:hash(local)===hash(live),sha256:hash(local)});}
// Also verify every production JS and CSS file referenced by or deferred from the build.
for(const file of (await readdir('dist/_astro')).filter(f=>/\.(js|css)$/.test(f))){const path='_astro/'+file,local=await readFile('dist/'+path);const response=await fetch(origin+path,{signal:AbortSignal.timeout(30000)}),live=Buffer.from(await response.arrayBuffer());entries.push({path,status:response.status,match:hash(local)===hash(live),sha256:hash(local)})}
const result={commit:process.argv[2]||null,date:new Date().toISOString(),url:origin,pass:entries.every(e=>e.status===200&&e.match),entries};await writeFile(output+'/live-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({commit:result.commit,files:entries.length,pass:result.pass,failed:entries.filter(e=>!e.match||e.status!==200)}));if(!result.pass)process.exit(1);
