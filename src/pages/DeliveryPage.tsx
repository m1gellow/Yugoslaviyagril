import React from 'react';
import { MapPin, Truck, Clock, CreditCard, Info } from 'lucide-react';

interface DeliveryPageProps {
  isDarkMode?: boolean;
}

const DeliveryPage: React.FC<DeliveryPageProps> = ({ isDarkMode }) => {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className={`rounded-2xl p-8 mb-12 ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-orange-50 to-white'} shadow-lg`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600">
            Доставка и оплата
          </h1>
          <p className={`text-lg text-center max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Быстрая и удобная доставка по всему городу. Выбирайте удобный способ получения и оплаты вашего заказа.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Delivery Cost Card */}
          <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
            <div className="flex items-center mb-5">
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-40' : 'bg-orange-100'} mr-4`}>
                <Truck className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h3 className="text-xl font-bold">Стоимость доставки</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                <span>
                  <span className="font-medium">До 10 км:</span> <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>200₽</span>
                </span>
              </li>
              <li className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                <span>
                  <span className="font-medium">Более 10 км:</span> <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>400₽</span>
                </span>
              </li>
              <li className="flex items-start pt-3 border-t border-dashed border-gray-500 border-opacity-30">
                <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                <span className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Бесплатно при заказе от 5000₽
                </span>
              </li>
            </ul>
          </div>

          {/* Working Hours Card */}
          <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
            <div className="flex items-center mb-5">
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-40' : 'bg-orange-100'} mr-4`}>
                <Clock className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h3 className="text-xl font-bold">Время работы</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Доставка:</h4>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ежедневно 10:00–22:00</p>
              </div>
              <div>
                <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Самовывоз:</h4>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ежедневно 10:00–22:00</p>
              </div>
            </div>
            <div className={`mt-4 pt-3 border-t border-dashed border-gray-500 border-opacity-30 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Время доставки зависит от загруженности кухни и дорожной ситуации
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
            <div className="flex items-center mb-5">
              <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-40' : 'bg-orange-100'} mr-4`}>
                <CreditCard className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h3 className="text-xl font-bold">Способы оплаты</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Наличными при получении</span>
              </li>
              <li className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Картой при получении</span>
              </li>
              <li className="flex items-start">
                <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${isDarkMode ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Система быстрых платежей (СБП)</span>
              </li>
            </ul>
            <div className={`mt-4 pt-3 border-t border-dashed border-gray-500 border-opacity-30 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              При оплате картой чек выдается курьером
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className={`rounded-xl p-6 mb-12 ${isDarkMode ? 'bg-gray-800 border-l-4 border-orange-500' : 'bg-orange-50 border-l-4 border-orange-400'} shadow-md`}>
          <div className="flex items-start">
            <Info className={`w-5 h-5 mt-1 mr-3 flex-shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Важная информация
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-2 bg-orange-500"></span>
                  <span>Доставка в Березовский и Верхнюю Пышму с доплатой по согласованию</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-2 bg-orange-500"></span>
                  <span>Минимальная сумма заказа на доставку — 1000₽</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-2 bg-orange-500"></span>
                  <span>Самовывоз доступен для заказов любой суммы</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Наши рестораны
          </h2>
          <p className={`text-lg text-center max-w-3xl mx-auto mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Выберите удобное место для самовывоза или закажите доставку из ближайшего к вам ресторана
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location 1 */}
            <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'} mr-4`}>
                  <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Кафе на Ясной, 6</h3>
                  <div className="space-y-2">
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Доставка:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 11:00-22:00</span>
                    </div>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Самовывоз:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 11:00-23:00</span>
                    </div>
                    <div className={`pt-2 mt-2 border-t border-dashed ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Минимальный заказ:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>1500₽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location 2 */}
            <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'} mr-4`}>
                  <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Кафе на Фронтовых Бригад, 33а</h3>
                  <div className="space-y-2">
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Доставка:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 10:00-22:00</span>
                    </div>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Самовывоз:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 10:00-22:00</span>
                    </div>
                    <div className={`pt-2 mt-2 border-t border-dashed ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Минимальный заказ:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>1000₽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location 3 */}
            <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'} mr-4`}>
                  <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Закусочная на Волгоградской, 178a</h3>
                  <div className="space-y-2">
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Доставка:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 10:00-24:00</span>
                    </div>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Самовывоз:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 10:00-24:00</span>
                    </div>
                    <div className={`pt-2 mt-2 border-t border-dashed ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Минимальный заказ:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>1000₽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location 4 */}
            <div className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'} border ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'} mr-4`}>
                  <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Ресторан на Белинского, 200</h3>
                  <div className="space-y-2">
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Доставка:</span>{' '}
                      <span className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>временно недоступна</span>
                    </div>
                    <div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Самовывоз:</span>{' '}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Пн-Вс 12:00-23:00</span>
                    </div>
                    <div className={`pt-2 mt-2 border-t border-dashed ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
                      <span className={`italic text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Информация о доставке появится в ближайшее время
                      </span>
                    </div>
                  </div>
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