// components/layouts/MainLayout.tsx
import { ReactNode } from 'react';
import Header from '../Header';
import cn from 'classnames';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  isDarkMode: boolean;
  toggleTheme?: () => void;
}

const MainLayout = ({ children, isDarkMode, toggleTheme, isCartModalOpen, setIsCartModalOpen }: MainLayoutProps) => {
  return (
    <div className={cn('flex flex-col min-h-screen', {
      'bg-gray-900 text-white': isDarkMode,
      'bg-white text-gray-900': !isDarkMode
    })}>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} isCartModalOpen={isCartModalOpen} setIsCartModalOpen={setIsCartModalOpen}/>
      <main className="flex-grow">
        {children}
      </main>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default MainLayout;