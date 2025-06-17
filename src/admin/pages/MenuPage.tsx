import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash, X, GridIcon, List, Tag, Star, Eye, MapPin } from 'lucide-react';
import { categories } from '../../utils/mockData';
import EditProductModal from '../components/menu/EditProductModal';
import CategorySidebar from '../components/menu/CategorySidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { Product, Restaurant } from '../../types';
import { fuzzySearch, normalizeString } from '../../utils/searchUtils';
import { supabase } from '../../lib/supabase';
import { useSupabase } from '../../context/SupabaseContext';

const MenuPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const { auth } = useSupabase();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [productList, setProductList] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем информацию о ресторане, к которому привязан пользователь
  const userRestaurantId = auth.profile?.restaurant_id || null;
  const isProductManager = auth.profile?.user_role === 'product_manager';

  // Если пользователь является продукт-менеджером и имеет привязку к ресторану,
  // автоматически выбираем его ресторан при загрузке страницы
  useEffect(() => {
    if (isProductManager && userRestaurantId && !selectedRestaurantId) {
      setSelectedRestaurantId(userRestaurantId);
    }
  }, [isProductManager, userRestaurantId, selectedRestaurantId]);

  // Загружаем продукты и рестораны при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Загружаем рестораны
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('id, name, address')
          .order('name', { ascending: true });

        if (restaurantsError) throw restaurantsError;
        setRestaurants(restaurantsData || []);

        // Формируем запрос для загрузки продуктов
        let query = supabase.from('products').select(`
            *,
            category:category_id(*)
          `);

        // Если пользователь является product_manager с привязкой к ресторану,
        // фильтруем продукты только для этого ресторана
        if (isProductManager && userRestaurantId) {
          query = query.eq('restaurant_id', userRestaurantId);
        }

        // Выполняем запрос
        const { data: productsData, error: productsError } = await query.order('name', { ascending: true });

        if (productsError) throw productsError;

        // Для каждого продукта загружаем цены в разных ресторанах
        const productsWithPrices = await Promise.all(
          (productsData || []).map(async (product) => {
            const { data: pricesData, error: pricesError } = await supabase
              .from('restaurant_products')
              .select('restaurant_id, price, is_available')
              .eq('product_id', product.id);

            if (pricesError) throw pricesError;

            // Создаем объект с ценами для каждого ресторана
            const restaurantPrices: { [restaurantId: string]: number } = {};
            pricesData?.forEach((item) => {
              if (item.is_available) {
                restaurantPrices[item.restaurant_id] = item.price;
              }
            });

            // Добавляем поле restaurant, если у продукта есть restaurant_id
            let restaurant: Restaurant | undefined;
            if (product.restaurant_id) {
              const restaurantObj = restaurantsData?.find((r) => r.id === product.restaurant_id);
              if (restaurantObj) {
                restaurant = restaurantObj;
              }
            }

            return {
              ...product,
              restaurantPrices,
              restaurant,
            };
          }),
        );

        setProductList(productsWithPrices);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте обновить страницу.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isProductManager, userRestaurantId]);

  // Фильтрация продуктов с использованием нечеткого поиска
  const filteredProducts = React.useMemo(() => {
    // Сначала фильтруем по категории
    let filtered = productList;

    if (selectedCategory !== null) {
      filtered = filtered.filter((product) => product.category_id === selectedCategory);
    }

    // Фильтруем по ресторану (если выбран)
    if (selectedRestaurantId !== null) {
      filtered = filtered.filter(
        (product) =>
          // Продукт принадлежит выбранному ресторану
          product.restaurant_id === selectedRestaurantId ||
          // Или продукт без ресторана, но имеет цену для выбранного ресторана
          (!product.restaurant_id &&
            product.restaurantPrices &&
            product.restaurantPrices[selectedRestaurantId] !== undefined),
      );
    }

    // Фильтруем по цене
    if (minPrice !== undefined && minPrice > 0) {
      filtered = filtered.filter((product) => {
        // Если выбран ресторан, проверяем цену в этом ресторане
        if (selectedRestaurantId && product.restaurantPrices && product.restaurantPrices[selectedRestaurantId]) {
          return product.restaurantPrices[selectedRestaurantId] >= minPrice;
        }
        // Иначе проверяем базовую цену
        return product.price >= minPrice;
      });
    }

    if (maxPrice !== undefined && maxPrice > 0) {
      filtered = filtered.filter((product) => {
        // Если выбран ресторан, проверяем цену в этом ресторане
        if (selectedRestaurantId && product.restaurantPrices && product.restaurantPrices[selectedRestaurantId]) {
          return product.restaurantPrices[selectedRestaurantId] <= maxPrice;
        }
        // Иначе проверяем базовую цену
        return product.price <= maxPrice;
      });
    }

    // Применяем нечеткий поиск если есть поисковый запрос
    if (searchTerm.trim()) {
      filtered = fuzzySearch(filtered, searchTerm, ['name', 'description'], 2);
    }

    return filtered;
  }, [productList, searchTerm, selectedCategory, selectedRestaurantId, minPrice, maxPrice]);

  const handleSaveProduct = async (updatedProduct: Product) => {
    setIsLoading(true);

    try {
      if (editingProduct && editingProduct.id) {
        // Обновляем существующий продукт
        const { error } = await supabase
          .from('products')
          .update({
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            weight: updatedProduct.weight,
            image: updatedProduct.image,
            category_id: updatedProduct.category_id,
            restaurant_id: updatedProduct.restaurant_id, // Сохраняем привязку к ресторану
            is_available: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        // Обновляем цены для разных ресторанов
        if (updatedProduct.restaurantPrices) {
          for (const [restaurantId, price] of Object.entries(updatedProduct.restaurantPrices)) {
            // Проверяем, существует ли уже запись для этого продукта и ресторана
            const { data: existingData, error: checkError } = await supabase
              .from('restaurant_products')
              .select('id')
              .eq('product_id', editingProduct.id)
              .eq('restaurant_id', restaurantId)
              .maybeSingle();

            if (checkError) throw checkError;

            if (existingData) {
              // Обновляем существующую запись
              const { error: updateError } = await supabase
                .from('restaurant_products')
                .update({
                  price,
                  is_available: true,
                })
                .eq('id', existingData.id);

              if (updateError) throw updateError;
            } else {
              // Создаем новую запись
              const { error: insertError } = await supabase.from('restaurant_products').insert({
                product_id: editingProduct.id,
                restaurant_id: restaurantId,
                price,
                is_available: true,
              });

              if (insertError) throw insertError;
            }
          }
        }

        // Обновляем продукт в списке
        setProductList((prevProducts) =>
          prevProducts.map((p) =>
            p.id === updatedProduct.id
              ? {
                  ...updatedProduct,
                  restaurantPrices: updatedProduct.restaurantPrices,
                }
              : p,
          ),
        );
      } else {
        // Создаем новый продукт
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            weight: updatedProduct.weight,
            image: updatedProduct.image,
            category_id: updatedProduct.category_id,
            restaurant_id: updatedProduct.restaurant_id, // Сохраняем привязку к ресторану
            is_available: true,
            rating: 0,
            reviews_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Добавляем цены для разных ресторанов
        if (updatedProduct.restaurantPrices && newProduct) {
          for (const [restaurantId, price] of Object.entries(updatedProduct.restaurantPrices)) {
            const { error: insertError } = await supabase.from('restaurant_products').insert({
              product_id: newProduct.id,
              restaurant_id: restaurantId,
              price,
              is_available: true,
            });

            if (insertError) throw insertError;
          }

          // Добавляем к новому продукту restaurantPrices
          const productWithPrices = {
            ...newProduct,
            restaurantPrices: updatedProduct.restaurantPrices,
          };

          // Добавляем новый продукт в список
          setProductList((prevProducts) => [...prevProducts, productWithPrices]);
        } else {
          // Добавляем новый продукт в список без специальных цен
          setProductList((prevProducts) => [...prevProducts, newProduct]);
        }
      }
    } catch (error: any) {
      console.error('Ошибка при сохранении продукта:', error);
      alert('Произошла ошибка при сохранении продукта: ' + (error.message || error));
    } finally {
      setIsLoading(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      setIsLoading(true);
      try {
        // Удаляем продукт из базы данных
        const { error } = await supabase.from('products').delete().eq('id', productId);

        if (error) throw error;

        // Удаляем продукт из списка
        setProductList((prevProducts) => prevProducts.filter((p) => p.id !== productId));
      } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
        alert('Произошла ошибка при удалении продукта');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddNewProduct = () => {
    const newProductTemplate: Product = {
      id: '',
      name: '',
      description: '',
      price: 0,
      weight: '',
      image:
        'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category_id: selectedCategory || categories[0].id,
      rating: 0,
      reviews_count: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      restaurantPrices: {},
      restaurant_id: isProductManager ? userRestaurantId : selectedRestaurantId, // Автоматически устанавливаем ресторан
    };

    setEditingProduct(newProductTemplate);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) {
      return text;
    }

    // Нормализуем и создаем паттерн для замены
    const normalizedHighlight = normalizeString(highlight.trim());
    const normalizedText = normalizeString(text);

    if (!normalizedText.includes(normalizedHighlight)) {
      return text; // Если нет совпадения, просто возвращаем исходный текст
    }

    const regex = new RegExp(`(${normalizedHighlight})`, 'gi');
    const parts = normalizedText.split(regex);

    // Найти соответствующие части в оригинальном тексте
    let currentPos = 0;
    const resultParts = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Обычный текст
        const partLength = parts[i].length;
        resultParts.push(text.substr(currentPos, partLength));
        currentPos += partLength;
      } else {
        // Совпадение
        const partLength = parts[i].length;
        const match = text.substr(currentPos, partLength);
        resultParts.push(
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 dark:text-white">
            {match}
          </mark>,
        );
        currentPos += partLength;
      }
    }

    // Если мы не обработали весь текст, добавляем оставшуюся часть
    if (currentPos < text.length) {
      resultParts.push(text.substr(currentPos));
    }

    return <>{resultParts}</>;
  };

  // Получение цены продукта для выбранного ресторана
  const getProductPrice = (product: Product): number => {
    if (selectedRestaurantId && product.restaurantPrices && product.restaurantPrices[selectedRestaurantId]) {
      return product.restaurantPrices[selectedRestaurantId];
    }
    return product.price;
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">
          Управление меню
          {isProductManager && userRestaurantId && restaurants.find((r) => r.id === userRestaurantId) && (
            <span className="ml-2 text-sm text-green-500">
              ({restaurants.find((r) => r.id === userRestaurantId)?.name})
            </span>
          )}
        </h2>
        <button
          className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 flex items-center"
          onClick={handleAddNewProduct}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить блюдо
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Категории */}
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4">
            <div className="flex flex-wrap md:items-center gap-4">
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Поиск блюд (даже с опечатками)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-orange-500 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Список"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-orange-500 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Сетка"
                >
                  <GridIcon className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} rounded-md text-gray-500 dark:text-gray-400`}
                  onClick={() => setShowFilters(!showFilters)}
                  title="Фильтры"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-3 p-3 border-t  dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedCategory === null
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    Все категории
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-3 py-1 rounded-md text-sm ${
                        selectedCategory === category.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Фильтр по ресторанам */}
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2 dark:text-gray-300">Рестораны</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Отображаем выбор ресторана только для администраторов и менеджеров */}
                    {!isProductManager && (
                      <button
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedRestaurantId === null
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                        onClick={() => setSelectedRestaurantId(null)}
                      >
                        Все рестораны
                      </button>
                    )}
                    {restaurants.map(
                      (restaurant) =>
                        // Для product_manager показываем только его ресторан
                        (!isProductManager || restaurant.id === userRestaurantId) && (
                          <button
                            key={restaurant.id}
                            className={`px-3 py-1 rounded-md text-sm ${
                              selectedRestaurantId === restaurant.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => setSelectedRestaurantId(restaurant.id)}
                            disabled={isProductManager && restaurant.id !== userRestaurantId}
                          >
                            {restaurant.name}
                          </button>
                        ),
                    )}
                  </div>
                </div>

                {/* Дополнительные фильтры могут быть добавлены здесь */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Сортировать по</label>
                    <select
                      className={`text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      } border rounded-md px-2 py-1`}
                    >
                      <option value="name_asc">Название (А-Я)</option>
                      <option value="name_desc">Название (Я-А)</option>
                      <option value="price_asc">Цена (по возрастанию)</option>
                      <option value="price_desc">Цена (по убыванию)</option>
                      <option value="popularity">Популярность</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Цена от</label>
                    <input
                      type="number"
                      placeholder="Мин. цена"
                      className={`text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      } border rounded-md px-2 py-1 w-full`}
                      min="0"
                      value={minPrice || ''}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Цена до</label>
                    <input
                      type="number"
                      placeholder="Макс. цена"
                      className={`text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      } border rounded-md px-2 py-1 w-full`}
                      min="0"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка продуктов...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">По вашему запросу ничего не найдено</p>
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Попробуйте изменить параметры поиска или используйте другие ключевые слова.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                  setSelectedRestaurantId(isProductManager ? userRestaurantId : null);
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                }}
                className="text-orange-500 dark:text-orange-400 font-medium hover:underline"
              >
                Сбросить все фильтры
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                // Получаем цену для выбранного ресторана или базовую цену
                const displayPrice = getProductPrice(product);

                return (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="relative overflow-hidden group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          className="p-2 bg-orange-500 text-white rounded-full m-1 hover:bg-orange-600 transition"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-red-500 text-white rounded-full m-1 hover:bg-red-600 transition"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-blue-500 text-white rounded-full m-1 hover:bg-blue-600 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Добавляем бейдж категории */}
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            isDarkMode ? 'bg-gray-800/80 text-white' : 'bg-white/90 text-gray-800'
                          }`}
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {product.category?.name || 'Категория'}
                        </span>
                      </div>

                      {/* Бейдж ресторана */}
                      {product.restaurant_id && (
                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              isDarkMode ? 'bg-blue-800/80 text-white' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {restaurants.find((r) => r.id === product.restaurant_id)?.name || 'Ресторан'}
                          </span>
                        </div>
                      )}

                      {/* Рейтинг продукта */}
                      {product.rating > 0 && (
                        <div className="absolute bottom-2 left-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium flex items-center ${
                              isDarkMode ? 'bg-gray-800/80 text-white' : 'bg-white/90 text-gray-800'
                            }`}
                          >
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline mr-1" />
                            {product.rating.toFixed(1)}
                            {product.reviews_count > 0 && (
                              <span className="text-xs text-gray-500 ml-1">({product.reviews_count})</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate dark:text-white">
                        {searchTerm ? getHighlightedText(product.name, searchTerm) : product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 h-12 overflow-hidden">
                        {searchTerm
                          ? getHighlightedText(product.description.substring(0, 60) + '...', searchTerm)
                          : product.description.substring(0, 60) + '...'}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-lg dark:text-white">{displayPrice} ₽</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{product.weight}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Товар
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Категория
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ресторан
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Цена
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Вес
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Рейтинг
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProducts.map((product) => {
                      // Получаем цену для выбранного ресторана или базовую цену
                      const displayPrice = getProductPrice(product);

                      return (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {searchTerm ? getHighlightedText(product.name, searchTerm) : product.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {searchTerm
                                    ? getHighlightedText(product.description.substring(0, 60) + '...', searchTerm)
                                    : product.description.substring(0, 60) + '...'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {product.category?.name || 'Категория'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.restaurant_id ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {restaurants.find((r) => r.id === product.restaurant_id)?.name || 'Ресторан'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Все рестораны
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium dark:text-white">
                              {displayPrice} ₽{/* Если продукт имеет разные цены для разных ресторанов */}
                              {selectedRestaurantId &&
                                product.restaurantPrices &&
                                product.restaurantPrices[selectedRestaurantId] !== product.price && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    (Базовая: {product.price} ₽)
                                  </span>
                                )}
                              {!selectedRestaurantId &&
                                product.restaurantPrices &&
                                Object.values(product.restaurantPrices).some((price) => price !== product.price) && (
                                  <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                                    (Есть разные цены)
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {product.weight}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.rating > 0 ? (
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                                <span className="text-sm font-medium dark:text-white">{product.rating.toFixed(1)}</span>
                                {product.reviews_count > 0 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    ({product.reviews_count})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">Нет оценок</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
          selectedRestaurantId={isProductManager ? userRestaurantId : selectedRestaurantId}
        />
      )}
    </div>
  );
};

export default MenuPage;
