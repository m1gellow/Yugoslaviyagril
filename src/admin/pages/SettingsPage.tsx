import React, { useState } from 'react';
import { Save, Moon, Sun, Bell, Shield, Key, Clock, Globe, Database, Server } from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';

const SettingsPage: React.FC = () => {
  const { isDarkMode, setIsDarkMode } = useAdminTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [timezone, setTimezone] = useState('Europe/Moscow');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Имитация сохранения настроек
    setTimeout(() => {
      setIsSaving(false);
      alert('Настройки сохранены');
    }, 800);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Настройки</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Управление настройками админ-панели и уведомлениями</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Боковая навигация */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-medium dark:text-white">Разделы настроек</h3>
            </div>
            <nav className="p-2">
              <button className="w-full flex items-center p-3 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                <Sun className="w-5 h-5 mr-3" />
                <span>Внешний вид</span>
              </button>
              <button className="w-full flex items-center p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1">
                <Bell className="w-5 h-5 mr-3" />
                <span>Уведомления</span>
              </button>
              <button className="w-full flex items-center p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1">
                <Shield className="w-5 h-5 mr-3" />
                <span>Безопасность</span>
              </button>
              <button className="w-full flex items-center p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1">
                <Globe className="w-5 h-5 mr-3" />
                <span>Язык и регион</span>
              </button>
              <button className="w-full flex items-center p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1">
                <Database className="w-5 h-5 mr-3" />
                <span>База данных</span>
              </button>
              <button className="w-full flex items-center p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mt-1">
                <Server className="w-5 h-5 mr-3" />
                <span>Интеграции</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Основной контент настроек */}
        <div className="md:col-span-2 space-y-6">
          {/* Настройки внешнего вида */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white flex items-center">
              <Sun className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
              Внешний вид
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-3 dark:text-gray-300">Темная тема</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isDarkMode}
                      onChange={() => setIsDarkMode(!isDarkMode)}
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${isDarkMode ? 'bg-orange-500' : 'bg-gray-300'}`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        isDarkMode ? 'transform translate-x-6' : ''
                      }`}
                    ></div>
                  </div>
                </label>
                <div className="flex items-center space-x-2">
                  <Moon className={`w-5 h-5 ${isDarkMode ? 'text-yellow-300' : 'text-gray-400'}`} />
                  <Sun className={`w-5 h-5 ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Основной цвет</label>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 cursor-pointer ring-2 ring-offset-2 ring-orange-500"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Настройки уведомлений */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white flex items-center">
              <Bell className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
              Уведомления
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-3 dark:text-gray-300">Включить уведомления</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={notificationsEnabled}
                      onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${notificationsEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        notificationsEnabled ? 'transform translate-x-6' : ''
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-3 dark:text-gray-300">Email-уведомления</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                      disabled={!notificationsEnabled}
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${
                        !notificationsEnabled
                          ? 'bg-gray-200 dark:bg-gray-600'
                          : emailNotifications
                            ? 'bg-orange-500'
                            : 'bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        emailNotifications && notificationsEnabled ? 'transform translate-x-6' : ''
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-3 dark:text-gray-300">Push-уведомления</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                      disabled={!notificationsEnabled}
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${
                        !notificationsEnabled
                          ? 'bg-gray-200 dark:bg-gray-600'
                          : pushNotifications
                            ? 'bg-orange-500'
                            : 'bg-gray-300'
                      }`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        pushNotifications && notificationsEnabled ? 'transform translate-x-6' : ''
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Настройки региональных параметров */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white flex items-center">
              <Globe className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
              Язык и регион
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Язык интерфейса
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="sr">Српски</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Часовой пояс</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="Europe/Moscow">Москва (GMT+3)</option>
                  <option value="Europe/Kaliningrad">Калининград (GMT+2)</option>
                  <option value="Europe/Samara">Самара (GMT+4)</option>
                  <option value="Asia/Yekaterinburg">Екатеринбург (GMT+5)</option>
                  <option value="Europe/Belgrade">Белград (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Кнопка сохранения настроек */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`px-6 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 flex items-center ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить настройки
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
