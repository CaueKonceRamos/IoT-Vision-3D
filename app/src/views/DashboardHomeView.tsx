import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Box, Grid3X3, BarChart3, Search, Wifi, Activity, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const RESEARCH_LINKS = {
  professor: 'https://forms.gle/MnUAck7vvBPruHvy7',
  student: 'https://forms.gle/a61NjYZanLctD7Fc6',
};

const welcomeMessages = [
  'Bem-vindo de volta ao seu laboratório IoT.',
  'Pronto para conectar seu próximo projeto em 3D?',
  'Seu ambiente está carregado e pronto para automação.',
  'Visualize dados reais e acesse o modo 2D com um clique.',
  'Hora de explorar sensores, circuitos e protótipos rápidos.',
];

const devices = [
  { label: 'ESP32-Principal', status: 'online' },
  { label: 'Arduino-Uno', status: 'online' },
  { label: 'Sensor PIR', status: 'online' },
  { label: 'DHT11-Sala', status: 'offline' },
  { label: 'Rele-Lampada', status: 'online' },
];

const baseShortcuts = [
  { label: '3D View', description: 'Abrir modo imersivo 3D', icon: Box, path: '/dashboard/workspace/3d', external: false },
  { label: '2D View', description: 'Ir para montagem e conexões', icon: Grid3X3, path: '/dashboard/workspace/circuit', external: false },
  { label: 'Painel IoT', description: 'Monitoramento em tempo real', icon: BarChart3, path: '/dashboard/workspace/data', external: false },
];

export default function DashboardHomeView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const researchLink = useMemo(() => {
    return user?.role === 'professor' ? RESEARCH_LINKS.professor : RESEARCH_LINKS.student;
  }, [user?.role]);
  
  const shortcuts = useMemo(() => [
    ...baseShortcuts,
    { label: 'Pesquisa', description: 'Acessar direcionador de pesquisa', icon: Search, path: researchLink, external: true },
  ], [researchLink]);
  const welcome = useMemo(() => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)], []);
  const onlineCount = devices.filter((device) => device.status === 'online').length;
  const offlineCount = devices.length - onlineCount;

  return (
    <div className="p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="grid gap-3 md:gap-4 lg:grid-cols-[1.5fr_1fr] mb-4 md:mb-6">
        <div className="panel p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs md:text-sm text-[#00d4ff] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-3">Dashboard inicial</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#f0f0f0] leading-tight">{welcome}</h1>
              <p className="mt-3 md:mt-4 text-xs md:text-sm text-white/60 max-w-2xl">
                Veja o resumo do seu ambiente, acesse modos 2D e 3D rapidamente e monitore o status dos seus dispositivos em um painel industrial leve.
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-3 md:p-4 w-full sm:max-w-[260px]">
              <div className="flex items-center gap-3">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-2xl bg-gradient-to-br from-[#0073e6] to-[#00d4ff] flex items-center justify-center text-white flex-shrink-0">
                  <Home className="w-5 md:w-6 h-5 md:h-6" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-white/50">Usuário</p>
                  <p className="text-sm md:text-base text-[#f0f0f0] font-semibold">{user?.name || 'Usuário'}</p>
                </div>
              </div>
              <div className="mt-3 md:mt-5 space-y-2 md:space-y-3">
                <div className="rounded-2xl bg-[#0f172a] p-2 md:p-3">
                  <p className="text-[10px] md:text-[11px] uppercase text-white/40">Papel</p>
                  <p className="mt-1 text-xs md:text-sm text-white">{user?.role === 'professor' ? 'Professor' : 'Estudante'}</p>
                </div>
                <div className="rounded-2xl bg-[#0f172a] p-2 md:p-3">
                  <p className="text-[10px] md:text-[11px] uppercase text-white/40">Projetos</p>
                  <p className="mt-1 text-xs md:text-sm text-white">5 projetos ativos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          <div className="panel p-4 md:p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs md:text-sm text-white/50">Dispositivos</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#f0f0f0]">{devices.length}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="rounded-3xl bg-[#0f172a] p-3 md:p-4">
                <p className="text-[10px] md:text-[11px] text-white/40">Online</p>
                <p className="text-lg md:text-xl text-[#00ff88] font-semibold mt-2">{onlineCount}</p>
              </div>
              <div className="rounded-3xl bg-[#0f172a] p-3 md:p-4">
                <p className="text-[10px] md:text-[11px] text-white/40">Offline</p>
                <p className="text-lg md:text-xl text-[#ff4444] font-semibold mt-2">{offlineCount}</p>
              </div>
            </div>
          </div>

          <div className="panel p-4 md:p-5 bg-[#121212] border border-white/[0.08]">
            <p className="text-xs md:text-sm text-white/50 uppercase tracking-[0.2em] mb-2 md:mb-3">Resumo rápido</p>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between rounded-3xl bg-[#0f172a] p-3 md:p-4">
                <div>
                  <p className="text-[11px] md:text-xs text-white/50">Conexões</p>
                  <p className="text-base md:text-lg text-[#f0f0f0] font-semibold">12</p>
                </div>
                <Activity className="w-4 md:w-5 h-4 md:h-5 text-[#00d4ff]" />
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-[#0f172a] p-3 md:p-4">
                <div>
                  <p className="text-[11px] md:text-xs text-white/50">Alertas</p>
                  <p className="text-base md:text-lg text-[#f0f0f0] font-semibold">3 ativos</p>
                </div>
                <ShieldCheck className="w-4 md:w-5 h-4 md:h-5 text-[#ffaa00]" />
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-[#0f172a] p-3 md:p-4">
                <div>
                  <p className="text-[11px] md:text-xs text-white/50">Status da rede</p>
                  <p className="text-base md:text-lg text-[#f0f0f0] font-semibold">Estável</p>
                </div>
                <Wifi className="w-4 md:w-5 h-4 md:h-5 text-[#00ff88]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3 md:space-y-4">
          <div className="panel p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
              <div>
                <h2 className="text-lg md:text-xl text-[#f0f0f0] font-semibold">Atalhos rápidos</h2>
                <p className="text-xs md:text-sm text-white/50">Navegue direto para as áreas principais do sistema.</p>
              </div>
              <button
                onClick={() => window.open(researchLink, '_blank')}
                className="btn-secondary text-[10px] md:text-xs px-3 py-2 rounded whitespace-nowrap"
              >
                Direcionador de Pesquisa
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {shortcuts.map((shortcut) => {
                const Icon = shortcut.icon;
                return (
                  <button
                    key={shortcut.label}
                    onClick={() => {
                      if (shortcut.external) {
                        window.open(shortcut.path, '_blank');
                      } else {
                        navigate(shortcut.path);
                      }
                    }}
                    className="group rounded-3xl border border-white/[0.08] bg-[#0f172a] p-3 md:p-4 text-left transition hover:border-[#00d4ff] hover:bg-[#071521]"
                  >
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <div className="rounded-2xl bg-[#121a2a] p-2 md:p-3 text-[#00d4ff] flex-shrink-0">
                        <Icon className="w-4 md:w-5 h-4 md:h-5" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-white font-semibold">{shortcut.label}</p>
                        <p className="text-[10px] md:text-[11px] text-white/50">{shortcut.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] md:text-[11px] text-[#00d4ff] group-hover:text-[#00ff88]">Acessar →</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel p-4 md:p-5">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div>
                <h2 className="text-lg md:text-xl text-[#f0f0f0] font-semibold">Dispositivos</h2>
                <p className="text-xs md:text-sm text-white/50">Visão técnica e operacional.</p>
              </div>
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white/40">Atualizado</span>
            </div>
            <div className="grid gap-2 md:gap-3">
              {devices.map((device) => (
                <div key={device.label} className="flex items-center justify-between rounded-3xl bg-[#121212] p-3 md:p-4 border border-white/[0.06]">
                  <div>
                    <p className="text-xs md:text-sm text-[#f0f0f0] font-medium">{device.label}</p>
                    <p className="text-[10px] md:text-[11px] text-white/50">{device.status === 'online' ? 'Conectado' : 'Desconectado'}</p>
                  </div>
                  <span className={`text-[10px] md:text-xs font-semibold ${device.status === 'online' ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {device.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div className="panel p-4 md:p-5 bg-[#121212] border border-white/[0.08]">
            <h2 className="text-lg md:text-xl text-[#f0f0f0] font-semibold mb-2 md:mb-3">Perfil</h2>
            <div className="rounded-3xl bg-[#0f172a] p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-2xl bg-[#0073e6] flex items-center justify-center text-white text-sm md:text-lg flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-white font-semibold truncate">{user?.name || 'Usuário'}</p>
                  <p className="text-[10px] md:text-xs text-white/50 truncate">{user?.email || 'sem-email@dominio.com'}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-2xl bg-[#121212] p-2 md:p-3">
                  <p className="text-[10px] md:text-[11px] text-white/40">Projetos recentes</p>
                  <p className="mt-1 text-xs md:text-sm text-white">Casa Inteligente, Estação Meteorológica</p>
                </div>
                <div className="rounded-2xl bg-[#121212] p-2 md:p-3">
                  <p className="text-[10px] md:text-[11px] text-white/40">Configurações</p>
                  <p className="mt-1 text-xs md:text-sm text-white">Preferências do laboratório, alertas, notificações</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-4 md:p-5 bg-[#121212] border border-white/[0.08]">
            <h2 className="text-lg md:text-xl text-[#f0f0f0] font-semibold mb-2 md:mb-3">Pesquisa</h2>
            <p className="text-xs md:text-sm text-white/60 mb-3 md:mb-4">Acesse rapidamente recursos de estudo, trabalhos e conteúdo recomendado para professor / estudante.</p>
            <button
              onClick={() => window.open(researchLink, '_blank')}
              className="w-full bg-[#0073e6] text-[#0a0a0a] py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium hover:bg-[#005bb5] transition-colors"
            >
              Abrir Direcionador de Pesquisa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
