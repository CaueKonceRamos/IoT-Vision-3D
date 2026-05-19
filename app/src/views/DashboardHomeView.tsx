import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Box, Grid3X3, BarChart3, Search, Users, Wifi, Cpu, Zap, Activity, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

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

const shortcuts = [
  { label: '3D View', description: 'Abrir modo imersivo 3D', icon: Box, path: '/dashboard/workspace/3d' },
  { label: '2D View', description: 'Ir para montagem e conexões', icon: Grid3X3, path: '/dashboard/workspace/circuit' },
  { label: 'Painel IoT', description: 'Monitoramento em tempo real', icon: BarChart3, path: '/dashboard/workspace/data' },
  { label: 'Pesquisa', description: 'Acessar direcionador de pesquisa', icon: Search, path: 'https://www.google.com/search?q=pesquisa+professor+estudante', external: true },
];

export default function DashboardHomeView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const welcome = useMemo(() => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)], []);
  const onlineCount = devices.filter((device) => device.status === 'online').length;
  const offlineCount = devices.length - onlineCount;

  return (
    <div className="p-6 overflow-y-auto">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] mb-6">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#00d4ff] uppercase tracking-[0.4em] mb-3">Dashboard inicial</p>
              <h1 className="text-3xl lg:text-4xl font-semibold text-[#f0f0f0] leading-tight">{welcome}</h1>
              <p className="mt-4 text-sm text-white/60 max-w-2xl">
                Veja o resumo do seu ambiente, acesse modos 2D e 3D rapidamente e monitore o status dos seus dispositivos em um painel industrial leve.
              </p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#121212] p-4 w-full max-w-[260px]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0073e6] to-[#00d4ff] flex items-center justify-center text-white">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/50">Usuário</p>
                  <p className="text-base text-[#f0f0f0] font-semibold">{user?.name || 'Usuário'}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#0f172a] p-3">
                  <p className="text-[11px] uppercase text-white/40">Papel</p>
                  <p className="mt-1 text-sm text-white">{user?.role === 'professor' ? 'Professor' : 'Estudante'}</p>
                </div>
                <div className="rounded-2xl bg-[#0f172a] p-3">
                  <p className="text-[11px] uppercase text-white/40">Projetos</p>
                  <p className="mt-1 text-sm text-white">5 projetos ativos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="panel p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/50">Dispositivos</p>
              <h2 className="text-3xl font-semibold text-[#f0f0f0]">{devices.length}</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="rounded-3xl bg-[#0f172a] p-4">
                <p className="text-[11px] text-white/40">Online</p>
                <p className="text-xl text-[#00ff88] font-semibold mt-2">{onlineCount}</p>
              </div>
              <div className="rounded-3xl bg-[#0f172a] p-4">
                <p className="text-[11px] text-white/40">Offline</p>
                <p className="text-xl text-[#ff4444] font-semibold mt-2">{offlineCount}</p>
              </div>
            </div>
          </div>

          <div className="panel p-5 bg-[#121212] border border-white/[0.08]">
            <p className="text-sm text-white/50 uppercase tracking-[0.2em] mb-3">Resumo rápido</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-3xl bg-[#0f172a] p-4">
                <div>
                  <p className="text-xs text-white/50">Conexões</p>
                  <p className="text-lg text-[#f0f0f0] font-semibold">12</p>
                </div>
                <Activity className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-[#0f172a] p-4">
                <div>
                  <p className="text-xs text-white/50">Alertas</p>
                  <p className="text-lg text-[#f0f0f0] font-semibold">3 ativos</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#ffaa00]" />
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-[#0f172a] p-4">
                <div>
                  <p className="text-xs text-white/50">Status da rede</p>
                  <p className="text-lg text-[#f0f0f0] font-semibold">Estável</p>
                </div>
                <Wifi className="w-5 h-5 text-[#00ff88]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl text-[#f0f0f0] font-semibold">Atalhos rápidos</h2>
                <p className="text-sm text-white/50">Navegue direto para as áreas principais do sistema.</p>
              </div>
              <button
                onClick={() => window.open('https://www.google.com/search?q=pesquisa+professor+estudante', '_blank')}
                className="btn-secondary text-xs px-3 py-2 rounded"
              >
                Direcionador de Pesquisa
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="group rounded-3xl border border-white/[0.08] bg-[#0f172a] p-4 text-left transition hover:border-[#00d4ff] hover:bg-[#071521]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-2xl bg-[#121a2a] p-3 text-[#00d4ff]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-semibold">{shortcut.label}</p>
                        <p className="text-[11px] text-white/50">{shortcut.description}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#00d4ff] group-hover:text-[#00ff88]">Acessar →</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl text-[#f0f0f0] font-semibold">Dispositivos</h2>
                <p className="text-sm text-white/50">Visão técnica e operacional.</p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Atualizado</span>
            </div>
            <div className="grid gap-3">
              {devices.map((device) => (
                <div key={device.label} className="flex items-center justify-between rounded-3xl bg-[#121212] p-4 border border-white/[0.06]">
                  <div>
                    <p className="text-sm text-[#f0f0f0] font-medium">{device.label}</p>
                    <p className="text-[11px] text-white/50">{device.status === 'online' ? 'Conectado' : 'Desconectado'}</p>
                  </div>
                  <span className={`text-xs font-semibold ${device.status === 'online' ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {device.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5 bg-[#121212] border border-white/[0.08]">
            <h2 className="text-xl text-[#f0f0f0] font-semibold mb-3">Perfil</h2>
            <div className="rounded-3xl bg-[#0f172a] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0073e6] flex items-center justify-center text-white text-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-white/50">{user?.email || 'sem-email@dominio.com'}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="rounded-2xl bg-[#121212] p-3">
                  <p className="text-[11px] text-white/40">Projetos recentes</p>
                  <p className="mt-1 text-sm text-white">Casa Inteligente, Estação Meteorológica</p>
                </div>
                <div className="rounded-2xl bg-[#121212] p-3">
                  <p className="text-[11px] text-white/40">Configurações</p>
                  <p className="mt-1 text-sm text-white">Preferências do laboratório, alertas, notificações</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-5 bg-[#121212] border border-white/[0.08]">
            <h2 className="text-xl text-[#f0f0f0] font-semibold mb-3">Pesquisa</h2>
            <p className="text-sm text-white/60 mb-4">Acesse rapidamente recursos de estudo, trabalhos e conteúdo recomendado para professor / estudante.</p>
            <button
              onClick={() => window.open('https://www.google.com/search?q=pesquisa+professor+estudante', '_blank')}
              className="w-full bg-[#0073e6] text-[#0a0a0a] py-3 rounded-xl text-sm font-medium hover:bg-[#005bb5] transition-colors"
            >
              Abrir Direcionador de Pesquisa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
