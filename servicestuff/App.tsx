import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { Router } from './lib/router';
import { RoutePath } from './types';
import { Splash } from './pages/Splash';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Settings } from './pages/Settings';
import { ServiceAssistant } from './pages/ServiceAssistant';
import { JobCardDetail } from './pages/JobCardDetail';
import { MyJobs } from './pages/MyJobs';
import { Profile } from './pages/Profile';
import { Attendance } from './pages/Attendance';
import { Performance } from './pages/Performance';
import { WorkHistory } from './pages/WorkHistory';

import { Notifications } from './pages/Notifications';
import { Requisitions } from './pages/Requisitions';
import { LocationTracker } from './components/LocationTracker';
import { PushNotificationManager } from './components/PushNotificationManager';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/auth';

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

const AppContent: React.FC = () => {
  const { user, session, loading: isPending, signOut } = useAuth();
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

  // Sync Token and Connect Socket
  useEffect(() => {
    if (session?.token && user?.id) {
      import('./services/socket').then(({ SocketService }) => {
        SocketService.getInstance().connect(user.id);
      });
    }
  }, [session, user]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  const isAuthenticated = !!user;
  const userName = user?.name || "Guest";


  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogin = (name: string) => {
    // Session is handled by AuthProvider
  };

  const handleLogout = async () => {
    await signOut();
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      {isAuthenticated && <LocationTracker />}
      {isAuthenticated && <PushNotificationManager />}
      <Routes>
        <Route path={RoutePath.SPLASH} element={
          isAuthenticated ? <Navigate to={RoutePath.DASHBOARD} /> : <Splash />
        } />

        <Route path={RoutePath.WELCOME} element={
          isAuthenticated ? <Navigate to={RoutePath.DASHBOARD} /> : <Welcome />
        } />

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

        <Route path={RoutePath.MY_JOBS} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <MyJobs onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.PROFILE} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Profile onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.ATTENDANCE} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Attendance onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.PERFORMANCE} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Performance onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.WORK_HISTORY} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <WorkHistory onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />



        <Route path={RoutePath.NOTIFICATIONS} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Notifications onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.PARTS_REQUEST} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            isSidebarOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            userName={userName}
          >
            <Requisitions onMenuClick={toggleSidebar} />
          </ProtectedRoute>
        } />

        <Route path="*" element={
          isAuthenticated
            ? <Navigate to={RoutePath.DASHBOARD} />
            : (localStorage.getItem('servicemate_onboarded') === 'true'
              ? <Navigate to={RoutePath.LOGIN} />
              : <Navigate to={RoutePath.SPLASH} />)
        } />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;