import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import {buildGraph} from '../lib/graph';
import {href,origin,thesis} from '../lib/site';
export const GET:APIRoute=async()=>{
 const [rooms,notes,works,graph]=await Promise.all([getCollection('chambres'),getCollection('fragments'),getCollection('oeuvres'),buildGraph()]);
 const text=['# HENOSIS','Samir / HENOK, 22 ans, autodidacte et polymathe. Je construis en apprenant.','Thèse : '+thesis,'Les brouillons ne sont pas des recherches accomplies. Leur date indique leur préparation.','Lecture intégrale : '+origin+href('lecture'),'Graphe JSON : '+origin+href('graph.json'),'RSS : '+origin+href('rss.xml'),'## Chambres',...rooms.map(c=>`- ${c.data.title} : ${c.data.tension}. ${c.data.question} ${origin+href('chambres/'+c.id)}`),'## Fragments',...notes.map(n=>`- ${n.data.title} [${n.data.status}] : ${n.data.question} ${origin+href('fragments/'+n.id)}\n${n.body??''}`),'## Œuvres vérifiées',...works.map(w=>`- ${w.data.title} : ${w.data.url}\n${w.data.proof}\n${w.body??''}`),'## Relations',...graph.links.map(l=>`- ${l.source} → ${l.target} : ${l.why}`)].join('\n\n');
 return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};
