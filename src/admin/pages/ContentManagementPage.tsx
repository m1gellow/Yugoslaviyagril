import React, { useState, useEffect } from 'react';
import {
  Edit,
  Save,
  Layout,
  FileText,
  Image,
  Camera,
  Link as LinkIcon,
  List,
  X,
  Check,
  Code,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { supabase } from '../../lib/supabase';

interface Section {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: 'text' | 'promo-card' | 'info-card' | 'image' | 'list';
  sort_order?: number;
}

interface PageContent {
  title: string;
  sections: Section[];
}

const ContentManagementPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [selectedPage, setSelectedPage] = useState<string>('promos');
  const [pageContent, setPageContent] = useState<Record<string, PageContent>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [sectionFormData, setSectionFormData] = useState<Section | null>(null);
  const [isAddingSectionForm, setIsAddingSectionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Список страниц, доступных для редактирования
  const editablePages = [
    { id: 'promos', name: 'Акции и бонусы' },
    { id: 'delivery', name: 'Доставка и оплата' },
  ];

  // Загрузка контента страницы из Supabase
  const fetchPageContent = async (pageId: string) => {
    console.log(`Загрузка содержимого страницы: ${pageId}`);
    setLoading(true);
    setError(null);

    try {
      // 1. Получаем информацию о странице - используем maybeSingle вместо single
      // чтобы избежать ошибки, когда страница не найдена
      const { data: pageDataArray, error: pageError } = await supabase
        .from('page_content')
        .select('id, title')
        .eq('page_id', pageId);

      if (pageError) {
        console.error('Ошибка при получении данных страницы:', pageError);
        setError(`Ошибка загрузки страницы: ${pageError.message}`);
        return;
      }

      // Проверяем, есть ли данные
      const pageData = pageDataArray && pageDataArray.length > 0 ? pageDataArray[0] : null;

      // 2. Если страница не существует, создаем её с дефолтным заголовком
      let pageTitle = editablePages.find((p) => p.id === pageId)?.name || pageId;
      let pageId_db = '';

      if (!pageData) {
        console.log(`Страница ${pageId} не найдена, создаем новую`);

        // Проверяем еще раз, не существует ли страница с таким page_id
        // для избежания race condition и дубликатов
        const { count, error: countError } = await supabase
          .from('page_content')
          .select('id', { count: 'exact', head: true })
          .eq('page_id', pageId);

        if (countError) {
          console.error('Ошибка при проверке существования страницы:', countError);
          setError(`Ошибка проверки страницы: ${countError.message}`);
          return;
        }

        // Если страница уже существует, получаем её данные
        if (count && count > 0) {
          console.log(`Страница ${pageId} уже существует, получаем данные`);
          const { data: existingPage, error: existingPageError } = await supabase
            .from('page_content')
            .select('id, title')
            .eq('page_id', pageId)
            .limit(1)
            .single();

          if (existingPageError) {
            console.error('Ошибка при получении существующей страницы:', existingPageError);
            setError(`Ошибка получения страницы: ${existingPageError.message}`);
            return;
          }

          pageTitle = existingPage.title;
          pageId_db = existingPage.id;
        } else {
          // Если страница не существует, создаем новую
          const { data: newPageData, error: newPageError } = await supabase
            .from('page_content')
            .insert({ page_id: pageId, title: pageTitle })
            .select('id, title')
            .single();

          if (newPageError) {
            // Если произошла ошибка дублирования ключа, значит страница уже была создана
            // (race condition), получаем существующую страницу
            if (newPageError.code === '23505') {
              console.log('Дубликат ключа, страница уже была создана. Получаем существующую.');
              const { data: existingPage, error: existingPageError } = await supabase
                .from('page_content')
                .select('id, title')
                .eq('page_id', pageId)
                .limit(1)
                .single();

              if (existingPageError) {
                console.error('Ошибка при получении существующей страницы:', existingPageError);
                setError(`Ошибка получения страницы: ${existingPageError.message}`);
                return;
              }

              pageTitle = existingPage.title;
              pageId_db = existingPage.id;
            } else {
              console.error('Ошибка при создании страницы:', newPageError);
              setError(`Ошибка создания страницы: ${newPageError.message}`);
              return;
            }
          } else {
            console.log(`Страница ${pageId} успешно создана`);
            pageTitle = newPageData.title;
            pageId_db = newPageData.id;
          }
        }
      } else {
        console.log(`Страница ${pageId} найдена, id: ${pageData.id}`);
        pageTitle = pageData.title;
        pageId_db = pageData.id;
      }

      // 3. Получаем секции страницы
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('page_sections')
        .select('id, title, content, image_url, section_type, sort_order')
        .eq('page_id', pageId_db)
        .order('sort_order', { ascending: true });

      if (sectionsError) {
        console.error('Ошибка при получении секций страницы:', sectionsError);
        setError(`Ошибка загрузки секций: ${sectionsError.message}`);
        return;
      }

      console.log(`Загружено ${sectionsData?.length || 0} секций для страницы ${pageId}`);

      // 4. Преобразуем данные для компонента
      const sections = sectionsData
        ? sectionsData.map((section) => ({
            id: section.id,
            title: section.title,
            content: section.content || '',
            imageUrl: section.image_url,
            type: section.section_type as 'text' | 'promo-card' | 'info-card' | 'image' | 'list',
            sort_order: section.sort_order,
          }))
        : [];

      // 5. Обновляем состояние
      setPageContent((prev) => ({
        ...prev,
        [pageId]: {
          title: pageTitle,
          sections: sections,
        },
      }));

      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Ошибка в fetchPageContent:', errorMessage);
      setError(`Произошла ошибка: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем контент при изменении выбранной страницы
  useEffect(() => {
    if (selectedPage) {
      fetchPageContent(selectedPage);
    }
  }, [selectedPage]);

  // Начать редактирование заголовка
  const startEditingTitle = () => {
    setTempTitle(pageContent[selectedPage]?.title || '');
    setIsEditingTitle(true);
  };

  // Сохранить отредактированный заголовок
  const saveTitle = async () => {
    console.log(`Сохранение заголовка для страницы ${selectedPage}: ${tempTitle}`);
    setSaveStatus('saving');

    try {
      // 1. Находим ID страницы в базе данных
      const { data: pageData, error: pageError } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_id', selectedPage)
        .limit(1)
        .single();

      if (pageError) {
        console.error('Ошибка поиска страницы:', pageError);
        setSaveStatus('error');
        return;
      }

      // 2. Обновляем заголовок
      const { error: updateError } = await supabase
        .from('page_content')
        .update({ title: tempTitle })
        .eq('id', pageData.id);

      if (updateError) {
        console.error('Ошибка обновления заголовка:', updateError);
        setSaveStatus('error');
        return;
      }

      console.log(`Заголовок страницы ${selectedPage} успешно обновлен`);

      // 3. Обновляем состояние
      setPageContent({
        ...pageContent,
        [selectedPage]: {
          ...pageContent[selectedPage],
          title: tempTitle,
        },
      });

      setIsEditingTitle(false);
      setSaveStatus('success');

      // Сбрасываем статус через 3 секунды
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Ошибка в saveTitle:', errorMessage);
      setSaveStatus('error');
    }
  };

  // Начать редактирование секции
  const startEditingSection = (sectionId: string) => {
    console.log(`Начало редактирования секции: ${sectionId}`);
    const section = pageContent[selectedPage]?.sections.find((s) => s.id === sectionId);
    if (section) {
      setSectionFormData({ ...section });
      setEditingSection(sectionId);
    }
  };

  // Начать добавление новой секции
  const startAddingSection = () => {
    console.log('Начало добавления новой секции');
    setSectionFormData({
      id: 'new',
      title: '',
      content: '',
      type: 'text',
    });
    setEditingSection('new');
    setIsAddingSectionForm(true);
  };

  // Сохранить отредактированную секцию
  const saveSection = async () => {
    if (!sectionFormData) return;

    console.log('Сохранение секции:', sectionFormData);
    setSaveStatus('saving');

    try {
      // 1. Находим ID страницы в базе данных
      const { data: pageData, error: pageError } = await supabase
        .from('page_content')
        .select('id')
        .eq('page_id', selectedPage)
        .limit(1)
        .single();

      if (pageError) {
        console.error('Ошибка поиска страницы:', pageError);
        setSaveStatus('error');
        return;
      }

      // 2. Выполняем операцию в зависимости от типа действия (добавление или обновление)
      if (editingSection === 'new') {
        // Находим максимальный sort_order
        const maxSortOrder = pageContent[selectedPage]?.sections.reduce(
          (max, section) => Math.max(max, section.sort_order || 0),
          0,
        );

        console.log(`Добавление новой секции с sort_order: ${maxSortOrder + 1}`);

        // Добавление новой секции
        const { data: newSection, error: insertError } = await supabase
          .from('page_sections')
          .insert({
            page_id: pageData.id,
            title: sectionFormData.title,
            content: sectionFormData.content,
            image_url: sectionFormData.imageUrl,
            section_type: sectionFormData.type,
            sort_order: maxSortOrder + 1,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Ошибка добавления секции:', insertError);
          setSaveStatus('error');
          return;
        }

        console.log('Секция успешно добавлена:', newSection);

        // Обновляем состояние
        setPageContent({
          ...pageContent,
          [selectedPage]: {
            ...pageContent[selectedPage],
            sections: [
              ...(pageContent[selectedPage]?.sections || []),
              {
                id: newSection.id,
                title: newSection.title,
                content: newSection.content || '',
                imageUrl: newSection.image_url,
                type: newSection.section_type as 'text' | 'promo-card' | 'info-card' | 'image' | 'list',
                sort_order: newSection.sort_order,
              },
            ],
          },
        });
      } else {
        // Обновление существующей секции
        console.log(`Обновление секции: ${editingSection}`);

        const { error: updateError } = await supabase
          .from('page_sections')
          .update({
            title: sectionFormData.title,
            content: sectionFormData.content,
            image_url: sectionFormData.imageUrl,
            section_type: sectionFormData.type,
          })
          .eq('id', editingSection);

        if (updateError) {
          console.error('Ошибка обновления секции:', updateError);
          setSaveStatus('error');
          return;
        }

        console.log('Секция успешно обновлена');

        // Обновляем состояние
        setPageContent({
          ...pageContent,
          [selectedPage]: {
            ...pageContent[selectedPage],
            sections: pageContent[selectedPage].sections.map((section) =>
              section.id === editingSection
                ? {
                    ...section,
                    title: sectionFormData.title,
                    content: sectionFormData.content,
                    imageUrl: sectionFormData.imageUrl,
                    type: sectionFormData.type,
                  }
                : section,
            ),
          },
        });
      }

      setEditingSection(null);
      setSectionFormData(null);
      setIsAddingSectionForm(false);
      setSaveStatus('success');

      // Сбрасываем статус через 3 секунды
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Ошибка в saveSection:', errorMessage);
      setSaveStatus('error');
    }
  };

  // Отмена редактирования секции
  const cancelEditingSection = () => {
    console.log('Отмена редактирования секции');
    setEditingSection(null);
    setSectionFormData(null);
    setIsAddingSectionForm(false);
  };

  // Удаление секции
  const deleteSection = async (sectionId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту секцию?')) {
      console.log(`Удаление секции: ${sectionId}`);
      setSaveStatus('saving');

      try {
        // Удаляем секцию из базы данных
        const { error } = await supabase.from('page_sections').delete().eq('id', sectionId);

        if (error) {
          console.error('Ошибка удаления секции:', error);
          setSaveStatus('error');
          return;
        }

        console.log(`Секция ${sectionId} успешно удалена`);

        // Обновляем состояние
        setPageContent({
          ...pageContent,
          [selectedPage]: {
            ...pageContent[selectedPage],
            sections: pageContent[selectedPage].sections.filter((section) => section.id !== sectionId),
          },
        });

        setSaveStatus('success');

        // Сбрасываем статус через 3 секунды
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Ошибка в deleteSection:', errorMessage);
        setSaveStatus('error');
      }
    }
  };

  // Обработчик изменения данных формы секции
  const handleSectionFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    if (!sectionFormData) return;

    const { name, value } = e.target;
    setSectionFormData({
      ...sectionFormData,
      [name]: value,
    });
  };

  // Сохранение всей страницы
  const savePage = async () => {
    console.log(`Сохранение страницы ${selectedPage}`);
    setSaveStatus('saving');

    try {
      if (!pageContent[selectedPage]) {
        throw new Error(`Нет данных для страницы ${selectedPage}`);
      }

      // 1. Проверяем, существует ли страница
      const { count, error: countError } = await supabase
        .from('page_content')
        .select('id', { count: 'exact', head: true })
        .eq('page_id', selectedPage);

      if (countError) {
        console.error('Ошибка при проверке существования страницы:', countError);
        setSaveStatus('error');
        return;
      }

      let pageId;

      if (count && count > 0) {
        // Страница существует, получаем её ID
        const { data: existingPage, error: getError } = await supabase
          .from('page_content')
          .select('id')
          .eq('page_id', selectedPage)
          .limit(1)
          .single();

        if (getError) {
          console.error('Ошибка получения существующей страницы:', getError);
          setSaveStatus('error');
          return;
        }

        pageId = existingPage.id;

        // Обновляем заголовок
        const { error: updateError } = await supabase
          .from('page_content')
          .update({ title: pageContent[selectedPage].title })
          .eq('id', pageId);

        if (updateError) {
          console.error('Ошибка обновления заголовка страницы:', updateError);
          setSaveStatus('error');
          return;
        }
      } else {
        // Страница не существует, создаем её
        const { data: newPage, error: createError } = await supabase
          .from('page_content')
          .insert({
            page_id: selectedPage,
            title: pageContent[selectedPage].title,
          })
          .select('id')
          .single();

        if (createError) {
          // Проверяем, не является ли ошибка дубликатом ключа (race condition)
          if (createError.code === '23505') {
            console.log('Дубликат ключа, страница уже была создана. Получаем существующую.');
            const { data: existingPage, error: existingPageError } = await supabase
              .from('page_content')
              .select('id')
              .eq('page_id', selectedPage)
              .limit(1)
              .single();

            if (existingPageError) {
              console.error('Ошибка при получении существующей страницы:', existingPageError);
              setSaveStatus('error');
              return;
            }

            pageId = existingPage.id;

            // Обновляем заголовок
            const { error: updateError } = await supabase
              .from('page_content')
              .update({ title: pageContent[selectedPage].title })
              .eq('id', pageId);

            if (updateError) {
              console.error('Ошибка обновления заголовка страницы:', updateError);
              setSaveStatus('error');
              return;
            }
          } else {
            console.error('Ошибка создания страницы:', createError);
            setSaveStatus('error');
            return;
          }
        } else {
          pageId = newPage.id;
        }
      }

      console.log(`Страница ${selectedPage} успешно сохранена`);
      setSaveStatus('success');

      // Сбрасываем статус через 3 секунды
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Ошибка в savePage:', errorMessage);
      setSaveStatus('error');
    }
  };

  // Рендеринг формы редактирования секции
  const renderSectionForm = () => {
    if (!sectionFormData) return null;

    return (
      <div
        className={`p-4 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
      >
        <h3 className="font-medium text-lg mb-4 dark:text-white">
          {editingSection === 'new' ? 'Добавление секции' : 'Редактирование секции'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип секции</label>
            <select
              name="type"
              value={sectionFormData.type}
              onChange={handleSectionFormChange}
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'
              }`}
            >
              <option value="text">Текстовый блок</option>
              <option value="promo-card">Промо-карточка</option>
              <option value="info-card">Инфо-карточка</option>
              <option value="image">Изображение</option>
              <option value="list">Список</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок</label>
            <input
              type="text"
              name="title"
              value={sectionFormData.title}
              onChange={handleSectionFormChange}
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Содержимое</label>
            <textarea
              name="content"
              value={sectionFormData.content}
              onChange={handleSectionFormChange}
              rows={4}
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          {(sectionFormData.type === 'promo-card' || sectionFormData.type === 'image') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL изображения</label>
              <input
                type="text"
                name="imageUrl"
                value={sectionFormData.imageUrl || ''}
                onChange={handleSectionFormChange}
                placeholder="https://example.com/image.jpg"
                className={`w-full p-2 border rounded-md ${
                  isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'
                }`}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={cancelEditingSection}
              className={`px-3 py-1.5 border rounded-md ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Отмена
            </button>
            <button
              onClick={saveSection}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Если данные еще не загружены, показываем загрузку
  if (loading && Object.keys(pageContent).length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <div className="ml-3 text-lg">Загрузка страницы...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Управление контентом страниц</h2>
        <div className="flex space-x-2">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className={`px-3 py-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          >
            {editablePages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.name}
              </option>
            ))}
          </select>
          <button
            onClick={savePage}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 text-white rounded-md flex items-center ${
              saveStatus === 'saving'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700'
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
                Сохранить страницу
              </>
            )}
          </button>
        </div>
      </div>

      {/* Отображение ошибок */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Уведомление об успешном сохранении */}
      {saveStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Изменения успешно сохранены
        </div>
      )}

      {/* Уведомление об ошибке */}
      {saveStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-center">
          <X className="w-5 h-5 mr-2" />
          Ошибка при сохранении изменений
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          {isEditingTitle ? (
            <div className="flex-1 flex items-center">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className={`flex-1 text-xl font-bold p-1 border-b-2 mr-2 ${
                  isDarkMode ? 'bg-transparent border-orange-500 text-white' : 'border-orange-500'
                }`}
                autoFocus
              />
              <div>
                <button
                  onClick={saveTitle}
                  className={`p-1 rounded-full mr-1 ${
                    isDarkMode
                      ? 'bg-green-900/20 text-green-500 hover:bg-green-900/30'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className={`p-1 rounded-full ${
                    isDarkMode
                      ? 'bg-red-900/20 text-red-500 hover:bg-red-900/30'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <h2 className="text-xl font-bold dark:text-white">{pageContent[selectedPage]?.title || ''}</h2>
              <button
                onClick={startEditingTitle}
                className={`ml-2 p-1 rounded-full ${
                  isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>URL: /{selectedPage}</span>
            <button
              className={`ml-2 p-1 rounded-full ${
                isDarkMode
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Содержимое страницы */}
        <div className="space-y-6">
          {pageContent[selectedPage]?.sections?.map((section) => (
            <div
              key={section.id}
              className={`border rounded-lg overflow-hidden group ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div
                className={`p-3 flex justify-between items-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center">
                  {section.type === 'text' && <FileText className="w-4 h-4 mr-2 text-blue-500" />}
                  {section.type === 'promo-card' && <Layout className="w-4 h-4 mr-2 text-orange-500" />}
                  {section.type === 'info-card' && <FileText className="w-4 h-4 mr-2 text-green-500" />}
                  {section.type === 'image' && <Image className="w-4 h-4 mr-2 text-purple-500" />}
                  {section.type === 'list' && <List className="w-4 h-4 mr-2 text-yellow-500" />}
                  <span className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{section.title}</span>
                </div>
                <div className={`flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button
                    onClick={() => startEditingSection(section.id)}
                    className={`p-1 rounded-full ${
                      isDarkMode
                        ? 'bg-blue-900/20 text-blue-500 hover:bg-blue-900/30'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className={`p-1 rounded-full ${
                      isDarkMode
                        ? 'bg-red-900/20 text-red-500 hover:bg-red-900/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Содержимое секции зависит от ее типа */}
              {section.type === 'text' && (
                <div className="p-4">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{section.content}</p>
                </div>
              )}

              {section.type === 'promo-card' && (
                <div className="p-4 flex flex-col md:flex-row">
                  {section.imageUrl && (
                    <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-full h-40 md:h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className={`${section.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                    <h3 className="font-bold text-lg mb-2 dark:text-white">{section.title}</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{section.content}</p>
                  </div>
                </div>
              )}

              {section.type === 'info-card' && (
                <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">{section.title}</h3>
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-line`}>
                    {section.content}
                  </div>
                </div>
              )}

              {section.type === 'image' && section.imageUrl && (
                <div className="p-4">
                  <img src={section.imageUrl} alt={section.title} className="w-full h-48 object-cover rounded-lg" />
                  {section.content && (
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {section.content}
                    </p>
                  )}
                </div>
              )}

              {section.type === 'list' && (
                <div className="p-4">
                  <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {section.content.split('\n').map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Форма для редактирования/добавления секции */}
          {editingSection && renderSectionForm()}

          {/* Кнопка для добавления новой секции */}
          {!editingSection && (
            <button
              onClick={startAddingSection}
              className={`w-full py-3 border-2 border-dashed rounded-lg flex items-center justify-center ${
                isDarkMode
                  ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Добавить новую секцию
            </button>
          )}
        </div>

        {/* Демонстрация HTML/CSS кода страницы */}
        <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium flex items-center dark:text-white">
              <Code className="w-4 h-4 mr-2" />
              HTML/CSS код страницы
            </h3>
            <button
              className={`text-sm ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
              }`}
            >
              Редактировать код
            </button>
          </div>
          <pre
            className={`p-3 rounded text-sm overflow-auto max-h-40 ${
              isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
            }`}
          >
            {`<div class="container mx-auto px-4 py-8">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
    <h1 class="text-3xl font-bold mb-6 text-center">${pageContent[selectedPage]?.title || ''}</h1>
    <!-- Содержимое страницы -->
    ${
      pageContent[selectedPage]?.sections
        ?.map(
          (section) =>
            `<div class="mb-6">
        <h2 class="text-xl font-bold mb-4">${section.title}</h2>
        <p>${section.content}</p>
      </div>`,
        )
        .join('\n    ') || ''
    }
  </div>
</div>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ContentManagementPage;
