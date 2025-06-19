import { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './lib/supabase'; // Предполагается, что у вас есть клиент Supabase
import TimeNotification from './components/common/TimeNotification';
import CookieConsent from './components/common/CookieConsent';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import NotFoundPage from './pages/NoFoundPage';
// Типы для пользователя и сессии
type UserSession = {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      role?: string;
    };
  };
};

const TimeNotificationWrapper = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDarkMode = document.body.classList.contains('dark-mode');

  if (isAdminRoute) return null;
  return <TimeNotification isDarkMode={isDarkMode} />;
};

// Улучшенный компонент для защищенных маршрутов админ-панели
const ProtectedAdminRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Получаем текущую сессию
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          throw error || new Error('No session found');
        }

        // Проверяем роль пользователя
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData) {
          throw userError || new Error('User data not found');
        }

        setIsAuthenticated(true);
        setHasAdminRole(userData.role === 'admin');
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setHasAdminRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Слушаем изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setHasAdminRole(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <h1>Loading...</h1>
  }

 

  if (!hasAdminRole) {
    // Перенаправляем на домашнюю страницу, если нет прав администратора
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  return <AdminPanel />;
};

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { toggleTheme, isDarkMode } = useTheme();

  useEffect(() => {
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

  if (connectionStatus === 'error') {
    return <ErrorConnectSupabase />;
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
                  <Route path='*' element={<NotFoundPage/>}/>
                </Routes>
              </MainLayout>

              <ChatButton isDarkMode={isDarkMode} />
              <CartModal />

              <PushNotification isDarkMode={isDarkMode} />
            </div>
          </CatogoryProvider>
        </CartProvider>
      </RestaurantProvider>
    </Router>
  );
}

export default App;