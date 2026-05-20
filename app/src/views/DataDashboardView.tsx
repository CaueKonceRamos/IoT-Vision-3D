import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Droplet, ListChecks, Sparkles, Thermometer, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import type { LogEntry } from '@/types';

const initialLogs: LogEntry[] = [
  { time: '14:23:01', level: 'INFO', message: 'ESP32-Principal conectado' },
  { time: '14:23:05', level: 'INFO', message: 'Sensor PIR inicializado' },
  { time: '14:23:10', level: 'INFO', message: 'Simulação iniciada' },
  { time: '14:23:15', level: 'INFO', message: 'DHT11: temperatura 24.5C' },
  { time: '14:23:20', level: 'WARN', message: 'Umidade acima do limite: 68%' },
];

const templateDashboardConfig = {
  casa: {
    title: 'Casa Inteligente',
    description: 'Automação residencial com controle de energia, sensores e dispositivos conectados.',
    stats: [
      { title: 'Dispositivos ativos', value: '12' },
      { title: 'Automação ativa', value: '8/10' },
      { title: 'Consumo médio', value: '4.8 kW' },
    ],
    actions: ['Ligar luz', 'Fechar cortinas', 'Ver consumo'],
  },
  estacao: {
    title: 'Estação Meteorológica',
    description: 'Monitoramento de clima e alertas em tempo real para evitar imprevistos.',
    stats: [
      { title: 'Leituras por hora', value: '18' },
      { title: 'Alertas ativos', value: '2' },
      { title: 'Chance de chuva', value: '45%' },
    ],
    actions: ['Atualizar leitura', 'Configurar alerta', 'Ver histórico'],
  },
  irrigacao: {
    title: 'Irrigação Inteligente',
    description: 'Controle inteligente da umidade do solo e do ciclo das bombas.',
    stats: [
      { title: 'Umidade do solo', value: '42%' },
      { title: 'Bombas ligadas', value: '3' },
      { title: 'Tempo de irrigação', value: '18 min' },
    ],
    actions: ['Iniciar irrigação', 'Pausar bomba', 'Ver níveis de solo'],
  },
} as const;

type TemplateKey = keyof typeof templateDashboardConfig;

function generateSensorValue(type: string, time: number): number {
  switch (type) {
    case 'temperature':
      return 22 + Math.sin(time * 0.12) * 3 + (Math.random() - 0.5) * 0.4;
    case 'humidity':
      return 55 + Math.sin(time * 0.09) * 10 + (Math.random() - 0.5) * 1.5;
    case 'light':
      return Math.max(0, 500 * Math.sin(time * 0.04) + (Math.random() - 0.5) * 40);
    default:
      return Math.random() * 100;
  }
}

export default function DataDashboardView() {
  const { isSimulating, addSensorData, addLog, activeProject } = useAppStore();
  const [tempHistory, setTempHistory] = useState<{ time: string; value: number }[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<{ time: string; value: number }[]>([]);
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(initialLogs);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [selectedAction, setSelectedAction] = useState('');
  const [interactionHistory, setInteractionHistory] = useState<string[]>([]);
  const [alerts] = useState([
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

        if (Math.random() > 0.94) {
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSimulating, addSensorData, addLog]);

  const filteredLogs = logFilter === 'ALL' ? localLogs : localLogs.filter((log) => log.level === logFilter);
  const currentTemp = tempHistory.length > 0 ? tempHistory[tempHistory.length - 1].value : 24.5;
  const currentHumidity = humidityHistory.length > 0 ? humidityHistory[humidityHistory.length - 1].value : 62;

  const templateKey = activeProject?.template as TemplateKey | undefined;
  const templateConfig = templateKey ? templateDashboardConfig[templateKey] : null;
  const projectTypeLabel = activeProject?.type === '3d' ? 'Projeto 3D' : activeProject?.type === 'circuit' ? 'Projeto 2D' : 'Projeto';
  const templateLabel = activeProject?.template ? `Template: ${activeProject.template}` : null;
  const actionOptions = templateConfig?.actions ?? [];

  return (
    <div className="p-6 overflow-y-auto">
      <div className="mb-8 rounded-[32px] border border-white/[0.08] bg-slate-950 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0b1220] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/50">Dashboard</span>
              {activeProject && <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">{projectTypeLabel}</span>}
              {templateLabel && <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/60">{templateLabel}</span>}
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-[#f8fafc]">{activeProject ? activeProject.name : 'Nenhum projeto selecionado'}</h1>
              <p className="max-w-2xl text-sm text-white/50 mt-3">
                {activeProject
                  ? 'Painel profissional de métricas, ações e histórico para projetos baseados em templates prontos.'
                  : 'Abra um projeto para ativar a dashboard e visualizar todas as estatísticas.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.08] bg-[#0b1220] p-4 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Conexões</p>
              <p className="mt-3 text-3xl font-semibold text-[#f8fafc]">5</p>
              <p className="mt-2 text-sm text-white/50">Dispositivos online</p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#0b1220] p-4 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Integridade</p>
              <p className="mt-3 text-3xl font-semibold text-[#f8fafc]">97%</p>
              <p className="mt-2 text-sm text-white/50">Disponibilidade do sistema</p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#0b1220] p-4 text-center">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Alertas</p>
              <p className="mt-3 text-3xl font-semibold text-[#f8fafc]">{alerts.length}</p>
              <p className="mt-2 text-sm text-white/50">Eventos ativos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr] xl:items-start">
        <div className="grid gap-4">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0f1724] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Visão geral dos sensores</p>
                <h2 className="mt-3 text-2xl font-semibold text-[#f8fafc]">Dados em tempo real</h2>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-2 text-sm text-white/60">Atualizando continuamente</div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/[0.06] bg-[#111827]/90 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Temperatura</p>
                    <p className="mt-2 text-3xl font-semibold text-[#f8fafc]">{currentTemp.toFixed(1)}°C</p>
                  </div>
                  <Thermometer className="h-7 w-7 text-[#3b82f6]" />
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tempHistory} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.24} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip contentStyle={{ background: '#0f1724', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#tempGradient)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-white/[0.06] bg-[#111827]/90 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Umidade</p>
                    <p className="mt-2 text-3xl font-semibold text-[#f8fafc]">{currentHumidity.toFixed(0)}%</p>
                  </div>
                  <Droplet className="h-7 w-7 text-[#10b981]" />
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={humidityHistory} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.24} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip contentStyle={{ background: '#0f1724', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#humidityGradient)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0f1724] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Interações</p>
                <h2 className="text-2xl font-semibold text-[#f8fafc]">Ações rápidas</h2>
              </div>
              <Sparkles className="h-6 w-6 text-[#facc15]" />
            </div>
            <div className="grid gap-3">
              {actionOptions.length > 0 ? (
                actionOptions.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setSelectedAction(action);
                      setInteractionHistory((prev) => [
                        `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${action}`,
                        ...prev,
                      ].slice(0, 5));
                    }}
                    className="rounded-3xl border border-white/[0.08] bg-white/5 px-5 py-4 text-left text-sm text-white transition hover:border-[#00d4ff] hover:bg-[#00d4ff]/10"
                  >
                    {action}
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/50">Selecione um projeto com template 2D para ativar as ações.</p>
              )}
            </div>
            <div className="mt-6 rounded-3xl border border-white/[0.08] bg-[#111827]/90 p-4">
              <p className="text-xs text-white/40 uppercase tracking-[0.24em]">Última ação</p>
              <p className="mt-3 text-lg font-semibold text-[#f8fafc]">{selectedAction || 'Nenhuma ação registrada'}</p>
              <p className="text-sm text-white/50 mt-2">A interação fica registrada no histórico para consulta imediata.</p>
            </div>
          </div>
        </div>
        <aside className="grid gap-4">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0f1724] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Resumo do template</p>
                <h2 className="text-2xl font-semibold text-[#f8fafc]">Métricas chave</h2>
              </div>
              <TrendingUp className="h-6 w-6 text-[#34d399]" />
            </div>
            {templateConfig ? (
              <div className="grid gap-3">
                {templateConfig.stats.map((stat) => (
                  <div key={stat.title} className="rounded-3xl border border-white/[0.06] bg-[#111827]/80 p-4">
                    <p className="text-sm text-white/40">{stat.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-[#f8fafc]">{stat.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50">Nenhum template selecionado. Abra um projeto para ver métricas específicas.</p>
            )}
          </div>
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0f1724] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Alertas</p>
                <h2 className="text-2xl font-semibold text-[#f8fafc]">Monitoramento</h2>
              </div>
              <Bell className="h-6 w-6 text-[#f59e0b]" />
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-3xl border border-white/[0.06] bg-[#111827]/80 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-semibold text-[#f8fafc]">{alert.severity === 'warning' ? 'Aviso' : 'Info'}</p>
                    <span className="text-[11px] text-white/40">{alert.time}</span>
                  </div>
                  <p className="text-sm text-white/60">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0f1724] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Logs recentes</p>
                <h2 className="text-2xl font-semibold text-[#f8fafc]">Atividade</h2>
              </div>
              <ListChecks className="h-6 w-6 text-[#60a5fa]" />
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div key={index} className="rounded-3xl border border-white/[0.06] bg-[#111827]/80 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className={`text-[11px] font-semibold uppercase ${
                      log.level === 'ERROR' ? 'text-[#f87171]' : log.level === 'WARN' ? 'text-[#fbbf24]' : 'text-[#60a5fa]'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-[11px] text-white/40">{log.time}</span>
                  </div>
                  <p className="text-sm text-white/60">{log.message}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLogFilter(level)}
                  className={`rounded-full px-3 py-2 text-xs transition ${logFilter === level ? 'bg-[#2563eb] text-slate-950' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
