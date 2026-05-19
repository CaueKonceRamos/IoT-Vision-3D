import { create } from 'zustand';
import type { ActiveView, Project, ClassItem, SensorData, LogEntry } from '@/types';

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

export const useAppStore = create<AppState>((set) => ({
  activeView: '3d',
  activeProject: null,
  isSimulating: false,
  sidebarCollapsed: false,
  projects: defaultProjects,
  classes: defaultClasses,
  sensorData: [],
  logs: [],
  setActiveView: (view) => set({ activeView: view }),
  setActiveProject: (project) => set({ activeProject: project }),
  toggleSimulation: () => set((s) => ({ isSimulating: !s.isSimulating })),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  addClass: (cls) => set((s) => ({ classes: [...s.classes, cls] })),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  addSensorData: (data) => set((s) => ({ sensorData: [...s.sensorData.slice(-100), data] })),
  addLog: (log) => set((s) => ({ logs: [...s.logs.slice(-99), log] })),
}));
