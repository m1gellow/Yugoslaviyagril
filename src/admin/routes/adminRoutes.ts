import DashboardPage from '../pages/DashboardPage';
import OrdersPage from '../pages/OrdersPage';
import MenuPage from '../pages/MenuPage';
import RestaurantsPage from '../pages/RestaurantsPage';
import UsersPage from '../pages/UsersPage';
import SettingsPage from '../pages/SettingsPage';
import PromoPage from '../pages/PromoPage';
import ContentManagementPage from '../pages/ContentManagementPage';
import ChatPage from '../pages/ChatPage';

export interface AdminRoute {
  id: string;
  component: React.ComponentType;
  title: string;
  minRole: 'operator' | 'manager' | 'admin' | 'product_manager'; // Добавлена новая роль product_manager
  icon: string; // Имя иконки из lucide-react
}

export const adminRoutes: AdminRoute[] = [
  {
    id: 'dashboard',
    component: DashboardPage,
    title: 'Панель управления',
    minRole: 'operator',
    icon: 'LayoutDashboard',
  },
  {
    id: 'orders',
    component: OrdersPage,
    title: 'Заказы',
    minRole: 'operator',
    icon: 'ShoppingBag',
  },
  {
    id: 'menu',
    component: MenuPage,
    title: 'Меню',
    minRole: 'product_manager', // Изменено с 'manager' на 'product_manager'
    icon: 'FileText',
  },
  {
    id: 'restaurants',
    component: RestaurantsPage,
    title: 'Рестораны',
    minRole: 'admin',
    icon: 'MapPin',
  },
  {
    id: 'promo',
    component: PromoPage,
    title: 'Промокоды',
    minRole: 'manager',
    icon: 'Percent',
  },
  {
    id: 'content',
    component: ContentManagementPage,
    title: 'Управление страницами',
    minRole: 'manager',
    icon: 'Layout',
  },
  {
    id: 'chat',
    component: ChatPage,
    title: 'Чат с клиентами',
    minRole: 'operator',
    icon: 'MessageCircle',
  },
  {
    id: 'users',
    component: UsersPage,
    title: 'Пользователи',
    minRole: 'admin',
    icon: 'Users',
  },
  {
    id: 'settings',
    component: SettingsPage,
    title: 'Настройки',
    minRole: 'admin',
    icon: 'Settings',
  },
];

export const getRouteById = (id: string): AdminRoute | undefined => {
  return adminRoutes.find((route) => route.id === id);
};

// Функция для фильтрации маршрутов по роли пользователя
export const getRoutesByRole = (role: 'admin' | 'manager' | 'operator' | 'product_manager' | 'user'): AdminRoute[] => {
  const roleLevel = {
    admin: 4,
    manager: 3,
    product_manager: 2, // Добавлен уровень для product_manager
    operator: 1,
    user: 0,
  };

  const minRoleLevel = {
    admin: 4,
    manager: 3,
    product_manager: 2,
    operator: 1,
  };

  return adminRoutes.filter((route) => {
    // Специальная проверка для product_manager: имеет доступ только к определенным разделам
    if (role === 'product_manager') {
      return ['dashboard', 'menu', 'chat'].includes(route.id);
    }

    return roleLevel[role] >= minRoleLevel[route.minRole];
  });
};
