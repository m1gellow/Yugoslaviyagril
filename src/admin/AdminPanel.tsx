import React, { useState, useEffect } from 'react';
import AdminLayout from './layout/AdminLayout';
import { adminRoutes, getRouteById, getRoutesByRole } from './routes/adminRoutes';
import { useSupabase } from '../context/SupabaseContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { auth } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Устанавливаем активную вкладку на основе URL
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    const route = getRouteById(lastSegment);

    if (route) {
      setActiveTab(lastSegment);
    }
  }, [location.pathname]);

  const renderTabContent = () => {
    const route = getRouteById(activeTab);
    if (route) {
      const RouteComponent = route.component;
      return <RouteComponent />;
    }
    return <div>Выберите раздел</div>;
  };

  // Обновляем URL при изменении активной вкладки
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId}`, { replace: true });
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userRole={auth.profile?.user_role || 'operator'}
      userName={auth.profile?.name || 'Администратор'}
    >
      {renderTabContent()}
    </AdminLayout>
  );
};

export default AdminPanel;
