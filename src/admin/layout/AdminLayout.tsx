import React, { ReactNode } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import { AdminThemeProvider } from '../context/AdminThemeContext';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: 'admin' | 'manager' | 'operator' | 'user';
  userName: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  userRole,
  userName,
}) => {
  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex h-screen overflow-hidden">
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userRole={userRole}
            userName={userName}
          />

          <main className="flex-1 relative overflow-y-auto focus:outline-none p-4">{children}</main>
        </div>
      </div>
    </AdminThemeProvider>
  );
};

export default AdminLayout;
