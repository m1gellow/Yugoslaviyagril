import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Store, Clock, CheckCircle, AlertTriangle, Search, X } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface RestaurantSelectorProps {
  isDarkMode?: boolean;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({ isDarkMode }) => {
  const { selectedRestaurant, allRestaurants, setSelectedRestaurant } = useRestaurant();
  const { cartItems, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClearCart, setConfirmClearCart] = useState(false);
  const [tempSelectedRestaurant, setTempSelectedRestaurant] = useState(selectedRestaurant);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Отфильтрованные рестораны
  const filteredRestaurants = searchQuery.trim()
    ? allRestaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allRestaurants;

  const handleRestaurantChange = (restaurant) => {
    if (restaurant.id === selectedRestaurant.id) {
      setIsOpen(false);
      return;
    }

    if (cartItems.length > 0) {
      // Если в корзине есть товары, то сохраняем выбранный ресторан во временную переменную
      // и показываем диалог подтверждения
      setTempSelectedRestaurant(restaurant);
      setConfirmClearCart(true);
    } else {
      // Даже если корзина пуста, всегда показываем предупреждение о разных ценах
      setTempSelectedRestaurant(restaurant);
      setShowPriceAlert(true);
    }
  };

  const confirmRestaurantChange = () => {
    // Очищаем корзину и применяем изменение ресторана
    clearCart();
    setSelectedRestaurant(tempSelectedRestaurant);
    setConfirmClearCart(false);
    setIsOpen(false);
  };

  const confirmPriceChange = () => {
    setSelectedRestaurant(tempSelectedRestaurant);
    setShowPriceAlert(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} rounded-lg p-3 shadow-md cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin className="text-orange-500 mr-2" />
        <div className="flex-1">
          <p className="font-medium text-sm">{selectedRestaurant.name}</p>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-xs`}>{selectedRestaurant.address}</p>
        </div>
        <ChevronDown
          className={`${isDarkMode ? 'text-gray-300' : ''} transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 ${isDarkMode ? 'bg-gray-700 shadow-2xl text-white' : 'bg-white shadow-lg'} rounded-lg z-20 overflow-hidden`}
        >
          <div className={`p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Выберите ресторан для заказа
              </p>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Поиск по ресторанам */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск ресторана..."
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`p-3 ${
                    isDarkMode
                      ? `hover:bg-gray-600 ${selectedRestaurant.id === restaurant.id ? 'bg-gray-600' : ''}`
                      : `hover:bg-orange-50 ${selectedRestaurant.id === restaurant.id ? 'bg-orange-50' : ''}`
                  } cursor-pointer`}
                  onClick={() => handleRestaurantChange(restaurant)}
                >
                  <div className="flex items-start">
                    <Store className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mt-1 mr-2`} />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium">{restaurant.name}</p>
                        {selectedRestaurant.id === restaurant.id && (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                        )}
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                        {restaurant.address}
                      </p>
                      <div
                        className={`flex items-center mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Доставка: {restaurant.workingHours || '10:00 - 22:00'}</span>
                      </div>

                      {restaurant.id === 1 || restaurant.id === 2 ? (
                        <div className={`mt-1 text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          Бизнес-ланч: Пн-Пт, {restaurant.id === 1 ? '12:00 - 15:00' : '12:00 - 16:00'}
                        </div>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs ${isDarkMode ? 'bg-orange-800 text-orange-100' : 'bg-orange-100 text-orange-700'} rounded-full px-2 py-0.5`}
                        >
                          Мин. заказ: {restaurant.minOrderAmount || 1000}₽
                        </span>
                        <span
                          className={`text-xs ${isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-700'} rounded-full px-2 py-0.5`}
                        >
                          Бесплатная доставка от {restaurant.freeDeliveryThreshold || 4000}₽
                        </span>
                      </div>

                      {restaurant.id !== selectedRestaurant.id && (
                        <div
                          className={`mt-2 text-xs flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-red-600'}`}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Цены могут отличаться от текущего ресторана!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`p-5 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Ресторанов не найдено. Попробуйте изменить поисковый запрос.
              </div>
            )}
          </div>

          <div
            className={`p-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} bg-gradient-to-r ${isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white'}`}
          >
            <Link
              to="/delivery"
              className={`block text-center ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} hover:underline text-sm p-1`}
              onClick={() => setIsOpen(false)}
            >
              Подробнее о доставке и самовывозе
            </Link>
          </div>
        </div>
      )}

      {/* Подтверждение смены ресторана с очисткой корзины */}
      {confirmClearCart && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-4 max-w-md w-full mx-4`}>
            <div className="flex items-start mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-bold mb-2">Сменить ресторан?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  В вашей корзине есть товары из ресторана "{selectedRestaurant.name}". При смене ресторана корзина
                  будет очищена.
                </p>
                <p className={`${isDarkMode ? 'text-yellow-400' : 'text-orange-600'} font-bold`}>
                  Кроме того, в ресторане "{tempSelectedRestaurant.name}" цены могут отличаться!
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmClearCart(false)}
                className={`px-4 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Отмена
              </button>
              <button
                onClick={confirmRestaurantChange}
                className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Информация о разных ценах в ресторанах */}
      {showPriceAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-4 max-w-md w-full mx-4`}>
            <div className="flex items-start mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-bold mb-2">Внимание: разные цены</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  Цены в ресторане "{tempSelectedRestaurant.name}" могут отличаться от текущего "
                  {selectedRestaurant.name}".
                  {tempSelectedRestaurant.id === 1 && (
                    <span className="block mt-2 text-yellow-500 font-bold">
                      Ресторан на Белинского предлагает блюда премиум-класса по более высоким ценам.
                    </span>
                  )}
                  {tempSelectedRestaurant.id === 5 && (
                    <span className="block mt-2 text-green-500">
                      В Закусочной на Латвийской действуют специальные цены, немного ниже стандартных.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPriceAlert(false)}
                className={`px-4 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Отмена
              </button>
              <button
                onClick={confirmPriceChange}
                className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSelector;
