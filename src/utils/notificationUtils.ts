// Проверка поддержки Push-уведомлений
export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Запрос разрешения на отправку уведомлений
export const askForPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Ошибка при запросе разрешения на уведомления:', error);
    return false;
  }
};

// Отправка локального уведомления (не требует сервера)
export const sendLocalNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error);
    }
  }
};

// Создание имитации push-уведомления для демонстрации
export const showDemoNotification = (title: string, options: NotificationOptions = {}, delay: number = 0): void => {
  setTimeout(() => {
    sendLocalNotification(title, {
      body: options.body || 'Это демо-уведомление',
      icon: options.icon || '/assets/img/favicon.png',
      ...options,
      requireInteraction: options.requireInteraction || true,
      silent: options.silent || false,
    });
  }, delay);
};

// Инициализация отображения уведомления о изменении статуса заказа (демо)
export const initOrderNotifications = (): void => {
  // Запрашиваем разрешение на отправку уведомлений
  askForPermission().then((granted) => {
    if (granted) {
      // Демонстрация push-уведомлений - в реальном приложении эти уведомления
      // отправлялись бы с сервера через веб-сокеты или WebPush API

      // В реальном приложении не нужно делать демо-уведомления
      // Они здесь только для демонстрации возможностей

      // Эмуляция уведомления о новом заказе через 30 секунд
      showDemoNotification(
        'Новый заказ!',
        {
          body: 'Заказ #12345 ожидает подтверждения',
          icon: '/assets/img/favicon.png',
          badge: '/assets/img/favicon.png',
          tag: 'new-order',
          data: { orderId: '12345' },
          actions: [
            {
              action: 'view',
              title: 'Просмотреть',
            },
            {
              action: 'close',
              title: 'Закрыть',
            },
          ],
        },
        30000,
      );
    }
  });
};

// Функция для регистрации на веб-пуш уведомления
// В реальном приложении это было бы интегрировано с сервером и Firebase Cloud Messaging
export const subscribeToPushNotifications = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const permission = await askForPermission();
    if (!permission) {
      return false;
    }

    // В реальном приложении здесь была бы регистрация сервис воркера и подписка на push
    // const registration = await navigator.serviceWorker.register('/service-worker.js');
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: <ВАША_ПУБЛИЧНАЯ_ВАПID_КЛЮЧ>
    // });

    // В этом демо мы просто возвращаем true
    return true;
  } catch (error) {
    console.error('Ошибка при подписке на push-уведомления:', error);
    return false;
  }
};
