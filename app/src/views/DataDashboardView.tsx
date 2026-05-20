import { useEffect, useState, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Wifi, AlertTriangle, X, Battery
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { LogEntry } from '@/types';

const initialLogs: LogEntry[] = [
  { time: '14:23:01', level: 'INFO', message: 'ESP32-Principal conectado' },
  { time: '14:23:05', level: 'INFO', message: 'Sensor PIR inicializado' },
  { time: '14:23:10', level: 'INFO', message: 'Simulacao iniciada' },
  { time: '14:23:15', level: 'INFO', message: 'DHT11: temperatura 24.5C' },
  { time: '14:23:20', level: 'WARN', message: 'Umidade acima do limite: 68%' },
];

const devices = [
  { name: 'ESP32-Principal', status: 'online', icon: Wifi, lastSeen: '2s' },
  { name: 'Arduino-Uno', status: 'online', icon: Wifi, lastSeen: '5s' },
  { name: 'Sensor-PIR-01', status: 'simulating', icon: Wifi, lastSeen: '1s' },
  { name: 'DHT11-Sala', status: 'online', icon: Wifi, lastSeen: '3s' },
  { name: 'Rele-Lampada', status: 'online', icon: Wifi, lastSeen: '4s' },
];

const powerData = [
  { name: 'ESP32', value: 35 },
  { name: 'Arduino', value: 25 },
  { name: 'Sensores', value: 20 },
  { name: 'Atuadores', value: 20 },
];

const COLORS = ['#0073e6', '#00d4ff', '#00ff88', '#ffaa00'];

function generateSensorValue(type: string, time: number): number {
  switch (type) {
    case 'temperature': return 22 + Math.sin(time * 0.1) * 3 + (Math.random() - 0.5) * 0.5;
    case 'humidity': return 55 + Math.sin(time * 0.07) * 10 + (Math.random() - 0.5) * 2;
    case 'light': return Math.max(0, 500 * Math.sin(time * 0.05) + (Math.random() - 0.5) * 50);
    case 'motion': return Math.random() > 0.97 ? 1 : 0;
    case 'distance': return Math.abs(Math.sin(time * 0.03) * 200 + (Math.random() - 0.5) * 10);
    default: return Math.random() * 100;
  }
}

export default function DataDashboardView() {
  const { isSimulating, addSensorData, addLog, activeProject } = useAppStore();
  const [tempHistory, setTempHistory] = useState<{ time: string; value: number }[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<{ time: string; value: number }[]>([]);
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(initialLogs);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [alerts, setAlerts] = useState([
    { id: '1', severity: 'warning', message: 'Umidade acima do limite configurado (65%)', time: '14:23:20' },
    { id: '2', severity: 'info', message: 'Sensor PIR detectou movimento', time: '14:22:15' },
  ]);
  const timeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (isSimulating) {
      intervalRef.current = setInterval(() => {
        timeRef.current += 0.1;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const temp = generateSensorValue('temperature', timeRef.current);
        const humidity = generateSensorValue('humidity', timeRef.current);
        const light = generateSensorValue('light', timeRef.current);

        setTempHistory((prev) => [...prev.slice(-30), { time: timeStr, value: parseFloat(temp.toFixed(1)) }]);
        setHumidityHistory((prev) => [...prev.slice(-30), { time: timeStr, value: parseFloat(humidity.toFixed(1)) }]);

        addSensorData({ name: 'Temperatura', type: 'DHT11', value: temp, unit: 'C', timestamp: Date.now() });
        addSensorData({ name: 'Umidade', type: 'DHT11', value: humidity, unit: '%', timestamp: Date.now() });
        addSensorData({ name: 'Luminosidade', type: 'LDR', value: light, unit: 'lux', timestamp: Date.now() });

        if (Math.random() > 0.95) {
          const log: LogEntry = {
            time: timeStr,
            level: Math.random() > 0.7 ? 'WARN' : 'INFO',
            message: `Sensor update: temp=${temp.toFixed(1)}C, humidity=${humidity.toFixed(1)}%`,
          };
          addLog(log);
          setLocalLogs((prev) => [...prev.slice(-49), log]);
        }
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSimulating, addSensorData, addLog]);

  const filteredLogs = logFilter === 'ALL' ? localLogs : localLogs.filter((l) => l.level === logFilter);

  const currentTemp = tempHistory.length > 0 ? tempHistory[tempHistory.length - 1].value : 24.5;
  const currentHumidity = humidityHistory.length > 0 ? humidityHistory[humidityHistory.length - 1].value : 62;

  const projectTypeLabel = activeProject?.type === '3d' ? 'Projeto 3D' : activeProject?.type === 'circuit' ? 'Projeto 2D' : 'Projeto';
  const templateLabel = activeProject?.template ? `Template: ${activeProject.template}` : null;

  return (
    <div className="p-6 overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-2xl text-[#f0f0f0] font-normal tracking-tight mb-2">
          {activeProject ? `${activeProject.name} — Dashboard` : 'Dashboard do Projeto'}
        </h1>
        {activeProject ? (
          <div className="text-sm text-white/50 space-y-1">
            <p>{projectTypeLabel}{templateLabel ? ` · ${templateLabel}` : ''}</p>
            <p>Resumo de interatividade e dados para o projeto ativo.</p>
          </div>
        ) : (
          <p className="text-sm text-white/50">Selecione um projeto em Meus Projetos para acessar o painel de interatividade específico.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Device Status */}
        <div className="panel p-5">
          <h3 className="text-base text-[#f0f0f0] font-normal mb-4">Status dos Dispositivos</h3>
          <div className="space-y-3">
            {devices.map((dev) => (
              <div key={dev.name} className="flex items-center gap-3">
                <dev.icon className={`w-4 h-4 ${dev.status === 'online' ? 'text-[#00ff88]' : dev.status === 'simulating' ? 'text-[#00d4ff]' : 'text-white/30'}`} />
                <span className="text-sm text-[#e1e1e1] flex-1 truncate">{dev.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'online' ? 'bg-[#00ff88]' : dev.status === 'simulating' ? 'bg-[#00d4ff]' : 'bg-[#ff4444]'}`} />
                <span className="font-mono-data text-[10px] text-white/40 uppercase">{dev.status}</span>
                <span className="text-[10px] text-white/30">{dev.lastSeen} ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base text-[#f0f0f0] font-normal">Temperatura</h3>
            <span className="font-mono-data text-sm text-[#00d4ff]">{currentTemp.toFixed(1)}C</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempHistory}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0073e6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#0073e6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0073e6" fill="url(#tempGrad)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/40">
            <span>Min: {tempHistory.length > 0 ? Math.min(...tempHistory.map((d) => d.value)).toFixed(1) : '22.0'}C</span>
            <span>Max: {tempHistory.length > 0 ? Math.max(...tempHistory.map((d) => d.value)).toFixed(1) : '28.0'}C</span>
            <span>Med: {tempHistory.length > 0 ? (tempHistory.reduce((a, b) => a + b.value, 0) / tempHistory.length).toFixed(1) : '24.5'}C</span>
          </div>
        </div>

        {/* Humidity Chart */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base text-[#f0f0f0] font-normal">Umidade</h3>
            <span className="font-mono-data text-sm text-[#00d4ff]">{currentHumidity.toFixed(0)}%</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={humidityHistory}>
                <defs>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} domain={[40, 70]} />
                <Tooltip
                  contentStyle={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00d4ff" fill="url(#humGrad)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/40">
            <span>Min: {humidityHistory.length > 0 ? Math.min(...humidityHistory.map((d) => d.value)).toFixed(0) : '45'}%</span>
            <span>Max: {humidityHistory.length > 0 ? Math.max(...humidityHistory.map((d) => d.value)).toFixed(0) : '68'}%</span>
            <span>Med: {humidityHistory.length > 0 ? (humidityHistory.reduce((a, b) => a + b.value, 0) / humidityHistory.length).toFixed(0) : '58'}%</span>
          </div>
        </div>

        {/* Sensor Readings */}
        <div className="panel p-5">
          <h3 className="text-base text-[#f0f0f0] font-normal mb-4">Leituras dos Sensores</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {[
              { name: 'DHT11-Sala', type: 'Temperatura', value: currentTemp, unit: 'C' },
              { name: 'DHT11-Sala', type: 'Umidade', value: currentHumidity, unit: '%' },
              { name: 'PIR-01', type: 'Movimento', value: Math.random() > 0.9 ? 1 : 0, unit: 'bool' },
              { name: 'LDR-01', type: 'Luminosidade', value: Math.max(0, 300 + Math.sin(Date.now() * 0.001) * 200), unit: 'lux' },
              { name: 'Ultrasonic-01', type: 'Distancia', value: Math.abs(Math.sin(Date.now() * 0.0005) * 150), unit: 'cm' },
              { name: 'Gas-MQ2', type: 'Gas', value: Math.random() * 100, unit: 'ppm' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 hover:bg-white/[0.02] rounded px-1">
                <span className="text-sm text-[#e1e1e1] flex-1">{s.name}</span>
                <span className="text-[10px] text-white/40">{s.type}</span>
                <span className="font-mono-data text-xs text-[#00d4ff] min-w-[50px] text-right">
                  {typeof s.value === 'number' ? s.value.toFixed(1) : s.value}
                </span>
                <span className="text-[10px] text-white/40 w-6">{s.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="panel p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base text-[#f0f0f0] font-normal">Logs do Sistema</h3>
            <div className="flex gap-1">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`text-[10px] px-2 py-1 rounded transition-colors ${
                    logFilter === f ? 'bg-[#0073e6]/20 text-[#0073e6]' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="font-mono-data text-[11px] space-y-1 max-h-[200px] overflow-y-auto">
            {filteredLogs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-white/30">[{log.time}]</span>
                <span className={
                  log.level === 'INFO' ? 'text-[#00d4ff]' :
                  log.level === 'WARN' ? 'text-[#ffaa00]' :
                  log.level === 'ERROR' ? 'text-[#ff4444]' : 'text-white/40'
                }>
                  [{log.level}]
                </span>
                <span className="text-white/60">{log.message}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && <span className="text-white/30">Nenhum log encontrado</span>}
          </div>
        </div>

        {/* Alerts */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base text-[#f0f0f0] font-normal">Alertas</h3>
            {alerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ff4444] text-white text-[10px] flex items-center justify-center">{alerts.length}</span>
            )}
          </div>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-2.5">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.severity === 'warning' ? 'text-[#ffaa00]' : 'text-[#00d4ff]'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-[#e1e1e1]">{alert.message}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{alert.time}</p>
                  </div>
                  <button onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))} className="btn-ghost p-1 rounded">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/30 text-center py-8">Nenhum alerta ativo</p>
          )}
        </div>

        {/* Power Consumption */}
        <div className="panel p-5">
          <h3 className="text-base text-[#f0f0f0] font-normal mb-4">Consumo de Energia</h3>
          <div className="flex items-center gap-4">
            <div className="w-[140px] h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={powerData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {powerData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              <div className="text-center mb-2">
                <Battery className="w-5 h-5 mx-auto text-[#0073e6] mb-1" />
                <span className="font-mono-data text-lg text-[#f0f0f0]">12.5W</span>
              </div>
              {powerData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-white/50 flex-1">{d.name}</span>
                  <span className="text-white/70">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
