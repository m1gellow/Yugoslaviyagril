import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Star, ChevronRight, MessageCircle, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface KnowledgeBaseFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

interface KnowledgeBasePageProps {
  isDarkMode?: boolean;
}

const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ isDarkMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [allFAQs, setAllFAQs] = useState<KnowledgeBaseFAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});

  // Загрузка данных из базы знаний
  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      try {
        // Получаем данные из таблицы knowledge_base
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          setAllFAQs(data);

          // Определяем уникальные категории
          const uniqueCategories = [...new Set(data.map((item) => item.category))];
          setCategories(uniqueCategories);

          // Устанавливаем первую категорию как активную
          if (uniqueCategories.length > 0 && !activeCategory) {
            setActiveCategory(uniqueCategories[0]);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке базы знаний:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Функция для фильтрации вопросов по категории и поисковому запросу
  const filteredFAQs = allFAQs.filter(
    (faq) =>
      (activeCategory ? faq.category === activeCategory : true) &&
      (searchTerm
        ? faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        : true),
  );

  // Развернуть/свернуть вопрос
  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prevExpanded) =>
      prevExpanded.includes(id) ? prevExpanded.filter((qId) => qId !== id) : [...prevExpanded, id],
    );
  };

  // Отметка ответа как полезный или бесполезный
  const submitFeedback = async (faqId: string, isHelpful: boolean) => {
    if (feedbackSubmitted[faqId]) return;

    try {
      // В реальном приложении здесь был бы запрос к API для сохранения отзыва
      console.log(`Отзыв на ответ ${faqId}: ${isHelpful ? 'полезный' : 'бесполезный'}`);

      // Запоминаем, что для этого вопроса отзыв уже отправлен
      setFeedbackSubmitted((prev) => ({ ...prev, [faqId]: true }));

      // Уведомляем пользователя о принятии обратной связи
      alert(isHelpful ? 'Спасибо за ваш отзыв!' : 'Спасибо за обратную связь. Мы постараемся улучшить ответ.');
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
    }
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}
      style={{ backgroundImage: isDarkMode ? 'none' : "url('/assets/img/bg.png')" }}
    >


      <div className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 mb-8`}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">База знаний</h1>
            <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Ответы на часто задаваемые вопросы о нашей сети ресторанов, доставке, меню и многом другом.
            </p>

            {/* Поиск по базе знаний */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                />
                <input
                  type="text"
                  placeholder="Поиск по базе знаний..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-full focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500'
                      : 'border-orange-300 focus:ring-orange-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Боковая панель с категориями */}
              <div className="md:col-span-1">
                <div className={`sticky top-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                  <h3 className="font-bold text-lg mb-4">Категории</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setActiveCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-md ${
                          activeCategory === null
                            ? isDarkMode
                              ? 'bg-orange-900/30 text-white'
                              : 'bg-orange-500 text-white'
                            : isDarkMode
                              ? 'hover:bg-gray-600 text-gray-300'
                              : 'hover:bg-orange-100 text-gray-700'
                        }`}
                      >
                        Все категории
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => setActiveCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            activeCategory === category
                              ? isDarkMode
                                ? 'bg-orange-900/30 text-white'
                                : 'bg-orange-500 text-white'
                              : isDarkMode
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-orange-100 text-gray-700'
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Список вопросов и ответов */}
              <div className="md:col-span-3">
                {filteredFAQs.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                    <FileText className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <h3 className="text-lg font-medium mb-2">Ничего не найдено</h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchTerm
                        ? 'По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.'
                        : 'В выбранной категории пока нет вопросов.'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className={`mt-3 px-4 py-2 rounded-md ${
                          isDarkMode
                            ? 'bg-orange-700 hover:bg-orange-600 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        Сбросить поиск
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Группировка по категориям при поиске по всей базе */}
                    {!activeCategory &&
                      searchTerm &&
                      categories.map((category) => {
                        const categoryFAQs = filteredFAQs.filter((faq) => faq.category === category);
                        if (categoryFAQs.length === 0) return null;

                        return (
                          <div key={category} className="mb-6">
                            <h3
                              className={`font-bold text-lg mb-4 pb-2 border-b ${
                                isDarkMode ? 'border-gray-700' : 'border-gray-200'
                              }`}
                            >
                              {category}
                            </h3>
                            <div className="space-y-4">{categoryFAQs.map((faq) => renderFAQItem(faq))}</div>
                          </div>
                        );
                      })}

                    {/* Обычный режим показа для выбранной категории */}
                    {(activeCategory || !searchTerm) && filteredFAQs.map((faq) => renderFAQItem(faq))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Секция с дополнительной помощью */}
          <div className={`mt-12 p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <h3 className="text-xl font-bold mb-4 text-center">Не нашли ответ на свой вопрос?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <MessageCircle
                  className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}
                />
                <h4 className="text-lg font-semibold mb-2">Чат с поддержкой</h4>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Наши операторы готовы ответить на ваши вопросы в чате.
                </p>
                <button
                  className={`px-6 py-2 rounded-full ${
                    isDarkMode
                      ? 'bg-orange-700 hover:bg-orange-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  Начать чат
                </button>
              </div>

              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <Phone className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                <h4 className="text-lg font-semibold mb-2">Позвоните нам</h4>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Свяжитесь с нами по телефону для получения помощи.
                </p>
                <a
                  href="tel:+79126696128"
                  className={`inline-block px-6 py-2 rounded-full ${
                    isDarkMode
                      ? 'bg-orange-700 hover:bg-orange-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  +7 (912) 669-61-28
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );

  // Функция для рендеринга отдельного вопроса-ответа
  function renderFAQItem(faq: KnowledgeBaseFAQ) {
    const isExpanded = expandedQuestions.includes(faq.id);

    return (
      <div
        key={faq.id}
        className={`border rounded-lg transition-shadow ${
          isExpanded
            ? isDarkMode
              ? 'border-orange-600 shadow-md'
              : 'border-orange-300 shadow-md'
            : isDarkMode
              ? 'border-gray-700'
              : 'border-gray-200'
        }`}
      >
        <div
          className={`p-4 flex justify-between items-center cursor-pointer ${
            isExpanded ? (isDarkMode ? 'bg-gray-700' : 'bg-orange-50') : ''
          }`}
          onClick={() => toggleQuestion(faq.id)}
        >
          <h4 className="font-medium pr-8">{faq.question}</h4>
          <button className="flex-shrink-0">
            {isExpanded ? (
              <Minus className="w-5 h-5 text-orange-500" />
            ) : (
              <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: faq.answer.replace(/\n/g, '<br />'),
              }}
            />

            <div
              className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">Был ли этот ответ полезным?</div>
              <div className="flex space-x-3">
                <button
                  onClick={() => submitFeedback(faq.id, true)}
                  disabled={feedbackSubmitted[faq.id]}
                  className={`px-3 py-1 rounded flex items-center text-sm ${
                    feedbackSubmitted[faq.id]
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400'
                        : 'bg-gray-100 text-gray-400'
                      : isDarkMode
                        ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Да
                </button>
                <button
                  onClick={() => submitFeedback(faq.id, false)}
                  disabled={feedbackSubmitted[faq.id]}
                  className={`px-3 py-1 rounded flex items-center text-sm ${
                    feedbackSubmitted[faq.id]
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400'
                        : 'bg-gray-100 text-gray-400'
                      : isDarkMode
                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Нет
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

// Дополнительные компоненты для чата
const Phone = ({ className }: { className?: string }) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ThumbsUp = ({ className }: { className?: string }) => (
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
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbsDown = ({ className }: { className?: string }) => (
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
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default KnowledgeBasePage;
