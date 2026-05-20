import { create } from 'zustand';
import type { ActiveView, Project, ClassItem, SensorData, LogEntry } from '@/types';

const STORAGE_KEY = 'kimi-app-state';

const loadAppState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveAppState = (data: { projects: Project[]; classes: ClassItem[]; activeProject: Project | null }) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
};

interface AppState {
  activeView: ActiveView;
  activeProject: Project | null;
  isSimulating: boolean;
  sidebarCollapsed: boolean;
  projects: Project[];
  classes: ClassItem[];
  sensorData: SensorData[];
  logs: LogEntry[];
  setActiveView: (view: ActiveView) => void;
  setActiveProject: (project: Project | null) => void;
  toggleSimulation: () => void;
  toggleSidebar: () => void;
  addClass: (cls: ClassItem) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  addSensorData: (data: SensorData) => void;
  addLog: (log: LogEntry) => void;
}

const defaultProjects: Project[] = [
  { id: '1', name: 'Casa Inteligente', type: '3d', template: 'casa', owner: 'Voltix', lastModified: 'há 2h', image: '/showcase-casa.jpg' },
  { id: '2', name: 'Estacao Meteorologica', type: '3d', template: 'estacao', owner: 'Voltix', lastModified: 'há 1d', image: '/showcase-estacao.jpg' },
  { id: '3', name: 'Irrigacao Inteligente', type: '3d', template: 'irrigacao', owner: 'Voltix', lastModified: 'há 3d', image: '/showcase-irrigacao.jpg' },
  { id: '4', name: 'Meu Projeto', type: 'circuit', owner: 'Voce', lastModified: 'há 5min', image: '/showcase-circuit.svg' },
];

const defaultClasses: ClassItem[] = [
  {
    id: '1', code: 'ELETRONICA', name: 'Eletronica 2025', subject: 'Eletronica', teacher: 'Prof. Silva',
    color: '#0073e6', students: 24,
    activities: [
      { id: '1', name: 'Casa Inteligente', type: '3D', dueDate: '20/05', status: 'em-andamento' },
      { id: '2', name: 'Circuito LED', type: 'Circuito', dueDate: '25/05', status: 'pendente' },
    ],
  },
  {
    id: '2', code: 'IOTAVAN', name: 'IoT Avancado', subject: 'IoT', teacher: 'Prof. Santos',
    color: '#00d4ff', students: 18,
    activities: [
      { id: '3', name: 'Estacao Meteorologica', type: '3D', dueDate: '22/05', status: 'entregue' },
    ],
  },
];

export const useAppStore = create<AppState>((set) => {
  const stored = loadAppState();
  return {
    activeView: 'home',
    activeProject: stored?.activeProject ?? null,
    isSimulating: false,
    sidebarCollapsed: false,
    projects: stored?.projects ?? defaultProjects,
    classes: stored?.classes ?? defaultClasses,
    sensorData: [],
    logs: [],
    setActiveView: (view) => set({ activeView: view }),
    setActiveProject: (project) => set((s) => {
      const nextActive = project;
      saveAppState({ projects: s.projects, classes: s.classes, activeProject: nextActive });
      return { activeProject: project };
    }),
    toggleSimulation: () => set((s) => ({ isSimulating: !s.isSimulating })),
    toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    addClass: (cls) => set((s) => {
      const nextClasses = [...s.classes, cls];
      saveAppState({ projects: s.projects, classes: nextClasses, activeProject: s.activeProject });
      return { classes: nextClasses };
    }),
    addProject: (project) => set((s) => {
      const nextProjects = [...s.projects, project];
      saveAppState({ projects: nextProjects, classes: s.classes, activeProject: s.activeProject });
      return { projects: nextProjects };
    }),
    updateProject: (project) => set((s) => {
      const nextProjects = s.projects.some((p) => p.id === project.id)
        ? s.projects.map((p) => (p.id === project.id ? project : p))
        : [...s.projects, project];
      saveAppState({ projects: nextProjects, classes: s.classes, activeProject: project });
      return { projects: nextProjects };
    }),
    addSensorData: (data) => set((s) => ({ sensorData: [...s.sensorData.slice(-100), data] })),
    addLog: (log) => set((s) => ({ logs: [...s.logs.slice(-99), log] })),
  };
});
