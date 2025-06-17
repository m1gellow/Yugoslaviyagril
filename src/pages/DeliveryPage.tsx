import React from 'react';
import { MapPin, Truck, Clock, CreditCard } from 'lucide-react';

interface DeliveryPageProps {
  isDarkMode?: boolean;
}

const DeliveryPage: React.FC<DeliveryPageProps> = ({ isDarkMode }) => {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 mb-8`}>
          <h1 className="text-3xl font-bold mb-6 text-center">Доставка и оплата</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`delivery-info-card ${isDarkMode ? 'bg-gray-700 border-orange-500' : 'bg-white border-l-gradient-orange-red'}`}
            >
              <div className="flex items-center mb-4">
                <Truck className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3`} />
                <h3 className="text-xl font-bold">Стоимость доставки</h3>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <span className="font-medium">До 10 км от кафе:</span> 200₽
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">В отдаленные районы (более 10км):</span> 400₽
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-4`}>
                <span className="text-orange-500 font-bold">Бесплатная доставка</span> при заказе от 5000₽
              </p>
            </div>

            <div
              className={`delivery-info-card ${isDarkMode ? 'bg-gray-700 border-orange-500' : 'bg-white border-l-gradient-orange-red'}`}
            >
              <div className="flex items-center mb-4">
                <Clock className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3`} />
                <h3 className="text-xl font-bold">Время работы</h3>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <span className="font-medium">Доставка:</span> ежедневно с 10:00 до 22:00
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-medium">Самовывоз:</span> ежедневно с 10:00 до 22:00
              </p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-4`}>
                Время доставки зависит от загруженности кухни и дорожной ситуации
              </p>
            </div>

            <div
              className={`delivery-info-card ${isDarkMode ? 'bg-gray-700 border-orange-500' : 'bg-white border-l-gradient-orange-red'}`}
            >
              <div className="flex items-center mb-4">
                <CreditCard className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3`} />
                <h3 className="text-xl font-bold">Способы оплаты</h3>
              </div>
              <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
                <li>Наличными при получении</li>
                <li>Картой при получении</li>
                <li>Система быстрых платежей (СБП)</li>
              </ul>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-4`}>
                При оплате заказа банковской картой, чек выдается курьером
              </p>
            </div>
          </div>

          <div
            className={`${isDarkMode ? 'bg-orange-900 bg-opacity-20 border border-orange-800' : 'bg-orange-50 border border-orange-200'} p-6 rounded-xl mb-8`}
          >
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>
              Важная информация
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Доставка в города Березовский и Верхняя Пышма производится с доплатой и по согласованию с оператором.
              Благодарим за понимание.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Минимальная сумма заказа на доставку — 1000₽. При заказе на меньшую сумму доступен только самовывоз.
            </p>
          </div>

          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>Наши рестораны</h2>

          <div className="delivery-locations">
            <div
              className={`location-card ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-start">
                <MapPin
                  className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mt-1 mr-2 flex-shrink-0`}
                />
                <div>
                  <h3 className="text-lg font-bold mb-2">Кафе на Ясной, 6</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Доставка: Пн-Вс 11:00-22:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Самовывоз: Пн-Вс 11:00-23:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Минимальная сумма заказа:</span> от 1500₽
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Бесплатная доставка:</span> от 5000₽
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`location-card ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-start">
                <MapPin
                  className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mt-1 mr-2 flex-shrink-0`}
                />
                <div>
                  <h3 className="text-lg font-bold mb-2">Кафе на Фронтовых Бригад, 33а</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Доставка: Пн-Вс 10:00-22:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Самовывоз: Пн-Вс 10:00-22:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Минимальная сумма заказа:</span> от 1000₽
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Бесплатная доставка:</span> от 5000₽
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`location-card ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-start">
                <MapPin
                  className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mt-1 mr-2 flex-shrink-0`}
                />
                <div>
                  <h3 className="text-lg font-bold mb-2">Закусочная на Волгоградской, 178a</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Доставка: Пн-Вс 10:00-24:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Самовывоз: Пн-Вс 10:00-24:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Минимальная сумма заказа:</span> от 1000₽
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Бесплатная доставка:</span> от 5000₽
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`location-card ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-start">
                <MapPin
                  className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mt-1 mr-2 flex-shrink-0`}
                />
                <div>
                  <h3 className="text-lg font-bold mb-2">Ресторан на Белинского, 200</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Доставка: временно недоступна
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    Самовывоз: Пн-Вс 12:00-23:00
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                    Информация о доставке появится в ближайшее время
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
