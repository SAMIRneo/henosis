import {forceSimulation,forceLink,forceManyBody,forceX,forceY,forceCollide} from 'd3-force';
import type {Graph} from '../lib/graph';
self.onmessage=(event:MessageEvent<Graph>)=>{
 const graph=event.data,nodes=graph.nodes.map(n=>({...n}));
 const sim=forceSimulation(nodes).stop().force('link',forceLink(graph.links.map(l=>({...l}))).id(n=>(n as {id:string}).id).distance(230).strength(.08)).force('charge',forceManyBody().strength(-400)).force('x',forceX(500).strength(.035)).force('y',forceY(350).strength(.035)).force('collide',forceCollide(80));
 sim.tick(140);sim.stop();
 const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y),xmin=Math.min(...xs),ymin=Math.min(...ys),dx=Math.max(1,Math.max(...xs)-xmin),dy=Math.max(1,Math.max(...ys)-ymin);
 for(const n of nodes){n.x=Math.round(160+(n.x-xmin)/dx*680);n.y=Math.round(110+(n.y-ymin)/dy*480)}
 self.postMessage(nodes);
};
