import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Calendar,
  Clock as ClockIcon,
  Phone,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';

const ChatPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'active' | 'all' | 'resolved' | 'closed'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chatStats, setChatStats] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Загружаем сессии чата
  useEffect(() => {
    fetchChatSessions();
    fetchChatStats();

    // Подписываемся на обновления чат-сессий
    try {
      const subscription = supabase
        .channel('chat_activity')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_sessions',
          },
          (payload) => {
            fetchChatSessions();
            fetchChatStats();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Ошибка при подписке на обновления чат-сессий:', error);
      // Не блокируем работу компонента из-за ошибки подписки
    }
  }, [statusFilter]);

  // Подписка на обновления сообщений текущей сессии
  useEffect(() => {
    if (selectedSession) {
      fetchChatMessages(selectedSession.id);

      // Подписываемся на новые сообщения для текущей сессии
      try {
        const subscription = supabase
          .channel(`chat_messages_${selectedSession.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `session_id=eq.${selectedSession.id}`,
            },
            (payload) => {
              if (payload.new) {
                setChatMessages((prevMessages) => [...prevMessages, payload.new]);

                // Прокручиваем к последнему сообщению
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            },
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Ошибка при подписке на обновления сообщений:', error);
        // Не блокируем работу компонента из-за ошибки подписки
      }
    }
  }, [selectedSession]);

  // Прокручиваем к последнему сообщению при получении новых сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Загрузка сессий чата с обработкой ошибок
  const fetchChatSessions = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Строим запрос с учетом фильтра
      let query = supabase.from('chat_sessions').select('*').order('last_message_at', { ascending: false });

      // Получаем сначала сами сессии без связанных данных
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: sessionsData, error: sessionsError } = await query;

      if (sessionsError) {
        throw sessionsError;
      }

      // Для каждой сессии отдельно получаем связанные данные
      const sessionsWithDetails = await Promise.all(
        (sessionsData || []).map(async (session) => {
          try {
            // Получаем данные пользователя, если есть user_id
            let userData = null;
            if (session.user_id) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('name, email, user_role')
                .eq('id', session.user_id)
                .single();

              if (!userError && user) {
                userData = user;
              }
            }

            // Получаем данные ресторана, если есть restaurant_id
            let restaurantData = null;
            if (session.restaurant_id) {
              const { data: restaurant, error: restaurantError } = await supabase
                .from('restaurants')
                .select('name, address')
                .eq('id', session.restaurant_id)
                .single();

              if (!restaurantError && restaurant) {
                restaurantData = restaurant;
              }
            }

            // Получаем количество непрочитанных сообщений
            const { count, error: countError } = await supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)
              .eq('is_read', false)
              .eq('sender_type', 'user');

            const unreadMessagesCount = countError ? 0 : count || 0;

            return {
              ...session,
              user: userData,
              restaurant: restaurantData,
              unreadCount: unreadMessagesCount,
            };
          } catch (error) {
            console.error(`Ошибка при получении данных для сессии ${session.id}:`, error);
            // Возвращаем сессию без дополнительных данных в случае ошибки
            return session;
          }
        }),
      );

      setChatSessions(sessionsWithDetails || []);

      // Считаем количество непрочитанных сообщений
      let unread = 0;
      for (const session of sessionsWithDetails || []) {
        unread += session.unreadCount || 0;
      }

      setUnreadCount(unread);

      // Если ранее был выбран чат, обновляем его данные
      if (selectedSession) {
        const updatedSession = sessionsWithDetails?.find((s) => s.id === selectedSession.id);
        if (updatedSession) {
          setSelectedSession(updatedSession);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке сессий чата:', error);
      setErrorMessage('Не удалось загрузить сессии чата. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка статистики чата
  const fetchChatStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_chat_stats');

      if (error) {
        console.error('Ошибка при загрузке статистики чата:', error);
        return;
      }

      setChatStats(data);
    } catch (error) {
      console.error('Ошибка при загрузке статистики чата:', error);
      // Не показываем ошибку пользователю, т.к. это не критично
    }
  };

  // Загрузка сообщений для выбранной сессии
  const fetchChatMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setChatMessages(data || []);

      // Отмечаем все сообщения как прочитанные
      await markMessagesAsRead(sessionId);

      // Обновляем счетчик непрочитанных
      fetchChatSessions();
    } catch (error) {
      console.error('Ошибка при загрузке сообщений чата:', error);
      // Показываем ошибку внутри области чата
      setChatMessages([
        {
          id: 'error',
          sender_type: 'system',
          content: 'Не удалось загрузить сообщения. Пожалуйста, попробуйте позже.',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  // Отметка сообщений как прочитанные
  const markMessagesAsRead = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('session_id', sessionId)
        .eq('sender_type', 'user')
        .eq('is_read', false);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Ошибка при отметке сообщений как прочитанные:', error);
      // Не критичная ошибка, можно продолжить работу
    }
  };

  // Отправка нового сообщения
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    try {
      // Определяем тип отправителя на основе роли пользователя
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userError) {
        console.error('Ошибка при получении роли пользователя:', userError);
        // Используем роль "operator" по умолчанию в случае ошибки
        const senderType = 'operator';
        await sendChatMessage(senderType);
        return;
      }

      const senderType =
        userData?.user_role === 'admin' ? 'admin' : userData?.user_role === 'manager' ? 'manager' : 'operator';

      await sendChatMessage(senderType);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      alert('Не удалось отправить сообщение. Попробуйте позже.');
    }
  };

  // Вспомогательная функция для отправки сообщения
  const sendChatMessage = async (senderType: string) => {
    try {
      // Отправляем сообщение
      const { data, error } = await supabase.from('chat_messages').insert({
        session_id: selectedSession.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        sender_type: senderType,
        content: newMessage,
        is_read: true,
      });

      if (error) {
        throw error;
      }

      // Обновляем время последнего сообщения в сессии
      await supabase
        .from('chat_sessions')
        .update({
          last_message_at: new Date().toISOString(),
          status: 'active', // Убеждаемся, что сессия активна
        })
        .eq('id', selectedSession.id);

      // Очищаем поле ввода
      setNewMessage('');
    } catch (error) {
      throw error;
    }
  };

  // Изменение статуса сессии
  const handleChangeStatus = async (sessionId: string, newStatus: 'active' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      // Добавляем системное сообщение о смене статуса
      const statusMessages = {
        resolved: 'Оператор отметил обращение как решенное.',
        closed: 'Оператор закрыл обращение.',
        active: 'Оператор возобновил обращение.',
      };

      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        sender_type: 'system',
        content: statusMessages[newStatus],
        is_read: true,
      });

      // Обновляем данные
      fetchChatSessions();
      if (selectedSession?.id === sessionId) {
        fetchChatMessages(sessionId);
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса сессии:', error);
      alert('Не удалось изменить статус. Попробуйте позже.');
    }
  };

  // Форматируем дату и время
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  // Обновление данных
  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      fetchChatSessions(),
      fetchChatStats(),
      selectedSession && fetchChatMessages(selectedSession.id),
    ]).finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    });
  };

  // Фильтрация сессий по поисковому запросу
  const filteredSessions = chatSessions.filter((session) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      session.name.toLowerCase().includes(searchLower) ||
      (session.email && session.email.toLowerCase().includes(searchLower)) ||
      session.topic.toLowerCase().includes(searchLower) ||
      (session.user && session.user.name && session.user.name.toLowerCase().includes(searchLower))
    );
  });

  // Обработка нажатия Enter при вводе сообщения
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Чат с клиентами</h2>
        <div className="flex space-x-2">
          <div
            className={`px-3 py-1 rounded-lg text-sm flex items-center ${
              isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>Активных чатов: {chatStats?.active_sessions || 0}</span>
          </div>
          <div
            className={`px-3 py-1 rounded-lg text-sm flex items-center ${
              isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
            }`}
          >
            <Info className="w-4 h-4 mr-1" />
            <span>Непрочитано: {unreadCount}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className={`mb-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {errorMessage}
          <button onClick={handleRefresh} className="ml-3 underline">
            Попробовать снова
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Список сессий */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
          <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Поиск по имени, email или теме..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md ${
                  isDarkMode ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    statusFilter === 'all'
                      ? isDarkMode
                        ? 'bg-gray-600'
                        : 'bg-gray-200'
                      : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  Все
                </button>
                <button
                  className={`px-2.5 py-1 text-xs rounded-md flex items-center ${
                    statusFilter === 'active'
                      ? 'bg-orange-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                  onClick={() => setStatusFilter('active')}
                >
                  {statusFilter === 'active' && <MessageCircle className="w-3 h-3 mr-1" />}
                  Активные
                </button>
                <button
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    statusFilter === 'resolved'
                      ? 'bg-green-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                  onClick={() => setStatusFilter('resolved')}
                >
                  Решенные
                </button>
                <button
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    statusFilter === 'closed'
                      ? 'bg-gray-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                  onClick={() => setStatusFilter('closed')}
                >
                  Закрытые
                </button>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-1 rounded text-sm ${
                  isRefreshing
                    ? isDarkMode
                      ? 'text-blue-400 animate-spin'
                      : 'text-blue-500 animate-spin'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-blue-400'
                      : 'text-gray-500 hover:text-blue-500'
                }`}
                title="Обновить"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'Чаты не найдены. Попробуйте изменить поисковый запрос.'
                    : statusFilter === 'active'
                      ? 'Нет активных чатов'
                      : statusFilter === 'resolved'
                        ? 'Нет решенных чатов'
                        : statusFilter === 'closed'
                          ? 'Нет закрытых чатов'
                          : 'Нет чатов'}
                </p>
              </div>
            ) : (
              <div>
                {filteredSessions.map((session) => {
                  // Проверяем наличие непрочитанных сообщений
                  const hasUnreadMessages = session.unreadCount && session.unreadCount > 0;

                  return (
                    <div
                      key={session.id}
                      className={`p-3 cursor-pointer border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedSession?.id === session.id ? (isDarkMode ? 'bg-gray-700' : 'bg-orange-50') : ''
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium dark:text-white">{session.name}</span>
                            <span
                              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                session.status === 'active'
                                  ? isDarkMode
                                    ? 'bg-orange-900/30 text-orange-300'
                                    : 'bg-orange-100 text-orange-800'
                                  : session.status === 'resolved'
                                    ? isDarkMode
                                      ? 'bg-green-900/30 text-green-300'
                                      : 'bg-green-100 text-green-800'
                                    : isDarkMode
                                      ? 'bg-gray-900/30 text-gray-300'
                                      : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {session.status === 'active'
                                ? 'Активен'
                                : session.status === 'resolved'
                                  ? 'Решен'
                                  : 'Закрыт'}
                            </span>
                            {hasUnreadMessages && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Тема: {session.topic}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDateTime(session.last_message_at).time}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {session.user?.name || session.name}{' '}
                          {session.user?.user_role ? `(${session.user.user_role})` : ''}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(session.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Область чата */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
          {!selectedSession ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium dark:text-white">
                {isLoading ? 'Загрузка чатов...' : 'Выберите чат слева'}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {isLoading ? 'Пожалуйста, подождите...' : 'Для начала диалога выберите чат из списка'}
              </p>
            </div>
          ) : (
            <>
              {/* Заголовок чата */}
              <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium dark:text-white">{selectedSession.name}</h3>
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        selectedSession.status === 'active'
                          ? isDarkMode
                            ? 'bg-orange-900/30 text-orange-300'
                            : 'bg-orange-100 text-orange-800'
                          : selectedSession.status === 'resolved'
                            ? isDarkMode
                              ? 'bg-green-900/30 text-green-300'
                              : 'bg-green-100 text-green-800'
                            : isDarkMode
                              ? 'bg-gray-900/30 text-gray-300'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedSession.status === 'active'
                        ? 'Активен'
                        : selectedSession.status === 'resolved'
                          ? 'Решен'
                          : 'Закрыт'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Тема: {selectedSession.topic}</div>
                </div>
                <div className="flex space-x-2">
                  {selectedSession.status === 'active' ? (
                    <>
                      <button
                        onClick={() => handleChangeStatus(selectedSession.id, 'resolved')}
                        className={`px-2 py-1 text-xs rounded flex items-center ${
                          isDarkMode
                            ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Решено
                      </button>
                      <button
                        onClick={() => handleChangeStatus(selectedSession.id, 'closed')}
                        className={`px-2 py-1 text-xs rounded flex items-center ${
                          isDarkMode
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Закрыть
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleChangeStatus(selectedSession.id, 'active')}
                      className={`px-2 py-1 text-xs rounded flex items-center ${
                        isDarkMode
                          ? 'bg-orange-900/30 text-orange-400 hover:bg-orange-900/50'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                      }`}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Возобновить
                    </button>
                  )}
                </div>
              </div>

              {/* Сообщения */}
              <div className="p-3 overflow-y-auto flex-1 bg-gray-100 dark:bg-gray-900">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Сообщений пока нет</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_type === 'user'
                              ? isDarkMode
                                ? 'bg-blue-900/30 text-white'
                                : 'bg-blue-100 text-gray-800'
                              : message.sender_type === 'system'
                                ? isDarkMode
                                  ? 'bg-gray-700 text-gray-300'
                                  : 'bg-gray-200 text-gray-800'
                                : isDarkMode
                                  ? 'bg-orange-900/30 text-white'
                                  : 'bg-orange-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            <span
                              className={`text-xs font-medium ${
                                message.sender_type === 'user'
                                  ? isDarkMode
                                    ? 'text-blue-300'
                                    : 'text-blue-800'
                                  : message.sender_type === 'system'
                                    ? isDarkMode
                                      ? 'text-gray-400'
                                      : 'text-gray-600'
                                    : isDarkMode
                                      ? 'text-orange-300'
                                      : 'text-orange-800'
                              }`}
                            >
                              {message.sender_type === 'user'
                                ? 'Клиент'
                                : message.sender_type === 'system'
                                  ? 'Система'
                                  : message.sender_type === 'admin'
                                    ? 'Администратор'
                                    : message.sender_type === 'manager'
                                      ? 'Менеджер'
                                      : 'Оператор'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {formatDateTime(message.created_at).time}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Форма ввода сообщения */}
              <div className="p-3 border-t dark:border-gray-700">
                <div className="flex">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите сообщение..."
                    className={`flex-1 p-2 border rounded-l-md ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                    } resize-none`}
                    rows={3}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || selectedSession.status !== 'active'}
                    className={`px-4 ${
                      !newMessage.trim() || selectedSession.status !== 'active'
                        ? isDarkMode
                          ? 'bg-gray-600 text-gray-400'
                          : 'bg-gray-200 text-gray-500'
                        : isDarkMode
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                    } rounded-r-md`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {selectedSession.status !== 'active' && (
                  <p className="mt-2 text-sm text-red-500 text-center">
                    Чат {selectedSession.status === 'resolved' ? 'решен' : 'закрыт'}. Чтобы отправить сообщение, нажмите
                    "Возобновить".
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Дополнительная информация и статистика */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="font-medium mb-3 dark:text-white flex items-center">
            <MessageCircle className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2" />
            Статистика чатов
          </h3>

          {chatStats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Всего сессий</p>
                <p className="text-2xl font-bold dark:text-white">{chatStats.total_sessions}</p>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Активные</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chatStats.active_sessions}</p>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Решенные</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{chatStats.resolved_sessions}</p>
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">Закрытые</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{chatStats.closed_sessions}</p>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:col-span-2">
          <h3 className="font-medium mb-3 dark:text-white flex items-center">
            <AlignLeft className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2" />
            Инструкция по работе с чатом
          </h3>

          <div className="text-sm space-y-2 dark:text-gray-300">
            <p>1. Выберите чат из списка слева, чтобы просмотреть сообщения и ответить клиенту.</p>
            <p>2. После ответа на вопрос клиента отметьте чат как "Решенный".</p>
            <p>3. Если клиент не отвечает в течение 24 часов, вы можете закрыть чат.</p>
            <p>4. Среднее время ответа на сообщение клиента не должно превышать 15 минут в рабочее время.</p>
            <p>5. При получении нового сообщения от клиента вы увидите красный индикатор непрочитанного сообщения.</p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRefresh}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить данные
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Добавляем недостающие компоненты
const RefreshCw = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const AlignLeft = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="3" x2="21" y1="6" y2="6" />
    <line x1="3" x2="13" y1="12" y2="12" />
    <line x1="3" x2="21" y1="18" y2="18" />
  </svg>
);

const Info = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export default ChatPage;
