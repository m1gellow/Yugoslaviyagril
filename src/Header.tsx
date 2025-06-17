import React, { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, Truck, Phone, User, Gift, Sun, Moon } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useRestaurant } from './context/RestaurantContext';
import AuthModal from './components/AuthModal';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabase } from './context/SupabaseContext';

interface HeaderProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  const { getTotalItems, getTotalPrice } = useCart();
  const { selectedRestaurant, toggleRestaurantList, showRestaurantList, allRestaurants, setSelectedRestaurant } =
    useRestaurant();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { auth, signOut } = useSupabase();
  const navigate = useNavigate();

  // Переход в админ-панель
  const handleAdminClick = () => {
    navigate('/admin/dashboard', { replace: true });
  };

  // Обработчик выхода из системы
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Успешный выход из системы');
      // После успешного выхода перенаправляем пользователя на главную страницу
      navigate('/', { replace: true });
      window.location.reload(); // Перезагружаем страницу для сброса всех состояний
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  return (
    <>
      <div
        className={`container mx-auto my-5 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-3xl shadow-md`}
      >
        <nav className="flex flex-col md:flex-row items-center justify-between p-4">
          <div className="logo-nav mb-4 md:mb-0">
            <Link to="/" className="navbar-brand">
              <img
                src="/static/img/logo-new.png"
                height="50"
                alt="Югославия Гриль"
                className="h-12"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://югославия-гриль.рф/static/img/logo-new.png';
                }}
              />
            </Link>
          </div>

          <div className="flex items-center mb-4 md:mb-0 cursor-pointer" onClick={toggleRestaurantList}>
            <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
            <span className="ms-1">Рестораны</span>

            {showRestaurantList && (
              <div
                className={`wrapper_list-location absolute ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} rounded-2xl shadow-lg z-50 p-3 top-32 md:top-24 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-auto`}
              >
                <ul>
                  {allRestaurants.map((restaurant) => (
                    <li
                      key={restaurant.id}
                      className={`m-2 pb-2 ${isDarkMode ? 'border-b border-gray-600' : 'border-b border-gradient-to-r from-orange-400 to-red-500'}`}
                    >
                      <Link
                        to={`/restaurant/${restaurant.id}`}
                        className={isDarkMode ? 'text-white hover:text-orange-400' : 'text-black hover:text-orange-500'}
                        onClick={() => setSelectedRestaurant(restaurant)}
                      >
                        {restaurant.name} ({restaurant.address})
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center mb-4 md:mb-0">
            <Truck className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
            <Link
              to="/delivery"
              className={`ms-1 ${isDarkMode ? 'text-white' : 'text-black'} no-underline hover:text-orange-500 transition`}
            >
              Доставка и оплата
            </Link>
          </div>

          <div className="flex items-center mb-4 md:mb-0">
            <Link
              to="/promotions"
              className={`flex items-center ${isDarkMode ? 'text-white' : 'text-black'} hover:text-orange-500 transition`}
            >
              <Gift className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-1`} />
              Акции и бонусы
            </Link>
          </div>

          <div className="flex items-center mb-4 md:mb-0">
            <a href={`tel:+7 (937) 000-03-07`} className="nav-phone px-2 flex items-center">
              <Phone className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
              <span className="ps-2 phone-venue font-semibold">+7 (937) 000-03-07</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Кнопка переключения темы */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
            )}

            {auth.user ? (
              <div className="flex items-center">
                <div className="relative group">
                  <Link
                    to="/cabinet"
                    className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-700'} hover:text-orange-500 transition`}
                  >
                    <User className="w-5 h-5" />
                    <span className="ml-1 hidden sm:inline">{auth.profile?.name || 'Личный кабинет'}</span>
                  </Link>

                  {/* Выпадающее меню */}
                  <div
                    className={`absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg ${
                      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    } hidden group-hover:block`}
                  >
                    <div className="py-1">
                      <Link
                        to="/cabinet"
                        className={`block px-4 py-2 text-sm ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Личный кабинет
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-500 hover:bg-gray-100'
                        }`}
                      >
                        Выйти
                      </button>
                    </div>
                  </div>
                </div>

                {/* Кнопка админ-панели для сотрудников */}
                {auth.isOperator && (
                  <button
                    onClick={handleAdminClick}
                    className={`ml-3 px-2 py-1 text-sm rounded-md ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-orange-400'
                        : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                    }`}
                  >
                    Админ-панель
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`flex items-center ${isDarkMode ? 'text-white' : 'text-gray-700'} hover:text-orange-500 transition`}
              >
                <User className="w-5 h-5" />
                <span className="ml-1 hidden sm:inline">Войти</span>
              </button>
            )}

            <div className="flex items-center">
              <div className="px-2 relative">
                <a href="#" data-bs-toggle="modal" data-bs-target="#cartModal">
                  <ShoppingBag
                    className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'} hover:text-orange-500 transition-colors duration-200`}
                  />
                  <span className="cart-count absolute -top-2 right-0 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs">
                    {getTotalItems()}
                  </span>
                </a>
              </div>

              <div className="mx-2">
                <span
                  className={`cash_sum ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'} rounded-full px-4 py-1 border border-gradient-to-r from-orange-400 to-red-500`}
                >
                  {getTotalPrice().toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </nav>

        <div className="submenu">
          <ul
            className={`flex gap-5 items-center justify-center pt-5 pb-3 list-none px-0 flex-wrap ${isDarkMode ? 'text-white' : ''}`}
          >
            {allRestaurants.map((restaurant) => (
              <li
                key={restaurant.id}
                className={`border-r last:border-r-0 px-2 text-sm md:text-base ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
              >
                <Link
                  to={`/restaurant/${restaurant.id}`}
                  className={`no-underline ${isDarkMode ? 'text-white' : 'text-black'} hover:text-orange-500 transition`}
                >
                  {restaurant.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDarkMode={isDarkMode} />
    </>
  );
};

export default Header;
