import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Users,
  Settings,
  ChevronRight,
  LogOut,
  MapPin,
  Percent,
  Bell,
  Layout,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { adminRoutes, getRoutesByRole } from '../routes/adminRoutes';
import { useSupabase } from '../../context/SupabaseContext';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: 'admin' | 'manager' | 'operator' | 'product_manager' | 'user';
  userName: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  userRole,
  userName,
}) => {
  const { isDarkMode } = useAdminTheme();
  const { signOut, auth } = useSupabase();

  // Получаем доступные для этой роли маршруты
  const availableRoutes = getRoutesByRole(userRole);

  // Функция для получения иконки по имени
  const getIconByName = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Percent':
        return <Percent className="w-5 h-5" />;
      case 'Layout':
        return <Layout className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Settings':
        return <Settings className="w-5 h-5" />;
      case 'Bell':
        return <Bell className="w-5 h-5" />;
      case 'Tag':
        return <Tag className="w-5 h-5" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 shadow-md transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
        <div className={`${!sidebarOpen && 'hidden'} font-semibold text-gray-800 dark:text-white`}>
          {userName}
          {userRole === 'product_manager' && auth.profile?.restaurant_id && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {auth.profile?.restaurant_id
                ? `ID ресторана: ${auth.profile.restaurant_id.substring(0, 8)}...`
                : 'Без ресторана'}
            </div>
          )}
        </div>
        <button
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronRight
            className={`h-5 w-5 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${sidebarOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div className="py-4 flex-1 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {availableRoutes.map((route) => (
            <button
              key={route.id}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === route.id
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab(route.id)}
            >
              <div
                className={`mr-3 h-5 w-5 ${
                  activeTab === route.id
                    ? 'text-orange-500 dark:text-orange-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              >
                {getIconByName(route.icon)}
              </div>
              {sidebarOpen && <span>{route.title}</span>}

              {/* Для product_manager показываем индикатор ограниченного доступа */}
              {sidebarOpen &&
                userRole === 'product_manager' &&
                (route.id === 'menu' || route.id === 'dashboard' || route.id === 'chat') && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Доступно
                  </span>
                )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <button
          className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-5 w-5 text-red-400 dark:text-red-500" />
          {sidebarOpen && <span>Выход</span>}
        </button>
      </div>

      {/* Информация о роли пользователя */}
      {sidebarOpen && (
        <div className="p-4 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <span>Роль:</span>
            <span
              className={`px-1.5 py-0.5 rounded ${
                userRole === 'admin'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                  : userRole === 'manager'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : userRole === 'product_manager'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {userRole === 'admin'
                ? 'Администратор'
                : userRole === 'manager'
                  ? 'Менеджер'
                  : userRole === 'product_manager'
                    ? 'Менеджер продуктов'
                    : 'Оператор'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
