import React, { useState } from 'react';
import { Plus, Search, MapPin, Phone, Edit, Trash, Check, X } from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { restaurants } from '../../utils/mockData';
import { Restaurant } from '../../types';

const RestaurantsPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [restaurantList, setRestaurantList] = useState(restaurants);

  // Фильтрация ресторанов по поисковому запросу
  const filteredRestaurants = restaurantList.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.phone.includes(searchTerm),
  );

  // Обработчик удаления ресторана
  const handleDeleteRestaurant = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот ресторан?')) {
      setRestaurantList(restaurantList.filter((r) => r.id !== id));
    }
  };

  // Форма для добавления/редактирования ресторана
  const RestaurantForm = ({ restaurant, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: restaurant?.name || '',
      address: restaurant?.address || '',
      phone: restaurant?.phone || '',
      url: restaurant?.url || '',
      minOrderAmount: restaurant?.minOrderAmount || 1000,
      freeDeliveryThreshold: restaurant?.freeDeliveryThreshold || 4000,
      workingHours: restaurant?.workingHours || '10:00 - 22:00',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: name === 'minOrderAmount' || name === 'freeDeliveryThreshold' ? parseInt(value) : value,
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        id: restaurant?.id || Date.now(), // Используем текущий timestamp как ID для новых ресторанов
        ...formData,
        location: restaurant?.location || { lat: 0, lng: 0 },
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название ресторана</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL-путь</label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Минимальная сумма заказа (₽)
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleInputChange}
              min="0"
              step="100"
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Бесплатная доставка от (₽)
            </label>
            <input
              type="number"
              name="freeDeliveryThreshold"
              value={formData.freeDeliveryThreshold}
              onChange={handleInputChange}
              min="0"
              step="100"
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Часы работы</label>
          <input
            type="text"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleInputChange}
            placeholder="10:00 - 22:00"
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-md ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-md hover:opacity-90"
          >
            {restaurant ? 'Сохранить изменения' : 'Добавить ресторан'}
          </button>
        </div>
      </form>
    );
  };

  // Обработчик сохранения ресторана (добавление или обновление)
  const handleSaveRestaurant = (restaurant: Restaurant) => {
    if (editingRestaurant) {
      // Обновление существующего ресторана
      setRestaurantList(restaurantList.map((r) => (r.id === restaurant.id ? restaurant : r)));
      setEditingRestaurant(null);
    } else {
      // Добавление нового ресторана
      setRestaurantList([...restaurantList, restaurant]);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Управление ресторанами</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить ресторан
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="flex md:items-center flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск ресторанов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Все
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Активные
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Неактивные
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ресторан
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Адрес
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Контакт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Работа
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-300 font-bold">{restaurant.name[0]}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{restaurant.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{restaurant.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                      {restaurant.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                      {restaurant.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>Мин. заказ: {restaurant.minOrderAmount} ₽</div>
                    <div>Бесплатная доставка: от {restaurant.freeDeliveryThreshold} ₽</div>
                    <div>{restaurant.workingHours}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingRestaurant(restaurant)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Рестораны не найдены</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-500 dark:text-blue-400 hover:underline"
              >
                Сбросить фильтр
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно добавления ресторана */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6`}>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Добавление ресторана</h3>
            <RestaurantForm restaurant={null} onSave={handleSaveRestaurant} onCancel={() => setIsAddModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Модальное окно редактирования ресторана */}
      {editingRestaurant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6`}>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Редактирование ресторана</h3>
            <RestaurantForm
              restaurant={editingRestaurant}
              onSave={handleSaveRestaurant}
              onCancel={() => setEditingRestaurant(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
