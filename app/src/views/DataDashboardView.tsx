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
      { title: 'Temperatura média', value: '24.2°C' },
      { title: 'Umidade relativa', value: '58%' },
      { title: 'Consumo médio', value: '3.9 kW' },
    ],
    actions: ['Ligar luz', 'Fechar cortinas', 'Ver consumo', 'Simular problema'],
  },
  estacao: {
    title: 'Estação Meteorológica',
    description: 'Monitoramento de clima e alertas em tempo real para evitar imprevistos.',
    stats: [
      { title: 'Previsão do dia', value: 'Parcialmente nublado' },
      { title: 'Alertas ativos', value: '2' },
      { title: 'Chance de chuva', value: '45%' },
    ],
    actions: ['Atualizar leitura', 'Configurar alerta', 'Ver histórico', 'Simular problema'],
  },
  irrigacao: {
    title: 'Irrigação Inteligente',
    description: 'Controle inteligente da umidade do solo e do ciclo das bombas.',
    stats: [
      { title: 'Umidade ideal', value: '45%' },
      { title: 'Bombas ligadas', value: '2' },
      { title: 'Último ciclo', value: '18 min' },
    ],
    actions: ['Iniciar irrigação', 'Pausar bomba', 'Ver níveis de solo', 'Simular problema'],
  },
} as const;

type TemplateKey = keyof typeof templateDashboardConfig;

function getTemplateSummaryMetrics(
  key: TemplateKey,
  currentTemp: number,
  currentHumidity: number,
  currentLight: number,
  alertsCount: number,
) {
  switch (key) {
    case 'casa':
      return [
        { title: 'Temperatura atual', value: `${currentTemp.toFixed(1)}°C`, detail: 'Climatização do ambiente' },
        { title: 'Umidade interna', value: `${currentHumidity.toFixed(0)}%`, detail: 'Conforto residencial' },
        { title: 'Dispositivos conectados', value: '8', detail: 'Sensores e atuadores ativos' },
      ];
    case 'estacao':
      return [
        { title: 'Temperatura atual', value: `${currentTemp.toFixed(1)}°C`, detail: 'Medição do sensor de ambiente' },
        { title: 'Umidade do ar', value: `${currentHumidity.toFixed(0)}%`, detail: 'Nível de vapor no ar' },
        { title: 'Luminosidade', value: `${currentLight.toFixed(0)} lux`, detail: 'Índice de claridade' },
      ];
    case 'irrigacao':
      return [
        { title: 'Umidade do solo', value: `${Math.max(20, Math.min(100, currentHumidity - 8)).toFixed(0)}%`, detail: 'Nível de água disponível' },
        { title: 'Bombas ativas', value: '2', detail: 'Canais de irrigação operando' },
        { title: 'Alertas ativos', value: `${alertsCount}`, detail: 'Condições de irrigação' },
      ];
    default:
      return [
        { title: 'Estado do sistema', value: 'Aguardando projeto', detail: 'Selecione um template para exibir métricas' },
      ];
  }
}

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

function calculateMetrics(history: { time: string; value: number }[]) {
  const length = history.length;
  if (!length) {
    return { average: 0, max: 0, min: 0 };
  }
  const total = history.reduce((sum, point) => sum + point.value, 0);
  const values = history.map((point) => point.value);
  return {
    average: total / length,
    max: Math.max(...values),
    min: Math.min(...values),
  };
}

function playTone(frequency: number, duration = 0.15, volume = 0.12) {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
  oscillator.onended = () => ctx.close();
}

function playClickSound() {
  playTone(880, 0.08, 0.08);
}

function playAlertSound() {
  playTone(880, 0.15, 0.16);
  setTimeout(() => playTone(660, 0.15, 0.16), 180);
}

function escapePdfString(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createProblemPdfBytes(lines: string[], redLineIndexes: number[]) {
  const encoder = new TextEncoder();
  const escapedLines = lines.map((line) => escapePdfString(line));
  const contentParts: string[] = ['BT /F1 10 Tf 40 760 Td'];
  escapedLines.forEach((line, index) => {
    const isRed = redLineIndexes.includes(index);
    contentParts.push(isRed ? '1 0 0 rg' : '0 0 0 rg');
    contentParts.push(`(${line}) Tj`);
    if (index < escapedLines.length - 1) contentParts.push('0 -14 Td');
  });
  contentParts.push('ET');

  const content = contentParts.join('\n');
  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
    `4 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
  ];

  let offset = encoder.encode('%PDF-1.2\n').length;
  const xrefEntries = ['0000000000 65535 f \n'];
  let body = '';
  for (const obj of objects) {
    xrefEntries.push(`${offset.toString().padStart(10, '0')} 00000 n \n`);
    body += obj;
    offset += encoder.encode(obj).length;
  }
  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join('')}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  const encodedParts = [
    encoder.encode('%PDF-1.2\n'),
    encoder.encode(body),
    encoder.encode(xref),
    encoder.encode(trailer),
  ];
  const pdfBytes = new Uint8Array(encodedParts.reduce((sum, part) => sum + part.length, 0));
  let writeIndex = 0;
  for (const part of encodedParts) {
    pdfBytes.set(part, writeIndex);
    writeIndex += part.length;
  }
  return pdfBytes;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildPrintHtml(options: {
  projectName: string;
  templateLabel: string;
  systemSummary: readonly { title: string; value: string; detail: string }[];
  templateStats: readonly { title: string; value: string }[];
  tempMetrics: ReturnType<typeof calculateMetrics>;
  humidityMetrics: ReturnType<typeof calculateMetrics>;
  lightMetrics: ReturnType<typeof calculateMetrics>;
  interactionHistory: string[];
  logs: LogEntry[];
}) {
  const {
    projectName,
    templateLabel,
    systemSummary,
    templateStats,
    tempMetrics,
    humidityMetrics,
    lightMetrics,
    interactionHistory,
    logs,
  } = options;

  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Relatório de Impressão - ${escapeHtml(projectName)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
      h1, h2, h3 { color: #111827; }
      .section { margin-bottom: 24px; }
      .metric { margin: 8px 0; }
      .metric strong { display: inline-block; width: 200px; }
      .box { padding: 16px; border: 1px solid #d1d5db; border-radius: 12px; margin-top: 12px; }
      .small { color: #6b7280; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; border: 1px solid #d1d5db; padding: 8px; }
      th { background: #f3f4f6; }
    </style>
  </head>
  <body>
    <h1>Relatório do template</h1>
    <p class="small">Projeto: ${escapeHtml(projectName)} | ${escapeHtml(templateLabel)}</p>

    <div class="section box">
      <h2>Resumo do sistema</h2>
      ${systemSummary
        .map((metric) => `<div class="metric"><strong>${escapeHtml(metric.title)}:</strong> ${escapeHtml(metric.value)}<br/><span class="small">${escapeHtml(metric.detail)}</span></div>`)
        .join('')}
    </div>

    <div class="section box">
      <h2>Métricas de sensores</h2>
      <div class="metric"><strong>Temperatura média:</strong> ${tempMetrics.average.toFixed(1)}°C</div>
      <div class="metric"><strong>Temperatura pico:</strong> ${tempMetrics.max.toFixed(1)}°C</div>
      <div class="metric"><strong>Temperatura mínima:</strong> ${tempMetrics.min.toFixed(1)}°C</div>
      <div class="metric"><strong>Umidade média:</strong> ${humidityMetrics.average.toFixed(0)}%</div>
      <div class="metric"><strong>Umidade máxima:</strong> ${humidityMetrics.max.toFixed(0)}%</div>
      <div class="metric"><strong>Umidade mínima:</strong> ${humidityMetrics.min.toFixed(0)}%</div>
      <div class="metric"><strong>Luminosidade média:</strong> ${lightMetrics.average.toFixed(0)} lux</div>
      <div class="metric"><strong>Luminosidade máxima:</strong> ${lightMetrics.max.toFixed(0)} lux</div>
      <div class="metric"><strong>Luminosidade mínima:</strong> ${lightMetrics.min.toFixed(0)} lux</div>
    </div>

    <div class="section box">
      <h2>Estatísticas do template</h2>
      ${templateStats
        .map((stat) => `<div class="metric"><strong>${escapeHtml(stat.title)}:</strong> ${escapeHtml(stat.value)}</div>`)
        .join('')}
    </div>

    <div class="section box">
      <h2>Histórico de interações</h2>
      ${interactionHistory.length > 0 ? `<ol>${interactionHistory.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ol>` : '<p class="small">Nenhuma interação registrada.</p>'}
    </div>

    <div class="section box">
      <h2>Logs recentes</h2>
      ${logs.length > 0 ? `<table><thead><tr><th>Hora</th><th>Nível</th><th>Mensagem</th></tr></thead><tbody>${logs
        .map((log) => `<tr><td>${escapeHtml(log.time)}</td><td>${escapeHtml(log.level)}</td><td>${escapeHtml(log.message)}</td></tr>`)
        .join('')}</tbody></table>` : '<p class="small">Nenhum log disponível.</p>'}
    </div>

    <script>window.print();</script>
  </body>
</html>`;
}

export default function DataDashboardView() {
  const { isSimulating, addSensorData, addLog, activeProject } = useAppStore();
  const [tempHistory, setTempHistory] = useState<{ time: string; value: number }[]>([]);
  const [humidityHistory, setHumidityHistory] = useState<{ time: string; value: number }[]>([]);
  const [lightHistory, setLightHistory] = useState<{ time: string; value: number }[]>([]);
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(initialLogs);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [selectedAction, setSelectedAction] = useState('');
  const [problemMode, setProblemMode] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
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
        setLightHistory((prev) => [...prev.slice(-30), { time: timeStr, value: parseFloat(light.toFixed(0)) }]);

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
  const currentLight = lightHistory.length > 0 ? lightHistory[lightHistory.length - 1].value : 320;

  const tempMetrics = calculateMetrics(tempHistory);
  const humidityMetrics = calculateMetrics(humidityHistory);
  const lightMetrics = calculateMetrics(lightHistory);

  const templateKey = activeProject?.template as TemplateKey | undefined;
  const templateConfig = templateKey ? templateDashboardConfig[templateKey] : null;
  const projectTypeLabel = activeProject?.type === '3d' ? 'Projeto 3D' : activeProject?.type === 'circuit' ? 'Projeto 2D' : 'Projeto';
  const templateLabel = activeProject?.template ? `Template: ${activeProject.template}` : null;
  const actionOptions = templateConfig?.actions ?? [];
  const systemSummaryMetrics = templateKey
    ? getTemplateSummaryMetrics(templateKey, currentTemp, currentHumidity, currentLight, alerts.length)
    : [
        { title: 'Aguardando template', value: 'Selecione um projeto', detail: 'Abra um template 3D para ver métricas do sistema.' },
      ];

  const handleSimulateProblem = () => {
    const projectName = activeProject?.name ?? 'Dashboard de template';
    const problemText = 'POSSÍVEL PROBLEMA: Falha de comunicação do sensor de temperatura detectada.';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSelectedAction('Simular problema');
    setProblemMode(true);
    setProblemDescription(problemText);
    setInteractionHistory((prev) => [`${now} — Simulação de problema iniciada`, ...prev].slice(0, 5));
    playAlertSound();

    const pdfLines = [
      `Projeto: ${projectName}`,
      `Template: ${activeProject?.template ?? 'não selecionado'}`,
      '',
      `Temperatura atual: ${currentTemp.toFixed(1)}°C`,
      `Umidade atual: ${currentHumidity.toFixed(0)}%`,
      `Luminosidade atual: ${currentLight.toFixed(0)} lux`,
      '',
      problemText,
      'Recomenda-se verificar o sensor e a alimentação do módulo rapidamente.',
    ];
    const pdfBytes = createProblemPdfBytes(pdfLines, [pdfLines.length - 2]);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_problema.pdf`);

    setTimeout(() => {
      setProblemMode(false);
      setProblemDescription('');
    }, 12000);
  };

  const handleAction = (action: string) => {
    playClickSound();
    if (action === 'Simular problema') {
      handleSimulateProblem();
      return;
    }

    setSelectedAction(action);
    setInteractionHistory((prev) => [
      `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${action}`,
      ...prev,
    ].slice(0, 5));
  };

  const handlePrintDashboard = () => {
    playClickSound();
    const projectName = activeProject?.name ?? 'Dashboard de template';
    const templateLabelText = activeProject?.template ? `Template: ${activeProject.template}` : 'Template não selecionado';
    const printHtml = buildPrintHtml({
      projectName,
      templateLabel: templateLabelText,
      systemSummary: systemSummaryMetrics,
      templateStats: templateConfig?.stats ?? [],
      tempMetrics,
      humidityMetrics,
      lightMetrics,
      interactionHistory,
      logs: filteredLogs,
    });

    const printWindow = window.open('', '_blank', 'width=950,height=700');
    if (printWindow) {
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  const dashboardWrapperClass = 'p-6 overflow-y-auto transition-colors duration-300' + (problemMode ? ' bg-red-950/10' : '');
  const dashboardHeaderClass = problemMode
    ? 'mb-8 rounded-[32px] border border-red-500 bg-red-950/90 shadow-[0_20px_80px_rgba(125,0,0,0.35)] p-8'
    : 'mb-8 rounded-[32px] border border-white/[0.08] bg-slate-950 shadow-[0_20px_80px_rgba(0,0,0,0.25)] p-8';

  return (
    <div className={dashboardWrapperClass}>
      <div className={dashboardHeaderClass}>
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
                {problemMode && problemDescription ? (
                  <div className="mt-4 rounded-3xl border border-red-500 bg-red-950/90 p-4 text-sm text-red-100">
                    <strong>Simulação de problema ativa:</strong> {problemDescription}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {systemSummaryMetrics.map((metric) => (
                <div key={metric.title} className="rounded-3xl border border-white/[0.08] bg-[#0b1220] p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">{metric.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#f8fafc]">{metric.value}</p>
                  <p className="mt-2 text-sm text-white/50">{metric.detail}</p>
                </div>
              ))}
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="rounded-2xl bg-white/5 px-4 py-2 text-sm text-white/60">Atualizando continuamente</div>
                <button
                  type="button"
                  onClick={handlePrintDashboard}
                  className="rounded-2xl bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1d4ed8]"
                >
                  Imprimir dados
                </button>
              </div>
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
                    onClick={() => handleAction(action)}
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
              <div className="mt-4 space-y-3">
                {interactionHistory.length > 0 ? (
                  interactionHistory.map((entry, index) => (
                    <p key={index} className="text-sm text-white/60">{entry}</p>
                  ))
                ) : (
                  <p className="text-sm text-white/50">Ainda não há ações recentes.</p>
                )}
              </div>
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
