import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, MessageCircle, FileText, ChevronDown, ThumbsUp, ThumbsDown, Phone } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Загрузка данных из базы знаний
  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;

        if (data) {
          setAllFAQs(data);
          const uniqueCategories = [...new Set(data.map((item) => item.category))];
          setCategories(uniqueCategories);
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

  const filteredFAQs = allFAQs.filter(
    (faq) =>
      (activeCategory ? faq.category === activeCategory : true) &&
      (searchTerm
        ? faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        : true),
  );

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const submitFeedback = async (faqId: string, isHelpful: boolean) => {
    if (feedbackSubmitted[faqId]) return;
    
    try {
      console.log(`Отзыв на ответ ${faqId}: ${isHelpful ? 'полезный' : 'бесполезный'}`);
      setFeedbackSubmitted((prev) => ({ ...prev, [faqId]: true }));
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}
      style={{ backgroundImage: isDarkMode ? 'none' : "url('/assets/img/bg.png')" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`p-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-orange-50 to-amber-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-orange-100'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-white shadow-md mb-4">
                <FileText className="w-8 h-8 text-orange-500" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                База знаний
              </h1>
              <p className={`max-w-2xl mx-auto text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ответы на часто задаваемые вопросы о нашей сети ресторанов, доставке, меню и многом другом.
              </p>

              {/* Search Bar */}
              <div className="mt-6 w-full max-w-2xl">
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Поиск по базе знаний..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-5 py-3.5 border rounded-xl focus:outline-none focus:ring-2 text-lg ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500'
                        : 'border-orange-200 focus:ring-orange-300 shadow-sm'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Category Toggle */}
          <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="font-medium">
                {activeCategory || 'Все категории'}
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'transform rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Categories Sidebar - Mobile */}
            {isMobileMenuOpen && (
              <div className="md:hidden col-span-1 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                  <h3 className="font-bold text-lg mb-4">Категории</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => {
                          setActiveCategory(null);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg ${
                          activeCategory === null
                            ? isDarkMode
                              ? 'bg-orange-600 text-white'
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
                          onClick={() => {
                            setActiveCategory(category);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg ${
                            activeCategory === category
                              ? isDarkMode
                                ? 'bg-orange-600 text-white'
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
            )}

            {/* Categories Sidebar - Desktop */}
            <div className="hidden md:block md:col-span-1 p-6 border-r border-gray-200 dark:border-gray-700">
              <div className={`sticky top-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'} shadow-sm`}>
                <h3 className="font-bold text-lg mb-4">Категории</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveCategory(null)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                        activeCategory === null
                          ? isDarkMode
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-orange-500 text-white shadow-md'
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
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                          activeCategory === category
                            ? isDarkMode
                              ? 'bg-orange-600 text-white shadow-md'
                              : 'bg-orange-500 text-white shadow-md'
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

            {/* FAQ Content */}
            <div className="col-span-1 md:col-span-3 p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Загрузка данных...</p>
                </div>
              ) : filteredFAQs.length === 0 ? (
                <div className={`text-center py-12 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-inner`}>
                  <FileText className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                  <h3 className="text-xl font-medium mb-2">Ничего не найдено</h3>
                  <p className={`max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm
                      ? 'По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.'
                      : 'В выбранной категории пока нет вопросов.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={`mt-4 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-orange-600 hover:bg-orange-500 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      Сбросить поиск
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Grouped by category when searching all */}
                  {!activeCategory && searchTerm && categories.map((category) => {
                    const categoryFAQs = filteredFAQs.filter((faq) => faq.category === category);
                    if (categoryFAQs.length === 0) return null;

                    return (
                      <div key={category} className="mb-8">
                        <h3 className={`font-bold text-xl mb-4 pb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          {category}
                        </h3>
                        <div className="space-y-4">
                          {categoryFAQs.map((faq) => renderFAQItem(faq))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Regular view for selected category */}
                  {(activeCategory || !searchTerm) && (
                    <div className="space-y-4">
                      {filteredFAQs.map((faq) => renderFAQItem(faq))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className={`p-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-orange-50 to-amber-50'} border-t ${isDarkMode ? 'border-gray-600' : 'border-orange-100'}`}>
            <h3 className="text-2xl font-bold mb-6 text-center">Не нашли ответ на свой вопрос?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className={`p-6 rounded-xl text-center transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-white'}`}>
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-md mb-4">
                  <MessageCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Чат с поддержкой</h4>
                <p className={`mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Наши операторы готовы ответить на ваши вопросы в чате.
                </p>
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-orange-600 hover:bg-orange-500 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  Начать чат
                </button>
              </div>

              <div className={`p-6 rounded-xl text-center transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-white'}`}>
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-md mb-4">
                  <Phone className="w-8 h-8 text-orange-500" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Позвоните нам</h4>
                <p className={`mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Свяжитесь с нами по телефону для получения помощи.
                </p>
                <a
                  href="tel:+79126696128"
                  className={`inline-block px-6 py-3 rounded-xl font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-orange-600 hover:bg-orange-500 text-white'
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

  // Функция для рендеринга отдельного FAQ элемента
  function renderFAQItem(faq: KnowledgeBaseFAQ) {
    const isExpanded = expandedQuestions.includes(faq.id);

    return (
      <div
        key={faq.id}
        className={`border rounded-xl transition-all overflow-hidden ${
          isExpanded
            ? isDarkMode
              ? 'border-orange-600 shadow-md'
              : 'border-orange-300 shadow-md'
            : isDarkMode
              ? 'border-gray-700 hover:border-gray-600'
              : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <button
          className={`w-full p-5 flex justify-between items-center text-left transition-colors ${
            isExpanded
              ? isDarkMode
                ? 'bg-gray-750'
                : 'bg-orange-50'
              : isDarkMode
                ? 'hover:bg-gray-750'
                : 'hover:bg-orange-50'
          }`}
          onClick={() => toggleQuestion(faq.id)}
        >
          <h4 className="font-medium text-lg pr-4">{faq.question}</h4>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <Minus className="w-5 h-5 text-orange-500" />
            ) : (
              <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className={`p-5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div
              className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{
                __html: faq.answer.replace(/\n/g, '<br />'),
              }}
            />

            <div
              className={`mt-6 pt-5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}
            >
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Был ли этот ответ полезным?
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => submitFeedback(faq.id, true)}
                  disabled={feedbackSubmitted[faq.id]}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    feedbackSubmitted[faq.id]
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400'
                        : 'bg-gray-100 text-gray-400'
                      : isDarkMode
                        ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Да
                </button>
                <button
                  onClick={() => submitFeedback(faq.id, false)}
                  disabled={feedbackSubmitted[faq.id]}
                  className={`px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors ${
                    feedbackSubmitted[faq.id]
                      ? isDarkMode
                        ? 'bg-gray-600 text-gray-400'
                        : 'bg-gray-100 text-gray-400'
                      : isDarkMode
                        ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
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

export default KnowledgeBasePage;