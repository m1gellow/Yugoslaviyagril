import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Book,
  PlusCircle,
  FileQuestion,
  ArrowUp,
  ArrowDown,
  Save,
  ExternalLink,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { supabase } from '../../lib/supabase';

interface KnowledgeBaseArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

const KnowledgeBaseManagePage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [tempArticle, setTempArticle] = useState<KnowledgeBaseArticle>({
    id: '',
    category: '',
    question: '',
    answer: '',
    sort_order: 0,
    is_active: true,
    created_at: '',
  });

  // Загрузка данных из Supabase
  useEffect(() => {
    loadArticles();
  }, []);

  // Фильтрация статей при изменении поисковой строки или фильтра
  useEffect(() => {
    if (articles.length === 0) return;

    let result = [...articles];

    // Фильтруем по категории
    if (categoryFilter) {
      result = result.filter((article) => article.category === categoryFilter);
    }

    // Фильтруем по поисковой строке
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (article) =>
          article.question.toLowerCase().includes(lowerSearchTerm) ||
          article.answer.toLowerCase().includes(lowerSearchTerm) ||
          article.category.toLowerCase().includes(lowerSearchTerm),
      );
    }

    // Сортируем по категории и порядку
    result.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.sort_order - b.sort_order;
    });

    setFilteredArticles(result);
  }, [articles, searchTerm, categoryFilter]);

  // Загрузка статей
  const loadArticles = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Ошибка при загрузке базы знаний:', error);
        setLoading(false);
        return;
      }

      setArticles(data || []);
      setFilteredArticles(data || []);

      // Собираем уникальные категории
      const uniqueCategories = [...new Set(data?.map((article) => article.category) || [])];
      setCategories(uniqueCategories);

      setLoading(false);
    } catch (e) {
      console.error('Ошибка при загрузке базы знаний:', e);
      setLoading(false);
    }
  };

  // Начало редактирования статьи
  const startEditingArticle = (article: KnowledgeBaseArticle) => {
    setEditingArticle(article);
    setTempArticle({ ...article });
  };

  // Начало добавления статьи
  const startAddingArticle = () => {
    // Определяем максимальный порядок сортировки для выбранной категории
    let maxSortOrder = 0;
    if (categoryFilter) {
      const categoryArticles = articles.filter((a) => a.category === categoryFilter);
      maxSortOrder = categoryArticles.length > 0 ? Math.max(...categoryArticles.map((a) => a.sort_order)) + 10 : 10;
    } else {
      maxSortOrder = articles.length > 0 ? Math.max(...articles.map((a) => a.sort_order)) + 10 : 10;
    }

    setTempArticle({
      id: '',
      category: categoryFilter || '',
      question: '',
      answer: '',
      sort_order: maxSortOrder,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    setIsAddingArticle(true);
  };

  // Сохранение статьи
  const saveArticle = async () => {
    try {
      setSaveStatus('saving');

      // Валидация
      if (!tempArticle.category || !tempArticle.question || !tempArticle.answer) {
        alert('Заполните все обязательные поля');
        setSaveStatus('error');
        return;
      }

      if (isAddingArticle) {
        // Создание новой статьи
        const { data, error } = await supabase
          .from('knowledge_base')
          .insert({
            category: tempArticle.category,
            question: tempArticle.question,
            answer: tempArticle.answer,
            sort_order: tempArticle.sort_order,
            is_active: tempArticle.is_active,
          })
          .select()
          .single();

        if (error) {
          console.error('Ошибка при создании статьи:', error);
          setSaveStatus('error');
          return;
        }

        // Добавляем новую статью в список
        setArticles([...articles, data]);

        // Добавляем категорию в список, если она новая
        if (!categories.includes(data.category)) {
          setCategories([...categories, data.category]);
        }
      } else if (editingArticle) {
        // Обновление существующей статьи
        const { data, error } = await supabase
          .from('knowledge_base')
          .update({
            category: tempArticle.category,
            question: tempArticle.question,
            answer: tempArticle.answer,
            sort_order: tempArticle.sort_order,
            is_active: tempArticle.is_active,
          })
          .eq('id', editingArticle.id)
          .select()
          .single();

        if (error) {
          console.error('Ошибка при обновлении статьи:', error);
          setSaveStatus('error');
          return;
        }

        // Обновляем статью в списке
        setArticles(articles.map((article) => (article.id === editingArticle.id ? data : article)));

        // Добавляем категорию в список, если она новая
        if (!categories.includes(data.category)) {
          setCategories([...categories, data.category]);
        }
      }

      // Сбрасываем состояние редактирования
      setEditingArticle(null);
      setIsAddingArticle(false);
      setSaveStatus('success');

      // Сбрасываем статус успешного сохранения через 3 секунды
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error('Ошибка при сохранении статьи:', e);
      setSaveStatus('error');
    }
  };

  // Удаление статьи
  const deleteArticle = async (article: KnowledgeBaseArticle) => {
    if (!confirm(`Вы действительно хотите удалить статью "${article.question}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('knowledge_base').delete().eq('id', article.id);

      if (error) {
        console.error('Ошибка при удалении статьи:', error);
        return;
      }

      // Удаляем статью из списка
      setArticles(articles.filter((a) => a.id !== article.id));
    } catch (e) {
      console.error('Ошибка при удалении статьи:', e);
    }
  };

  // Изменение порядка сортировки статьи
  const moveSortOrder = async (article: KnowledgeBaseArticle, direction: 'up' | 'down') => {
    // Получаем статьи этой же категории
    const categoryArticles = articles
      .filter((a) => a.category === article.category)
      .sort((a, b) => a.sort_order - b.sort_order);

    // Находим индекс текущей статьи
    const currentIndex = categoryArticles.findIndex((a) => a.id === article.id);

    // Проверяем, можно ли двигать статью
    if (direction === 'up' && currentIndex === 0) return; // Уже первая
    if (direction === 'down' && currentIndex === categoryArticles.length - 1) return; // Уже последняя

    // Находим соседнюю статью
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetArticle = categoryArticles[targetIndex];

    try {
      // Обновляем порядок текущей статьи и соседней
      const updates = [
        {
          id: article.id,
          sort_order: targetArticle.sort_order,
        },
        {
          id: targetArticle.id,
          sort_order: article.sort_order,
        },
      ];

      // Обновляем в базе данных
      for (const update of updates) {
        const { error } = await supabase
          .from('knowledge_base')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) {
          console.error(`Ошибка при обновлении порядка статьи ${update.id}:`, error);
          return;
        }
      }

      // Обновляем список статей
      setArticles(
        articles.map((a) => {
          if (a.id === article.id) {
            return { ...a, sort_order: targetArticle.sort_order };
          }
          if (a.id === targetArticle.id) {
            return { ...a, sort_order: article.sort_order };
          }
          return a;
        }),
      );
    } catch (e) {
      console.error('Ошибка при изменении порядка статьи:', e);
    }
  };

  // Изменение статуса активности статьи
  const toggleArticleActive = async (article: KnowledgeBaseArticle) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .update({ is_active: !article.is_active })
        .eq('id', article.id);

      if (error) {
        console.error('Ошибка при изменении статуса статьи:', error);
        return;
      }

      // Обновляем статью в списке
      setArticles(articles.map((a) => (a.id === article.id ? { ...a, is_active: !a.is_active } : a)));
    } catch (e) {
      console.error('Ошибка при изменении статуса статьи:', e);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">База знаний</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Управление базой знаний и FAQ</p>
        </div>
        <button
          onClick={startAddingArticle}
          className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить статью
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-5">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск статей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-2 px-3"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter(null)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Ссылка на публичную страницу */}
        <div className="mt-3 flex">
          <a
            href="/knowledge-base"
            target="_blank"
            className={`text-sm flex items-center ${
              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Открыть публичную страницу базы знаний
          </a>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-3 dark:text-white">Загрузка базы знаний...</p>
        </div>
      ) : (
        <>
          {/* Форма редактирования/добавления */}
          {(isAddingArticle || editingArticle) && (
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 mb-6 ${
                saveStatus === 'error' ? 'border-2 border-red-500' : ''
              }`}
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center dark:text-white">
                {isAddingArticle ? (
                  <>
                    <PlusCircle className="w-5 h-5 mr-2 text-orange-500" />
                    Добавление статьи
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5 mr-2 text-orange-500" />
                    Редактирование статьи
                  </>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория *</label>
                  <div className="flex">
                    <input
                      type="text"
                      list="categories"
                      value={tempArticle.category}
                      onChange={(e) => setTempArticle({ ...tempArticle, category: e.target.value })}
                      className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Выберите или введите новую категорию"
                      required
                    />
                    <datalist id="categories">
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Порядок сортировки
                  </label>
                  <input
                    type="number"
                    value={tempArticle.sort_order}
                    onChange={(e) => setTempArticle({ ...tempArticle, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="10"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Вопрос *</label>
                <input
                  type="text"
                  value={tempArticle.question}
                  onChange={(e) => setTempArticle({ ...tempArticle, question: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Введите вопрос"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ответ *</label>
                <textarea
                  value={tempArticle.answer}
                  onChange={(e) => setTempArticle({ ...tempArticle, answer: e.target.value })}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Введите ответ"
                  rows={6}
                  required
                ></textarea>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Используйте символ перевода строки для разделения абзацев
                </p>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={tempArticle.is_active}
                  onChange={(e) => setTempArticle({ ...tempArticle, is_active: e.target.checked })}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="is-active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Активна (отображается на сайте)
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingArticle(null);
                    setIsAddingArticle(false);
                    setSaveStatus('idle');
                  }}
                  className="px-4 py-2 border rounded-md dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={saveArticle}
                  disabled={saveStatus === 'saving'}
                  className={`px-4 py-2 rounded-md text-white flex items-center ${
                    saveStatus === 'saving'
                      ? 'bg-gray-400 cursor-wait'
                      : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Сохранить
                    </>
                  )}
                </button>
              </div>

              {saveStatus === 'success' && (
                <div className="mt-4 p-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Статья успешно сохранена
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="mt-4 p-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Ошибка при сохранении статьи
                </div>
              )}
            </div>
          )}

          {/* Таблица статей */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-10">
                <FileQuestion className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white mb-2">Статьи не найдены</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || categoryFilter
                    ? 'Попробуйте изменить параметры поиска или фильтры'
                    : 'Добавьте первую статью, нажав кнопку "Добавить статью" выше'}
                </p>
                {(searchTerm || categoryFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter(null);
                    }}
                    className="mt-3 text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : (
              <div className="min-w-full divide-y dark:divide-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-12 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <div className="col-span-3">Категория</div>
                    <div className="col-span-4">Вопрос</div>
                    <div className="col-span-2">Статус</div>
                    <div className="col-span-3 text-right">Действия</div>
                  </div>
                </div>
                <div className="divide-y dark:divide-gray-700">
                  {filteredArticles.map((article, index) => {
                    // Определяем, является ли статья первой или последней в своей категории
                    const categoryArticles = filteredArticles.filter((a) => a.category === article.category);
                    const isFirstInCategory = categoryArticles[0].id === article.id;
                    const isLastInCategory = categoryArticles[categoryArticles.length - 1].id === article.id;

                    return (
                      <div
                        key={article.id}
                        className="grid grid-cols-12 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="col-span-3 font-medium text-gray-900 dark:text-white flex items-center">
                          <Book className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                          <span className="truncate">{article.category}</span>
                        </div>
                        <div className="col-span-4 text-gray-500 dark:text-gray-300 truncate">{article.question}</div>
                        <div className="col-span-2">
                          {article.is_active ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Активна
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Не активна
                            </span>
                          )}
                        </div>
                        <div className="col-span-3 text-right space-x-3">
                          <button
                            onClick={() => toggleArticleActive(article)}
                            className={`p-1.5 rounded-full ${
                              article.is_active
                                ? isDarkMode
                                  ? 'bg-red-900 text-red-300 hover:bg-red-800'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                                : isDarkMode
                                  ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={article.is_active ? 'Деактивировать' : 'Активировать'}
                          >
                            {article.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEditingArticle(article)}
                            className={`p-1.5 rounded-full ${
                              isDarkMode
                                ? 'bg-blue-900 text-blue-300 hover:bg-blue-800'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteArticle(article)}
                            className={`p-1.5 rounded-full ${
                              isDarkMode
                                ? 'bg-red-900 text-red-300 hover:bg-red-800'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title="Удалить"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          {!isFirstInCategory && (
                            <button
                              onClick={() => moveSortOrder(article, 'up')}
                              className={`p-1.5 rounded-full ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Переместить вверх"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          )}
                          {!isLastInCategory && (
                            <button
                              onClick={() => moveSortOrder(article, 'down')}
                              className={`p-1.5 rounded-full ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Переместить вниз"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default KnowledgeBaseManagePage;
