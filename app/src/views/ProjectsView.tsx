import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Box, Grid3X3, Filter } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { toast } from '@/stores/toastStore';

const filters = ['Todos', '3D', 'Circuito', 'Casa Inteligente', 'Estacao Meteorologica', 'Irrigacao'];

export default function ProjectsView() {
  const navigate = useNavigate();
  const { projects } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === 'Todos' ||
      (activeFilter === '3D' && p.type === '3d') ||
      (activeFilter === 'Circuito' && p.type === 'circuit') ||
      (activeFilter === 'Casa Inteligente' && p.template === 'casa') ||
      (activeFilter === 'Estacao Meteorologica' && p.template === 'estacao') ||
      (activeFilter === 'Irrigacao' && p.template === 'irrigacao');
    return matchesSearch && matchesFilter;
  });

  const handleOpenProject = (project: typeof projects[0]) => {
    toast.success(`Abrindo: ${project.name}`);
    navigate('/dashboard/workspace/3d');
  };

  const getProjectImage = (project: typeof projects[0]) => {
    if (project.template === 'casa') return '/showcase-casa.jpg';
    if (project.template === 'estacao') return '/showcase-estacao.jpg';
    if (project.template === 'irrigacao') return '/showcase-irrigacao.jpg';
    return null;
  };

  return (
    <div className="p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl text-[#f0f0f0] font-normal tracking-tight">Meus Projetos</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar projeto..."
              className="w-full bg-white/5 border border-white/[0.08] rounded-md pl-9 pr-3 py-2 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/30 shrink-0" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeFilter === f
                ? 'bg-[#0073e6] text-[#0a0a0a]'
                : 'bg-white/5 text-white/50 hover:text-white/70 border border-white/[0.06]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((project) => {
          const img = getProjectImage(project);
          return (
            <button
              key={project.id}
              onClick={() => handleOpenProject(project)}
              className="panel overflow-hidden text-left group hover:border-white/[0.14] transition-all"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#0d1117]">
                {img ? (
                  <img
                    src={img}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {project.type === '3d' ? (
                      <Box className="w-12 h-12 text-[#0073e6]/30" />
                    ) : (
                      <Grid3X3 className="w-12 h-12 text-[#00d4ff]/30" />
                    )}
                  </div>
                )}
                {project.template && (
                  <span className="absolute top-2 left-2 text-[10px] bg-[#0073e6]/80 text-[#0a0a0a] px-2 py-0.5 rounded">
                    MODELO
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm text-[#f0f0f0] font-normal truncate">{project.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    project.type === '3d' ? 'bg-[#0073e6]/15 text-[#0073e6]' : 'bg-[#00d4ff]/15 text-[#00d4ff]'
                  }`}>
                    {project.type === '3d' ? '3D' : 'Circuito'}
                  </span>
                  <span className="text-[10px] text-white/40">{project.lastModified}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Box className="w-12 h-12 mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm">Nenhum projeto encontrado</p>
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-6 w-full max-w-[600px]">
            <h3 className="text-lg text-[#f0f0f0] font-normal mb-6">Novo Projeto</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => { toast.success('Projeto 3D criado!'); setShowNewModal(false); navigate('/dashboard/workspace/3d'); }}
                className="p-6 rounded-xl border border-white/[0.08] hover:border-[#0073e6]/50 hover:bg-[#0073e6]/5 transition-all text-center group"
              >
                <Box className="w-10 h-10 mx-auto text-[#0073e6] mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-[#f0f0f0] mb-1">Criar Projeto 3D</p>
                <p className="text-xs text-white/40">Ambiente 3D interativo</p>
              </button>
              <button
                onClick={() => { toast.success('Circuito criado!'); setShowNewModal(false); navigate('/dashboard/workspace/circuit'); }}
                className="p-6 rounded-xl border border-white/[0.08] hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/5 transition-all text-center group"
              >
                <Grid3X3 className="w-10 h-10 mx-auto text-[#00d4ff] mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-[#f0f0f0] mb-1">Criar Circuito 2D</p>
                <p className="text-xs text-white/40">Editor de circuitos</p>
              </button>
            </div>
            <p className="label-text mb-3">Ou comecar com um modelo:</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {projects.filter((p) => p.template).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { toast.success(`Usando modelo: ${p.name}`); setShowNewModal(false); navigate('/dashboard/workspace/3d'); }}
                  className="shrink-0 w-32 rounded-lg border border-white/[0.08] overflow-hidden hover:border-[#0073e6]/30 transition-all"
                >
                  <div className="aspect-video bg-[#0d1117]">
                    <img src={getProjectImage(p) || ''} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-white/60 p-2 truncate">{p.name}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowNewModal(false)} className="btn-secondary text-sm px-4 py-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
