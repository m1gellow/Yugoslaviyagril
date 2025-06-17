import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabase } from './SupabaseContext';

interface OnlineStatusContextType {
  isOnline: boolean;
  lastSeen: Date | null;
  updateStatus: (isOnline: boolean) => Promise<void>;
  onlineUsers: { userId: string; userName: string; lastActivity: Date }[];
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
};

interface OnlineStatusProviderProps {
  children: ReactNode;
}

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const { auth } = useSupabase();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string; userName: string; lastActivity: Date }[]>([]);

  // Обработка статуса онлайн/офлайн
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (auth.user) {
        updateUserStatus(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (auth.user) {
        updateUserStatus(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsOnline(navigator.onLine);
        if (auth.user && navigator.onLine) {
          updateUserStatus(true);
        }
      } else if (document.visibilityState === 'hidden') {
        if (auth.user) {
          updateUserStatus(false);
        }
      }
    };

    // Первичное обновление статуса
    if (auth.user) {
      updateUserStatus(navigator.onLine);
      fetchUserStatus();
    }

    // Слушатели событий
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Интервал для обновления статуса активных пользователей
    const intervalId = setInterval(() => {
      if (auth.user) {
        updateUserStatus(navigator.onLine);
        fetchOnlineUsers();
      }
    }, 60000); // Обновляем каждую минуту

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);

      // При размонтировании компонента устанавливаем статус офлайн
      if (auth.user) {
        updateUserStatus(false);
      }
    };
  }, [auth.user]);

  // Получение текущего статуса пользователя
  const fetchUserStatus = async () => {
    if (!auth.user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_status', {
        user_id: auth.user.id,
      });

      if (error) {
        console.error('Ошибка получения статуса пользователя:', error);
        return;
      }

      if (data && data.last_seen_at) {
        setLastSeen(new Date(data.last_seen_at));
      }
    } catch (error) {
      console.error('Ошибка при запросе статуса пользователя:', error);
    }
  };

  // Получение списка пользователей онлайн
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_online_users', {
        limit_count: 20,
      });

      if (error) {
        console.error('Ошибка получения списка онлайн пользователей:', error);
        return;
      }

      if (data && Array.isArray(data)) {
        const formattedUsers = data.map((user) => ({
          userId: user.user_id,
          userName: user.user_name || 'Пользователь',
          lastActivity: new Date(user.last_activity),
        }));
        setOnlineUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Ошибка при запросе списка онлайн пользователей:', error);
    }
  };

  // Обновление статуса пользователя
  const updateUserStatus = async (online: boolean) => {
    if (!auth.user) return;

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      };

      await supabase.rpc('update_user_status', {
        p_user_id: auth.user.id,
        p_is_online: online,
        p_device_info: deviceInfo,
      });

      console.log(`Статус пользователя обновлен: ${online ? 'онлайн' : 'офлайн'}`);
    } catch (error) {
      console.error('Ошибка обновления статуса пользователя:', error);
    }
  };

  // Публичная функция для обновления статуса
  const updateStatus = async (online: boolean) => {
    setIsOnline(online);
    if (auth.user) {
      await updateUserStatus(online);
    }
  };

  const value = {
    isOnline,
    lastSeen,
    updateStatus,
    onlineUsers,
  };

  return <OnlineStatusContext.Provider value={value}>{children}</OnlineStatusContext.Provider>;
};
