import React, { useState } from 'react';
import { Gift, Ticket, Trophy, Star, Calendar, Clock, Percent, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromotionsPageProps {
  isDarkMode?: boolean;
}

const PromotionsPage: React.FC<PromotionsPageProps> = ({ isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState('promotions');

  const promotions = [
    {
      id: 1,
      title: 'Счастливые часы',
      description: 'Каждый день с 15:00 до 17:00 скидка 20% на все бургеры',
      image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
      validUntil: '30 сентября 2025',
      code: 'HAPPYHOUR',
      time: '15:00-17:00',
      discount: '20%'
    },
    {
      id: 2,
      title: 'Комбо для компании',
      description: 'При заказе от 3000₽ картофель фри и 2 соуса в подарок',
      image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
      validUntil: '31 августа 2025',
      code: 'COMBO3000',
      minOrder: '3000₽'
    },
    {
      id: 3,
      title: 'День рождения',
      description: 'Скидка 15% в день рождения, и за день до и после праздника',
      image: 'https://images.pexels.com/photos/2531546/pexels-photo-2531546.jpeg',
      validUntil: 'Постоянная акция',
      code: 'BIRTHDAY',
      discount: '15%'
    },
  ];

  const contests = [
    {
      id: 1,
      title: 'Выиграй обед на двоих',
      description: 'Подпишись на наши соцсети, сделай репост и участвуй в еженедельном розыгрыше обеда на двоих',
      image: 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg',
      endDate: '31 августа 2025',
      participants: 243,
      prize: 'Обед на двоих'
    },
    {
      id: 2,
      title: 'Летний фотоконкурс',
      description: 'Выложи фото своего обеда в Югославии Гриль с хэштегом #ЛетоЮгославия и выиграй сертификат на 5000₽',
      image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg',
      endDate: '15 августа 2025',
      participants: 157,
      prize: '5000₽'
    },
  ];

  const bonuses = [
    {
      id: 1,
      title: 'Бонусная программа',
      description: '5% от каждого заказа возвращается на ваш бонусный счет. Накапливайте и оплачивайте до 50% заказа бонусами.',
      image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg',
      icon: <Percent className="w-5 h-5" />
    },
    {
      id: 2,
      title: 'Программа лояльности',
      description: 'Повышайте свой статус с каждым заказом. Серебряный, Золотой и Платиновый уровни с дополнительными привилегиями.',
      image: 'https://images.pexels.com/photos/5370650/pexels-photo-5370650.jpeg',
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 3,
      title: 'Приведи друга',
      description: 'Получите 500 бонусных баллов за каждого нового клиента, который сделает заказ по вашей рекомендации.',
      image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
      icon: <Gift className="w-5 h-5" />
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className={`rounded-2xl p-8 mb-12 text-center ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-orange-50 to-white'} shadow-lg`}>
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-40' : 'bg-orange-100'} mb-4`}>
              <Gift className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              Акции и бонусы
            </h1>
            <p className={`text-lg max-w-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Специальные предложения, розыгрыши и бонусная программа для наших гостей
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-12">
          <div className={`inline-flex rounded-full p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`px-6 py-2 rounded-full flex items-center transition-all ${activeTab === 'promotions' 
                ? `${isDarkMode ? 'bg-orange-600 text-white' : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md'}`
                : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}`}
            >
              <Percent className="w-5 h-5 mr-2" />
              <span className="font-medium">Акции</span>
            </button>

            <button
              onClick={() => setActiveTab('contests')}
              className={`px-6 py-2 rounded-full flex items-center transition-all ${activeTab === 'contests' 
                ? `${isDarkMode ? 'bg-orange-600 text-white' : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md'}`
                : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}`}
            >
              <Trophy className="w-5 h-5 mr-2" />
              <span className="font-medium">Розыгрыши</span>
            </button>

            <button
              onClick={() => setActiveTab('bonuses')}
              className={`px-6 py-2 rounded-full flex items-center transition-all ${activeTab === 'bonuses' 
                ? `${isDarkMode ? 'bg-orange-600 text-white' : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md'}`
                : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}`}
            >
              <Star className="w-5 h-5 mr-2" />
              <span className="font-medium">Бонусы</span>
            </button>
          </div>
        </div>

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={promotion.image} 
                    alt={promotion.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                    {promotion.validUntil}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold">{promotion.title}</h3>
                    {promotion.discount && (
                      <span className={`px-2 py-1 rounded-md text-sm font-bold ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>
                        {promotion.discount}
                      </span>
                    )}
                  </div>

                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {promotion.description}
                  </p>

                  <div className="space-y-3 mb-5">
                    {promotion.time && (
                      <div className="flex items-center">
                        <Clock className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {promotion.time}
                        </span>
                      </div>
                    )}
                    {promotion.minOrder && (
                      <div className="flex items-center">
                        <Ticket className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          От {promotion.minOrder}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-500 border-opacity-30">
                    <div className="flex items-center">
                      <Ticket className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mr-2`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {promotion.code}
                      </span>
                    </div>
                    <button className={`flex items-center text-sm font-medium ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'}`}>
                      Подробнее <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contests Tab */}
        {activeTab === 'contests' && (
          <div className="space-y-8">
            {contests.map((contest) => (
              <div
                key={contest.id}
                className={`rounded-xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={contest.image}
                      alt={contest.title}
                      className="w-full h-full min-h-64 object-cover"
                    />
                  </div>

                  <div className="p-8 md:w-2/3">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold">{contest.title}</h3>
                      {contest.prize && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-600'}`}>
                          {contest.prize}
                        </span>
                      )}
                    </div>

                    <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {contest.description}
                    </p>

                    <div className="flex flex-wrap gap-6 mb-8">
                      <div className="flex items-center">
                        <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mr-3`} />
                        <div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Дата окончания</p>
                          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {contest.endDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Trophy className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mr-3`} />
                        <div>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Участников</p>
                          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {contest.participants}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      className={`px-8 py-3 rounded-full font-medium flex items-center ${isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-md'}`}
                    >
                      Участвовать
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bonuses Tab */}
        {activeTab === 'bonuses' && (
          <div>
            {/* Bonus Balance Card */}
            <div
              className={`mb-12 p-8 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-orange-50 to-white'} shadow-lg`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center mb-6 md:mb-0">
                  <div className={`p-4 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-40' : 'bg-orange-100'} mr-6`}>
                    <Star className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Ваш бонусный баланс</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Накапливайте баллы с каждым заказом
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Доступно бонусов</p>
                  <h4 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 mb-1">
                    750
                  </h4>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>1 балл = 1 рубль</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-500 border-opacity-30">
                <Link
                  to="/cabinet"
                  className={`px-8 py-3 rounded-full font-medium inline-flex items-center ${isDarkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-md'}`}
                >
                  Перейти в личный кабинет
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Bonus Programs */}
            <h3 className="text-2xl font-bold mb-8">Наши бонусные программы</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bonuses.map((bonus) => (
                <div
                  key={bonus.id}
                  className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-orange-50'}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={bonus.image}
                      alt={bonus.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className={`absolute top-4 left-4 p-3 rounded-full ${isDarkMode ? 'bg-orange-900 bg-opacity-60' : 'bg-white bg-opacity-90'}`}>
                      {bonus.icon}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3">{bonus.title}</h4>
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {bonus.description}
                    </p>

                    <button className={`flex items-center font-medium ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-500'}`}>
                      Подробнее о программе
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsPage;