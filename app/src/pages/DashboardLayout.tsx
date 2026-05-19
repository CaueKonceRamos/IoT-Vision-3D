import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Box, Grid3X3, BarChart3, FolderOpen, Users, Layers,
  Menu, X, LogOut,
  Play, Square, Save, Share2, Wifi
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { toast } from '@/stores/toastStore';

const navItems = [
  { section: 'ESPACO DE TRABALHO', items: [
    { icon: Home, label: 'Visão Geral', path: '/dashboard', view: 'home' as const },
    { icon: Box, label: '3D View', path: '/dashboard/workspace/3d', view: '3d' as const },
    { icon: Grid3X3, label: '2D View', path: '/dashboard/workspace/circuit', view: 'circuit' as const },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard/workspace/data', view: 'dashboard' as const },
  ]},
  { section: 'PROJETOS', items: [
    { icon: FolderOpen, label: 'Meus Projetos', path: '/dashboard/projects', view: 'projects' as const },
    { icon: Layers, label: 'Templates', path: '/dashboard/projects', view: 'projects' as const },
  ]},
  { section: 'TURMAS', items: [
    { icon: Users, label: 'Minhas Turmas', path: '/dashboard/classes', view: 'classes' as const },
  ]},
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile } = useAuthStore();
  const { activeView, setActiveView, isSimulating, toggleSimulation, sidebarCollapsed, toggleSidebar } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatarUrl ?? '');

  const currentPath = location.pathname;

  useEffect(() => {
    setProfileName(user?.name ?? '');
    setProfileAvatar(user?.avatarUrl ?? '');
  }, [user]);

  const handleNav = (path: string, view: typeof activeView) => {
    setActiveView(view);
    navigate(path);
    setMobileOpen(false);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      toast.success('Projeto salvo!');
    }, 800);
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setProfileAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      toast.error('Nome do perfil é obrigatório');
      return;
    }
    updateProfile(profileName.trim(), profileAvatar);
    toast.success('Perfil atualizado!');
    setShowProfileModal(false);
  };

  const handleLogout = () => {
    logout();
    toast.info('Sessao encerrada');
    navigate('/login');
  };

  const isWorkspace = currentPath.includes('/workspace/');

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#f0f0f0] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0a0a0a] lg:hidden" style={{ width: 280 }}>
          <div className="p-5 flex items-center justify-between border-b border-white/[0.08]">
            <span className="text-[#f0f0f0] text-base">Voltix <span className="text-[#0073e6] text-[11px] uppercase tracking-wider">3D</span></span>
            <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <SidebarContent navigate={handleNav} currentPath={currentPath} onLogout={handleLogout} onProfileClick={() => setShowProfileModal(true)} user={user} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#121212] border-r border-white/[0.08] h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        <div className={`p-5 border-b border-white/[0.08] ${sidebarCollapsed ? 'px-3' : ''}`}>
          <span className={`text-[#f0f0f0] text-base whitespace-nowrap ${sidebarCollapsed ? 'hidden' : ''}`}>
            Voltix <span className="text-[#0073e6] text-[11px] uppercase tracking-wider">3D</span>
          </span>
          {sidebarCollapsed && <Box className="w-5 h-5 text-[#0073e6] mx-auto" />}
        </div>
        <SidebarContent navigate={handleNav} currentPath={currentPath} onLogout={handleLogout} onProfileClick={() => setShowProfileModal(true)} user={user} collapsed={sidebarCollapsed} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-[52px] bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/[0.08] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => { setMobileOpen(true); toggleSidebar(); }} className="lg:hidden text-white/50 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-[13px] text-white/50 truncate">
              <span>Turma: Eletronica 2025</span>
              <span className="mx-2 text-white/20">/</span>
              <span className="text-[#0073e6] cursor-pointer hover:underline">Casa Inteligente</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isWorkspace && (
              <>
                <button onClick={handleSave} className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded text-xs">
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo' : 'Salvar'}
                  </span>
                  {saveStatus === 'saved' && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />}
                </button>
                <button className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded text-xs">
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>
                <button
                  onClick={toggleSimulation}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-normal transition-colors ${
                    isSimulating ? 'bg-[#ff4444]/20 text-[#ff4444] border border-[#ff4444]/30' : 'bg-[#0073e6] text-[#0a0a0a]'
                  }`}
                >
                  {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isSimulating ? 'Parar' : 'Executar'}
                </button>
              </>
            )}

            <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-[#00ff88]" />
                <span className="text-[11px] text-white/50">Online</span>
              </div>
              <div className="font-mono-data text-[11px]">
                <span className={isSimulating ? 'text-[#00d4ff]' : 'text-white/40'}>
                  Sim: {isSimulating ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      {showProfileModal && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] bg-[#121212] border border-white/[0.08] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl text-[#f0f0f0] font-normal">Editar Perfil</h2>
                <p className="text-sm text-white/50">Atualize seu nome e foto do perfil.</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0f172a] border border-white/[0.08] flex items-center justify-center">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-white/80">{profileName?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <label className="cursor-pointer text-sm text-[#0073e6] hover:text-[#00d4ff] transition-colors">
                  Alterar foto
                  <input type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                </label>
              </div>
              <div>
                <label className="label-text block mb-2">Nome</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
                <button onClick={() => setShowProfileModal(false)} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
                <button onClick={handleSaveProfile} className="btn-primary px-4 py-2 text-sm">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  navigate,
  currentPath,
  onLogout,
  onProfileClick,
  user,
  collapsed = false,
}: {
  navigate: (path: string, view: 'home' | '3d' | 'circuit' | 'dashboard' | 'classes' | 'projects') => void;
  currentPath: string;
  onLogout: () => void;
  onProfileClick: () => void;
  user: { name: string; role: string; avatarUrl?: string } | null;
  collapsed?: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-4">
      {navItems.map((section) => (
        <div key={section.section} className={`mb-4 ${collapsed ? 'px-2' : 'px-4'}`}>
          {!collapsed && <p className="label-text px-2 mb-2">{section.section}</p>}
          {section.items.map((item) => {
            const isActive = currentPath === item.path || (item.view && currentPath.includes(item.path));
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path, item.view)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-[13px] font-light transition-all ${
                  isActive
                    ? 'text-[#f0f0f0] bg-[#0073e6]/15'
                    : 'text-white/50 hover:text-[#e1e1e1] hover:bg-white/[0.04]'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      ))}

      {/* User Profile */}
      <div className={`mt-auto border-t border-white/[0.08] pt-4 ${collapsed ? 'px-2' : 'px-4'}`}>
        <button
          onClick={onProfileClick}
          className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center' : ''} text-left rounded-lg p-2 hover:bg-white/[0.04] transition-colors`}
          type="button"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#0073e6] to-[#00d4ff] flex items-center justify-center shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#f0f0f0] truncate">{user?.name || 'Usuario'}</p>
              <p className="text-[11px] text-white/50 capitalize">{user?.role || 'Aluno'}</p>
            </div>
          )}
        </button>
        <div className="mt-3 flex justify-end">
          <button onClick={onLogout} className="text-white/30 hover:text-white/70 transition-colors text-xs" title="Sair">
            <LogOut className="w-4 h-4 inline-block align-middle" />
          </button>
        </div>
      </div>
    </div>
  );
}
