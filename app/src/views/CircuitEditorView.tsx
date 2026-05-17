import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Lightbulb, Zap, Cpu, Wifi, Thermometer, Droplets, Wind,
  Volume2, Monitor, Bluetooth, ChevronDown, Search, Trash2, Copy
} from 'lucide-react';

interface CircuitComponent {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  rotation: number;
  icon: React.ElementType;
  color: string;
}

interface Wire {
  id: string;
  from: string;
  to: string;
  color: string;
}

const componentLibrary = [
  {
    category: 'Eletronica Basica',
    items: [
      { type: 'led', label: 'LED', icon: Lightbulb, color: '#00ff88' },
      { type: 'resistor', label: 'Resistor', icon: Zap, color: '#ffaa00' },
      { type: 'button', label: 'Botao', icon: Zap, color: '#e1e1e1' },
      { type: 'buzzer', label: 'Buzzer', icon: Volume2, color: '#ff4444' },
    ],
  },
  {
    category: 'Microcontroladores',
    items: [
      { type: 'arduino', label: 'Arduino Uno', icon: Cpu, color: '#0073e6' },
      { type: 'esp32', label: 'ESP32', icon: Wifi, color: '#00d4ff' },
      { type: 'raspberry', label: 'Raspberry Pi', icon: Cpu, color: '#ff4444' },
    ],
  },
  {
    category: 'Sensores',
    items: [
      { type: 'temp', label: 'DHT11', icon: Thermometer, color: '#ffaa00' },
      { type: 'humidity', label: 'Umidade', icon: Droplets, color: '#00d4ff' },
      { type: 'motion', label: 'PIR', icon: Wind, color: '#00ff88' },
      { type: 'light', label: 'LDR', icon: Lightbulb, color: '#ffaa00' },
    ],
  },
  {
    category: 'Atuadores',
    items: [
      { type: 'servo', label: 'Servo Motor', icon: Wind, color: '#0073e6' },
      { type: 'motor', label: 'Motor DC', icon: Wind, color: '#00d4ff' },
      { type: 'relay', label: 'Rele', icon: Zap, color: '#ff4444' },
      { type: 'display', label: 'LCD', icon: Monitor, color: '#00ff88' },
      { type: 'oled', label: 'OLED', icon: Monitor, color: '#00d4ff' },
    ],
  },
  {
    category: 'IoT',
    items: [
      { type: 'wifi', label: 'WiFi Module', icon: Wifi, color: '#0073e6' },
      { type: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, color: '#00d4ff' },
    ],
  },
];

export default function CircuitEditorView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [placingType, setPlacingType] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [expandedCategory, setExpandedCategory] = useState<string>('Eletronica Basica');
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const GRID_SIZE = 20;

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  // Canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const startX = Math.floor(-pan.x / zoom / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(-pan.y / zoom / GRID_SIZE) * GRID_SIZE;
    const endX = startX + w / zoom + GRID_SIZE * 2;
    const endY = startY + h / zoom + GRID_SIZE * 2;
    for (let x = startX; x < endX; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y < endY; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Wires
    wires.forEach((wire) => {
      const fromComp = components.find((c) => c.id === wire.from);
      const toComp = components.find((c) => c.id === wire.to);
      if (!fromComp || !toComp) return;
      ctx.strokeStyle = wire.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromComp.x, fromComp.y);
      const midX = (fromComp.x + toComp.x) / 2;
      ctx.lineTo(midX, fromComp.y);
      ctx.lineTo(midX, toComp.y);
      ctx.lineTo(toComp.x, toComp.y);
      ctx.stroke();
    });

    // Components
    components.forEach((comp) => {
      const size = comp.type === 'arduino' || comp.type === 'esp32' || comp.type === 'raspberry' ? 60 : 40;

      // Selection glow
      if (comp.id === selectedId) {
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 12;
      }

      // Component body
      ctx.fillStyle = '#1a1a1a';
      ctx.strokeStyle = comp.id === selectedId ? '#00d4ff' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = comp.id === selectedId ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(comp.x - size / 2, comp.y - size / 2, size, size, 6);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Color indicator
      ctx.fillStyle = comp.color;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(comp.x - size / 2 + 4, comp.y - size / 2 + 4, size - 8, 4);
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(comp.label, comp.x, comp.y + size / 2 + 14);

      // Connection pins
      ctx.fillStyle = comp.color;
      const pinPositions = [
        [comp.x - size / 2, comp.y],
        [comp.x + size / 2, comp.y],
        [comp.x, comp.y - size / 2],
        [comp.x, comp.y + size / 2],
      ];
      pinPositions.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.restore();
  }, [components, wires, selectedId, zoom, pan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const animLoop = () => {
      draw();
      requestAnimationFrame(animLoop);
    };
    const raf = requestAnimationFrame(animLoop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [draw]);

  // Mouse handlers
  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (placingType) {
      const pos = getCanvasPos(e);
      const libItem = componentLibrary.flatMap((c) => c.items).find((i) => i.type === placingType);
      if (libItem) {
        const newComp: CircuitComponent = {
          id: Date.now().toString(),
          type: placingType,
          label: libItem.label,
          x: snapToGrid(pos.x),
          y: snapToGrid(pos.y),
          rotation: 0,
          icon: libItem.icon,
          color: libItem.color,
        };
        setComponents((prev) => [...prev, newComp]);
        setPlacingType(null);
      }
      return;
    }

    const pos = getCanvasPos(e);
    const clicked = components.find((c) => {
      const size = c.type === 'arduino' || c.type === 'esp32' || c.type === 'raspberry' ? 60 : 40;
      return Math.abs(c.x - pos.x) < size / 2 && Math.abs(c.y - pos.y) < size / 2;
    });
    setSelectedId(clicked ? clicked.id : null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isPanning.current = true;
      lastPan.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const pos = getCanvasPos(e);
    const clicked = components.find((c) => {
      const size = c.type === 'arduino' || c.type === 'esp32' || c.type === 'raspberry' ? 60 : 40;
      return Math.abs(c.x - pos.x) < size / 2 && Math.abs(c.y - pos.y) < size / 2;
    });
    if (clicked) {
      setDragging(clicked.id);
      setSelectedId(clicked.id);
      dragOffset.current = { x: pos.x - clicked.x, y: pos.y - clicked.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      setPan((p) => ({
        x: p.x + e.clientX - lastPan.current.x,
        y: p.y + e.clientY - lastPan.current.y,
      }));
      lastPan.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (dragging) {
      const pos = getCanvasPos(e);
      setComponents((prev) =>
        prev.map((c) =>
          c.id === dragging
            ? { ...c, x: snapToGrid(pos.x - dragOffset.current.x), y: snapToGrid(pos.y - dragOffset.current.y) }
            : c
        )
      );
    }
  };

  const handleMouseUp = () => {
    isPanning.current = false;
    setDragging(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.25, Math.min(4, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedId) {
      setComponents((prev) => prev.filter((c) => c.id !== selectedId));
      setWires((prev) => prev.filter((w) => w.from !== selectedId && w.to !== selectedId));
      setSelectedId(null);
    }
  };

  const addWire = () => {
    if (components.length < 2) return;
    const from = components[Math.floor(Math.random() * components.length)];
    const to = components[Math.floor(Math.random() * components.length)];
    if (from.id !== to.id) {
      setWires((prev) => [...prev, {
        id: Date.now().toString(),
        from: from.id,
        to: to.id,
        color: ['#0073e6', '#00d4ff', '#00ff88', '#ffaa00'][Math.floor(Math.random() * 4)],
      }]);
    }
  };

  const filteredLib = search
    ? componentLibrary.map((c) => ({
        ...c,
        items: c.items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase())),
      })).filter((c) => c.items.length > 0)
    : componentLibrary;

  return (
    <div className="flex h-full" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Component Library */}
      <div className="w-[260px] bg-[#121212] border-r border-white/[0.08] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/[0.08]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar componente..."
              className="w-full bg-white/5 border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-xs text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredLib.map((cat) => (
            <div key={cat.category}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.category ? '' : cat.category)}
                className="w-full flex items-center justify-between py-2 text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                <span>{cat.category}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategory === cat.category ? '' : '-rotate-90'}`} />
              </button>
              {expandedCategory === cat.category && (
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {cat.items.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setPlacingType(placingType === item.type ? null : item.type)}
                      className={`p-2 rounded-md border text-center transition-all ${
                        placingType === item.type
                          ? 'border-[#0073e6] bg-[#0073e6]/15'
                          : 'border-white/[0.06] bg-[#1a1a1a] hover:border-white/[0.14]'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                      <span className="text-[10px] text-white/60">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {placingType && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[#121212] border border-[#0073e6]/30 rounded-lg px-4 py-2 text-xs text-[#00d4ff]">
            Clique no canvas para colocar o componente
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${placingType ? 'cursor-crosshair' : dragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-[#121212]/80 backdrop-blur rounded-lg border border-white/[0.08] p-1">
          <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))} className="btn-ghost p-1.5 rounded text-xs">+</button>
          <span className="text-[10px] text-white/50 text-center py-0.5">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))} className="btn-ghost p-1.5 rounded text-xs">-</button>
        </div>

        {/* Quick actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={addWire} className="btn-secondary text-xs px-3 py-1.5 rounded">Conectar</button>
          {selectedId && (
            <>
              <button onClick={() => setComponents((prev) => prev.filter((c) => c.id !== selectedId))} className="btn-ghost text-xs px-3 py-1.5 rounded flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
              </button>
              <button className="btn-ghost text-xs px-3 py-1.5 rounded flex items-center gap-1">
                <Copy className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
