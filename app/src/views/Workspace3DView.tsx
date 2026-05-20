import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box, RotateCcw, Move, Maximize2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface IoTComponent {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  size: [number, number, number];
  label: string;
}

const defaultComponents: IoTComponent[] = [
  { id: '1', type: 'arduino', position: [0, 0.1, 0], rotation: [0, 0, 0], color: '#0073e6', size: [0.8, 0.15, 0.6], label: 'Arduino Uno' },
  { id: '2', type: 'led', position: [1.5, 0.05, 0.5], rotation: [0, 0, 0], color: '#00ff88', size: [0.15, 0.1, 0.15], label: 'LED' },
  { id: '3', type: 'sensor', position: [-1.2, 0.2, 0.8], rotation: [0, 0, 0], color: '#ffaa00', size: [0.3, 0.4, 0.2], label: 'PIR Sensor' },
  { id: '4', type: 'relay', position: [1.0, 0.1, -0.8], rotation: [0, 0, 0], color: '#ff4444', size: [0.4, 0.2, 0.3], label: 'Rele' },
  { id: '5', type: 'motor', position: [-0.5, 0.15, -1.0], rotation: [0, 0, 0], color: '#00d4ff', size: [0.3, 0.3, 0.3], label: 'Servo' },
];

function Component3D({
  comp,
  isSelected,
  onSelect,
}: {
  comp: IoTComponent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { isSimulating } = useAppStore();
  const glowIntensity = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isSimulating && (comp.type === 'led' || comp.type === 'motor')) {
      glowIntensity.current = (Math.sin(Date.now() * 0.003) + 1) * 0.5;
      if (comp.type === 'motor') {
        meshRef.current.rotation.y += delta * 2;
      }
    }
    if (meshRef.current.material && 'emissiveIntensity' in meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        isSimulating ? glowIntensity.current * 0.5 : 0;
    }
  });

  return (
    <group position={comp.position} rotation={comp.rotation}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(); }} castShadow receiveShadow>
        <boxGeometry args={comp.size} />
        <meshStandardMaterial
          color={comp.color}
          emissive={comp.color}
          emissiveIntensity={0}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {/* Selection box */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...comp.size.map((s) => s + 0.05) as [number, number, number])]} />
          <lineBasicMaterial color="#00d4ff" transparent opacity={0.6} />
        </lineSegments>
      )}
      {/* Label */}
      <mesh position={[0, comp.size[1] / 2 + 0.2, 0]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshBasicMaterial color="#0a0a0a" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function Wire3D({
  start,
  end,
  color = '#0073e6',
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}) {
  const { isSimulating } = useAppStore();
  const pulsePos = useRef(0);

  const points = useMemo(() => {
    const midY = Math.min(start[1], end[1]) - 0.3;
    return [
      new THREE.Vector3(...start),
      new THREE.Vector3(start[0], midY, start[2]),
      new THREE.Vector3(end[0], midY, end[2]),
      new THREE.Vector3(...end),
    ];
  }, [start, end]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame((_, delta) => {
    if (isSimulating) {
      pulsePos.current = (pulsePos.current + delta * 0.5) % 1;
    }
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 20, 0.01, 8, false]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSimulating ? 0.3 : 0} />
      </mesh>
      {isSimulating && (
        <mesh position={curve.getPointAt(pulsePos.current)}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
      )}
    </group>
  );
}

function Scene3D({
  components,
  selectedId,
  onSelect,
}: {
  components: IoTComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#0073e6" />
      <Environment preset="city" />
      <Grid
        args={[50, 50]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="rgba(255,255,255,0.08)"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="rgba(0,115,230,0.15)"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
      />

      {components.map((comp) => (
        <Component3D
          key={comp.id}
          comp={comp}
          isSelected={selectedId === comp.id}
          onSelect={() => onSelect(comp.id)}
        />
      ))}

      {/* Wires */}
      <Wire3D start={[0, 0.15, 0.3]} end={[1.5, 0.1, 0.5]} color="#0073e6" />
      <Wire3D start={[0, 0.15, -0.2]} end={[-1.2, 0.3, 0.8]} color="#00d4ff" />
      <Wire3D start={[0.3, 0.1, -0.3]} end={[1.0, 0.15, -0.8]} color="#ffaa00" />

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </>
  );
}

export default function Workspace3DView() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [components] = useState<IoTComponent[]>(defaultComponents);
  const { isSimulating, sensorData, activeProject } = useAppStore();
  const [showTimeline, setShowTimeline] = useState(true);

  const selected = components.find((c) => c.id === selectedId);

  return (
    <div className="flex h-full">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [3, 3, 3], fov: 50 }}
          style={{ background: '#0a0a0a' }}
          gl={{ antialias: true }}
        >
          <Scene3D components={components} selectedId={selectedId} onSelect={setSelectedId} />
        </Canvas>

        {/* Overlay Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button className="btn-ghost p-2 rounded" title="Orbit"><RotateCcw className="w-4 h-4" /></button>
          <button className="btn-ghost p-2 rounded" title="Pan"><Move className="w-4 h-4" /></button>
          <button className="btn-ghost p-2 rounded" title="Zoom"><Maximize2 className="w-4 h-4" /></button>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <button className="btn-ghost text-[11px] px-3 py-1.5 rounded">Isometric</button>
          <button className="btn-ghost text-[11px] px-3 py-1.5 rounded">Top</button>
          <button className="btn-ghost text-[11px] px-3 py-1.5 rounded">Front</button>
          {activeProject && (
            <button onClick={() => navigate('/dashboard/workspace/data')} className="btn-ghost text-[11px] px-3 py-1.5 rounded">
              Dashboard
            </button>
          )}
        </div>

        {/* Timeline */}
        {showTimeline && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur border-t border-white/[0.08] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="label-text">Dados em Tempo Real</span>
              <button onClick={() => setShowTimeline(false)} className="text-white/30 hover:text-white/70 text-xs">Ocultar</button>
            </div>
            <div className="flex gap-4 overflow-x-auto">
              {isSimulating && sensorData.slice(-4).map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs shrink-0">
                  <span className="text-white/50">{d.name}:</span>
                  <span className="font-mono-data text-[#00d4ff]">{d.value.toFixed(1)}{d.unit}</span>
                </div>
              ))}
              {(!isSimulating || sensorData.length === 0) && (
                <span className="text-xs text-white/30">Inicie a simulacao para ver dados</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <div className="w-[280px] bg-[#121212] border-l border-white/[0.08] p-5 overflow-y-auto hidden lg:block">
        {selected ? (
          <>
            <h3 className="text-base text-[#f0f0f0] font-normal mb-4">{selected.label}</h3>
            <div className="space-y-4">
              <div>
                <label className="label-text block mb-1.5">Tipo</label>
                <div className="bg-white/5 border border-white/[0.08] rounded-md px-3 py-2 text-sm text-[#f0f0f0] capitalize">{selected.type}</div>
              </div>
              <div>
                <label className="label-text block mb-1.5">Posicao</label>
                <div className="grid grid-cols-3 gap-2">
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis} className="bg-white/5 border border-white/[0.08] rounded-md px-2 py-1.5 text-center">
                      <span className="text-[10px] text-white/40 block">{axis}</span>
                      <span className="font-mono-data text-xs text-[#00d4ff]">{selected.position[i].toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-text block mb-1.5">Cor</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-white/[0.08]" style={{ backgroundColor: selected.color }} />
                  <span className="font-mono-data text-xs text-white/50">{selected.color}</span>
                </div>
              </div>
              <div>
                <label className="label-text block mb-1.5">Conexoes</label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#0073e6]" />
                    <span className="text-white/50">Arduino → LED</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-white/30 text-sm mt-20">
            <Box className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Selecione um componente</p>
            <p className="text-xs mt-1">Clique em um componente na cena 3D</p>
          </div>
        )}
      </div>
    </div>
  );
}
