// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../utils/routes';
import { useTheme } from '../context/ThemeContext';
import NoFoundImg from '../../public/static/img/noFoundImg.png'

const NotFoundPage = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <img src={NoFoundImg} alt="NoFoundImage" />
      <h2 className="text-2xl mb-6">Страница не найдена</h2>
      <p className="mb-8 text-center max-w-md px-4">
        Запрошенная страница не существует или была перемещена.
      </p>
      <Link
        to={APP_ROUTES.HOME}
        className={`px-6 py-3 rounded-full ${isDarkMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-400 hover:bg-orange-500'} text-white transition-colors`}
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;