import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AdminThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setIsDarkMode: (isDark: boolean) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

interface AdminThemeProviderProps {
  children: ReactNode;
}

export const AdminThemeProvider: React.FC<AdminThemeProviderProps> = ({ children }) => {
  // Проверка системных предпочтений
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Пробуем получить сохраненную тему из localStorage
  const savedTheme = localStorage.getItem('adminTheme');

  // Выбираем начальное состояние темы
  const initialTheme = savedTheme ? savedTheme === 'dark' : prefersDark;

  const [isDarkMode, setIsDarkMode] = useState(initialTheme);

  // Эффект для применения темного класса к HTML элементу при изменении isDarkMode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      // Добавляем класс к body для глобального контекста темной темы
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      // Удаляем класс с body
      document.body.classList.remove('dark-mode');
    }
    // Сохраняем выбор темы в localStorage
    localStorage.setItem('adminTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Функция для переключения между темными и светлыми темами
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <AdminThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        setIsDarkMode,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
};

// Хук для использования контекста темы
export const useAdminTheme = (): AdminThemeContextType => {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within a AdminThemeProvider');
  }
  return context;
};
