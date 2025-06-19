import React, { useState } from 'react';
import { MapPin, ChevronDown, Store, Clock, CheckCircle, AlertTriangle, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRestaurant } from '../../context/RestaurantContext';
import { useCart } from '../../context/CartContext';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  workingHours?: string;
}

interface RestaurantSelectorProps {
  isDarkMode?: boolean;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({ isDarkMode }) => {
  const { selectedRestaurant, allRestaurants, setSelectedRestaurant } = useRestaurant();
  const { cartItems, clearCart } = useCart();
  
  const [isOpen, setIsOpen] = useState(false);
  const [confirmClearCart, setConfirmClearCart] = useState(false);
  const [tempSelectedRestaurant, setTempSelectedRestaurant] = useState<Restaurant>(selectedRestaurant);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = searchQuery.trim()
    ? allRestaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allRestaurants;

  const handleRestaurantChange = (restaurant: Restaurant) => {
    if (restaurant.id === selectedRestaurant.id) {
      setIsOpen(false);
      return;
    }

    setTempSelectedRestaurant(restaurant);
    
    if (cartItems.length > 0) {
      setConfirmClearCart(true);
    } else {
      setShowPriceAlert(true);
    }
  };

  const confirmChange = () => {
    if (confirmClearCart) {
      clearCart();
      setConfirmClearCart(false);
    }
    setSelectedRestaurant(tempSelectedRestaurant);
    setShowPriceAlert(false);
    setIsOpen(false);
  };

  const cancelChange = () => {
    setConfirmClearCart(false);
    setShowPriceAlert(false);
  };

  return (
    <div className="relative">
      {/* Main Selector Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center w-full p-3 rounded-xl shadow-sm transition-all ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-white' 
            : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center w-full">
          <MapPin className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3`} />
          <div className="text-left flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedRestaurant.name}</p>
            <p className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {selectedRestaurant.address}
            </p>
          </div>
          <ChevronDown
            className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-20 overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Search Bar */}
            <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск ресторана..."
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300 placeholder-gray-500'
                  } border`}
                />
              </div>
            </div>

            {/* Restaurant List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <motion.div
                    key={restaurant.id}
                    whileHover={{ backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.8)' }}
                    className={`p-3 cursor-pointer ${
                      selectedRestaurant.id === restaurant.id && (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                    }`}
                    onClick={() => handleRestaurantChange(restaurant)}
                  >
                    <div className="flex items-start">
                      <Store className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mt-1 mr-3`} />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium">{restaurant.name}</p>
                          {selectedRestaurant.id === restaurant.id && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1`}>
                          {restaurant.address}
                        </p>
                        <div className={`flex items-center mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{restaurant.workingHours || '10:00 - 22:00'}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`text-xs rounded-full px-2 py-0.5 ${
                              isDarkMode ? 'bg-orange-900 text-orange-100' : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            Мин. заказ: {restaurant.minOrderAmount || 1000}₽
                          </span>
                          <span
                            className={`text-xs rounded-full px-2 py-0.5 ${
                              isDarkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            Бесплатная доставка от {restaurant.freeDeliveryThreshold || 4000}₽
                          </span>
                        </div>

                        {restaurant.id !== selectedRestaurant.id && (
                          <div className={`mt-2 text-xs flex items-center ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Цены могут отличаться
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={`p-5 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ресторанов не найдено
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <a
                href="#"
                className={`block text-center text-sm ${
                  isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'
                } transition-colors`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }}
              >
                Подробнее о доставке
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {(confirmClearCart || showPriceAlert) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`rounded-xl p-5 w-full max-w-md ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <div className="flex items-start mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    {confirmClearCart ? 'Сменить ресторан?' : 'Внимание: разные цены'}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                    {confirmClearCart
                      ? `В вашей корзине есть товары из "${selectedRestaurant.name}". При смене ресторана корзина будет очищена.`
                      : `Цены в ресторане "${tempSelectedRestaurant.name}" могут отличаться от "${selectedRestaurant.name}".`}
                  </p>
                  {confirmClearCart && (
                    <p className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} font-medium`}>
                      Цены также могут отличаться!
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelChange}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  } transition-colors`}
                >
                  Отмена
                </button>
                <button
                  onClick={confirmChange}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Подтвердить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantSelector;