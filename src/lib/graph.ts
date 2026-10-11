import {getCollection} from 'astro:content';
import {forceSimulation,forceLink,forceManyBody,forceCenter,forceCollide,forceX,forceY,type SimulationNodeDatum} from 'd3-force';
import {href} from './site';
export interface GraphNode {id:string;title:string;url:string;chambres:string[];status:string;x:number;y:number}
export interface GraphLink {id:string;source:string;target:string;why:string}
export interface Graph {version:1;nodes:GraphNode[];links:GraphLink[]}
let cached:Promise<Graph>|undefined;
export function buildGraph():Promise<Graph>{return cached??=(async()=>{
 const [fragments,chambres]=await Promise.all([getCollection('fragments'),getCollection('chambres')]);
 if(chambres.length>6)throw Error('Six chambres maximum');
 const ids=new Set(fragments.map(f=>f.id)),rooms=new Set(chambres.map(c=>c.id));
 const links:GraphLink[]=[];
 const nodes=fragments.sort((a,b)=>a.id.localeCompare(b.id)).map((f,i)=>{
  for(const room of f.data.chambres)if(!rooms.has(room))throw Error(`Chambre inconnue : ${f.id} → ${room}`);
  for(const relation of f.data.relates){if(!ids.has(relation.slug)||relation.slug===f.id)throw Error(`Relation invalide : ${f.id} → ${relation.slug}`);links.push({id:`${f.id}:${relation.slug}`,source:f.id,target:relation.slug,why:relation.why});}
  const angle=i/fragments.length*Math.PI*2-Math.PI/2;
  return {id:f.id,title:f.data.title,url:href(`fragments/${f.id}`),chambres:f.data.chambres,status:f.data.status,x:500+Math.cos(angle)*280,y:350+Math.sin(angle)*230};
 });
 const positions=nodes.map(n=>({...n})) as (GraphNode&SimulationNodeDatum)[];
 const simulation=forceSimulation(positions).stop().force('link',forceLink(links.map(l=>({...l}))).id(n=>(n as GraphNode).id).distance(240)).force('charge',forceManyBody().strength(-1600)).force('center',forceCenter(500,350)).force('x',forceX(500).strength(.025)).force('y',forceY(350).strength(.025)).force('collision',forceCollide(85));
 simulation.tick(300);simulation.stop();
 const xs=positions.map(p=>p.x),ys=positions.map(p=>p.y),xmin=Math.min(...xs),ymin=Math.min(...ys),dx=Math.max(1,Math.max(...xs)-xmin),dy=Math.max(1,Math.max(...ys)-ymin);
 nodes.forEach((n,i)=>{const p=positions[i]!;n.x=Math.round(160+(p.x-xmin)/dx*680);n.y=Math.round(110+(p.y-ymin)/dy*480)});
 return {version:1,nodes,links};
})()}
