import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ChatButtonProps {
  isDarkMode?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ isDarkMode = false }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [bounce, setBounce] = useState(false);

  // Эффект для привлечения внимания к кнопке чата
  useEffect(() => {
    // Через 10 секунд после загрузки страницы начинаем анимацию
    const timer = setTimeout(() => {
      setBounce(true);
      // Останавливаем анимацию через 2 секунды
      setTimeout(() => setBounce(false), 2000);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Имитация получения непрочитанных сообщений
  useEffect(() => {
    if (!isChatOpen) {
      const timer = setInterval(() => {
        // 5% шанс получения нового сообщения каждые 30 секунд, если чат закрыт
        if (Math.random() < 0.05) {
          setUnreadMessages((prev) => prev + 1);
          setBounce(true);
          setTimeout(() => setBounce(false), 2000);
        }
      }, 30000);

      return () => clearInterval(timer);
    } else {
      // Если чат открыт, сбрасываем счетчик непрочитанных сообщений
      setUnreadMessages(0);
    }
  }, [isChatOpen]);

  return (
    <>
      <div className="fixed bottom-24 left-6 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg ${
            bounce ? 'animate-bounce' : ''
          } ${isDarkMode ? 'bg-gray-700 text-orange-400' : 'bg-orange-500 text-white'}`}
        >
          <MessageCircle className="w-6 h-6" />
          {unreadMessages > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs">
              {unreadMessages}
            </span>
          )}
        </button>
      </div>

      {isChatOpen && <ChatWindow isDarkMode={isDarkMode} onClose={() => setIsChatOpen(false)} />}
    </>
  );
};

export default ChatButton;
