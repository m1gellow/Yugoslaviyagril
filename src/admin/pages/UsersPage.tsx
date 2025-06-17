import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash,
  Eye,
  Mail,
  Phone,
  User as UserIcon,
  X,
  Check,
  Building,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import UserStatusIndicator from '../../components/UserStatusIndicator';
import { supabase } from '../../lib/supabase';
import { Restaurant, User } from '../../types';

const UsersPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Используем хук для получения данных из Supabase
  const {
    data: dbUsers,
    loading: loadingUsers,
    error: usersError,
    refresh: refreshUsers,
  } = useSupabaseData<any>('users', {
    select: '*',
    order: { column: 'created_at', ascending: false },
  });

  // Загружаем список ресторанов
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const { data, error } = await supabase.from('restaurants').select('id, name, address').order('name');

        if (error) throw error;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Ошибка при загрузке ресторанов:', error);
      }
    };

    loadRestaurants();
  }, []);

  // Отслеживание онлайн-статусов пользователей
  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>({});

  // Загрузка статусов онлайн при монтировании
  useEffect(() => {
    const fetchOnlineStatuses = async () => {
      try {
        const { data, error } = await supabase.rpc('get_online_users', {
          limit_count: 100,
        });

        if (error) {
          console.error('Ошибка при получении статусов онлайн:', error);
          return;
        }

        if (data) {
          const statuses: { [key: string]: boolean } = {};
          data.forEach((user: any) => {
            statuses[user.user_id] = true;
          });
          setOnlineStatuses(statuses);
        }
      } catch (error) {
        console.error('Ошибка при запросе статусов онлайн:', error);
      }
    };

    fetchOnlineStatuses();

    // Обновляем статусы каждую минуту
    const interval = setInterval(fetchOnlineStatuses, 60000);

    return () => clearInterval(interval);
  }, []);

  // Преобразуем данные из БД в формат для отображения
  const users: User[] = dbUsers.map((user) => ({
    id: user.id,
    name: user.name || 'Нет имени',
    email: user.email || 'Нет email',
    phone: user.phone || 'Нет телефона',
    user_role: user.user_role || 'user',
    restaurant_id: user.restaurant_id || null,
    status: (onlineStatuses[user.id] ? 'active' : 'inactive') as 'active' | 'inactive' | 'blocked',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || null,
  }));

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.user_role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Обработчик удаления пользователя
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', userId);

        if (error) throw error;

        // Обновляем список пользователей после удаления
        refreshUsers();
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        alert('Не удалось удалить пользователя. Пожалуйста, попробуйте снова.');
      }
    }
  };

  // Обработчик обновления пользователя
  const handleUpdateUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          phone: user.phone,
          user_role: user.user_role,
          restaurant_id: user.user_role === 'product_manager' ? user.restaurant_id : null, // Устанавливаем restaurant_id только для product_manager
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Закрываем модальное окно и обновляем список пользователей
      setIsEditModalOpen(false);
      setEditingUser(null);
      refreshUsers();

      alert('Пользователь успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      alert('Не удалось обновить пользователя. Пожалуйста, попробуйте снова.');
    }
  };

  // Получение названия роли для отображения
  const getRoleName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'manager':
        return 'Менеджер';
      case 'operator':
        return 'Оператор';
      case 'product_manager':
        return 'Менеджер продуктов';
      default:
        return 'Пользователь';
    }
  };

  // Получение класса для бейджа статуса
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Получение текста статуса для отображения
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Не активен';
      case 'blocked':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  // Форма для редактирования пользователя
  const UserEditForm = ({ user }: { user: User }) => {
    const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      user_role: user.user_role,
      restaurant_id: user.restaurant_id || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleUpdateUser({
        ...user,
        ...formData,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Имя
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
            placeholder="Имя пользователя"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Телефон
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        <div>
          <label htmlFor="user_role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Роль пользователя
          </label>
          <select
            id="user_role"
            name="user_role"
            value={formData.user_role}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
            required
          >
            <option value="user">Пользователь</option>
            <option value="operator">Оператор</option>
            <option value="product_manager">Менеджер продуктов</option>
            <option value="manager">Менеджер</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        {/* Показываем выбор ресторана только для менеджера продуктов */}
        {formData.user_role === 'product_manager' && (
          <div>
            <label htmlFor="restaurant_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Привязка к ресторану <span className="text-red-500">*</span>
            </label>
            <select
              id="restaurant_id"
              name="restaurant_id"
              value={formData.restaurant_id}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
              required
            >
              <option value="">-- Выберите ресторан --</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} ({restaurant.address})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-red-500">Для менеджера продуктов обязательно выберите ресторан</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingUser(null);
            }}
            className={`mr-3 px-4 py-2 border rounded-md ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Отмена
          </button>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-md">
            Сохранить
          </button>
        </div>
      </form>
    );
  };

  // Загрузка данных
  if (loadingUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <div className="ml-3 text-lg">Загрузка пользователей...</div>
      </div>
    );
  }

  // Обработка ошибки
  if (usersError) {
    return (
      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md">
        <h3 className="text-red-700 dark:text-red-300 font-bold">Ошибка загрузки данных</h3>
        <p className="text-red-600 dark:text-red-400">{usersError.message}</p>
        <button onClick={refreshUsers} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Управление пользователями</h2>
        <button className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Добавить пользователя
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex md:items-center flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2 px-3"
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="manager">Менеджеры</option>
              <option value="product_manager">Менеджеры продуктов</option>
              <option value="operator">Операторы</option>
              <option value="user">Пользователи</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2 px-3"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="blocked">Заблокированные</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ресторан
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.id.substring(0, 8)}...</div>
                      </div>
                      <div className="ml-2">
                        <UserStatusIndicator userId={user.id} isDarkMode={isDarkMode} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                      {user.email}
                    </div>
                    {user.phone && user.phone !== 'Нет телефона' && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                        {user.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.user_role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          : user.user_role === 'manager'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : user.user_role === 'product_manager'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : user.user_role === 'operator'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {getRoleName(user.user_role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.restaurant_id ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {restaurants.find((r) => r.id === user.restaurant_id)?.name ||
                          user.restaurant_id.substring(0, 8) + '...'}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setShowUserDetails(user)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mr-3"
                      onClick={() => {
                        setEditingUser(user);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Пользователи не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно с информацией о пользователе */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold dark:text-white">Информация о пользователе</h3>
              <button
                onClick={() => setShowUserDetails(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="ml-4">
                <h4 className="text-xl font-bold dark:text-white">{showUserDetails.name}</h4>
                <p className="text-gray-500 dark:text-gray-400">{showUserDetails.id}</p>
                <div className="mt-1">
                  <UserStatusIndicator userId={showUserDetails.id} isDarkMode={isDarkMode} />
                </div>
              </div>
              <span
                className={`ml-auto px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(showUserDetails.status)}`}
              >
                {getStatusText(showUserDetails.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</h5>
                <p className="dark:text-white">{showUserDetails.email}</p>
              </div>
              <div>
                <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Телефон</h5>
                <p className="dark:text-white">{showUserDetails.phone}</p>
              </div>
              <div>
                <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Роль</h5>
                <p className="dark:text-white">{getRoleName(showUserDetails.user_role)}</p>
              </div>
              <div>
                <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Дата регистрации</h5>
                <p className="dark:text-white">{new Date(showUserDetails.created_at).toLocaleDateString('ru-RU')}</p>
              </div>
              {showUserDetails.user_role === 'product_manager' && (
                <div className="md:col-span-2">
                  <h5 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Привязка к ресторану</h5>
                  {showUserDetails.restaurant_id ? (
                    <p className="dark:text-white flex items-center">
                      <Building className="w-4 h-4 mr-2 text-blue-500" />
                      {restaurants.find((r) => r.id === showUserDetails.restaurant_id)?.name || 'Неизвестный ресторан'}
                      <span className="text-xs text-gray-500 ml-2">
                        ({showUserDetails.restaurant_id.substring(0, 8)}...)
                      </span>
                    </p>
                  ) : (
                    <p className="text-yellow-500">Не привязан к ресторану</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className={`px-4 py-2 border rounded-md ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setShowUserDetails(null)}
              >
                Закрыть
              </button>
              <button
                className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700"
                onClick={() => {
                  setEditingUser(showUserDetails);
                  setShowUserDetails(null);
                  setIsEditModalOpen(true);
                }}
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования пользователя */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold dark:text-white">Редактирование пользователя</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <UserEditForm user={editingUser} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
