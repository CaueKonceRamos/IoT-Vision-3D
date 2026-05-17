import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function randomSpherePoint(cx: number, cy: number, cz: number, radius: number) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  return {
    x: cx + r * Math.sin(phi) * Math.cos(theta),
    y: cy + r * Math.sin(phi) * Math.sin(theta),
    z: cz + r * Math.cos(phi),
  };
}

const COLORS = ['#00d4ff', '#00ff88', '#3366ff', '#ffaa00'].map((c) => new THREE.Color(c));

export default function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor('#0a0a0a');
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(0.03, 8, 8);
    const particles: {
      mesh: THREE.Mesh;
      angleX: number;
      angleY: number;
      angleZ: number;
      speedX: number;
      speedY: number;
      speedZ: number;
      radius: number;
      radiusChangeSpeed: number;
    }[] = [];

    for (let i = 0; i < 800; i++) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geometry, mat);
      const pos = randomSpherePoint(0, 0, 0, 2);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.scale.setScalar(0.5 + Math.random() * 0.5);
      scene.add(mesh);
      particles.push({
        mesh,
        angleX: Math.random() * Math.PI * 2,
        angleY: Math.random() * Math.PI * 2,
        angleZ: Math.random() * Math.PI * 2,
        speedX: (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1),
        speedY: (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1),
        speedZ: (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1),
        radius: 0.5 + Math.random() * 1.5,
        radiusChangeSpeed: 0.0001 + Math.random() * 0.0004,
      });
    }

    const attractor = new THREE.Vector3(0, 0, 0);
    let noiseTime = 0;
    const cameraTarget = { x: 0, y: 0 };
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      noiseTime += 0.0005;
      attractor.x = Math.sin(noiseTime * 0.7) * 1.5;
      attractor.y = Math.cos(noiseTime * 0.5) * 1.2;
      attractor.z = Math.sin(noiseTime * 0.3) * 0.8;

      for (const p of particles) {
        p.angleX += p.speedX;
        p.angleY += p.speedY;
        p.angleZ += p.speedZ;
        const r = p.radius + Math.sin(noiseTime * p.radiusChangeSpeed * 100) * 0.2;
        const tx = attractor.x + Math.cos(p.angleX) * r;
        const ty = attractor.y + Math.sin(p.angleY) * r;
        const tz = attractor.z + Math.sin(p.angleZ) * r;
        p.mesh.position.lerp(new THREE.Vector3(tx, ty, tz), 0.05);
      }

      cameraTarget.x += (mouseRef.current.x * 0.3 - camera.position.x) * 0.05;
      cameraTarget.y += (mouseRef.current.y * 0.3 - camera.position.y) * 0.05;
      camera.position.x = cameraTarget.x;
      camera.position.y = cameraTarget.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const nw = container.offsetWidth || window.innerWidth;
      const nh = container.offsetHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      particles.forEach((p) => {
        (p.mesh.material as THREE.Material).dispose();
        scene.remove(p.mesh);
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-[1]" />;
}
