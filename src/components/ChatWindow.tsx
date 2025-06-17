import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, User, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabase } from '../context/SupabaseContext';

interface ChatWindowProps {
  isDarkMode?: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id?: string;
  content: string;
  sender_type: 'user' | 'operator' | 'manager' | 'admin' | 'system';
  created_at?: string;
  is_read?: boolean;
  user_id?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isDarkMode = false, onClose }) => {
  const { auth } = useSupabase();
  const [formData, setFormData] = useState({
    name: auth.profile?.name || '',
    email: auth.profile?.email || '',
    topic: 'Общий вопрос',
    message: '',
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOperatorTyping, setIsOperatorTyping] = useState(false);

  // Прокрутка до последнего сообщения при добавлении нового
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Загружаем существующую сессию чата при авторизации
  useEffect(() => {
    if (auth.user) {
      loadExistingChatSession();
    }
  }, [auth.user]);

  // Подписка на обновления сообщений, если есть активная сессия
  useEffect(() => {
    if (sessionId) {
      const subscription = supabase
        .channel(`chat_messages_${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            // Получили новое сообщение
            if (payload.new && payload.new.sender_type !== 'user') {
              const newMessage: ChatMessage = {
                id: payload.new.id,
                content: payload.new.content,
                sender_type: payload.new.sender_type,
                created_at: payload.new.created_at,
                is_read: payload.new.is_read,
              };

              setMessages((prev) => [...prev, newMessage]);

              // Если это сообщение от оператора, покажем анимацию набора текста
              if (['operator', 'manager', 'admin'].includes(payload.new.sender_type)) {
                setIsOperatorTyping(false);
              }
            }
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [sessionId]);

  // Создание имитации набора текста оператором
  useEffect(() => {
    if (sessionStarted && messages.length > 0 && messages[messages.length - 1].sender_type === 'user') {
      // Если последнее сообщение от пользователя, показываем что оператор печатает
      const timer = setTimeout(() => {
        setIsOperatorTyping(true);

        // Через некоторое время скрываем индикатор набора текста
        setTimeout(() => {
          setIsOperatorTyping(false);
        }, 5000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [sessionStarted, messages]);

  // Загрузка существующей сессии чата
  const loadExistingChatSession = async () => {
    try {
      // Ищем активную сессию для текущего пользователя
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', auth.user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        console.error('Ошибка при загрузке сессии чата:', sessionError);
        return;
      }

      if (session) {
        setSessionId(session.id);
        setSessionStarted(true);
        setFormData((prev) => ({
          ...prev,
          name: session.name || prev.name,
          email: session.email || prev.email,
          topic: session.topic || prev.topic,
        }));

        // Загружаем сообщения для этой сессии
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Ошибка при загрузке сообщений чата:', messagesError);
          return;
        }

        if (messagesData) {
          setMessages(
            messagesData.map((msg) => ({
              id: msg.id,
              content: msg.content,
              sender_type: msg.sender_type,
              created_at: msg.created_at,
              is_read: msg.is_read,
              user_id: msg.user_id,
            })),
          );
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке чат-сессии:', error);
    }
  };

  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!formData.message.trim()) return;

    setIsSubmitting(true);

    try {
      if (!sessionStarted) {
        // Создаем новую чат-сессию
        const { data, error } = await supabase.rpc('create_chat_session', {
          p_name: formData.name,
          p_email: formData.email,
          p_topic: formData.topic,
          p_first_message: formData.message,
        });

        if (error) throw error;

        if (data) {
          setSessionId(data.session_id);
          setSessionStarted(true);

          // Добавляем отправленное сообщение и автоматический ответ локально
          setMessages([
            {
              content: formData.message,
              sender_type: 'user',
              created_at: new Date().toISOString(),
            },
            {
              content:
                'Ваше обращение принято. Оператор ответит вам в ближайшее время. Обычное время ожидания: 5-15 минут в рабочее время (10:00-22:00).',
              sender_type: 'system',
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } else if (sessionId) {
        // Отправляем сообщение в существующую сессию
        const newMessage = {
          session_id: sessionId,
          user_id: auth.user?.id,
          sender_type: 'user',
          content: formData.message,
        };

        const { error } = await supabase.from('chat_messages').insert(newMessage);

        if (error) throw error;

        // Локально добавляем сообщение в список
        setMessages((prev) => [
          ...prev,
          {
            content: formData.message,
            sender_type: 'user',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // Очищаем поле ввода
      setFormData({ ...formData, message: '' });
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      alert('Не удалось отправить сообщение. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-28 right-6 z-50 w-full max-w-sm">
      <div className={`w-full rounded-lg shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Заголовок окна чата */}
        <div
          className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-500 text-white'} flex justify-between items-center`}
        >
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>Чат поддержки</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-orange-600 text-white'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Область сообщений */}
        <div className={`p-3 h-96 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {/* Если чат не начат, показываем форму */}
          {!sessionStarted ? (
            <div className={`space-y-3 ${isDarkMode ? 'text-white' : ''}`}>
              <h4 className="font-medium">Начните чат с оператором</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Пожалуйста, заполните информацию ниже, чтобы начать чат
              </p>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Ваше имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={`w-full p-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                  }`}
                  placeholder="Иван Петров"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Email (необязательно)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Тема обращения
                </label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className={`w-full p-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                  }`}
                >
                  <option value="Общий вопрос">Общий вопрос</option>
                  <option value="Проблема с заказом">Проблема с заказом</option>
                  <option value="Доставка">Доставка</option>
                  <option value="Оплата">Оплата</option>
                  <option value="Жалоба">Жалоба</option>
                  <option value="Другое">Другое</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`${
                    message.sender_type === 'user'
                      ? 'ml-auto bg-orange-100 dark:bg-orange-900/30 text-gray-800 dark:text-gray-100'
                      : message.sender_type === 'system'
                        ? 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                        : 'mr-auto bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-gray-100'
                  } max-w-[80%] p-3 rounded-lg shadow-sm relative`}
                >
                  <div className="flex items-center mb-1">
                    {message.sender_type === 'user' ? (
                      <User className="w-4 h-4 mr-1 text-orange-500" />
                    ) : message.sender_type === 'system' ? (
                      <ShieldCheck className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <User className="w-4 h-4 mr-1 text-blue-500" />
                    )}
                    <span className="text-xs font-medium">
                      {message.sender_type === 'user'
                        ? 'Вы'
                        : message.sender_type === 'system'
                          ? 'Система'
                          : message.sender_type === 'admin'
                            ? 'Администратор'
                            : message.sender_type === 'manager'
                              ? 'Менеджер'
                              : 'Оператор'}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <div className="absolute bottom-1 right-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="inline w-3 h-3 mr-1" />
                    {message.created_at
                      ? new Date(message.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : new Date().toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </div>
                </div>
              ))}

              {/* Индикатор "Оператор печатает" */}
              {isOperatorTyping && (
                <div className="mr-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 max-w-[80%] p-3 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: '200ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: '400ms' }}
                    ></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Область ввода сообщения */}
        <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
          <div className="flex">
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder={sessionStarted ? 'Введите сообщение...' : 'Введите ваш вопрос...'}
              className={`flex-1 p-2 border rounded-l-md focus:outline-none resize-none ${
                isDarkMode ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
              } h-10 min-h-10 max-h-28`}
              style={{ overflow: 'auto' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={isSubmitting || !formData.message.trim() || (formData.name === '' && !sessionStarted)}
              className={`px-4 rounded-r-md flex items-center justify-center ${
                isSubmitting || !formData.message.trim() || (formData.name === '' && !sessionStarted)
                  ? isDarkMode
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-gray-200 text-gray-500'
                  : isDarkMode
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
