import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CookieConsentProps {
  isDarkMode?: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже показано уведомление
    const consentAccepted = localStorage.getItem('cookieConsent');

    if (!consentAccepted) {
      // Показываем после небольшой задержки для лучшего UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800 text-white border-t border-gray-700' : 'bg-white border-t border-gray-200'} shadow-lg z-50`}
    >
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-start mb-4 sm:mb-0 sm:mr-4">
            <Cookie
              className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3 flex-shrink-0 mt-1`}
            />
            <div>
              <h3 className="text-sm font-medium">Мы используем cookies</h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Продолжая использовать сайт, вы соглашаетесь с использованием cookies и обработкой персональных данных в
                соответствии с{' '}
                <Link to="/privacy-policy" className="text-orange-500 hover:underline">
                  политикой конфиденциальности
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex">
            <button
              onClick={handleClose}
              className={`mr-2 px-3 py-1.5 border ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'} rounded`}
            >
              Закрыть
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded text-sm"
            >
              Принять
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
