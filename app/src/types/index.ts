export type UserRole = 'professor' | 'aluno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ActiveView = '3d' | 'circuit' | 'dashboard' | 'classes' | 'projects';

export interface Project {
  id: string;
  name: string;
  type: '3d' | 'circuit';
  template?: string;
  owner: string;
  lastModified: string;
}

export interface ClassItem {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  color: string;
  activities: Activity[];
  students: number;
}

export interface Activity {
  id: string;
  name: string;
  type: '3D' | 'Circuito' | 'Quiz';
  dueDate: string;
  status: 'pendente' | 'em-andamento' | 'entregue' | 'atrasado';
}

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
}

export interface Component3D {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SensorData {
  name: string;
  type: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface LogEntry {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}
