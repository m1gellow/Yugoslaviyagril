import React from 'react';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Gift,
  MessageCircle,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface FooterProps {
  isDarkMode?: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  const { selectedRestaurant } = useRestaurant();
  const { getTotalItems } = useCart();

  return (
    <footer
      className={`${isDarkMode ? 'bg-gray-800 text-white border-t border-gray-700' : 'bg-white text-gray-800 border-t border-gray-200'} py-8 mt-12`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and About */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="mb-4 flex items-center">
              <img src="https://югославия-гриль.рф/static/img/logo-new.png" alt="Югославия Гриль" className="h-16" />
            </Link>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm text-center md:text-left`}>
              Настоящая сербская кухня в Екатеринбурге. Блюда на гриле, бургеры и традиционные балканские рецепты.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className={`${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className={`${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <a
                  href={`tel:+7 (937) 000-03-07`}
                  className={`${isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'} transition`}
                >
                  +7 (937) 000-03-07
                </a>
              </li>
              <li className="flex items-center">
                <Mail className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <a
                  href="mailto:info@yugoslavia-grill.ru"
                  className={`${isDarkMode ? 'text-gray-300 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'} transition`}
                >
                  info@yugoslavia-grill.ru
                </a>
              </li>
              <li className="flex items-center">
                <Clock className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ежедневно 11:00 – 22:00</span>
              </li>
            </ul>
          </div>

          {/* Addresses */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Наши рестораны</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Волгоградская, 178</span>
              </li>
              <li className="flex items-center">
                <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Фронтовых бригад, 33А</span>
              </li>
              <li className="flex items-center">
                <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ясная, 6</span>
              </li>
              <li className="flex items-center">
                <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Белинского, 200</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col md:flex-row justify-between items-center`}
        >
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-4 md:mb-0`}>
            © 2023-2025 Югославия Гриль. Все права защищены.
          </p>
          <div className="flex items-center space-x-4 flex-wrap justify-center">
            <Link
              to="/delivery"
              className={`${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
            >
              Доставка и оплата
            </Link>
            <Link
              to="/cabinet"
              className={`${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
            >
              Личный кабинет
            </Link>
            <Link
              to="/promotions"
              className={`flex items-center ${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
            >
              <Gift className="w-4 h-4 mr-1" />
              Акции и бонусы
            </Link>
            <Link
              to="/knowledge-base"
              className={`flex items-center ${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              База знаний
            </Link>
            <Link
              to="/privacy-policy"
              className={`${isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'} transition`}
            >
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky cart button for mobile */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className={`cart-sticky flex items-center justify-center w-14 h-14 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-full shadow-lg`}
        >
          <a href="#" data-bs-toggle="modal" data-bs-target="#cartModal" className="relative">
            <ShoppingBag className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
            <span className="cart-count absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs">
              {getTotalItems()}
            </span>
          </a>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
