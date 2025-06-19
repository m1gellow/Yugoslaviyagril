// components/layouts/MainLayout.tsx
import { ReactNode } from 'react';
import Header from './Header';
import cn from 'classnames';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
  isDarkMode: boolean;
  toggleTheme?: () => void;
}

const MainLayout = ({ children, isDarkMode, toggleTheme }: MainLayoutProps) => {
  const location = useLocation();

  return (
    <div
      className={cn('flex flex-col min-h-screen', {
        'bg-gray-900 text-white': isDarkMode,
        'bg-white text-gray-900': !isDarkMode,
      })}
    >
      {!location.pathname.startsWith('/admin') && <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}

      <main className="flex-grow">{children}</main>
      {!location.pathname.startsWith('/admin/') && <Footer isDarkMode={isDarkMode} />}
    </div>
  );
};

export default MainLayout;
