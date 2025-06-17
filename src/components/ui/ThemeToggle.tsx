import React, { useState } from 'react';
import { Sun, Moon, Settings } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  useSystemTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme, isSystemTheme, useSystemTheme }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-white text-gray-700'
        }`}
      >
        <Settings className="w-6 h-6" />
      </button>

      {showOptions && (
        <div
          className={`absolute bottom-14 right-0 w-64 p-3 rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
        >
          <div className="mb-2 pb-2 border-b border-gray-200">
            <p className="text-sm font-medium">Настройки темы</p>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => {
                toggleTheme();
                setShowOptions(false);
              }}
              className={`flex items-center p-2 rounded-md ${
                isDarkMode && !isSystemTheme ? 'bg-gray-700' : !isDarkMode && !isSystemTheme ? 'bg-gray-100' : ''
              }`}
            >
              {isDarkMode ? (
                <>
                  <Moon className="w-5 h-5 mr-2 text-blue-400" />
                  <span>Темная тема</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                  <span>Светлая тема</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                useSystemTheme();
                setShowOptions(false);
              }}
              className={`flex items-center p-2 rounded-md ${isSystemTheme ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
            >
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <span>Системная тема</span>
            </button>
          </div>

          <div className="mt-2 pt-2 text-xs text-gray-500 border-t border-gray-200">
            <p>Системная тема автоматически переключается на темную с 20:00 до 8:00</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
