import React, { useState, useEffect } from 'react';
import { useCart } from './context/CartContext';
import { useRestaurant } from './context/RestaurantContext';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal';
import { useSupabase } from './context/SupabaseContext';
import { CircleUserRound, Moon, Search, ShoppingCart, Truck, Menu, X, MapPin, Gift, Phone, Sun } from 'lucide-react';

interface HeaderProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

// isCartModalOpen={isCartModalOpen} setIsCartModalOpen={setIsCartModalOpen}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, isCartModalOpen, setIsCartModalOpen }) => {
  const { getTotalItems, getTotalPrice } = useCart();
  const { selectedRestaurant, toggleRestaurantList, showRestaurantList, allRestaurants, setSelectedRestaurant } = useRestaurant();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { auth, signOut } = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Переход в админ-панель
  const handleAdminClick = () => {
    navigate('/admin/dashboard', { replace: true });
    setIsMobileMenuOpen(false);
  };

  // Обработчик выхода из системы
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Успешный выход из системы");
      navigate('/', { replace: true });
      window.location.reload();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  return (
    <>
      <nav className={`w-full flex flex-col py-[15px] gap-5 ${isDarkMode ? 'bg-gray-800' : 'bg-[#232323]'} sticky top-0 z-50 ${isScrolled ? 'shadow-lg' : ''}`}>
        {/* Desktop Top Navigation */}
        <div className="hidden md:flex items-center pb-[15px] justify-between border-b border-gray-400/20 container mx-auto">
          <ul className="flex gap-[40px]">
            <li className="relative">
              <div 
                className="navLink flex gap-[8px] text-white cursor-pointer" 
                onClick={toggleRestaurantList}
              >
                <MapPin color="white" size={27} />
                <span className="hidden lg:inline">Рестораны</span>
              </div>
              
              {showRestaurantList && (
                <div className={`absolute top-full left-0 mt-2 w-64 rounded-md shadow-lg z-50 p-3 ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                }`}>
                  <ul>
                    {allRestaurants.map(restaurant => (
                      <li 
                        key={restaurant.id} 
                        className={`m-2 pb-2 ${isDarkMode ? 'border-b border-gray-600' : 'border-b border-gray-200'}`}
                      >
                        <Link 
                          to={`/restaurant/${restaurant.id}`} 
                          className="hover:text-orange-500 transition"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            toggleRestaurantList();
                          }}
                        >
                          {restaurant.name} ({restaurant.address})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            <li>
              <Link to="/delivery" className={'navLink flex gap-[8px] text-white'}>
                <Truck color="white" size={27}/>
                <span className="hidden lg:inline">Доставка и оплата</span>
              </Link>
            </li>
            <li>
              <Link to="/promotions" className={'navLink flex gap-[8px] text-white'}>
                <Gift color="white" size={27} />
                <span className="hidden lg:inline">Акции и бонусы</span>
              </Link>
            </li>
          </ul>

          <div className="flex gap-[20px] lg:gap-[40px] items-center">
            <div className="hidden lg:flex items-center gap-2">
              <Phone color="white" size={20} />
              <div className="flex flex-col">
                <span className="text-[#AAA9A9] text-sm">Телефон Доставки</span>
                <a href="tel:+79370000307" className="navLink text-white">
                  +7 (937) 000-03-07
                </a>
              </div>
            </div>
            
            {toggleTheme && (
              <button 
                onClick={toggleTheme} 
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-white" />
                )}
              </button>
            )}

            <button className="px-6 lg:px-12 py-[7px] bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm whitespace-nowrap">
              Заказать Доставку
            </button>
          </div>
        </div>

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4">
          <div className="logo-nav">
            <Link to="/" className="navbar-brand">
              <img
                src="/static/img/logo-new.png"
                height="50"
                alt="Югославия Гриль"
                className="h-10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://югославия-гриль.рф/static/img/logo-new.png';
                }}
              />
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative">
              <ShoppingCart color="white" size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
            <button 
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden ${isDarkMode ? 'bg-gray-800' : 'bg-[#333]'} py-4 px-4`}>
            <ul className="flex flex-col gap-4">
              <li>
                <div 
                  className="flex items-center gap-3 text-white py-2 cursor-pointer"
                  onClick={toggleRestaurantList}
                >
                  <MapPin color="white" size={24} />
                  Рестораны
                </div>
                
                {showRestaurantList && (
                  <div className="ml-8 mt-2">
                    {allRestaurants.map(restaurant => (
                      <Link
                        key={restaurant.id}
                        to={`/restaurant/${restaurant.id}`}
                        className="block py-2 text-gray-300 hover:text-white"
                        onClick={() => {
                          setSelectedRestaurant(restaurant);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {restaurant.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
              <li>
                <Link 
                  to="/delivery" 
                  className="flex items-center gap-3 text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Truck color="white" size={24} />
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link 
                  to="/promotions" 
                  className="flex items-center gap-3 text-white py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Gift color="white" size={24} />
                  Акции и бонусы
                </Link>
              </li>
              
              <li className="border-t border-gray-600 pt-3 mt-2">
                <div className="flex items-center gap-3 text-white py-2">
                  <Phone color="white" size={24} />
                  <a href="tel:+79370000307" className="text-white">
                    +7 (937) 000-03-07
                  </a>
                </div>
              </li>
              
              {auth.user ? (
                <>
                  <li>
                    <Link 
                      to="/cabinet"
                      className="flex items-center gap-3 text-white py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CircleUserRound color="white" size={24} />
                      {auth.profile?.name || 'Личный кабинет'}
                    </Link>
                  </li>
                  {auth.isOperator && (
                    <li>
                      <button
                        onClick={handleAdminClick}
                        className="w-full text-left flex items-center gap-3 text-white py-2"
                      >
                        <span>Админ-панель</span>
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-3 text-red-400 py-2"
                    >
                      <span>Выйти</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button 
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 text-white py-2"
                  >
                    <CircleUserRound color="white" size={24} />
                    Войти
                  </button>
                </li>
              )}
              
              <li className="pt-4">
                <button 
                  className="w-full py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Заказать Доставку
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Bottom Navigation (Desktop) */}
        <div className="hidden md:flex items-center justify-between container mx-auto">
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

          <ul className="flex gap-[40px]">
            <li>
              <Link to="/search" className={'navLink flex gap-[8px] text-white'}>
                <Search color="white" size={25} />
                <span className="hidden lg:inline">Поиск</span>
              </Link>
            </li>
            {auth.user ? (
              <li className="relative group">
                <div className="navLink flex gap-[8px] text-white cursor-pointer">
                  <CircleUserRound color="white" size={25} />
                  <span className="hidden lg:inline">{auth.profile?.name || 'Аккаунт'}</span>
                </div>
                
                <div className={`absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg ${
                  isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-[#333] border border-gray-500'
                } hidden group-hover:block`}>
                  <div className="py-1">
                    <Link
                      to="/cabinet"
                      className="block px-4 py-2 text-white hover:bg-gray-600"
                    >
                      Личный кабинет
                    </Link>
                    {auth.isOperator && (
                      <button
                        onClick={handleAdminClick}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
                      >
                        Админ-панель
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li>
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className={'navLink flex gap-[8px] text-white'}
                >
                  <CircleUserRound color="white" size={25} />
                  <span className="hidden lg:inline">Войти</span>
                </button>
              </li>
            )}
            <li>
              <a onClick={() => setIsCartModalOpen(!isCartModalOpen)} className={'navLink flex gap-[8px] text-white relative'}>
                <ShoppingCart color="white" size={25} />
                <span className="hidden lg:inline">Корзина</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs">
                    {getTotalItems()}
                  </span>
                )}
              </a>
              {getTotalItems() > 0 && (
                <span className={`absolute mt-1 right-0 text-xs ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'
                } rounded-full px-2 py-0.5`}>
                  {getTotalPrice().toFixed(0)} ₽
                </span>
              )}
            </li>
          </ul>
        </div>

    

        {/* Bottom Navigation (Mobile) - Fixed at bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#232323] border-t border-gray-700 z-40">
          <ul className="flex justify-around py-3">
            <li>
              <Link to="/search" className="flex flex-col items-center text-white">
                <Search size={20} />
                <span className="text-xs mt-1">Поиск</span>
              </Link>
            </li>
            <li>
              {auth.user ? (
                <Link to="/cabinet" className="flex flex-col items-center text-white">
                  <CircleUserRound size={20} />
                  <span className="text-xs mt-1">Аккаунт</span>
                </Link>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className="flex flex-col items-center text-white"
                >
                  <CircleUserRound size={20} />
                  <span className="text-xs mt-1">Войти</span>
                </button>
              )}
            </li>
            <li>
              <a href='#'  className="flex flex-col items-center text-white relative" data-bs-toggle="modal" >
                <ShoppingCart size={20} />
                <span className="text-xs mt-1">Корзина</span>
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px]">
                    {getTotalItems()}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDarkMode={isDarkMode} />
    </>
  );
};

export default Header;