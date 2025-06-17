import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle } from 'lucide-react';

interface TimeNotificationProps {
  isDarkMode?: boolean;
}

const TimeNotification: React.FC<TimeNotificationProps> = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isNonWorkingHours, setIsNonWorkingHours] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже показано уведомление
    const notificationShown = sessionStorage.getItem('timeNotificationShown');

    // Проверяем, рабочее ли сейчас время (10:00 - 22:00)
    const checkWorkingHours = () => {
      const now = new Date();
      const hours = now.getHours();
      return hours < 10 || hours >= 22;
    };

    // Показываем уведомление только если сейчас нерабочее время и уведомление еще не показывалось
    const isNonWorking = checkWorkingHours();
    setIsNonWorkingHours(isNonWorking);

    if (isNonWorking && !notificationShown) {
      // Отложенный показ уведомления для лучшего UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Запоминаем, что уже показали уведомление в данной сессии
        sessionStorage.setItem('timeNotificationShown', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || !isNonWorkingHours) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-md z-50 px-4">
      <div
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg overflow-hidden border-l-4 border-orange-500 animate-slideUp`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <h3 className="text-lg font-medium">Уважаемые Гости!</h3>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Мы рады принять Ваш заказ с 10:00 до 22:00
              </p>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Обратите внимание, что на данный момент доступен только предзаказ, заказ будет подтвержден в рабочее
                время диспетчера.
              </p>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <strong>Самовывоз с Волгоградская, 178 доступен до 02:00</strong>
              </p>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Заказ можно оформить в заведении или по телефону{' '}
                <a href="tel:+79126696128" className="text-orange-500">
                  +7 (912) 669-61-28
                </a>
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none`}
                onClick={() => setIsVisible(false)}
              >
                <span className="sr-only">Закрыть</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        <div
          className={`border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'} px-4 py-3 sm:px-6 flex justify-between items-center`}
        >
          <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
            <span>Текущее время: {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-sm text-orange-600 hover:text-orange-800">
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeNotification;
