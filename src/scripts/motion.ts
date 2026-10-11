import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {CustomEase} from 'gsap/CustomEase';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger,CustomEase);
CustomEase.create('henosis','.22,.68,.16,1');
let lenis:Lenis|undefined,entry:gsap.core.Timeline|undefined;
const ease='cubic-bezier(.22,.68,.16,1)';
export function start(home:boolean){
 stop();
 // GSAP owns the sole animation clock. Lenis is disabled for reduced motion.
 lenis=new Lenis({duration:1,easing:(t:number)=>1-Math.pow(1-t,4),smoothWheel:true,syncTouch:false,anchors:true});
 lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);
 if(home){
  const shards=gsap.utils.toArray<SVGGElement>('.shard');
  const label=document.querySelector('[data-phase]');
  if(label)label.textContent='Des fragments séparés.';
  entry=gsap.timeline({onComplete:()=>{if(label)label.textContent='Les fragments font une forme.';document.documentElement.dataset.entry='united'}});
  // Each displaced piece is a content fragment, never a generic particle.
  shards.forEach((el,i)=>{entry!.fromTo(el,{x:Math.sin(i*2.1)*150,y:Math.cos(i*1.7)*90,rotation:(i%2?1:-1)*(25+i*9),transformOrigin:'500px 350px'},{x:0,y:0,rotation:0,duration:1.2,ease:'henosis'},i*.045)});
  entry.fromTo('[data-thesis]',{y:12},{y:0,duration:.9,ease:'henosis'},0.4);
  entry.fromTo('[data-entry-thesis]',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.9,ease:'henosis'},.8);
 }
 document.documentElement.style.setProperty('--motion-curve',ease);
}
function tick(seconds:number){lenis?.raf(seconds*1000)}
export function stop(){entry?.kill();entry=undefined;gsap.ticker.remove(tick);lenis?.destroy();lenis=undefined;ScrollTrigger.getAll().forEach(trigger=>trigger.kill());}
