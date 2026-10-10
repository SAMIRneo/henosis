import {useEffect, useRef} from 'react';
import * as THREE from 'three';

export default function Orbital({still, focus = 0}: {still: boolean; focus?: number}) {
  const mount = useRef<HTMLDivElement>(null);
  const paused = useRef(still);
  const selected = useRef(focus);
  const refresh = useRef<(() => void) | null>(null);
  useEffect(() => {paused.current = still; selected.current = focus; refresh.current?.();}, [still, focus]);

  useEffect(() => {
    const element = mount.current!;
    let renderer: THREE.WebGLRenderer;
    try {renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});} catch {return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.z = 7;
    const group = new THREE.Group();
    scene.add(group);
    const points = Array.from({length: 181}, (_, index) => {
      const angle = index / 180 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * 1.65, Math.sin(angle) * 1.65, 0);
    });
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const ringMaterial = new THREE.LineBasicMaterial({color: 0xb3a285, transparent: true, opacity: .4});
    for (let index = 0; index < 5; index++) {
      const ring = new THREE.Line(ringGeometry, ringMaterial);
      ring.rotation.x = index * .56; ring.rotation.y = index * .65;
      group.add(ring);
    }
    const nucleus = new THREE.IcosahedronGeometry(.83, 1);
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(nucleus), new THREE.LineBasicMaterial({color: 0xe2d5b8, transparent: true, opacity: .28})));
    nucleus.dispose();
    const palette = [0x92cbd2,0xc7ac79,0xb5a1d0,0xd2c7ae,0x92b6a5];
    const mineral = new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},tint:{value:new THREE.Color(palette[selected.current])}},
      vertexShader:`varying vec3 vN;varying vec3 vP;uniform float time;
      void main(){vec3 p=position+normal*sin(position.y*12.+time*.6)*.016;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.);vP=mv.xyz;gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`varying vec3 vN;varying vec3 vP;uniform vec3 tint;uniform float time;
      void main(){float rim=pow(1.-max(0.,dot(normalize(vN),normalize(-vP))),2.4);
      float strata=pow(.5+.5*sin(vP.y*65.+sin(vP.x*9.)+time*.3),18.);
      gl_FragColor=vec4(tint*(rim*.85+strata*.16),rim*.46+strata*.09);}`});
    const core=new THREE.Mesh(new THREE.SphereGeometry(1.04,48,32),mineral);group.add(core);
    const dots: number[] = [];
    for (let index = 0; index < 160; index++) {
      const angle = index * 2.39996, y = 1 - index / 80, radius = Math.sqrt(1 - y * y);
      dots.push(Math.cos(angle) * radius * 2.2, y * 2.2, Math.sin(angle) * radius * 2.2);
    }
    group.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(dots, 3)), new THREE.PointsMaterial({color: 0xd5c6a7, size: .021})));

    let frame = 0, visible = false, elapsed = 0, previousTime = 0;
    const target = {x: 0, y: 0}, pointer = {x: 0, y: 0};
    const surface = element.parentElement!;
    const stop = () => {cancelAnimationFrame(frame); frame = 0; previousTime = 0;};
    const paint = () => {
      mineral.uniforms.time.value=elapsed;
      mineral.uniforms.tint.value.setHex(palette[selected.current]);
      ringMaterial.color.setHex(palette[selected.current]);
      renderer.render(scene, camera);
    };
    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.hidden || paused.current) return;
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .06) : 0;
      previousTime = time; elapsed += delta;
      const blend = 1 - Math.exp(-delta * 8);
      pointer.x += (target.x - pointer.x) * blend;
      pointer.y += (target.y - pointer.y) * blend;
      group.rotation.y = .3 + elapsed * .075 + pointer.x * .2;
      group.rotation.x = .2 + pointer.y * .15;
      group.rotation.z += (selected.current * .35 - group.rotation.z) * blend;
      paint(); frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      stop();
      if (!visible || document.hidden) return;
      if (paused.current || document.documentElement.dataset.input === 'keyboard') group.rotation.z = selected.current * .35;
      paint();
      if (!paused.current) frame = requestAnimationFrame(draw);
    };
    refresh.current = sync;
    const move = (event: PointerEvent) => {
      if (paused.current || event.pointerType !== 'mouse') return;
      const bounds = surface.getBoundingClientRect();
      target.x = (event.clientX - bounds.left) / bounds.width - .5;
      target.y = (event.clientY - bounds.top) / bounds.height - .5;
    };
    const leave = () => {target.x = 0; target.y = 0;};
    surface.addEventListener('pointermove', move, {passive: true});
    surface.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', sync);
    const resize = new ResizeObserver(() => {
      const {width, height} = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); sync();
    });
    resize.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; sync();});
    intersection.observe(element);
    group.rotation.set(.2, .3, selected.current * .35);
    return () => {
      stop(); refresh.current = null; resize.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      surface.removeEventListener('pointermove', move); surface.removeEventListener('pointerleave', leave);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {if (object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
      }});
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
      renderer.dispose(); element.replaceChildren();
    };
  }, []);
  return <div className="orbital" ref={mount} aria-hidden="true"/>;
}
