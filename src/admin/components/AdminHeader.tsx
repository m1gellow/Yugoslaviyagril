import React, { useState } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsCenter from './notifications/NotificationsCenter';
import { useSupabase } from '../../context/SupabaseContext';

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, setActiveTab }) => {
  const { auth, signOut } = useSupabase();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Функция для выхода из админ-панели
  const handleLogout = async () => {
    try {
      await signOut();
      // При успешном выходе перенаправляем на главную
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <header className={`bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="block">
                <img
                  src="/static/img/logo-new.png"
                  alt="Югославия Гриль"
                  className="h-12"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://югославия-гриль.рф/static/img/logo-new.png';
                  }}
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard' ? 'border-orange-500 text-gray-900 dark:text-white' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Панель управления
              </button>
              <button
                className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'orders' ? 'border-orange-500 text-gray-900 dark:text-white' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Заказы
              </button>
              <button
                className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'menu' ? 'border-orange-500 text-gray-900 dark:text-white' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                Меню
              </button>
            </div>
          </div>
          <div className="flex items-center">
            {/* Центр уведомлений */}
            <NotificationsCenter />

           

            {/* Меню пользователя */}
            <div className="relative">
              <button
                className="ml-3 p-1 flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="sr-only">Профиль пользователя</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="User"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {auth.profile?.name || 'Администратор'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                    <p className="font-bold">{auth.profile?.name || 'Администратор'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Роль:{' '}
                      {auth.profile?.user_role === 'admin'
                        ? 'Администратор'
                        : auth.profile?.user_role === 'manager'
                          ? 'Менеджер'
                          : auth.profile?.user_role === 'product_manager'
                            ? 'Менеджер продуктов'
                            : 'Оператор'}
                    </p>
                    {auth.profile?.restaurant_id && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID ресторана: {auth.profile.restaurant_id.substring(0, 8)}...
                      </p>
                    )}
                  </div>
                  <Link
                    to="/"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Перейти на сайт
                  </Link>
                  <button
                    onClick={() => navigate('/')}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
