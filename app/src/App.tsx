import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ToastContainer from '@/components/Toast';
import { useAuthStore } from '@/stores/authStore';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardLayout = lazy(() => import('@/pages/DashboardLayout'));
const Workspace3DView = lazy(() => import('@/views/Workspace3DView'));
const CircuitEditorView = lazy(() => import('@/views/CircuitEditorView'));
const DataDashboardView = lazy(() => import('@/views/DataDashboardView'));
const ClassesView = lazy(() => import('@/views/ClassesView'));
const ProjectsView = lazy(() => import('@/views/ProjectsView'));

function LoadingFallback() {
  return (
    <div className="w-screen h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#0073e6] rounded-full animate-spin" />
        <p className="text-sm text-white/50">Carregando...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Workspace3DView />} />
            <Route path="workspace/3d" element={<Workspace3DView />} />
            <Route path="workspace/circuit" element={<CircuitEditorView />} />
            <Route path="workspace/data" element={<DataDashboardView />} />
            <Route path="classes" element={<ClassesView />} />
            <Route path="projects" element={<ProjectsView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
