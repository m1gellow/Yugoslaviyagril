import { Mail, Lock, Phone, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SignUpProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  isDarkMode: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (success: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onClose: () => void;
}

export const SignUp = ({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  phoneNumber,
  setPhoneNumber,
  isDarkMode,
  error,
  setError,
  success,
  setSuccess,
  loading,
  setLoading,
  onClose,
}: SignUpProps) => {
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!email.includes('@')) {
        setError('Пожалуйста, введите корректный email');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Пароль должен содержать не менее 6 символов');
        setLoading(false);
        return;
      }

      console.log({name, email, password, phoneNumber})

       const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone: phoneNumber,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess('Регистрация прошла успешно! Пожалуйста, проверьте вашу электронную почту для подтверждения.');
      setTimeout(() => onClose(), 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message.includes('already registered')) {
        setError('Этот email уже зарегистрирован. Попробуйте войти.');
      } else {
        setError(err.message || 'Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>{success}</div>
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="name"
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
        >
          Имя и фамилия
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`pl-10 w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
            }`}
            placeholder="Иван Петров"
            required
            autoComplete="name"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="email"
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 required`}
        >
          Email
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            id="email"
            className={`pl-10 w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
            }`}
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="password"
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 required`}
        >
          Пароль
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            id="password"
            className={`pl-10 w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
            }`}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Минимум 6 символов</p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="phone"
          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
        >
          Телефон
        </label>
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            id="phone"
            className={`pl-10 w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
            }`}
            placeholder="+7 (999) 999-99-99"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-medium mt-2 relative overflow-hidden"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Загрузка...
          </span>
        ) : (
          'Зарегистрироваться'
        )}
      </button>
    </form>
  );
};
