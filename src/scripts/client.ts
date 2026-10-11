import type {Graph} from '../lib/graph';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
type Connection=Navigator&{connection?:{saveData?:boolean;addEventListener?:(type:string,fn:()=>void)=>void}};
let gpu:typeof import('./surface')|undefined;
let motion:typeof import('./motion')|undefined;
let idle=0,epoch=0,worker:Worker|undefined;
let off=false;try{off=sessionStorage.getItem('henosis-motion')==='off'}catch{/* storage optional */}
const constrained=()=>off||reduced.matches||Boolean((navigator as Connection).connection?.saveData);
const getGraph=():Graph|undefined=>{const el=document.querySelector('#graph-data');return el?.textContent?JSON.parse(el.textContent) as Graph:undefined};
function selectNode(id:string,graph:Graph){
 const node=graph.nodes.find(n=>n.id===id);if(!node)return;
 document.querySelectorAll<HTMLElement|SVGElement>('[data-node]').forEach(el=>el.classList.toggle('active',el.dataset.node===id));
 document.querySelectorAll<SVGElement>('[data-edge]').forEach(el=>{const active=el.dataset.source===id||el.dataset.target===id;el.classList.toggle('active',active);el.classList.toggle('dim',!active)});
 document.querySelectorAll<HTMLElement>('[data-select]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.select===id)));
 const title=document.querySelector('[data-selection]'),reasons=document.querySelector('[data-reasons]');
 if(title)title.textContent=node.title;
 if(reasons){reasons.replaceChildren();for(const link of graph.links.filter(l=>l.source===id||l.target===id)){const p=document.createElement('p');p.textContent=link.why;reasons.append(p)}}
 gpu?.highlight(id,graph);
}
function bindGraph(graph:Graph){
 document.querySelectorAll<HTMLElement|SVGElement>('[data-node]').forEach(el=>{el.addEventListener('mouseenter',()=>selectNode(el.dataset.node!,graph));el.addEventListener('focus',()=>selectNode(el.dataset.node!,graph))});
 document.querySelectorAll<HTMLButtonElement>('[data-select]').forEach(el=>{el.hidden=false;el.addEventListener('click',()=>selectNode(el.dataset.select!,graph))});
 if(constrained()||document.documentElement.dataset.mode!=='graph')return;
 const version=epoch;
 worker=new Worker(new URL('./graph.worker.ts',import.meta.url),{type:'module'});
 worker.onmessage=(event:MessageEvent<Graph['nodes']>)=>{if(version!==epoch)return;const positions=event.data;for(const p of positions){const n=graph.nodes.find(n=>n.id===p.id);if(n){n.x=p.x;n.y=p.y}const el=document.querySelector<SVGAElement>(`[data-node="${p.id}"]`);el?.querySelector('path')?.setAttribute('transform',`translate(${p.x} ${p.y})`);const hit=el?.querySelector('circle');hit?.setAttribute('cx',String(p.x));hit?.setAttribute('cy',String(p.y));const text=el?.querySelector('text');text?.setAttribute('x',String(p.x+22));text?.setAttribute('y',String(p.y+5))}for(const link of graph.links){const a=graph.nodes.find(n=>n.id===link.source)!,b=graph.nodes.find(n=>n.id===link.target)!;const el=document.querySelector(`[data-edge="${link.id}"]`);for(const [key,value] of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))el?.setAttribute(key,String(value))}gpu?.arrange(graph);worker?.terminate();worker=undefined};
 worker.onerror=()=>{worker?.terminate();worker=undefined};
 worker.postMessage(graph);
}
async function enhance(version:number){
 if(version!==epoch||constrained())return;
 const graph=getGraph(),mode=document.documentElement.dataset.mode;
 if(!graph||mode==='reading'||mode==='content')return;
 motion??=await import('./motion');if(version!==epoch||constrained())return;
 motion.start(mode==='entry');
 // A separate idle task keeps renderer loading off the critical path.
 const start=async()=>{if(version!==epoch||constrained())return;try{gpu??=await import('./surface');if(version!==epoch||constrained())return;await gpu.start(graph);if(version!==epoch||constrained()){gpu.pause();return}gpu.arrange(graph)}catch{document.documentElement.dataset.gpu='fallback'}};
 window.setTimeout(()=>{if('requestIdleCallback' in window)window.requestIdleCallback(()=>void start(),{timeout:2500});else void start()},1900);
}
function load(){
 epoch++;const version=epoch;worker?.terminate();worker=undefined;
 if(idle&&'cancelIdleCallback' in window)window.cancelIdleCallback(idle);
 const root=document.documentElement;root.dataset.motion=constrained()?'off':'on';
 if(document.activeElement?.classList.contains('skip'))document.querySelector<HTMLElement>('main')?.focus({preventScroll:true});
 const toggle=document.querySelector<HTMLButtonElement>('#motion-toggle');
 if(toggle){toggle.hidden=reduced.matches||Boolean((navigator as Connection).connection?.saveData);toggle.setAttribute('aria-pressed',String(off));toggle.textContent=off?'Activer le mouvement':'Suspendre le mouvement';toggle.addEventListener('click',()=>{off=!off;try{sessionStorage.setItem('henosis-motion',off?'off':'on')}catch{}gpu?.pause();motion?.stop();load()})}
 const graph=getGraph();if(graph){bindGraph(graph);gpu?.arrange(graph)}else gpu?.pause();
 if(gpu?.isReady())root.dataset.gpu='ready';
 if(constrained()){gpu?.pause();motion?.stop();root.dataset.gpu='fallback';return}
 if('requestIdleCallback' in window)idle=window.requestIdleCallback(()=>void enhance(version),{timeout:1500});else setTimeout(()=>void enhance(version),300);
}
document.addEventListener('astro:page-load',load);
document.addEventListener('astro:before-swap',()=>{epoch++;worker?.terminate();motion?.stop();gpu?.pause()});
reduced.addEventListener('change',()=>{gpu?.dispose();motion?.stop();load()});
(navigator as Connection).connection?.addEventListener?.('change',()=>{gpu?.dispose();motion?.stop();load()});
window.addEventListener('pagehide',()=>{worker?.terminate();gpu?.dispose();motion?.stop()});

