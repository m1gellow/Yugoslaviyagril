import React, { useState, useEffect } from 'react';
import { Bell, BellOff, AlertTriangle, X} from 'lucide-react';
import { askForPermission, isPushNotificationSupported } from '../../utils/notificationUtils';

interface PushNotificationProps {
  isDarkMode?: boolean;
}

const PushNotification: React.FC<PushNotificationProps> = ({ isDarkMode = false }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    // Проверяем, поддерживаются ли уведомления
    if (isPushNotificationSupported()) {
      // Проверяем текущее состояние разрешения
      if (Notification.permission === 'default') {
        // Проверяем, показывали ли мы уже баннер
        const hasShownBanner = localStorage.getItem('notificationBannerShown');
        if (!hasShownBanner) {
          // Показываем баннер через 3 секунды после загрузки страницы
          const timer = setTimeout(() => {
            setShowBanner(true);
          }, 3000);

          return () => clearTimeout(timer);
        }
      } else {
        setNotificationStatus(Notification.permission as 'granted' | 'denied');
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await askForPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
    setShowBanner(false);

    // Запоминаем, что баннер был показан
    localStorage.setItem('notificationBannerShown', 'true');
  };

  const handleClose = () => {
    setShowBanner(false);
    localStorage.setItem('notificationBannerShown', 'true');
  };

  if (!showBanner || notificationStatus === 'granted') {
    return null;
  }

  return (
    <div className={`fixed bottom-20 left-0 right-0 z-40 mx-auto w-full max-w-md px-4 animate-slideUp`}>
      <div
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg border ${
          notificationStatus === 'denied' ? 'border-red-500' : isDarkMode ? 'border-orange-600' : 'border-orange-500'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${notificationStatus === 'denied' ? 'text-red-500' : 'text-orange-500'}`}>
              {notificationStatus === 'denied' ? <AlertTriangle className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
            </div>
            <div className="ml-3 w-0 flex-1">
              <h3 className="text-lg font-medium">
                {notificationStatus === 'denied' ? 'Уведомления отключены' : 'Получайте уведомления о заказах'}
              </h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {notificationStatus === 'denied'
                  ? 'Вы отклонили разрешение на уведомления. Чтобы получать уведомления, измените настройки в вашем браузере.'
                  : 'Разрешите уведомления, чтобы получать информацию о статусе заказа и новых акциях.'}
              </p>
              {notificationStatus === 'default' && (
                <div className="mt-4 flex">
                  <button
                    type="button"
                    className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white ${
                      isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                    onClick={handleRequestPermission}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Разрешить уведомления
                  </button>
                  <button
                    type="button"
                    className={`ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={handleClose}
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Не сейчас
                  </button>
                </div>
              )}
            </div>
            <button
              className={`ml-3 flex-shrink-0 rounded-md p-1.5 ${
                isDarkMode
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              onClick={handleClose}
            >
              <span className="sr-only">Закрыть</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {notificationStatus === 'denied' && (
          <div
            className={`border-t px-4 py-3 ${
              isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <p className="text-xs text-center">
              Инструкции по включению уведомлений можно найти в{' '}
              <a href="#" className="text-blue-500 hover:underline">
                разделе помощи
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotification;
