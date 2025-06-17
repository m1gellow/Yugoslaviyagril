import React from 'react';
import { adminRoutes } from '../routes/adminRoutes';

export const getTabComponent = (activeTab: string): React.ReactNode => {
  const route = adminRoutes.find(route => route.id === activeTab);
  if (route) {
    const Component = route.component;
    return <Component />;
  }
  return <div>Выберите раздел</div>;
};

export const getTabTitle = (activeTab: string): string => {
  const route = adminRoutes.find(route => route.id === activeTab);
  return route ? route.title : 'Админ панель';
};