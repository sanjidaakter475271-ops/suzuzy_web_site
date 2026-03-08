import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Router } from './lib/router';
import { RoutePath } from './types';
import { Splash } from './pages/Splash';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { BottomBar } from './components/BottomBar';
import { Settings } from './pages/Settings';
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

import { OfflineBanner } from './components/OfflineBanner';
import { PermissionManager } from './components/PermissionManager';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  onLogout: () => void;
  userName: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  children,
  onLogout,
  userName
}) => {
  const location = useLocation();
  const isJobCard = location.pathname.includes('/job/');

  if (!isAuthenticated) {
    return <Navigate to={RoutePath.LOGIN} replace />;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <OfflineBanner />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 will-change-[opacity]"
        >
          {children}
          {!isJobCard && <div className="h-40 w-full" />} {/* Spacer */}
        </motion.div>
      </AnimatePresence>
      {!isJobCard && <BottomBar />}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, session, loading: isPending, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [permissionsDone, setPermissionsDone] = useState(false);

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
        // Use staff_id for technicians, fallback to user.id
        const connectionId = user.staff_id || user.id;
        SocketService.getInstance().connect(connectionId);
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
  };

  return (
    <>
      {isAuthenticated && !permissionsDone && (
        <PermissionManager onComplete={() => setPermissionsDone(true)} />
      )}
      {isAuthenticated && permissionsDone && <LocationTracker />}
      {isAuthenticated && permissionsDone && <PushNotificationManager />}
      <Routes location={location} key={location.pathname}>
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
            onLogout={handleLogout}
            userName={userName}
          >
            <Dashboard onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.SETTINGS} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <Settings onMenuClick={() => navigate(RoutePath.PROFILE)} userName={userName} onToggleTheme={toggleTheme} isDark={theme === 'dark'} />
          </ProtectedRoute>
        } />


        <Route path={RoutePath.JOB_CARD} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <JobCardDetail />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.MY_JOBS} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <MyJobs onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.PROFILE} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <Profile onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.ATTENDANCE} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <Attendance onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.PERFORMANCE} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <Performance onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.WORK_HISTORY} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <WorkHistory onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />



        <Route path={RoutePath.NOTIFICATIONS} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <Notifications onMenuClick={() => navigate(RoutePath.PROFILE)} />
          </ProtectedRoute>
        } />

        <Route path={RoutePath.PARTS_REQUEST} element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
            userName={userName}
          >
            <Requisitions onMenuClick={() => navigate(RoutePath.PROFILE)} />
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
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;