import React, { useState } from 'react';
import { Gift, Ticket, Trophy, Star, Calendar, Clock, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PromotionsPageProps {
  isDarkMode?: boolean;
}

const PromotionsPage: React.FC<PromotionsPageProps> = ({ isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState('promotions');

  // Моковые данные для акций
  const promotions = [
    {
      id: 1,
      title: 'Счастливые часы',
      description: 'Каждый день с 15:00 до 17:00 скидка 20% на все бургеры',
      image:
        'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      validUntil: '30 сентября 2025',
      code: 'HAPPYHOUR',
    },
    {
      id: 2,
      title: 'Комбо для компании',
      description: 'При заказе от 3000₽ картофель фри и 2 соуса в подарок',
      image:
        'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      validUntil: '31 августа 2025',
      code: 'COMBO3000',
    },
    {
      id: 3,
      title: 'День рождения',
      description: 'Скидка 15% в день рождения, и за день до и после праздника',
      image:
        'https://images.pexels.com/photos/2531546/pexels-photo-2531546.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      validUntil: 'Постоянная акция',
      code: 'BIRTHDAY',
    },
  ];

  // Моковые данные для розыгрышей
  const contests = [
    {
      id: 1,
      title: 'Выиграй обед на двоих',
      description: 'Подпишись на наши соцсети, сделай репост и участвуй в еженедельном розыгрыше обеда на двоих',
      image:
        'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      endDate: '31 августа 2025',
      participants: 243,
    },
    {
      id: 2,
      title: 'Летний фотоконкурс',
      description: 'Выложи фото своего обеда в Югославии Гриль с хэштегом #ЛетоЮгославия и выиграй сертификат на 5000₽',
      image:
        'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      endDate: '15 августа 2025',
      participants: 157,
    },
  ];

  // Моковые данные для бонусов
  const bonuses = [
    {
      id: 1,
      title: 'Бонусная программа',
      description:
        '5% от каждого заказа возвращается на ваш бонусный счет. Накапливайте и оплачивайте до 50% заказа бонусами.',
      image:
        'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 2,
      title: 'Программа лояльности',
      description:
        'Повышайте свой статус с каждым заказом. Серебряный, Золотой и Платиновый уровни с дополнительными привилегиями.',
      image:
        'https://images.pexels.com/photos/5370650/pexels-photo-5370650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      id: 3,
      title: 'Приведи друга',
      description:
        'Получите 500 бонусных баллов за каждого нового клиента, который сделает заказ по вашей рекомендации.',
      image:
        'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
  ];

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
      style={{ backgroundImage: isDarkMode ? 'none' : "url('https://югославия-гриль.рф/static/img/bg.png')" }}
    >


      <div className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 mb-8`}>
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <Gift className={`w-10 h-10 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3`} />
              <h1 className="text-3xl font-bold">Акции и бонусы</h1>
            </div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Специальные предложения, розыгрыши и бонусная программа для наших гостей
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className={`inline-flex rounded-full p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <button
                onClick={() => setActiveTab('promotions')}
                className={`px-4 py-2 rounded-full flex items-center text-sm ${
                  activeTab === 'promotions'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-600'
                }`}
              >
                <Percent className="w-4 h-4 mr-2" />
                Акции
              </button>

              <button
                onClick={() => setActiveTab('contests')}
                className={`px-4 py-2 rounded-full flex items-center text-sm ${
                  activeTab === 'contests'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-600'
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Розыгрыши
              </button>

              <button
                onClick={() => setActiveTab('bonuses')}
                className={`px-4 py-2 rounded-full flex items-center text-sm ${
                  activeTab === 'bonuses'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-600'
                }`}
              >
                <Star className="w-4 h-4 mr-2" />
                Бонусы
              </button>
            </div>
          </div>

          {activeTab === 'promotions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className={`overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-[1.02] ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <img src={promotion.image} alt={promotion.title} className="w-full h-48 object-cover" />

                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg mb-2">{promotion.title}</h3>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'}`}
                      >
                        {promotion.validUntil}
                      </div>
                    </div>

                    <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {promotion.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Ticket className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mr-1`} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Промокод: {promotion.code}
                        </span>
                      </div>
                      <button
                        className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contests' && (
            <div className="space-y-6">
              {contests.map((contest) => (
                <div
                  key={contest.id}
                  className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={contest.image}
                        alt={contest.title}
                        className="w-full h-full object-cover max-h-64 md:max-h-none"
                      />
                    </div>

                    <div className="p-6 md:w-2/3">
                      <h3 className="font-bold text-xl mb-2">{contest.title}</h3>
                      <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{contest.description}</p>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mr-2`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            До: {contest.endDate}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <Trophy className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} mr-2`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Участников: {contest.participants}
                          </span>
                        </div>
                      </div>

                      <button
                        className={`px-6 py-2 rounded-full ${isDarkMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600'} text-white`}
                      >
                        Участвовать
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'bonuses' && (
            <div>
              <div
                className={`mb-8 p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-orange-50 to-red-50'} shadow-md`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-full ${isDarkMode ? 'bg-orange-500' : 'bg-orange-100'}`}>
                    <Star className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-orange-600'}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-xl">Ваш бонусный баланс</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Накапливайте баллы с каждым заказом
                    </p>
                  </div>
                </div>

                <div className={`text-center py-6 mb-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Доступно бонусов</p>
                  <h4 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    750 баллов
                  </h4>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>1 бонус = 1 рубль</p>
                </div>

                <div className="flex justify-center">
                  <Link
                    to="/cabinet"
                    className={`px-6 py-2 rounded-full text-white text-sm font-medium ${isDarkMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600'}`}
                  >
                    Перейти в личный кабинет
                  </Link>
                </div>
              </div>

              <h3 className="font-bold text-xl mb-4">Наши бонусные программы</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className={`rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02] ${isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-white'}`}
                  >
                    <img src={bonus.image} alt={bonus.title} className="w-full h-48 object-cover" />

                    <div className="p-4">
                      <h4 className="font-bold text-lg mb-2">{bonus.title}</h4>
                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {bonus.description}
                      </p>

                      <button className="text-sm bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-1.5 rounded-full">
                        Подробнее
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PromotionsPage;
