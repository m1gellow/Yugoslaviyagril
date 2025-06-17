import { useState, useEffect } from 'react';
import './App.css';
import CartModal from './components/CartModal';
import TimeNotification from './components/TimeNotification';
import CookieConsent from './components/CookieConsent';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import DeliveryPage from './pages/DeliveryPage';
import UserCabinetPage from './pages/UserCabinetPage';
import RestaurantPage from './pages/RestaurantPage';
import AdminPanel from './admin/AdminPanel';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PromotionsPage from './pages/PromotionsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import PushNotification from './components/notifications/PushNotification';
import ChatButton from './components/ChatButton';
import { checkSupabaseConnection } from './lib/supabase';
import { HomePage } from './pages/HomePage';
import { useTheme } from './context/ThemeContext';
import { ErrorConnectSupabase } from './components/ErrorComponents/ErrorConnectSupabase';
import cn from 'classnames';
import MainLayout from './components/MainLayout';

// Вспомогательный компонент для определения текущего пути
const TimeNotificationWrapper = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Отображаем уведомление только если мы не на странице админа
  if (isAdminRoute) return null;

  return <TimeNotification isDarkMode={isDarkMode} />;
};

// Компонент для защищенных маршрутов админ-панели - без проверки прав доступа
const ProtectedAdminRoute = () => {
  return <AdminPanel />;
};

function App() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const {toggleTheme, isDarkMode } = useTheme();

  useEffect(() => {
    // Проверка соединения с Supabase
    const checkConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        if (result.success) {
          console.log('Supabase connection successful');
          setConnectionStatus('connected');
        } else {
          console.error('Supabase connection error:', result.message);
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  // Глобальный слушатель событий для корзины
  useEffect(() => {
    const handleCartClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[data-bs-toggle="modal"]')) {
        e.preventDefault();
        setIsCartModalOpen(true);
      }
    };

    document.addEventListener('click', handleCartClick);
    return () => document.removeEventListener('click', handleCartClick);
  }, []);

  // Показываем ошибку, если не удалось подключиться к Supabase
  if (connectionStatus === 'error') {
    <ErrorConnectSupabase />;
  }

  return (
    <Router>
      <RestaurantProvider>
        <CartProvider>
          <div className={cn(`app min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'}`)}>
            <CookieConsent isDarkMode={isDarkMode} />
            <TimeNotificationWrapper />

            {/* Кнопка чата */}
            <ChatButton isDarkMode={isDarkMode} />
            <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
              <Routes>
                <Route path="/" element={<HomePage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
                <Route path="/delivery" element={<DeliveryPage isDarkMode={isDarkMode} />} />
                <Route path="/cabinet" element={<UserCabinetPage isDarkMode={isDarkMode} />} />
                <Route path="/restaurant/:id" element={<RestaurantPage isDarkMode={isDarkMode} />} />
                <Route path="/admin/*" element={<ProtectedAdminRoute />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage isDarkMode={isDarkMode} />} />
                <Route path="/promotions" element={<PromotionsPage isDarkMode={isDarkMode} />} />
                <Route path="/knowledge-base" element={<KnowledgeBasePage isDarkMode={isDarkMode} />} />
              </Routes>
            </MainLayout>
            <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />

            {/* Компонент пуш уведомлений */}
            <PushNotification isDarkMode={isDarkMode} />
          </div>
        </CartProvider>
      </RestaurantProvider>
    </Router>
  );
}

export default App;
