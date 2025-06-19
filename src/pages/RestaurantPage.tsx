import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone } from 'lucide-react';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(26); // Бургеры по умолчанию
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Находим ресторан по ID из URL
  const restaurantId = parseInt(id || '1');
  const restaurant: Restaurant = restaurants.find((r) => r.id === restaurantId) || restaurants[0];

  // Проверка на бизнес-ланч
  const isBusinessLunchAvailable = () => {
    // Проверяем, что ресторан - это Белинского или Ясная
    if (restaurantId !== 1 && restaurantId !== 2) return false;

    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();

    // Проверка на рабочие дни (Пн-Пт: 1-5)
    if (day < 1 || day > 5) return false;

    // Проверка на время для разных ресторанов
    if (restaurantId === 1) {
      // Белинского
      return hours >= 12 && hours < 15;
    } else if (restaurantId === 2) {
      // Ясная
      return hours >= 12 && hours < 16;
    }

    return false;
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : ''}`}
      style={{ backgroundImage: isDarkMode ? 'none' : "url('https://югославия-гриль.рф/static/img/bg.png')" }}
    >
  
      <div className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 mb-8`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span className={isDarkMode ? 'text-gray-300' : ''}>{restaurant.address}</span>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <div
                className={`flex items-center ${isDarkMode ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-100'} px-4 py-2 rounded-lg`}
              >
                <Phone className="w-5 h-5 text-orange-500 mr-2" />
                <a
                  href={`tel:+7 (937) 000-03-07`}
                  className={`font-medium ${isDarkMode ? 'text-orange-300 hover:text-orange-200' : 'text-orange-800 hover:text-orange-600'}`}
                >
                  +7 (937) 000-03-07
                </a>
              </div>
            </div>
          </div>

          {/* Поисковая строка для фильтрации товаров */}
          <div className="mb-6">
            <SearchBar onSelectProduct={handleSelectProduct} isDarkMode={isDarkMode} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`${isDarkMode ? 'bg-gradient-to-r from-orange-900 to-red-900 bg-opacity-20' : 'bg-gradient-to-r from-orange-100 to-red-100'} p-4 rounded-lg flex items-center`}
            >
              <Clock className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Время работы</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Ежедневно: 10:00 – 22:00</p>
              </div>
            </div>

            {isBusinessLunchAvailable() && (
              <div
                className={`${isDarkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-100'} p-4 rounded-lg flex items-center col-span-1 md:col-span-2`}
              >
                <Calendar className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Бизнес-ланч</h3>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {restaurantId === 1 ? 'Пн-Пт: 12:00 – 15:00' : 'Пн-Пт: 12:00 – 16:00'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Особые условия для конкретного ресторана */}
          {restaurantId === 1 && ( // Белинского
            <div
              className={`${isDarkMode ? 'bg-blue-900 bg-opacity-20 border-blue-700' : 'bg-blue-50 border-blue-500'} p-4 rounded-lg border-l-4 mb-8`}
            >
              <h3 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : ''}`}>
                Особые условия ресторана на Белинского
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : ''}>Минимальная сумма заказа на доставку: 2500 ₽</p>
              <p className={isDarkMode ? 'text-gray-300' : ''}>Бесплатная доставка: от 5000 ₽</p>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : ''}`}>
                В отличие от других заведений, здесь доступен соус Томатный вместо Кетчупа
              </p>
            </div>
          )}

          {/* Меню ресторана */}
          <CategoryNav onSelectCategory={setSelectedCategoryId} isDarkMode={isDarkMode} />
          <ProductList selectedCategoryId={selectedCategoryId} isDarkMode={isDarkMode} />
        </div>
      </div>


    </div>
  );
};

export default RestaurantPage;
