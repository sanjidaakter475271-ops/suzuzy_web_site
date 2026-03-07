import { useNavigate, useLocation } from 'react-router-dom';
import { RoutePath } from '../types';
import React, { useState, useEffect } from 'react';
import { Menu, Bell, ChevronLeft } from 'lucide-react';
import { TechnicianAPI } from '../services/api';
import { SocketService } from '../services/socket';

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
  showBack?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkUnread = async () => {
      // Don't show unread dot if we are already viewing the notifications page
      if (location.pathname === RoutePath.NOTIFICATIONS) {
        if (mounted) setHasUnread(false);
        return;
      }

      try {
        const { data } = await TechnicianAPI.getNotifications();
        if (data.success && data.data && mounted) {
          const unread = data.data.some((n: any) => !n.is_read);
          setHasUnread(unread);
        }
      } catch (err) {
        console.error("TopBar failed to fetch notification status:", err);
      }
    };

    checkUnread();

    const socket = SocketService.getInstance();

    const handleNewNotification = () => {
      if (mounted) setHasUnread(true);
    };

    const handleNotificationsRead = () => {
      if (mounted) setHasUnread(false);
    };

    socket.on('notification:new', handleNewNotification);
    window.addEventListener('notifications:read', handleNotificationsRead);

    return () => {
      mounted = false;
      socket.off('notification:new', handleNewNotification);
      window.removeEventListener('notifications:read', handleNotificationsRead);
    };
  }, []);

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
      <button
        onClick={() => {
          if (hasUnread) {
            setHasUnread(false);
            window.dispatchEvent(new Event('notifications:read'));
          }
          navigate(RoutePath.NOTIFICATIONS);
        }}
        className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative transition-colors active:scale-90"
      >
        <Bell size={24} />
        {hasUnread && (
          <span className="absolute top-[6px] right-[8px] w-[10px] h-[10px] bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-sm"></span>
        )}
      </button>
    </header>
  );
};