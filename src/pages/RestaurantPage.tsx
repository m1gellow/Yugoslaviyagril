import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Info, ChevronRight } from 'lucide-react';
import CategoryNav from '../components/layout/CategoryNav';
import SearchBar from '../components/common/SearchBar';
import { Restaurant, Product } from '../types';
import { restaurants } from '../utils/mockData';
import { ProductList } from '../components/product';

interface RestaurantParams {
  id: string;
}

interface RestaurantPageProps {
  isDarkMode?: boolean;
}

const RestaurantPage: React.FC<RestaurantPageProps> = ({ isDarkMode = false }) => {
  const { id } = useParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(26);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const restaurantId = parseInt(id || '1');
  const restaurant: Restaurant = restaurants.find((r) => r.id === restaurantId) || restaurants[0];

  const isBusinessLunchAvailable = () => {
    if (restaurantId !== 1 && restaurantId !== 2) return false;

    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();

    if (day < 1 || day > 5) return false;

    if (restaurantId === 1) {
      return hours >= 12 && hours < 15;
    } else if (restaurantId === 2) {
      return hours >= 12 && hours < 16;
    }

    return false;
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Restaurant Header */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="relative h-48 md:h-64 w-full">
            <img 
              src={restaurant.image || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'} 
              alt={restaurant.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{restaurant.name}</h1>
              <div className="flex items-center mt-2 text-white/90">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{restaurant.address}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-40' : 'bg-orange-100'} mr-4`}>
                  <Phone className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Телефон для заказов</p>
                  <a 
                    href={`tel:+7 (937) 000-03-07`} 
                    className={`text-lg font-bold ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'}`}
                  >
                    +7 (937) 000-03-07
                  </a>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <SearchBar onSelectProduct={handleSelectProduct} isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} shadow-md transition-all duration-300`}>
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'} mr-4`}>
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Время работы</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Ежедневно: 10:00 – 22:00</p>
              </div>
            </div>
          </div>

          {isBusinessLunchAvailable() && (
            <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-green-900 bg-opacity-20 hover:bg-green-900/30' : 'bg-green-50 hover:bg-green-100'} shadow-md transition-all duration-300 md:col-span-2`}>
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-800 bg-opacity-40' : 'bg-green-100'} mr-4`}>
                  <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Бизнес-ланч</h3>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {restaurantId === 1 ? 'Пн-Пт: 12:00 – 15:00' : 'Пн-Пт: 12:00 – 16:00'}
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                    Сейчас доступен! Закажите до {restaurantId === 1 ? '15:00' : '16:00'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Special Conditions */}
        {restaurantId === 1 && (
          <div className={`rounded-xl p-6 mb-8 ${isDarkMode ? 'bg-blue-900 bg-opacity-20 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-400'} shadow-md`}>
            <div className="flex items-start">
              <Info className={`w-5 h-5 mt-1 mr-3 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h3 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Особые условия ресторана на Белинского
                </h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-2 bg-blue-500"></span>
                    <span>Минимальная сумма заказа на доставку: 2500 ₽</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-2 bg-blue-500"></span>
                    <span>Бесплатная доставка: от 5000 ₽</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-2 bg-blue-500"></span>
                    <span>Доступен соус Томатный вместо Кетчупа</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Menu Section */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6 border-b border-gray-200 border-opacity-20">
            <h2 className="text-2xl font-bold">Меню ресторана</h2>
          </div>
          
          <div className="p-6">
            <CategoryNav onSelectCategory={setSelectedCategoryId} isDarkMode={isDarkMode} />
          </div>
          
          <div className="px-6 pb-6">
            <ProductList selectedCategoryId={selectedCategoryId} isDarkMode={isDarkMode} />
          </div>
        </div>

        {/* Delivery Info */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className="text-xl font-bold mb-4">Условия доставки</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Стоимость доставки</h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>До 5 км — 200 ₽</li>
                <li>5-10 км — 300 ₽</li>
                <li>Свыше 10 км — 400 ₽</li>
                <li className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Бесплатно от 5000 ₽</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Время доставки</h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>Обычное время: 60-90 мин</li>
                <li>В часы пик: до 120 мин</li>
                <li>Экспресс-доставка: +200 ₽ (до 45 мин)</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Минимальный заказ</h4>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>Доставка: {restaurantId === 1 ? '2500 ₽' : '1500 ₽'}</li>
                <li>Самовывоз: нет минимальной суммы</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;