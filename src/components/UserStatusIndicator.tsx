import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useOnlineStatus } from '../context/OnlineStatusContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserStatusIndicatorProps {
  userId?: string;
  showDetails?: boolean;
  isDarkMode?: boolean;
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({
  userId,
  showDetails = true,
  isDarkMode = false,
}) => {
  const { isOnline, lastSeen, onlineUsers } = useOnlineStatus();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Если передан userId, показываем статус этого пользователя
  // Иначе показываем текущий статус
  const userStatus = userId
    ? onlineUsers.find((user) => user.userId === userId)
      ? { isOnline: true, lastSeen: onlineUsers.find((user) => user.userId === userId)?.lastActivity || null }
      : { isOnline: false, lastSeen: null }
    : { isOnline, lastSeen };

  // Скрываем тултип через 2 секунды после показа
  useEffect(() => {
    if (tooltipVisible) {
      const timer = setTimeout(() => {
        setTooltipVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tooltipVisible]);

  // Форматирование времени последнего онлайна
  const formatLastSeen = (date: Date | null) => {
    if (!date) return 'не в сети';

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ru,
    });
  };

  return (
    <div className="relative cursor-pointer" onClick={() => setTooltipVisible(!tooltipVisible)}>
      <div className="inline-flex items-center gap-1">
        {userStatus.isOnline ? (
          <span className={`flex h-2.5 w-2.5 ${isDarkMode ? 'bg-green-400' : 'bg-green-500'} rounded-full`}>
            <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-green-400 opacity-75"></span>
          </span>
        ) : (
          <span className={`h-2.5 w-2.5 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'} rounded-full`}></span>
        )}
        {showDetails && (
          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {userStatus.isOnline ? 'онлайн' : formatLastSeen(userStatus.lastSeen)}
          </span>
        )}
      </div>

      {/* Тултип */}
      {tooltipVisible && (
        <div
          className={`absolute bottom-full left-0 mb-2 p-2 rounded text-xs w-max ${
            isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white shadow-md text-gray-800'
          }`}
        >
          <div className="flex items-center mb-1">
            {userStatus.isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-500 mr-1" />
                <span>Пользователь в сети</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-gray-500 mr-1" />
                <span>Пользователь не в сети</span>
              </>
            )}
          </div>
          {userStatus.lastSeen && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {userStatus.isOnline ? 'Активность сейчас' : `Последний раз ${formatLastSeen(userStatus.lastSeen)}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserStatusIndicator;
