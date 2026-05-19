import { useState } from 'react';
import { Users, Plus, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { toast } from '@/stores/toastStore';

const statusConfig = {
  pendente: { bg: 'bg-[#ffaa00]/15', text: 'text-[#ffaa00]', label: 'Pendente' },
  'em-andamento': { bg: 'bg-[#0073e6]/15', text: 'text-[#0073e6]', label: 'Em Andamento' },
  entregue: { bg: 'bg-[#00ff88]/15', text: 'text-[#00ff88]', label: 'Entregue' },
  atrasado: { bg: 'bg-[#ff4444]/15', text: 'text-[#ff4444]', label: 'Atrasado' },
};

export default function ClassesView() {
  const { classes, addClass } = useAppStore();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState('Eletronica');
  const [newTeacher, setNewTeacher] = useState('Prof. Novo');
  const [newColor, setNewColor] = useState('#0073e6');
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

  const generateClassCode = () => `T${Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}`;

  const handleJoin = () => {
    if (joinCode.length < 4) {
      toast.error('Codigo invalido');
      return;
    }
    toast.success(`Entrou na turma com codigo ${joinCode}!`);
    setShowJoinModal(false);
    setJoinCode('');
  };

  const handleCreateClass = () => {
    if (!newClassName.trim() || !newSubject.trim() || !newTeacher.trim()) {
      toast.error('Preencha todos os campos da nova turma');
      return;
    }
    const code = generateClassCode();
    addClass({
      id: Date.now().toString(),
      code,
      name: newClassName.trim(),
      subject: newSubject.trim(),
      teacher: newTeacher.trim(),
      color: newColor,
      students: 0,
      activities: [],
    });
    toast.success(`Turma ${newClassName.trim()} criada! Codigo: ${code}`);
    setShowCreateModal(false);
    setNewClassName('');
    setNewSubject('Eletronica');
    setNewTeacher('Prof. Novo');
    setNewColor('#0073e6');
  };

  return (
    <div className="p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl text-[#f0f0f0] font-normal tracking-tight">Minhas Turmas</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Criar Turma
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Entrar em Turma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="panel p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cls.color }} />
              <div className="flex-1">
                <h3 className="text-lg text-[#f0f0f0] font-normal">{cls.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-white/40">{cls.teacher}</span>
                  <span className="text-xs text-white/30">|</span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {cls.students} alunos
                  </span>
                  <span className="text-xs text-white/30">|</span>
                  <span className="text-xs text-[#00ff88]">Código: {cls.code}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-white/[0.06] pb-2">
              {['Atividades', 'Alunos', 'Progresso'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab((prev) => ({ ...prev, [cls.id]: tab }))}
                  className={`text-xs px-3 py-1.5 rounded transition-colors ${
                    (activeTab[cls.id] || 'Atividades') === tab
                      ? 'bg-[#0073e6]/15 text-[#0073e6]'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {(activeTab[cls.id] || 'Atividades') === 'Atividades' && (
              <div className="space-y-2">
                {cls.activities.map((act) => {
                  const status = statusConfig[act.status];
                  return (
                    <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                        {act.type === '3D' ? <BookOpen className="w-4 h-4 text-[#0073e6]" /> : <GraduationCap className="w-4 h-4 text-[#00d4ff]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#e1e1e1]">{act.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {act.dueDate}
                          </span>
                          <span className="text-[10px] text-white/30">{act.type}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
                {cls.activities.length === 0 && (
                  <p className="text-sm text-white/30 text-center py-4">Nenhuma atividade</p>
                )}
              </div>
            )}

            {(activeTab[cls.id] || 'Atividades') === 'Alunos' && (
              <div className="space-y-2">
                {[
                  { name: 'Ana Silva', online: true },
                  { name: 'Bruno Costa', online: true },
                  { name: 'Carla Mendes', online: false },
                  { name: 'Daniel Lima', online: true },
                  { name: 'Elena Rocha', online: false },
                ].map((student) => (
                  <div key={student.name} className="flex items-center gap-3 p-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0073e6] to-[#00d4ff] flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium">{student.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-[#e1e1e1] flex-1">{student.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${student.online ? 'bg-[#00ff88]' : 'bg-white/20'}`} />
                  </div>
                ))}
              </div>
            )}

            {(activeTab[cls.id] || 'Atividades') === 'Progresso' && (
              <div className="space-y-3">
                {cls.activities.map((act) => {
                  const progress = act.status === 'entregue' ? 100 : act.status === 'em-andamento' ? 65 : act.status === 'atrasado' ? 30 : 0;
                  return (
                    <div key={act.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#e1e1e1]">{act.name}</span>
                        <span className="text-[10px] text-white/40">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: progress === 100 ? '#00ff88' : progress > 50 ? '#0073e6' : '#ffaa00',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="w-full mt-4 btn-primary text-xs py-2">
              Entrar no Laboratorio
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-6 w-full max-w-[420px]">
            <h3 className="text-lg text-[#f0f0f0] font-normal mb-2">Criar Nova Turma</h3>
            <p className="text-sm text-white/50 mb-4">Preencha os dados para criar uma nova turma.</p>
            <div className="space-y-4">
              <div>
                <label className="label-text block mb-2">Nome da Turma</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ex: Robótica Avançada"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>
              <div>
                <label className="label-text block mb-2">Disciplina</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Eletrônica"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>
              <div>
                <label className="label-text block mb-2">Professor</label>
                <input
                  type="text"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="Prof. Silva"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>
              <div>
                <label className="label-text block mb-2">Cor do Painel</label>
                <div className="flex gap-2 flex-wrap">
                  {['#0073e6', '#00d4ff', '#00ff88', '#ffaa00', '#ff4444'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-10 h-10 rounded-full border ${newColor === color ? 'border-white' : 'border-white/[0.12]'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
              <button onClick={handleCreateClass} className="btn-primary px-4 py-2 text-sm">Criar Turma</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-6 w-full max-w-[400px]">
            <h3 className="text-lg text-[#f0f0f0] font-normal mb-2">Entrar em Turma</h3>
            <p className="text-sm text-white/50 mb-4">Digite o codigo de convite fornecido pelo professor</p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all text-center font-mono-data tracking-widest mb-4"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowJoinModal(false)} className="flex-1 btn-secondary py-2.5 text-sm">Cancelar</button>
              <button onClick={handleJoin} className="flex-1 btn-primary py-2.5 text-sm">Entrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
