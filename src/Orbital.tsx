import { useEffect, useRef } from 'react';
import * as THREE from 'three';
export default function Orbital({still}:{still:boolean}) {
 const mount=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=mount.current!; let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=7;
  const group=new THREE.Group();scene.add(group);
  const material=new THREE.LineBasicMaterial({color:0xb3a285,transparent:true,opacity:.36});
  for(let i=0;i<5;i++){const points=[];for(let j=0;j<=180;j++){const t=j/180*Math.PI*2;points.push(new THREE.Vector3(Math.cos(t)*1.65,Math.sin(t)*1.65,0));}const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material);ring.rotation.x=i*.56;ring.rotation.y=i*.65;group.add(ring);}
  const geo=new THREE.IcosahedronGeometry(.83,1);const wire=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xe2d5b8,transparent:true,opacity:.23}));group.add(wire);
  const dots=[];for(let i=0;i<160;i++){const t=i*2.39996;const y=1-i/80;const r=Math.sqrt(1-y*y);dots.push(Math.cos(t)*r*2.2,y*2.2,Math.sin(t)*r*2.2);}
  const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(dots,3)),new THREE.PointsMaterial({color:0xd5c6a7,size:.021}));group.add(stars);
  let frame=0,visible=true;const pointer={x:0,y:0};
  const move=(e:PointerEvent)=>{const b=el.getBoundingClientRect();pointer.x=(e.clientX-b.left)/b.width-.5;pointer.y=(e.clientY-b.top)/b.height-.5;};el.addEventListener('pointermove',move);
  const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.render(scene,camera);};const ro=new ResizeObserver(resize);ro.observe(el);
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});io.observe(el);
  const draw=(t:number)=>{if(visible&&!document.hidden){group.rotation.y=still?.3:t*.000075+pointer.x*.15;group.rotation.x=still?.2:.2+pointer.y*.12;renderer.render(scene,camera);}if(!still)frame=requestAnimationFrame(draw);};frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();el.removeEventListener('pointermove',move);scene.traverse(obj=>{if(obj instanceof THREE.Line||obj instanceof THREE.Points){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>m.dispose());}});geo.dispose();renderer.dispose();el.replaceChildren();};
 },[still]);
 return <div className="orbital" ref={mount} aria-hidden="true"/>;
}
