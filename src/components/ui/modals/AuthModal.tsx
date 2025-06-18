import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignIn } from '../forms/SignIn';
import { SignUp } from '../forms/SignUp';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4 relative`}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-red-500 hover:bg-red-100 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{isSignup ? 'Регистрация' : 'Вход'}</h2>

        {isSignup ? (
          <SignUp
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            name={name}
            setName={setName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            isDarkMode={isDarkMode}
            error={error}
            setError={setError}
            success={success}
            setSuccess={setSuccess}
            loading={loading}
            setLoading={setLoading}
            onClose={onClose}
          />
        ) : (
          <SignIn
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isDarkMode={isDarkMode}
            error={error}
            setError={setError}
            success={success}
            setSuccess={setSuccess}
            loading={loading}
            setLoading={setLoading}
            onClose={onClose}
            navigate={navigate}
          />
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