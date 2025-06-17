import { Order, Product, Restaurant } from '../../types';
import { products, restaurants } from '../../utils/mockData';

// Функции-помощники для работы с заказами
export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'delivering':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new':
      return 'bell';
    case 'processing':
      return 'clock';
    case 'delivering':
      return 'truck';
    case 'completed':
      return 'check-circle';
    case 'cancelled':
      return 'x-circle';
    default:
      return null;
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Новый';
    case 'processing':
      return 'Готовится';
    case 'delivering':
      return 'Доставляется';
    case 'completed':
      return 'Выполнен';
    case 'cancelled':
      return 'Отменен';
    default:
      return status;
  }
};

export const generateRandomDate = (
  start: Date = new Date(new Date().setDate(new Date().getDate() - 7)),
  end: Date = new Date(),
): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const generateMockOrders = (count: number = 15): Order[] => {
  const statuses: ('new' | 'processing' | 'delivering' | 'completed' | 'cancelled')[] = [
    'new',
    'processing',
    'delivering',
    'completed',
    'cancelled',
  ];
  const paymentMethods: ('cash' | 'card' | 'online')[] = ['cash', 'card', 'online'];
  const deliveryMethods: ('delivery' | 'pickup')[] = ['delivery', 'pickup'];

  // Используем импортированные данные вместо require

  return Array.from({ length: count }, (_, i) => {
    const orderItems = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      return {
        name: product.name,
        quantity,
        price: product.price,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

    // Generate dates from the last 7 days
    const date = generateRandomDate();
    const formattedDate = formatDate(date);

    return {
      id: `ORD-${1000 + i}`,
      date: formattedDate,
      customer: `Клиент ${i + 1}`,
      phone: `+7 (9${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
      address:
        i % 3 === 0
          ? 'Самовывоз'
          : `ул. Ленина, ${Math.floor(Math.random() * 100) + 1}, кв. ${Math.floor(Math.random() * 100) + 1}`,
      restaurant: restaurant.name,
      items: orderItems,
      total,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      deliveryMethod: i % 3 === 0 ? 'pickup' : 'delivery',
    };
  });
};
