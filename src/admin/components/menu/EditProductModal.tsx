import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Tag,
  ThumbsUp,
  Search,
  Check,
  Info,
  MapPin,
} from 'lucide-react';
import { Product, Restaurant } from '../../../types';
import { categories, products, sauces, sideDishes } from '../../../utils/mockData';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { fuzzySearch, findRecommendedProducts } from '../../../utils/searchUtils';
import { supabase } from '../../../lib/supabase';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  selectedRestaurantId?: string | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave, selectedRestaurantId }) => {
  const { isDarkMode } = useAdminTheme();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product.name,
    description: product.description,
    price: product.price,
    weight: product.weight,
    image: product.image,
    category_id: product.category_id,
    rating: product.rating || 0,
    reviews_count: product.reviews_count || 0,
    restaurant_id: product.restaurant_id || selectedRestaurantId || null,
  });

  const [imagePreview, setImagePreview] = useState<string>(product.image);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Состояние для рекомендуемых товаров
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState<Product[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);

  // Состояние для дополнительных компонентов
  const [selectedComponents, setSelectedComponents] = useState<{ id: number; name: string; type: string }[]>([]);
  const [showComponentSearch, setShowComponentSearch] = useState(false);
  const [componentSearchTerm, setComponentSearchTerm] = useState('');
  const [componentSearchResults, setComponentSearchResults] = useState<{ id: number; name: string; type: string }[]>(
    [],
  );

  // Состояние для цен в разных ресторанах
  const [restaurantPrices, setRestaurantPrices] = useState<{ [restaurantId: string]: number }>({});
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // Загружаем рестораны из базы данных
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, address')
          .order('name', { ascending: true });

        if (error) throw error;
        setRestaurants(data || []);

        // Если редактируем существующий продукт, получаем цены для всех ресторанов
        if (product.id) {
          const { data: priceData, error: priceError } = await supabase
            .from('restaurant_products')
            .select('restaurant_id, price')
            .eq('product_id', product.id);

          if (priceError) throw priceError;

          const prices: { [restaurantId: string]: number } = {};
          priceData?.forEach((item) => {
            prices[item.restaurant_id] = item.price;
          });

          // Для ресторанов, у которых нет цены, устанавливаем базовую цену продукта
          data?.forEach((restaurant) => {
            if (!prices[restaurant.id]) {
              prices[restaurant.id] = product.price;
            }
          });

          setRestaurantPrices(prices);
        } else {
          // Для нового продукта устанавливаем базовую цену для всех ресторанов
          const prices: { [restaurantId: string]: number } = {};
          data?.forEach((restaurant) => {
            prices[restaurant.id] = formData.price || 0;
          });
          setRestaurantPrices(prices);
        }
      } catch (error) {
        console.error('Ошибка при загрузке ресторанов:', error);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, [product.id, product.price, formData.price]);

  // Объединяем соусы и гарниры в один массив для поиска
  const allComponents = [
    ...sauces.map((sauce) => ({ id: sauce.id, name: sauce.name, type: 'sauce' })),
    ...sideDishes.map((side) => ({ id: side.id, name: side.name, type: 'side' })),
  ];

  // Находим начальный набор рекомендуемых товаров при загрузке
  useEffect(() => {
    const updatedProduct = {
      ...product,
      ...formData,
    } as Product;

    const recommendations = findRecommendedProducts(updatedProduct, products, 'category_id', 'price', 'id', 4);

    setSelectedRecommendedProducts(recommendations);
  }, []);

  // Поиск продуктов по ключевому слову
  useEffect(() => {
    if (productSearchTerm.trim()) {
      const results = fuzzySearch(
        products.filter((p) => p.id !== product.id), // Исключаем текущий продукт
        productSearchTerm,
        ['name', 'description'],
        2,
      );
      // Исключаем уже выбранные продукты
      const filteredResults = results.filter(
        (p) => !selectedRecommendedProducts.some((selected) => selected.id === p.id),
      );
      setProductSearchResults(filteredResults);
    } else {
      setProductSearchResults([]);
    }
  }, [productSearchTerm, selectedRecommendedProducts, product.id]);

  // Поиск компонентов по ключевому слову
  useEffect(() => {
    if (componentSearchTerm.trim()) {
      const results = allComponents.filter(
        (component) =>
          component.name.toLowerCase().includes(componentSearchTerm.toLowerCase()) &&
          !selectedComponents.some((selected) => selected.id === component.id && selected.type === component.type),
      );
      setComponentSearchResults(results);
    } else {
      const availableComponents = allComponents.filter(
        (component) =>
          !selectedComponents.some((selected) => selected.id === component.id && selected.type === component.type),
      );
      setComponentSearchResults(availableComponents);
    }
  }, [componentSearchTerm, selectedComponents]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'price' || name === 'rating' || name === 'reviews_count' || name === 'category_id') {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Очистить ошибки валидации для поля
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  // Обработчик изменения цены для конкретного ресторана
  const handleRestaurantPriceChange = (restaurantId: string, price: number) => {
    setRestaurantPrices((prev) => ({
      ...prev,
      [restaurantId]: price,
    }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Название обязательно';
    }

    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Описание обязательно';
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'Цена должна быть больше нуля';
    }

    if (!formData.weight || formData.weight.trim() === '') {
      errors.weight = 'Вес обязателен';
    }

    if (!formData.image || formData.image.trim() === '') {
      errors.image = 'URL изображения обязателен';
    }

    if (!formData.restaurant_id) {
      errors.restaurant_id = 'Ресторан обязателен';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // В реальном приложении здесь был бы код для загрузки изображения на сервер
      // Сейчас просто эмулируем предварительный просмотр
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({
          ...formData,
          image: result, // В реальности здесь был бы URL загруженного изображения
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...product,
        ...(formData as Product),
        restaurantPrices, // Добавляем цены для разных ресторанов
        restaurant_id: formData.restaurant_id as string,
      });
    }
  };

  // Добавление рекомендуемого товара из поисковых результатов
  const handleAddRecommendedProduct = (newProduct: Product) => {
    setSelectedRecommendedProducts([...selectedRecommendedProducts, newProduct]);
    setProductSearchResults(productSearchResults.filter((p) => p.id !== newProduct.id));
    setProductSearchTerm('');
  };

  // Удаление рекомендуемого товара
  const handleRemoveRecommendedProduct = (productId: number) => {
    setSelectedRecommendedProducts(selectedRecommendedProducts.filter((p) => p.id !== productId));
  };

  // Добавление компонента из поисковых результатов
  const handleAddComponent = (component: { id: number; name: string; type: string }) => {
    setSelectedComponents([...selectedComponents, component]);
    setComponentSearchResults(
      componentSearchResults.filter((c) => !(c.id === component.id && c.type === component.type)),
    );
    setComponentSearchTerm('');
  };

  // Удаление компонента
  const handleRemoveComponent = (component: { id: number; type: string }) => {
    setSelectedComponents(selectedComponents.filter((c) => !(c.id === component.id && c.type === component.type)));
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center`}>
      <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto`}>
        <div
          className={`sticky top-0 flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-10 bg-inherit`}
        >
          <h3 className="text-xl font-bold dark:text-white">{product.id ? 'Редактирование товара' : 'Новый товар'}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Название <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      validationErrors.name
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300'
                    }`}
                    placeholder="Введите название"
                  />
                  {validationErrors.name && <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Описание <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full p-2 border rounded-md ${
                      validationErrors.description
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300'
                    }`}
                    placeholder="Введите описание"
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Базовая цена (₽) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="10"
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.price
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300'
                      }`}
                      placeholder="0"
                    />
                    {validationErrors.price && <p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Вес/Объем <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.weight
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-300'
                      }`}
                      placeholder="100г"
                    />
                    {validationErrors.weight && <p className="mt-1 text-sm text-red-500">{validationErrors.weight}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Категория <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Новый селектор ресторана */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ресторан <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="restaurant_id"
                    value={formData.restaurant_id || ''}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      validationErrors.restaurant_id
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Выберите ресторан --</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name} ({restaurant.address})
                      </option>
                    ))}
                  </select>
                  {validationErrors.restaurant_id && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.restaurant_id}</p>
                  )}
                  {selectedRestaurantId && formData.restaurant_id !== selectedRestaurantId && (
                    <p className="mt-1 text-sm text-amber-500">
                      <Info className="w-4 h-4 inline mr-1" />
                      Вы меняете ресторан для этого продукта
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Рейтинг (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Количество отзывов
                    </label>
                    <input
                      type="number"
                      name="reviews_count"
                      value={formData.reviews_count}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full p-2 border rounded-md ${
                        isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Изображение <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-full h-48 mb-4 rounded-lg overflow-hidden border-2 border-dashed ${
                    validationErrors.image ? 'border-red-500' : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.name || 'Предпросмотр'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Добавить изображение</p>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer block text-center py-2 px-4 border border-gray-300 rounded-md ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    Загрузить фото
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="w-full mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL изображения
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      validationErrors.image
                        ? 'border-red-500'
                        : isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {validationErrors.image && <p className="mt-1 text-sm text-red-500">{validationErrors.image}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Секция с ценами для разных ресторанов */}
          <div
            className={`p-4 rounded-lg border mb-6 ${
              isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-orange-100 bg-orange-50'
            }`}
          >
            <h4 className="font-medium text-lg mb-3 flex items-center dark:text-white">
              <MapPin className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
              Цены в ресторанах
            </h4>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Установите цены для каждого ресторана. Если цена не указана, будет использоваться базовая цена.
            </p>

            {loadingRestaurants ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-sm">Загрузка ресторанов...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-2 md:mb-0">
                        <h5 className="font-medium text-sm dark:text-white">
                          {restaurant.name}
                          {formData.restaurant_id === restaurant.id && (
                            <span className="text-green-500 ml-2 text-xs">
                              <Check className="w-4 h-4 inline" /> Основной ресторан
                            </span>
                          )}
                        </h5>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {restaurant.address}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={restaurantPrices[restaurant.id] || 0}
                          onChange={(e) => handleRestaurantPriceChange(restaurant.id, parseInt(e.target.value) || 0)}
                          className={`w-24 p-2 border rounded-md ${
                            isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                          }`}
                        />
                        <span className="ml-2">₽</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'} border border-dashed ${
                    isDarkMode ? 'border-gray-500' : 'border-orange-300'
                  } text-center`}
                >
                  <button
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-orange-500 hover:text-orange-600'
                    }`}
                    onClick={() => {
                      // Копируем базовую цену во все рестораны
                      const newPrices: { [restaurantId: string]: number } = {};
                      restaurants.forEach((restaurant) => {
                        newPrices[restaurant.id] = formData.price || 0;
                      });
                      setRestaurantPrices(newPrices);
                    }}
                  >
                    Применить базовую цену для всех ресторанов
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Секция рекомендуемых товаров */}
          <div
            className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-orange-100 bg-orange-50'} mb-6`}
          >
            <h4 className="font-medium text-lg mb-3 flex items-center dark:text-white">
              <ThumbsUp className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
              Рекомендуемые товары
            </h4>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Выберите товары, которые будут рекомендованы при просмотре текущего товара
            </p>

            {/* Поисковая строка для товаров */}
            <div className="relative mb-3">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Найти товары для рекомендации..."
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setShowProductSearch(true);
                    }}
                    onFocus={() => setShowProductSearch(true)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                <button
                  className={`ml-2 p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  title={showProductSearch ? 'Скрыть результаты поиска' : 'Показать результаты поиска'}
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Результаты поиска товаров */}
              {showProductSearch && (productSearchResults.length > 0 || !productSearchTerm.trim()) && (
                <div
                  className={`absolute z-10 mt-1 w-full overflow-hidden rounded-lg shadow-lg ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="max-h-60 overflow-y-auto">
                    {!productSearchTerm.trim() ? (
                      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Начните вводить название товара для поиска
                      </div>
                    ) : productSearchResults.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Товары не найдены. Попробуйте другой поисковый запрос.
                      </div>
                    ) : (
                      <ul>
                        {productSearchResults.map((prod) => (
                          <li
                            key={`product-${prod.id}`}
                            className={`p-2 ${
                              isDarkMode
                                ? 'hover:bg-gray-700 border-b border-gray-700 last:border-b-0'
                                : 'hover:bg-gray-50 border-b border-gray-100 last:border-b-0'
                            }`}
                          >
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => handleAddRecommendedProduct(prod)}
                            >
                              <img src={prod.image} alt={prod.name} className="w-8 h-8 object-cover rounded mr-2" />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {prod.name}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {prod.price} ₽ • {categories.find((c) => c.id === prod.category_id)?.name}
                                </p>
                              </div>
                              <button
                                className={`ml-2 p-1 rounded-full ${
                                  isDarkMode
                                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Выбранные рекомендуемые товары */}
            <div className="space-y-2">
              {selectedRecommendedProducts.length === 0 ? (
                <div className={`text-center py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                  Нет выбранных рекомендаций. Добавьте товары через поиск выше.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRecommendedProducts.map((prod) => (
                    <div
                      key={`selected-${prod.id}`}
                      className={`p-2 border rounded-lg flex items-center ${
                        isDarkMode ? 'border-orange-500 bg-orange-900/30' : 'border-orange-500 bg-orange-100'
                      }`}
                    >
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-md mr-2" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : ''}`}>{prod.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {prod.price} ₽ • {categories.find((c) => c.id === prod.category_id)?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveRecommendedProduct(prod.id)}
                        className={`ml-2 p-1 rounded-full ${
                          isDarkMode
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Секция дополнительных компонентов */}
          <div
            className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-blue-100 bg-blue-50'} mb-6`}
          >
            <h4 className="font-medium text-lg mb-3 flex items-center dark:text-white">
              <Tag className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
              Дополнительные компоненты
            </h4>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Добавьте ингредиенты или дополнительные компоненты к товару
            </p>

            {/* Поисковая строка для компонентов */}
            <div className="relative mb-3">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Найти соусы или гарниры..."
                    value={componentSearchTerm}
                    onChange={(e) => {
                      setComponentSearchTerm(e.target.value);
                      setShowComponentSearch(true);
                    }}
                    onFocus={() => setShowComponentSearch(true)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                <button
                  className={`ml-2 p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  onClick={() => setShowComponentSearch(!showComponentSearch)}
                  title={showComponentSearch ? 'Скрыть результаты' : 'Показать все компоненты'}
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Результаты поиска компонентов */}
              {showComponentSearch && (
                <div
                  className={`absolute z-10 mt-1 w-full overflow-hidden rounded-lg shadow-lg ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="max-h-60 overflow-y-auto">
                    {componentSearchResults.length === 0 ? (
                      <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {componentSearchTerm.trim()
                          ? 'Компоненты не найдены. Попробуйте другой поисковый запрос.'
                          : 'Все доступные компоненты уже выбраны.'}
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {componentSearchResults.map((component) => (
                          <li
                            key={`component-${component.type}-${component.id}`}
                            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          >
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => handleAddComponent(component)}
                            >
                              <div
                                className={`w-8 h-8 flex items-center justify-center rounded ${
                                  component.type === 'sauce'
                                    ? isDarkMode
                                      ? 'bg-red-900/30 text-red-400'
                                      : 'bg-red-100 text-red-600'
                                    : isDarkMode
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-green-100 text-green-600'
                                }`}
                              >
                                {component.type === 'sauce' ? '🍯' : '🍟'}
                              </div>
                              <div className="ml-2 flex-1">
                                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {component.name}
                                </p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {component.type === 'sauce' ? 'Соус' : 'Гарнир'}
                                </p>
                              </div>
                              <button
                                className={`ml-2 p-1 rounded-full ${
                                  isDarkMode
                                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Выбранные компоненты */}
            <div className="space-y-2">
              {selectedComponents.length === 0 ? (
                <div className={`text-center py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                  Нет выбранных компонентов. Добавьте компоненты через поиск выше.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedComponents.map((component, index) => (
                    <div
                      key={`selected-component-${index}`}
                      className={`p-2 border rounded-lg flex items-center ${
                        component.type === 'sauce'
                          ? isDarkMode
                            ? 'border-red-500 bg-red-900/30'
                            : 'border-red-300 bg-red-50'
                          : isDarkMode
                            ? 'border-green-500 bg-green-900/30'
                            : 'border-green-300 bg-green-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded ${
                          component.type === 'sauce'
                            ? isDarkMode
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-red-100 text-red-600'
                            : isDarkMode
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {component.type === 'sauce' ? '🍯' : '🍟'}
                      </div>
                      <div className="ml-2 flex-1">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{component.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {component.type === 'sauce' ? 'Соус' : 'Гарнир'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveComponent(component)}
                        className={`ml-2 p-1 rounded-full ${
                          isDarkMode
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-md ${
                isDarkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-md hover:opacity-90"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
