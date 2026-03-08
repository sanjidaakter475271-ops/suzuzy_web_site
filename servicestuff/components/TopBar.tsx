import { useNavigate, useLocation } from 'react-router-dom';
import { RoutePath } from '../types';
import React, { useState, useEffect } from 'react';
import { Menu, Bell, ChevronLeft, User, Home, ChevronRight } from 'lucide-react';
import { TechnicianAPI } from '../services/api';
import { SocketService } from '../services/socket';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
  showBack?: boolean;
  breadcrumbs?: Breadcrumb[];
  onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title, showBack, breadcrumbs, onBack }) => {
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

  const isHome = location.pathname === RoutePath.DASHBOARD || location.pathname === '/';

  const handleHomeClick = () => {
    if (!isHome) navigate(RoutePath.DASHBOARD);
  };

  const isNotifications = location.pathname === RoutePath.NOTIFICATIONS;

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else if (showBack) {
      onMenuClick();
    } else {
      handleHomeClick();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-300 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
      <div className="flex items-center min-w-0 flex-1">
        <button
          onClick={handleBackAction}
          className={`p-2 mr-3 -ml-2 rounded-xl transition-all active:scale-95 border border-transparent shrink-0 ${onBack || showBack ? 'text-blue-500 hover:bg-blue-500/10' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
        >
          {(onBack || showBack) ? <ChevronLeft size={22} strokeWidth={2.5} /> : <Home size={20} />}
        </button>

        <div className="flex items-center gap-1.5 overflow-hidden select-none min-w-0">
          <button
            onClick={handleHomeClick}
            className={`text-sm tracking-tight transition-colors whitespace-nowrap shrink-0 ${isHome
              ? 'text-blue-600 dark:text-blue-400 font-black italic uppercase text-[10px] tracking-[0.2em]'
              : 'text-slate-400 dark:text-slate-500 hover:text-blue-500 font-bold'
              }`}
          >
            Workshop
          </button>

          {breadcrumbs ? (
            breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={12} className="text-slate-300 dark:text-slate-700 shrink-0" />
                <button
                  onClick={() => bc.path && navigate(bc.path)}
                  disabled={!bc.path}
                  className={`text-sm font-extrabold tracking-tight whitespace-nowrap truncate transition-colors min-w-0 ${bc.path
                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer'
                    : 'text-slate-400 dark:text-slate-500'
                    } ${idx === breadcrumbs.length - 1 ? 'dark:text-slate-200' : ''}`}
                >
                  {bc.label}
                </button>
              </React.Fragment>
            ))
          ) : (
            !isHome && (
              <>
                <ChevronRight size={14} className="text-slate-300 dark:text-slate-700 shrink-0" />
                <button
                  onClick={() => showBack && onMenuClick()}
                  disabled={!showBack}
                  className={`text-sm font-black tracking-tight whitespace-nowrap truncate transition-colors min-w-0 ${showBack
                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer'
                    : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                  {title === 'Dashboard' ? 'Home' : title}
                </button>
              </>
            )
          )}
        </div>
      </div>
      <button
        onClick={() => {
          if (isNotifications) {
            navigate(-1);
          } else {
            if (hasUnread) {
              setHasUnread(false);
              window.dispatchEvent(new Event('notifications:read'));
            }
            navigate(RoutePath.NOTIFICATIONS);
          }
        }}
        className={`p-2 rounded-full relative transition-all active:scale-90 shrink-0 ml-2 ${isNotifications
          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-inner'
          : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
      >
        <Bell size={24} />
        {hasUnread && (
          <span className="absolute top-[6px] right-[8px] w-[10px] h-[10px] bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-sm"></span>
        )}
      </button>
    </header>
  );
};