import {WebGPURenderer,Scene,OrthographicCamera,InstancedMesh,BufferGeometry,Float32BufferAttribute,MeshBasicNodeMaterial,Matrix4,Color,DoubleSide} from 'three/webgpu';
import {color,hash,screenCoordinate,float,mix,normalLocal,instanceIndex} from 'three/tsl';
import {gsap} from 'gsap';
import type {Graph} from '../lib/graph';
let renderer:WebGPURenderer|undefined,scene:Scene|undefined,camera:OrthographicCamera|undefined,mesh:InstancedMesh|undefined;
let graph:Graph|undefined,frame=0,last=0,samples=0,total=0,active=false,initializing:Promise<void>|undefined;
let ratio=1,observer:IntersectionObserver|undefined;
const matrix=new Matrix4(),scale=new Matrix4(),rotation=new Matrix4(),tilt=new Matrix4(),tint=new Color();
type Pose={x:number;y:number;sx:number;sy:number;angle:number};
let poses:Pose[]=[],tween:gsap.core.Tween|undefined;
let observed:Element|undefined;
let layoutScroll=0;
export function isReady(){return Boolean(renderer)}
export async function start(data:Graph){
 if(renderer)return; if(initializing)return initializing;
 graph=data;
 initializing=(async()=>{
  const canvas=document.querySelector<HTMLCanvasElement>('#henosis-canvas');if(!canvas)return;
  const candidate=new WebGPURenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  try{await candidate.init()}catch{candidate.dispose();document.documentElement.dataset.gpu='fallback';return}
  renderer=candidate;scene=new Scene();camera=new OrthographicCamera(0,innerWidth,0,innerHeight,-10,10);camera.position.z=2;
  const step=Math.PI*2/data.nodes.length;
  const x=Math.cos(step),y=Math.sin(step),z=.035;
  // A triangular brass plate has two faces and three edges. The same prism
  // is instanced once per fragment, with a slight fold around the shared axis.
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute([
   0,0,z,1,0,z,x,y,z, 0,0,-z,x,y,-z,1,0,-z,
   0,0,z,0,0,-z,1,0,z, 1,0,z,0,0,-z,1,0,-z,
   1,0,z,1,0,-z,x,y,z, x,y,z,1,0,-z,x,y,-z,
   x,y,z,x,y,-z,0,0,z, 0,0,z,x,y,-z,0,0,-z
  ],3));geometry.computeVertexNormals();
  const material=new MeshBasicNodeMaterial({side:DoubleSide,transparent:true,depthWrite:false});
  // Grain is evaluated in TSL screen space. No texture or GLSL dependency.
  const grain=hash(screenCoordinate.x.add(screenCoordinate.y.mul(137))).mul(.16);
  material.colorNode=mix(color('#4e4737'),color('#c8b078'),float(.25).add(normalLocal.z.abs().mul(.35)).add(hash(instanceIndex).mul(.2)).add(grain));material.opacity=.82;
  mesh=new InstancedMesh(geometry,material,data.nodes.length);scene.add(mesh);
  poses=data.nodes.map(()=>({x:0,y:0,sx:0,sy:0,angle:0}));
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
  observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){active=true;resume()}else pause()},{threshold:.05});
  resize();document.documentElement.dataset.gpu='ready';arrange(data);
 })().finally(()=>{initializing=undefined});
 return initializing;
}
function resize(){if(!renderer||!camera)return;ratio=Math.min(devicePixelRatio,innerWidth<700?1.5:2);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);camera.right=innerWidth;camera.bottom=innerHeight;camera.updateProjectionMatrix();if(graph)arrange(graph)}
export function arrange(data:Graph){
 graph=data;if(!renderer||!mesh)return;
 const mode=document.documentElement.dataset.mode,target=document.querySelector(mode==='entry'?'[data-signature] svg':'.graph-map svg');
 if(observed)observer?.unobserve(observed);observed=target??undefined;
 if(!target||!['entry','graph'].includes(mode??'')){pause();return}
 observer?.observe(target);const rect=target.getBoundingClientRect();layoutScroll=scrollY;
 // SVG viewBox preserveAspectRatio uses the smaller scale and centers the frame.
 const unit=Math.min(rect.width/1000,rect.height/700),left=rect.left+(rect.width-unit*1000)/2,top=rect.top+(rect.height-unit*700)/2;
 tween?.kill();
 for(let i=0;i<poses.length;i++){const p=poses[i]!,node=data.nodes[i]!;const targetPose=mode==='entry'?{x:left+500*unit,y:top+350*unit,sx:112*unit,sy:268*unit,angle:i/data.nodes.length*Math.PI*2-Math.PI/2}:{x:left+node.x*unit,y:top+node.y*unit,sx:15*unit,sy:15*unit,angle:-Math.PI/2};
  if(p.sx===0)Object.assign(p,targetPose);else gsap.to(p,{...targetPose,duration:1.05,ease:'henosis',overwrite:true});
 }
 active=true;document.documentElement.dataset.gpu='ready';resume();
}
function draw(now:number){
 frame=0;if(!active||document.hidden||!renderer||!scene||!camera||!mesh)return;
 const delta=last?now-last:16;last=now;total+=delta;samples++;
 if(samples===90){const fps=1000/(total/samples);if(fps<38&&ratio>.75){ratio=Math.max(.75,ratio-.25);renderer.setPixelRatio(ratio)}samples=0;total=0}
 for(let i=0;i<poses.length;i++){const p=poses[i]!;rotation.makeRotationZ(p.angle);tilt.makeRotationY((i%2?1:-1)*.06);rotation.multiply(tilt);scale.makeScale(p.sx,p.sy,20);matrix.multiplyMatrices(scale,rotation);matrix.setPosition(p.x,p.y,i*.03);mesh.setMatrixAt(i,matrix)}
 camera.position.y=scrollY-layoutScroll;camera.updateMatrixWorld();
 mesh.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);frame=requestAnimationFrame(draw);
}
function resume(){if(active&&!document.hidden&&!frame)frame=requestAnimationFrame(draw)}
export function pause(){active=false;cancelAnimationFrame(frame);frame=0;last=0}
function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}else resume()}
export function highlight(id:string,data:Graph){if(!mesh)return;for(let i=0;i<data.nodes.length;i++){const n=data.nodes[i]!;const linked=n.id===id||data.links.some(l=>(l.source===id&&l.target===n.id)||(l.target===id&&l.source===n.id));tint.set(linked?'#e5cd96':'#817250');mesh.setColorAt(i,tint)}if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}
export function dispose(){pause();tween?.kill();gsap.killTweensOf(poses);observer?.disconnect();observed=undefined;window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);mesh?.geometry.dispose();(mesh?.material as MeshBasicNodeMaterial|undefined)?.dispose();renderer?.dispose();renderer=undefined;mesh=undefined;scene=undefined;camera=undefined;document.documentElement.dataset.gpu='fallback';}
