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
      <div className="fixed md:bottom-10 bottom-20 md:right-20 right-14 z-40">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
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
