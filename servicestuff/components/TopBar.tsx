import React from 'react';
import { Menu, Bell, ChevronLeft } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
  showBack?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title, showBack }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 mr-3 -ml-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {showBack ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white font-display tracking-wide">{title}</h1>
      </div>
      <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative transition-colors">
        <Bell size={24} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
      </button>
    </header>
  );
};