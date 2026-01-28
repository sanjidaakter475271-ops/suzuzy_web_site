import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoutePath } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Settings } from './pages/Settings';
import { ServiceAssistant } from './pages/ServiceAssistant';
import { JobCardDetail } from './pages/JobCardDetail';
import { authClient } from './lib/auth-client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  onLogout: () => void;
  userName: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
  isSidebarOpen,
  onCloseSidebar,
  onLogout,
  userName
}) => {
  if (!isAuthenticated) {
    return <Navigate to={RoutePath.LOGIN} replace />;
  }
  return (
    <>
      {children}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={onCloseSidebar}
        onLogout={onLogout}
        userName={userName}
      />
    </>
  );
};

const App: React.FC = () => {
  const { data: session, isPending } = authClient.useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Load Theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  const isAuthenticated = !!session;
  const userName = session?.user?.name || "Guest";


  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogin = (name: string) => {
    // Session is handled by authClient
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path={RoutePath.LOGIN} element={
          isAuthenticated ? <Navigate to={RoutePath.DASHBOARD} /> : <Login onLogin={handleLogin} />
        } />

        <Route path={RoutePath.REGISTER} element={
          isAuthenticated ? <Navigate to={RoutePath.DASHBOARD} /> : <Register onLogin={handleLogin} />
        } />

        <Route path={RoutePath.DASHBOARD} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Dashboard onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.SETTINGS} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Settings onMenuClick={toggleSidebar} userName={userName} onToggleTheme={toggleTheme} isDark={theme === 'dark'} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.ASSISTANT} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <ServiceAssistant onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.JOB_CARD} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <JobCardDetail />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={isAuthenticated ? RoutePath.DASHBOARD : RoutePath.LOGIN} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;