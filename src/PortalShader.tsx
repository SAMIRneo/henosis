import {useEffect,useRef} from 'react';
import * as THREE from 'three';

// An engraved aperture, rendered above the supplied artwork. The image remains
// the accessible, complete fallback when WebGL is unavailable.
export default function PortalShader({still,beyond}:{still:boolean;beyond:boolean}) {
 const mount=useRef<HTMLDivElement>(null),paused=useRef(still),opened=useRef(beyond),refresh=useRef<()=>void>(()=>{});
 useEffect(()=>{paused.current=still;opened.current=beyond;refresh.current()},[still,beyond]);
 useEffect(()=>{
  const el=mount.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'})}catch{return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));el.appendChild(renderer.domElement);
  const uniforms={time:{value:0},aspect:{value:1},opening:{value:Number(opened.current)},pointer:{value:new THREE.Vector2(.5,.5)}};
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,
   vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
   fragmentShader:`varying vec2 vUv;uniform float time,aspect,opening;uniform vec2 pointer;
    void main(){
     vec2 p=(vUv-vec2(.59,.51))*vec2(aspect,1.);
     float angle=atan(p.y,p.x),r=length(p);
     float radius=.295+opening*.035;
     float wave=sin(angle*7.+time*.28)*.0018+sin(angle*19.-time*.14)*.001;
     float rim=1.-smoothstep(.001,.004,abs(r-radius-wave));
     float outer=(1.-smoothstep(.0007,.0017,abs(r-radius-.025)))*.27;
     float engraving=step(.92,sin(angle*96.))*(1.-smoothstep(.004,.009,abs(r-radius-.016)))*.45;
     float light=.42+.58*pow(max(0.,cos(angle-time*.12)),6.);
     float lens=exp(-length((vUv-pointer)*vec2(aspect,1.))*16.);
     vec3 bronze=vec3(.76,.60,.36),ice=vec3(.48,.76,.80);
     vec3 metal=mix(bronze,ice,opening);
     float alpha=(rim*light+outer+engraving)*.65;
     float grain=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
     alpha+=lens*.055*step(.97,grain);
     gl_FragColor=vec4(metal*(.8+lens*.25),alpha);
    }`});
  const geometry=new THREE.PlaneGeometry(2,2),scene=new THREE.Scene(),camera=new THREE.Camera();scene.add(new THREE.Mesh(geometry,material));
  let frame=0,visible=false,last=0,disposed=false;
  const target=new THREE.Vector2(.5,.5);
  const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0};
  const paint=()=>renderer.render(scene,camera);
  const draw=(now:number)=>{frame=0;if(paused.current||!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
   uniforms.time.value+=dt;uniforms.opening.value+=(Number(opened.current)-uniforms.opening.value)*(1-Math.exp(-dt*5));uniforms.pointer.value.lerp(target,1-Math.exp(-dt*7));paint();frame=requestAnimationFrame(draw)};
  const sync=()=>{stop();if(disposed||!visible||document.hidden)return;if(paused.current)uniforms.opening.value=Number(opened.current);paint();if(!paused.current)frame=requestAnimationFrame(draw)};
  refresh.current=sync;
  const surface=el.parentElement!;
  const move=(e:PointerEvent)=>{if(paused.current||e.pointerType!=='mouse')return;const b=el.getBoundingClientRect();target.set((e.clientX-b.left)/b.width,1-(e.clientY-b.top)/b.height)};
  const leave=()=>target.set(.5,.5);surface.addEventListener('pointermove',move,{passive:true});surface.addEventListener('pointerleave',leave);
  const resize=new ResizeObserver(()=>{const b=el.getBoundingClientRect();if(!b.width||!b.height)return;renderer.setSize(b.width,b.height);uniforms.aspect.value=b.width/b.height;sync()});resize.observe(el);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()});observer.observe(el);document.addEventListener('visibilitychange',sync);
  return()=>{disposed=true;stop();refresh.current=()=>{};resize.disconnect();observer.disconnect();surface.removeEventListener('pointermove',move);surface.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',sync);geometry.dispose();material.dispose();renderer.dispose();el.replaceChildren()};
 },[]);
 return <div className="portal-shader" ref={mount} aria-hidden="true"/>;
}
