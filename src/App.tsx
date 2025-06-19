import { useState, useEffect } from 'react';
import './App.css';

import TimeNotification from './components/common/TimeNotification';
import CookieConsent from './components/common/CookieConsent';
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
import ChatButton from './components/chat/ChatButton';
import { checkSupabaseConnection } from './lib/supabase';
import { HomePage } from './pages/HomePage';
import { useTheme } from './context/ThemeContext';
import { ErrorConnectSupabase } from './components/ErrorComponents/ErrorConnectSupabase';
import MainLayout from './components/layout/MainLayout';
import { APP_ROUTES } from './utils/routes';
import { CartModal } from './components/ui';
import { CatogoryProvider } from './context/CategoryContext';

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
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { toggleTheme, isDarkMode } = useTheme();

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

  // Показываем ошибку, если не удалось подключиться к Supabase
  if (connectionStatus === 'error') {
    <ErrorConnectSupabase />;
  }

  return (
    <Router>
      <RestaurantProvider>
        <CartProvider>
          <CatogoryProvider>
            <div className="app min-h-screen">
              <CookieConsent isDarkMode={isDarkMode} />
              <TimeNotificationWrapper />

              <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                <Routes>
                  <Route path={APP_ROUTES.HOME} element={<HomePage isDarkMode={isDarkMode} />} />
                  <Route path={APP_ROUTES.DELIVERY} element={<DeliveryPage isDarkMode={isDarkMode} />} />
                  <Route path={APP_ROUTES.CABINET} element={<UserCabinetPage isDarkMode={isDarkMode} />} />
                  <Route path={APP_ROUTES.RESTAURANT.pattern} element={<RestaurantPage isDarkMode={isDarkMode} />} />
                  <Route path={APP_ROUTES.ADMIN} element={<ProtectedAdminRoute />} />
                  <Route path={APP_ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage isDarkMode={isDarkMode} />} />
                  <Route path={APP_ROUTES.PROMOTIONS} element={<PromotionsPage isDarkMode={isDarkMode} />} />
                  <Route path={APP_ROUTES.KNOWLEDGE_BASE} element={<KnowledgeBasePage isDarkMode={isDarkMode} />} />
                </Routes>
              </MainLayout>

              <ChatButton isDarkMode={isDarkMode} />
              <CartModal />

              {/* Компонент пуш уведомлений */}
              <PushNotification isDarkMode={isDarkMode} />
            </div>
          </CatogoryProvider>
        </CartProvider>
      </RestaurantProvider>
    </Router>
  );
}

export default App;
