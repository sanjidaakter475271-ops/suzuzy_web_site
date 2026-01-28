import React from 'react';
import { X, Home, Settings, LogOut, Wrench } from 'lucide-react';
import { RoutePath } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, userName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-primary font-display tracking-wider">ServiceMate</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">Welcome, {userName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => handleNavigate(RoutePath.DASHBOARD)}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${isActive(RoutePath.DASHBOARD) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <Home size={20} className="mr-3" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => handleNavigate(RoutePath.ASSISTANT)}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${isActive(RoutePath.ASSISTANT) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <Wrench size={20} className="mr-3" />
            <span className="font-medium">AI Mechanic Helper</span>
          </button>

          <button 
            onClick={() => handleNavigate(RoutePath.SETTINGS)}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${isActive(RoutePath.SETTINGS) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <Settings size={20} className="mr-3" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};