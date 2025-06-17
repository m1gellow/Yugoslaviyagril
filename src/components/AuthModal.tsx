import React, { useState, useEffect } from 'react';
import { X, Phone, MessageCircle, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isDarkMode = false }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const { signIn } = useSupabase();

  // Сбрасываем состояние при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setLoginAttempts(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (verificationMethod === 'email') {
        console.log('Attempting to sign in with email:', email);

        // Проверка на слишком много попыток входа
        if (loginAttempts >= 5) {
          setError('Слишком много попыток входа. Пожалуйста, попробуйте позже.');
          setLoading(false);
          return;
        }

        // Увеличиваем счетчик попыток
        setLoginAttempts((prev) => prev + 1);

        // Проверка валидации полей
        if (!email.includes('@') || password.length < 6) {
          setError('Пожалуйста, введите корректный email и пароль не менее 6 символов');
          setLoading(false);
          return;
        }

        // Используем контекстную функцию для входа с повторными попытками
        try {
          const { redirectToAdmin } = await signIn(email, password);

          console.log('Sign in successful, redirect to admin:', redirectToAdmin);

          setSuccess('Вход выполнен успешно!');

          // Закрываем модальное окно и перезагружаем страницу (или перенаправляем пользователя)
          setTimeout(() => {
            onClose();

            // Если пользователь сотрудник, перенаправляем в админ-панель
            if (redirectToAdmin) {
              console.log('Redirecting to admin panel');
              navigate('/admin');
            } else {
              // Для обычных пользователей закрываем модальное окно без перезагрузки
              console.log('Closing modal for regular user');
            }
          }, 1000);
        } catch (authError) {
          console.error('Authentication error:', authError);
          throw authError;
        }
      } else {
        // Вход по телефону - в реальном приложении здесь будет логика OTP
        setError('Вход по телефону временно недоступен');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Неверный email или пароль');
      } else if (err.message.includes('Too many requests')) {
        setError('Слишком много запросов. Пожалуйста, попробуйте позже.');
      } else {
        setError(err.message || 'Ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Базовые проверки валидации
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

      // Регистрация по email и паролю с повторными попытками
      let retryCount = 0;
      let success = false;
      let lastError = null;

      while (retryCount < 3 && !success) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                phone: phoneNumber,
              },
            },
          });

          if (error) throw error;
          success = true;
        } catch (err: any) {
          lastError = err;
          retryCount++;
          // Небольшая пауза между попытками
          if (retryCount < 3) await new Promise((r) => setTimeout(r, 1000));
        }
      }

      if (!success && lastError) {
        throw lastError;
      }

      setSuccess('Регистрация прошла успешно! Пожалуйста, проверьте вашу электронную почту для подтверждения.');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message.includes('already registered')) {
        setError('Этот email уже зарегистрирован. Попробуйте войти.');
      } else if (err.message.includes('invalid email')) {
        setError('Указан некорректный email адрес.');
      } else {
        setError(err.message || 'Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (verificationMethod === 'email') {
        // Проверяем формат email
        if (!email.includes('@')) {
          setError('Пожалуйста, введите корректный email');
          setLoading(false);
          return;
        }

        // Отправка письма со ссылкой для сброса пароля
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });

        if (error) throw error;

        setSuccess('Ссылка для сброса пароля отправлена на ваш email');
        setCodeSent(true);
      } else {
        // Отправка SMS с кодом - в реальном приложении здесь будет логика OTP
        setError('Отправка SMS-кодов временно недоступна');
      }
    } catch (err: any) {
      if (err.message.includes('rate limit')) {
        setError('Слишком много запросов. Пожалуйста, попробуйте позже.');
      } else {
        setError(err.message || 'Ошибка при отправке кода');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4 relative`}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-red-500 hover:bg-red-100 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{isSignup ? 'Регистрация' : 'Вход'}</h2>

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

        {!codeSent ? (
          <form onSubmit={isSignup ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignup && (
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                >
                  Имя и фамилия
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-2 border rounded focus:ring-orange-500 focus:border-orange-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                  }`}
                  placeholder="Иван Петров"
                  required={isSignup}
                  autoComplete="name"
                />
              </div>
            )}

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
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Минимум 6 символов</p>
            </div>

            {isSignup && (
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
            )}

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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Загрузка...
                </span>
              ) : isSignup ? (
                'Зарегистрироваться'
              ) : (
                'Войти'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="mb-6 text-center">
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Проверьте вашу электронную почту для завершения процесса.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-medium"
            >
              Закрыть
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
              setSuccess(null);
            }}
            className={`text-sm ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'}`}
          >
            {isSignup ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>

          {!isSignup && !codeSent && (
            <button
              onClick={handleRequestCode}
              className={`block mx-auto text-sm mt-2 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
            >
              Забыли пароль?
            </button>
          )}
        </div>

        <p className={`mt-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
          Выбирая способ авторизации, вы соглашаетесь с
          <a href="/privacy-policy" className="text-orange-500 hover:underline">
            {' '}
            политикой конфиденциальности
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
