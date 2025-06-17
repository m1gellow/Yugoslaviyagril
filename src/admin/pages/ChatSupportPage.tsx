import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  MoreHorizontal,
  User,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string | null;
  sender_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  name: string;
  email: string | null;
  topic: string;
  restaurant_id: string | null;
  user_id: string | null;
  status: 'active' | 'resolved' | 'closed';
  created_at: string;
  last_message_at: string;
  restaurant?: {
    name: string;
    address: string;
  };
  unreadCount?: number;
}

const CHAT_STATUSES = [
  { value: 'active', label: 'Активные', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'resolved', label: 'Решенные', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { value: 'closed', label: 'Закрытые', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
];

// Шаблоны быстрых ответов
const QUICK_REPLIES = [
  { id: 'greeting', text: 'Здравствуйте! Чем могу помочь?' },
  { id: 'thanks', text: 'Спасибо за обращение в службу поддержки. Мы решим вашу проблему в ближайшее время.' },
  { id: 'order-status', text: 'Ваш заказ находится в обработке. Ожидаемое время доставки: 40-60 минут.' },
  {
    id: 'apology',
    text: 'Приносим извинения за доставленные неудобства. Мы сделаем всё возможное, чтобы решить эту проблему.',
  },
  { id: 'closing', text: 'Рады были помочь! Если у вас возникнут еще вопросы, обращайтесь.' },
];

const ChatSupportPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка сессий чата
  useEffect(() => {
    loadChatSessions();

    // Устанавливаем подписку на новые сессии и сообщения
    const subscription = supabase
      .channel('chat-admin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        () => {
          // При любых изменениях в таблице сессий обновляем список
          loadChatSessions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sessionFilter]);

  // Автоскролл при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Подписка на новые сообщения в выбранной сессии
  useEffect(() => {
    if (!selectedSession) return;

    // Загружаем сообщения для выбранной сессии
    loadChatMessages(selectedSession.id);

    // Подписываемся на новые сообщения в этой сессии
    const subscription = supabase
      .channel(`chat-messages-${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          // Добавляем новое сообщение
          const newMessage = payload.new as ChatMessage;
          setChatMessages((prev) => [...prev, newMessage]);

          // Если сообщение от пользователя, отмечаем его как прочитанное
          if (newMessage.sender_type === 'user') {
            markMessageAsRead(newMessage.id);

            // Обновляем счетчик непрочитанных сообщений в сессии
            setChatSessions((prev) =>
              prev.map((session) => (session.id === selectedSession.id ? { ...session, unreadCount: 0 } : session)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedSession]);

  // Загрузка сессий чата с фильтрацией
  const loadChatSessions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('chat_sessions')
        .select(
          `
          *,
          restaurant:restaurant_id(name, address)
        `,
        )
        .eq('status', sessionFilter)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Ошибка при загрузке сессий чата:', error);
        setLoading(false);
        return;
      }

      // Получаем количество непрочитанных сообщений для каждой сессии
      const sessionsWithUnread = await Promise.all(
        data.map(async (session) => {
          const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .eq('is_read', false)
            .eq('sender_type', 'user');

          return {
            ...session,
            unreadCount: countError ? 0 : count || 0,
          };
        }),
      );

      // Фильтруем по поисковому запросу
      const filteredSessions = searchTerm
        ? sessionsWithUnread.filter(
            (session) =>
              session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              session.topic.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : sessionsWithUnread;

      setChatSessions(filteredSessions);
      setLoading(false);

      // Если сессии загружены и нет выбранной сессии, выбираем первую
      if (filteredSessions.length > 0 && !selectedSession) {
        setSelectedSession(filteredSessions[0]);
        loadChatMessages(filteredSessions[0].id);
      } else if (selectedSession) {
        // Обновляем выбранную сессию, если она изменилась
        const updatedSession = filteredSessions.find((session) => session.id === selectedSession.id);
        if (updatedSession) {
          setSelectedSession(updatedSession);
        }
      }
    } catch (e) {
      console.error('Ошибка при загрузке сессий чата:', e);
      setLoading(false);
    }
  };

  // Загрузка сообщений для выбранной сессии
  const loadChatMessages = async (sessionId: string) => {
    try {
      setMessageLoading(true);

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Ошибка при загрузке сообщений:', error);
        setMessageLoading(false);
        return;
      }

      setChatMessages(data || []);

      // Отмечаем сообщения от пользователя как прочитанные
      const unreadUserMessages = data?.filter((msg) => msg.sender_type === 'user' && !msg.is_read) || [];

      if (unreadUserMessages.length > 0) {
        const messageIds = unreadUserMessages.map((msg) => msg.id);
        markMessagesAsRead(messageIds);

        // Обновляем счетчик непрочитанных сообщений в сессии
        setChatSessions((prev) =>
          prev.map((session) => (session.id === sessionId ? { ...session, unreadCount: 0 } : session)),
        );
      }

      setMessageLoading(false);
    } catch (e) {
      console.error('Ошибка при загрузке сообщений:', e);
      setMessageLoading(false);
    }
  };

  // Отметка сообщений как прочитанных
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return;

    try {
      const { error } = await supabase.from('chat_messages').update({ is_read: true }).in('id', messageIds);

      if (error) {
        console.error('Ошибка при отметке сообщений как прочитанных:', error);
      }
    } catch (e) {
      console.error('Ошибка при отметке сообщений как прочитанных:', e);
    }
  };

  // Отметка одного сообщения как прочитанного
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase.from('chat_messages').update({ is_read: true }).eq('id', messageId);

      if (error) {
        console.error('Ошибка при отметке сообщения как прочитанного:', error);
      }
    } catch (e) {
      console.error('Ошибка при отметке сообщения как прочитанного:', e);
    }
  };

  // Отправка нового сообщения
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newMessage.trim() || !selectedSession) return;

    try {
      setMessageLoading(true);

      // Добавляем сообщение в базу данных
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: selectedSession.id,
          sender_type: 'operator', // Или получать из контекста авторизации
          content: newMessage,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Ошибка при отправке сообщения:', error);
        setMessageLoading(false);
        return;
      }

      // Обновляем время последнего сообщения
      await supabase
        .from('chat_sessions')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSession.id);

      // Очищаем поле ввода
      setNewMessage('');
      setMessageLoading(false);

      // Скрываем панель быстрых ответов
      setShowQuickReplies(false);
    } catch (e) {
      console.error('Ошибка при отправке сообщения:', e);
      setMessageLoading(false);
    }
  };

  // Обновление статуса чата
  const updateChatStatus = async (sessionId: string, status: 'active' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Ошибка при обновлении статуса чата:', error);
        return;
      }

      // Если сессия в текущем фильтре, обновляем её
      if (status === sessionFilter) {
        loadChatSessions();
      } else {
        // Иначе удаляем из списка
        setChatSessions((prev) => prev.filter((session) => session.id !== sessionId));
        setSelectedSession(null);
      }
    } catch (e) {
      console.error('Ошибка при обновлении статуса чата:', e);
    }
  };

  // Форматирование даты
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Вставка быстрого ответа
  const insertQuickReply = (text: string) => {
    setNewMessage(text);
    setShowQuickReplies(false);
  };

  // Отфильтрованные сессии
  const filteredSessions = searchTerm
    ? chatSessions.filter(
        (session) =>
          session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : chatSessions;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Чат с клиентами</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Управление обращениями клиентов</p>
      </div>

      <div className="flex flex-col lg:flex-row h-full gap-4 overflow-hidden">
        {/* Панель чатов */}
        <div
          className={`w-full lg:w-80 flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md flex flex-col`}
        >
          {/* Поиск и фильтры */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative mb-3">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                size={16}
              />
              <input
                type="text"
                placeholder="Поиск по имени, теме..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 
                  ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border border-gray-300'
                  }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex space-x-2 overflow-x-auto p-1">
              {CHAT_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSessionFilter(status.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
                    ${sessionFilter === status.value ? 'bg-orange-500 text-white' : status.color}`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Список чатов */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Загрузка чатов...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center p-6">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'По вашему запросу ничего не найдено' : 'Нет активных чатов'}
                </p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="mt-2 text-sm text-orange-500 hover:underline">
                    Сбросить поиск
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y dark:divide-gray-700">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-3 cursor-pointer transition-colors
                      ${
                        selectedSession?.id === session.id
                          ? isDarkMode
                            ? 'bg-gray-700'
                            : 'bg-orange-50'
                          : isDarkMode
                            ? 'hover:bg-gray-700'
                            : 'hover:bg-gray-50'
                      }
                      ${session.unreadCount ? 'font-semibold' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium dark:text-white flex items-center">
                          <span className="truncate max-w-[150px]">{session.name}</span>
                          {session.unreadCount ? (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                              {session.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {session.topic}
                        </div>
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDistanceToNow(new Date(session.last_message_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </div>
                    </div>
                    {session.restaurant && (
                      <div
                        className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1 flex items-center`}
                      >
                        <MapPin size={12} className="mr-1" />
                        {session.restaurant.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Статистика */}
          <div
            className={`p-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'} text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Обновление...
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Всего чатов: {chatSessions.length}</span>
                <button
                  onClick={() => loadChatSessions()}
                  className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Область чата */}
        {selectedSession ? (
          <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md flex flex-col`}>
            {/* Заголовок чата */}
            <div
              className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}
            >
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium dark:text-white">{selectedSession.name}</h3>
                  <span
                    className={`ml-3 px-2 py-0.5 text-xs rounded-md ${
                      selectedSession.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : selectedSession.status === 'resolved'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedSession.status === 'active'
                      ? 'Активный'
                      : selectedSession.status === 'resolved'
                        ? 'Решен'
                        : 'Закрыт'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Тема: {selectedSession.topic}</div>
              </div>
              <div className="flex items-center space-x-3">
                {selectedSession.status === 'active' ? (
                  <>
                    <button
                      onClick={() => updateChatStatus(selectedSession.id, 'resolved')}
                      className="px-3 py-1.5 text-sm rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <CheckCircle className="w-4 h-4 inline-block mr-1" />
                      Решено
                    </button>
                    <button
                      onClick={() => updateChatStatus(selectedSession.id, 'closed')}
                      className="px-3 py-1.5 text-sm rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                    >
                      <XCircle className="w-4 h-4 inline-block mr-1" />
                      Закрыть
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateChatStatus(selectedSession.id, 'active')}
                    className="px-3 py-1.5 text-sm rounded-md bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    <MessageSquare className="w-4 h-4 inline-block mr-1" />
                    Возобновить
                  </button>
                )}
                <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Информация о клиенте */}
            <div
              className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {selectedSession.user_id && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1 text-gray-400" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      ID: {selectedSession.user_id.substring(0, 8)}...
                    </span>
                  </div>
                )}
                {selectedSession.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-gray-400" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{selectedSession.email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {formatDateTime(selectedSession.created_at)}
                  </span>
                </div>
                {selectedSession.restaurant && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {selectedSession.restaurant.name} ({selectedSession.restaurant.address})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Сообщения чата */}
            <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {messageLoading && chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-gray-500 dark:text-gray-400">Загрузка сообщений...</span>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Нет сообщений</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'user'
                          ? 'justify-start'
                          : message.sender_type === 'system'
                            ? 'justify-center'
                            : 'justify-end'
                      }`}
                    >
                      {message.sender_type === 'system' ? (
                        <div
                          className={`max-w-[90%] px-4 py-2 rounded-lg ${
                            isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                          } text-sm flex items-center`}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          {message.content}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-lg ${
                            message.sender_type === 'user'
                              ? isDarkMode
                                ? 'bg-gray-700 text-white'
                                : 'bg-white text-gray-800'
                              : isDarkMode
                                ? 'bg-orange-900 text-white'
                                : 'bg-orange-500 text-white'
                          }`}
                        >
                          <div className="flex items-start">
                            <div>
                              <div className="text-sm">{message.content}</div>
                              <div className="text-xs opacity-70 text-right mt-1 flex items-center justify-end">
                                {formatDateTime(message.created_at)}
                                {message.sender_type !== 'user' &&
                                  (message.is_read ? (
                                    <CheckCircle className="w-3 h-3 ml-1" />
                                  ) : (
                                    <Clock className="w-3 h-3 ml-1" />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Форма отправки сообщений */}
            {selectedSession.status === 'active' && (
              <div className="p-4 border-t dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                  <div className="relative flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..."
                      rows={1}
                      className={`w-full px-3 py-2 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-orange-500 
                        ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'border border-gray-300'
                        }`}
                      style={{ minHeight: '44px' }}
                    />
                    <div className="absolute right-2 bottom-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                        className={`p-1 rounded-full ${
                          isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Быстрые ответы */}
                    {showQuickReplies && (
                      <div
                        className={`absolute bottom-full left-0 mb-2 w-full p-2 ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        } border rounded-md shadow-lg z-10`}
                      >
                        <div className="max-h-60 overflow-y-auto divide-y dark:divide-gray-600">
                          {QUICK_REPLIES.map((reply) => (
                            <button
                              key={reply.id}
                              type="button"
                              onClick={() => insertQuickReply(reply.text)}
                              className={`w-full text-left p-2 text-sm ${
                                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              }`}
                            >
                              {reply.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || messageLoading}
                    className={`p-3 rounded-full transition-colors 
                      ${
                        !newMessage.trim() || messageLoading
                          ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                          : 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700'
                      }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md flex items-center justify-center`}
          >
            <div className="text-center p-6">
              <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className="text-xl font-medium dark:text-white">
                {loading ? 'Загрузка чатов...' : 'Выберите чат слева'}
              </h3>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {loading ? 'Пожалуйста, подождите...' : 'Для начала диалога выберите чат из списка'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSupportPage;
