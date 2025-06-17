import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Send, AlertTriangle, Settings, RefreshCcw, MessageSquare } from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { subscribeToPushNotifications, showDemoNotification } from '../../../utils/notificationUtils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
}

const NotificationsCenter: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
  });

  // Загрузка уведомлений при монтировании компонента
  useEffect(() => {
    // Проверяем, включены ли push-уведомления
    Notification.permission === 'granted' && setPushEnabled(true);

    // Имитация загрузки уведомлений с сервера
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Новый заказ',
        message: 'Поступил новый заказ #ORD-1234 на сумму 2450₽',
        time: new Date(Date.now() - 15 * 60000).toISOString(),
        type: 'info',
        isRead: false,
      },
      {
        id: '2',
        title: 'Отмена заказа',
        message: 'Заказ #ORD-1230 был отменен клиентом',
        time: new Date(Date.now() - 3 * 3600000).toISOString(),
        type: 'warning',
        isRead: true,
      },
      {
        id: '3',
        title: 'Успешная доставка',
        message: 'Заказ #ORD-1229 успешно доставлен',
        time: new Date(Date.now() - 5 * 3600000).toISOString(),
        type: 'success',
        isRead: true,
      },
      {
        id: '4',
        title: 'Системное уведомление',
        message: 'Выполнено резервное копирование базы данных',
        time: new Date(Date.now() - 24 * 3600000).toISOString(),
        type: 'info',
        isRead: true,
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
  }, []);

  // Функция для форматирования времени уведомлений
  const formatNotificationTime = (isoTime: string): string => {
    const date = new Date(isoTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} мин. назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч. назад`;
    } else if (diffDays === 1) {
      return 'вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Функция для получения иконки уведомления в зависимости от типа
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCheck className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  // Функция для отметки уведомления как прочитанное
  const markAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );

    // Обновляем счетчик непрочитанных уведомлений
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Функция для отметки всех уведомлений как прочитанные
  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);
  };

  // Функция для удаления уведомления
  const removeNotification = (id: string) => {
    setNotifications((prevNotifications) => {
      const notificationToRemove = prevNotifications.find((n) => n.id === id);
      const newNotifications = prevNotifications.filter((n) => n.id !== id);

      // Если удаляем непрочитанное уведомление, уменьшаем счетчик
      if (notificationToRemove && !notificationToRemove.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      return newNotifications;
    });
  };

  // Включение push-уведомлений
  const handleEnablePushNotifications = async () => {
    const isSubscribed = await subscribeToPushNotifications();
    setPushEnabled(isSubscribed);

    if (isSubscribed) {
      // Добавляем системное уведомление об успешной подписке
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Push-уведомления включены',
        message: 'Теперь вы будете получать уведомления о новых заказах и событиях',
        time: new Date().toISOString(),
        type: 'success',
        isRead: false,
      };

      setNotifications([newNotification, ...notifications]);
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Отправка тестового уведомления
  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      showDemoNotification('Тестовое уведомление', {
        body: 'Это тестовое уведомление от админ-панели',
        icon: '/assets/img/favicon.png',
      });

      // Добавляем в центр уведомлений
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Тестовое уведомление отправлено',
        message: 'Тестовое push-уведомление было успешно отправлено',
        time: new Date().toISOString(),
        type: 'info',
        isRead: false,
      };

      setNotifications([newNotification, ...notifications]);
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Отправка уведомления пользователям
  const handleSendNotificationToUsers = () => {
    if (!notificationForm.title || !notificationForm.message) return;

    // В реальном приложении здесь был бы запрос к серверу для отправки уведомлений
    // пользователям через push API или другие каналы

    // Добавляем информацию об отправке в центр уведомлений админа
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Уведомление отправлено',
      message: `Уведомление "${notificationForm.title}" отправлено пользователям`,
      time: new Date().toISOString(),
      type: 'success',
      isRead: false,
    };

    setNotifications([newNotification, ...notifications]);
    setUnreadCount((prev) => prev + 1);

    // Сбрасываем форму
    setNotificationForm({
      title: '',
      message: '',
      type: 'info',
    });

    // Закрываем форму
    setShowNotificationForm(false);
  };

  return (
    <div className="relative">
      {/* Кнопка для открытия центра уведомлений */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full ${
          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Выпадающий центр уведомлений */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 md:w-96 rounded-lg shadow-lg z-20 overflow-hidden ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <div
            className={`flex justify-between items-center px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <h3 className="font-medium flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Уведомления {unreadCount > 0 && <span className="ml-1 text-sm text-gray-500">({unreadCount})</span>}
            </h3>
            <div className="flex">
              <button
                onClick={markAllAsRead}
                className={`p-1 rounded-full mr-2 ${
                  isDarkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-500 hover:bg-gray-100'
                }`}
                title="Отметить все как прочитанные"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowNotificationForm(!showNotificationForm)}
                className={`p-1 rounded-full mr-2 ${
                  isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-500 hover:bg-gray-100'
                }`}
                title="Отправить уведомление"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded-full ${
                  isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="Настройки уведомлений"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Форма для отправки уведомления пользователям */}
          {showNotificationForm && (
            <div
              className={`p-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
            >
              <h4 className="font-medium text-sm mb-2">Отправить уведомление пользователям</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Заголовок уведомления"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className={`w-full p-2 text-sm border rounded ${
                    isDarkMode ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                  }`}
                />
                <textarea
                  placeholder="Текст уведомления"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  rows={2}
                  className={`w-full p-2 text-sm border rounded ${
                    isDarkMode ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                  }`}
                />
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                  className={`w-full p-2 text-sm border rounded ${
                    isDarkMode ? 'bg-gray-600 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="info">Информация</option>
                  <option value="success">Успех</option>
                  <option value="warning">Предупреждение</option>
                  <option value="error">Ошибка</option>
                </select>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setShowNotificationForm(false)}
                    className={`mr-2 py-1 px-3 text-sm rounded ${
                      isDarkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSendNotificationToUsers}
                    className={`py-1 px-3 text-sm rounded bg-green-500 text-white hover:bg-green-600`}
                    disabled={!notificationForm.title || !notificationForm.message}
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Нет новых уведомлений</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                    } ${notification.isRead ? '' : isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}
                  >
                    <div className="flex">
                      <div className={`${notification.isRead ? (isDarkMode ? 'opacity-70' : 'opacity-80') : ''}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <h4
                            className={`font-medium ${
                              notification.isRead ? (isDarkMode ? 'text-gray-300' : 'text-gray-600') : ''
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p
                          className={`text-sm ${
                            notification.isRead
                              ? isDarkMode
                                ? 'text-gray-400'
                                : 'text-gray-500'
                              : isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-700'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatNotificationTime(notification.time)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`text-xs ${
                                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
                              }`}
                            >
                              Отметить как прочитанное
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Футер с дополнительными действиями */}
          <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <button
                onClick={sendTestNotification}
                className={`text-sm ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
                } flex items-center`}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Тестовое уведомление
              </button>

              <button
                onClick={() => {
                  /* имитация обновления */
                }}
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                } flex items-center`}
              >
                <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                Обновить
              </button>
            </div>

            {!pushEnabled && (
              <button
                onClick={handleEnablePushNotifications}
                className={`mt-2 w-full py-1.5 text-sm rounded ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Включить push-уведомления
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
