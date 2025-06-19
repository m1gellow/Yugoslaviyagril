import React, { useState, useEffect, useRef } from 'react';
import { useCart, useCartInfo } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../public/static/img/MainLogo.svg';

import { useSupabase } from '../../context/SupabaseContext';
import {
  CircleUserRound,
  Moon,
  Search,
  ShoppingCart,
  Truck,
  Menu,
  X,
  MapPin,
  Gift,
  Phone,
  Sun,
  UtensilsCrossed,
} from 'lucide-react';
import { APP_ROUTES } from '../../utils/routes';

import { AuthModal, MainButton } from '../ui';

interface HeaderProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  const { toggleCartOpen } = useCart();
  const { totalItems, totalPrice } = useCartInfo();
  const { toggleRestaurantList, showRestaurantList, allRestaurants, setSelectedRestaurant } = useRestaurant();
  const { auth, signOut } = useSupabase();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isUserMenuOpen,setIsOpenUserMenu ] = useState(false)

  const restaurantListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleAdminClick = () => {
    navigate('/admin/dashboard', { replace: true });
    setIsMobileMenuOpen(false);
  };

const handleSignOut = async () => {
  setIsMobileMenuOpen(false); // Закрываем меню сразу
  
  try {
    // Быстрый выход без ожидания (если не нужен await)
    signOut().then(() => {
      window.location.href = '/'; // Жёсткий редирект
    });
    
    // ИЛИ альтернатива с мягкой перезагрузкой:
    // await signOut();
    // navigate('/', { replace: true });
    // window.location.reload();
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        restaurantListRef.current &&
        !restaurantListRef.current.contains(event.target as Node) &&
        showRestaurantList
      ) {
        toggleRestaurantList();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRestaurantList]);

  const renderDesktopTopNav = () => (
  <div className="hidden md:block border-b border-gray-400/20">
    <div className="container mx-auto">
      <div className="flex items-center py-[23px] justify-between">
        <ul className="flex gap-[40px]">
          <li className="relative">
            <div className="navLink flex gap-[8px] text-white cursor-pointer" onClick={toggleRestaurantList}>
              <UtensilsCrossed color="white" size={27} />
              <span className="hidden lg:inline">Рестораны</span>
            </div>
            {showRestaurantList && (
              <div
                ref={restaurantListRef}
                className={`absolute top-full left-0 mt-2 w-64 rounded-md shadow-lg z-50 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                {allRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="m-2 pb-2 border-b border-gray-600 last:border-b-0">
                    <Link
                      to={`/restaurant/${restaurant.id}`}
                      className={`block hover:text-orange-500 transition ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                      onClick={() => {
                        setSelectedRestaurant(restaurant);
                        toggleRestaurantList();
                      }}
                    >
                      {restaurant.name} ({restaurant.address})
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </li>
          <li>
            <Link to={APP_ROUTES.DELIVERY} className="navLink flex gap-[8px] text-white hover:text-orange-400 transition">
              <Truck color="currentColor" size={27} />
              <span className="hidden lg:inline">Доставка и оплата</span>
            </Link>
          </li>
          <li>
            <Link to={APP_ROUTES.PROMOTIONS} className="navLink flex gap-[8px] text-white hover:text-orange-400 transition">
              <Gift color="currentColor" size={27} />
              <span className="hidden lg:inline">Акции и бонусы</span>
            </Link>
          </li>
        </ul>

        <div className="flex gap-[20px] lg:gap-[40px] items-center">
          <div className="hidden lg:flex items-center gap-2">
            <Phone color="white" size={20} />
            <div className="flex flex-col">
              <span className="text-[#AAA9A9] text-sm">Телефон Доставки</span>
              <a href="tel:+79370000307" className="navLink text-white hover:text-orange-400 transition">
                +7 (919) 381-27-70
              </a>
            </div>
          </div>

          {toggleTheme && (
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
              aria-label={isDarkMode ? 'Светлая тема' : 'Темная тема'}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-white" />}
            </button>
          )}
        
          <MainButton>Заказать Доставку</MainButton>
        </div>
      </div>
    </div>
  </div>
);

  const renderMobileTopBar = () => (
    <div className="md:hidden py-[10px] flex items-center justify-between px-4">
      <Link to={APP_ROUTES.HOME}>
        <img src={Logo} alt="" />
      </Link>

      <div className="flex items-center gap-4">
        <button onClick={toggleCartOpen}>
          <ShoppingCart color="white" size={24} />
          {totalItems && (
            <span className="absolute top-3 right-12 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs">
              {totalItems}
            </span>
          )}
        </button>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </div>
  );

  const renderMobileMenu = () => (
    <div className={`md:hidden ${isDarkMode ? 'bg-gray-800' : 'bg-[#333]'} py-4 px-4`}>
      <ul className="flex flex-col gap-4">
        <li>
          <div className="flex items-center gap-3 text-white py-2 cursor-pointer" onClick={toggleRestaurantList}>
            <MapPin color="white" size={24} />
            Рестораны
          </div>
          {showRestaurantList && (
            <div className="ml-8 mt-2">
              {allRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  to={APP_ROUTES.RESTAURANT.create(restaurant.id)}
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
            to={APP_ROUTES.DELIVERY}
            className="flex items-center gap-3 text-white py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Truck color="white" size={24} />
            Доставка и оплата
          </Link>
        </li>
        <li>
          <Link
            to={APP_ROUTES.PROMOTIONS}
            className="flex items-center gap-3 text-white py-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Gift color="white" size={24} />
            Акции и бонусы
          </Link>
        </li>

        <li className="border-t border-gray-600 pt-3 mt-2">
          <a href="tel:+79370000307" className="flex items-center gap-3 text-white py-2">
            <Phone color="white" size={24} />
            +7 (937) 000-03-07
          </a>
        </li>

        {auth.user ? (
          <>
            <li>
              <Link
                to={APP_ROUTES.CABINET}
                className="flex items-center gap-3 text-white py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <CircleUserRound color="white" size={24} />
                {auth.profile?.name || 'Личный кабинет'}
              </Link>
            </li>
            {auth.isOperator && (
              <li>
                <button onClick={handleAdminClick} className="w-full text-left flex items-center gap-3 text-white py-2">
                  Админ-панель
                </button>
              </li>
            )}
            <li>
              <button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 text-red-400 py-2">
                Выйти
              </button>
            </li>
          </>
        ) : (
          <li>
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-3 text-white py-2">
              <CircleUserRound color="white" size={24} />
              Войти
            </button>
          </li>
        )}

        <li className="pt-4">
          <button className="w-full py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full">
            Заказать Доставку
          </button>
        </li>
      </ul>
    </div>
  );

  const renderDesktopBottomNav = () => (
    <div className="hidden md:flex items-center py-[23px]  justify-between container mx-auto">
      <Link to={APP_ROUTES.HOME}>
        <img src={Logo} alt="Logo" />
      </Link>

      <ul className="flex  items-center gap-[40px]">
        <li>
          <Link to={APP_ROUTES.HOME} className="navLink flex gap-[8px] text-white">
            <Search color="white" size={25} />
            <span className="hidden lg:inline">Поиск</span>
          </Link>
        </li>
        {auth.user ? (
          <li className="relative group">
            <div className="navLink flex gap-[8px] text-white cursor-pointer" onClick={() => setIsOpenUserMenu(!isUserMenuOpen)}>
              <CircleUserRound color="white" size={25} />
              <span className="hidden lg:inline">{auth.profile?.name || 'Аккаунт'}</span>
            </div>
            <div
              className={`absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-[#333]'} ${isUserMenuOpen ? "block" : 'hidden'}`}
            >
              <div className="py-1">
                <Link to={APP_ROUTES.CABINET} className="block px-4 py-2 text-white hover:bg-gray-600">
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
            <button onClick={() => setShowAuthModal(true)} className="navLink flex gap-[8px] text-white">
              <CircleUserRound color="white" size={25} />
              <span className="hidden lg:inline">Войти</span>
            </button>
          </li>
        )}
        <li>
          <button onClick={toggleCartOpen} className="navLink  flex items-center gap-[20px] text-white relative">
            {totalItems && (
              <span className="absolute hidden -top-2  right-[70px] w-5 h-5 md:flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs">
                {totalItems}
              </span>
            )}

            <ShoppingCart color="white" size={25} />

            {totalPrice && <span className="block px-[5px]   rounded-full">{totalPrice}₽</span>}
          </button>
        </li>
      </ul>
    </div>
  );

  const renderMobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#232323] border-t border-gray-700 z-40">
      <ul className="flex justify-around py-3">
        <li>
          <Link to={APP_ROUTES.HOME} className="flex flex-col items-center text-white">
            <Search size={20}/>
            <span className="text-xs mt-1">Поиск</span>
          </Link>
        </li>
        <li>
          {auth.user ? (
            <Link to={APP_ROUTES.CABINET} className="flex flex-col items-center text-white">
              <CircleUserRound size={20} />
              <span className="text-xs mt-1">Аккаунт</span>
            </Link>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex flex-col items-center text-white">
              <CircleUserRound size={20} />
              <span className="text-xs mt-1">Войти</span>
            </button>
          )}
        </li>
        <li>
          <button onClick={toggleCartOpen} className="flex flex-col items-center text-white relative">
            <ShoppingCart size={20} />
            <span className="text-xs mt-1">Корзина</span>
            {totalItems && (
              <span className="absolute top-0 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-[10px]">
                {totalItems}
              </span>
            )}
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <nav
        ref={navRef}
        className={`w-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-[#232323]'} sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          isScrolled ? 'shadow-lg' : ''
        } ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {renderDesktopTopNav()}
        {renderDesktopBottomNav()}

        {renderMobileTopBar()}
        {isMobileMenuOpen && renderMobileMenu()}
      </nav>
      {renderMobileBottomNav()}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDarkMode={isDarkMode} />
    </>
  );
};

export default Header;
