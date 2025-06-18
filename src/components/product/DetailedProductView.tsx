import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../../types';
import { X, Plus, Minus, Check, HelpCircle, ChevronRight, Star, MessageCircle, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSupabase } from '../../context/SupabaseContext';
import { supabase } from '../../lib/supabase';

interface DetailedProductViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const DetailedProductView: React.FC<DetailedProductViewProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { selectedRestaurant } = useRestaurant();
  const { sauces, sides } = useSupabase();
  const [selectedSauce, setSelectedSauce] = useState<string>('Сербский');
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSauceToast, setShowSauceToast] = useState(false);
  const [showSidesAdded, setShowSidesAdded] = useState(false);
  const [showExtraToast, setShowExtraToast] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Определяем темную тему из Body
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark-mode'));

  // Проверяем текущую тему системы регулярно
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.body.classList.contains('dark-mode'));
    };

    checkDarkMode();
    const interval = setInterval(checkDarkMode, 1000);

    return () => clearInterval(interval);
  }, []);

  // Загружаем отзывы при открытии
  useEffect(() => {
    if (isOpen && product) {
      // Получаем отзывы о товаре из Supabase
      const fetchReviews = async () => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching reviews:', error);
            return;
          }

          setReviews(data || []);
        } catch (err) {
          console.error('Failed to fetch reviews:', err);
        }
      };

      fetchReviews();
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleAddSide = (side: string) => {
    if (selectedSides.includes(side)) {
      setSelectedSides(selectedSides.filter((s) => s !== side));
    } else {
      setSelectedSides([...selectedSides, side]);
      // Показываем уведомление при добавлении
      setShowSidesAdded(true);
      setTimeout(() => setShowSidesAdded(false), 1500);
    }
  };

  const handleSauceChange = (sauce: string) => {
    setSelectedSauce(sauce);
    // Показываем уведомление при выборе соуса
    setShowSauceToast(true);
    setTimeout(() => setShowSauceToast(false), 1500);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSauce, selectedSides);
    onClose();
  };

  const handleAddExtraToCart = (name: string, type: 'sauce' | 'side', price: number) => {
    // Создаем временный товар для добавления в корзину
    const extraProduct: Product = {
      id: `${type}-${Math.random().toString(36).substring(2, 15)}`,
      name: type === 'sauce' ? `Соус ${name}` : name,
      description: `Дополнительно к заказу: ${name}`,
      price: price,
      weight: type === 'sauce' ? '50г' : '100г',
      image:
        type === 'sauce'
          ? 'https://images.pexels.com/photos/6941042/pexels-photo-6941042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
          : 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      category_id: type === 'sauce' ? (sauces.length > 0 ? sauces[0].id : '') : sides.length > 0 ? sides[0].id : '',
      rating: 0,
      reviews_count: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addToCart(extraProduct, 1);

    // Показываем уведомление о добавлении
    setShowExtraToast(name);
    setTimeout(() => setShowExtraToast(null), 1500);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const rating = product.rating || 4.8;
  const reviewCount = product.reviews_count || 0;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-gray-900 bg-opacity-90' : 'bg-gray-500 bg-opacity-75'} flex items-center justify-center`}
    >
      <div
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg w-full max-w-lg mx-auto my-8 max-h-[90vh] overflow-y-auto`}
      >
        <div className="relative">
          {/* Картинка и рейтинг */}
          <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-full p-1 shadow-md`}
          >
            <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-500'}`} />
          </button>

          <div
            className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-full px-3 py-1 flex items-center`}
          >
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className={`text-sm font-bold ml-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {rating.toFixed(1)}
            </span>
            <button
              className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} ml-2 flex items-center`}
              onClick={() => setShowReviews(!showReviews)}
            >
              <MessageCircle className="w-3 h-3 mr-0.5" />
              {reviewCount} {showReviews ? 'Скрыть' : 'Смотреть'}
            </button>
          </div>
        </div>

        {/* Заголовок и цена */}
        <div className="p-4">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{product.name}</h1>

          {/* Описание */}
          <div className="mt-3">
            <h2 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Описание</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.description}</p>
            <p className={`text-xl font-bold mt-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {product.price.toFixed(0)} ₽
            </p>
          </div>

          {/* Отзывы (открыты только когда showReviews == true) */}
          {showReviews && (
            <div className="mt-4">
              <h2
                className={`text-lg font-medium mb-2 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                <MessageCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                Отзывы посетителей ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  У этого блюда еще нет отзывов. Будьте первым, кто поделится мнением!
                </p>
              ) : (
                <div className={`space-y-3 max-h-60 overflow-y-auto p-2 ${isDarkMode ? 'bg-gray-700 rounded-lg' : ''}`}>
                  {reviews.map((review) => (
                    <div key={review.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-500' : 'bg-orange-100'} text-orange-500 mr-2`}
                          >
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{review.user_name}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(review.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {review.comment || 'Пользователь оценил товар без комментария'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 text-center">
                <button
                  className={`text-sm ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'}`}
                  onClick={() => setShowReviews(false)}
                >
                  Свернуть отзывы
                </button>
              </div>
            </div>
          )}

          {/* Подгарнировка (аккордеон) */}
          <div className={`mt-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button className="flex justify-between items-center w-full py-3" onClick={() => toggleSection('sides')}>
              <div className="flex items-center">
                <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} font-medium`}>
                  Подгарнировка
                </span>
                <HelpCircle className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} ml-1`} />
              </div>
              <ChevronRight
                className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} transition-transform duration-300 ${activeSection === 'sides' ? 'rotate-90' : ''}`}
              />
            </button>
            {activeSection === 'sides' && (
              <div className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {sides.map((side) => (
                    <button
                      key={side.id}
                      className={`py-1 px-3 border rounded-full text-sm ${
                        selectedSides.includes(side.name)
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                          : isDarkMode
                            ? 'border-gray-600 hover:border-orange-400 text-white'
                            : 'border-gray-300 hover:border-orange-400'
                      }`}
                      onClick={() => handleAddSide(side.name)}
                    >
                      {side.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Соус на выбор (аккордеон) */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button className="flex justify-between items-center w-full py-3" onClick={() => toggleSection('sauce')}>
              <div className="flex items-center">
                <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} font-medium`}>
                  Соус на выбор
                </span>
                <HelpCircle className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} ml-1`} />
              </div>
              <ChevronRight
                className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} transition-transform duration-300 ${activeSection === 'sauce' ? 'rotate-90' : ''}`}
              />
            </button>
            {activeSection === 'sauce' && (
              <div className="pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {sauces.map((sauce) => (
                    <div key={sauce.id} className="flex items-center">
                      <label
                        className={`flex items-center border rounded-full px-3 py-2 w-full cursor-pointer ${
                          isDarkMode ? 'border-gray-700 text-white' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="sauce"
                          value={sauce.name}
                          checked={selectedSauce === sauce.name}
                          onChange={() => handleSauceChange(sauce.name)}
                          className="hidden"
                        />
                        <span
                          className={`w-5 h-5 flex items-center justify-center rounded-full mr-2 ${
                            selectedSauce === sauce.name
                              ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                              : isDarkMode
                                ? 'border border-gray-600'
                                : 'border border-gray-300'
                          }`}
                        >
                          {selectedSauce === sauce.name && <Check className="w-3 h-3" />}
                        </span>
                        <span>{sauce.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Добавить к заказу (аккордеон) */}
          <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button className="flex justify-between items-center w-full py-3" onClick={() => toggleSection('extras')}>
              <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} font-medium`}>
                Добавить к заказу
              </span>
              <ChevronRight
                className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} transition-transform duration-300 ${activeSection === 'extras' ? 'rotate-90' : ''}`}
              />
            </button>
            {activeSection === 'extras' && (
              <div className="pb-4 grid gap-2">
                <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                  {sauces.map((sauce) => (
                    <div
                      key={`extra-${sauce.id}`}
                      className={`flex justify-between items-center p-2 border rounded ${
                        isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : ''}`}>Соус {sauce.name}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {sauce.price} ₽
                        </div>
                      </div>
                      <button
                        className={`w-6 h-6 ${
                          isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                        } rounded-full flex items-center justify-center`}
                        onClick={() => handleAddExtraToCart(sauce.name, 'sauce', sauce.price)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {sides.map((side) => (
                    <div
                      key={`extra-${side.id}`}
                      className={`flex justify-between items-center p-2 border rounded ${
                        isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : ''}`}>{side.name}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {side.price} ₽
                        </div>
                      </div>
                      <button
                        className={`w-6 h-6 ${
                          isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                        } rounded-full flex items-center justify-center`}
                        onClick={() => handleAddExtraToCart(side.name, 'side', side.price)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Счетчик и кнопка добавления */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-5">
              <div className={`flex items-center border rounded-lg ${isDarkMode ? 'border-gray-700' : ''}`}>
                <button
                  className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'text-white' : ''}`}
                  onClick={decrementQuantity}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center">{quantity}</span>
                <button
                  className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'text-white' : ''}`}
                  onClick={incrementQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {(product.price * quantity).toFixed(0)} ₽
              </span>
            </div>

            <button
              className="py-3 w-full bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-lg font-medium"
              onClick={handleAddToCart}
            >
              В корзину
            </button>
          </div>

          <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
            <p>Минимальная сумма заказа на доставку {selectedRestaurant.min_order_amount || 1000}₽</p>
            <p>Бесплатная доставка от {selectedRestaurant.free_delivery_threshold || 4000} ₽</p>
          </div>
        </div>
      </div>

      {/* Всплывающее уведомление о выборе соуса */}
      {showSauceToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideUp">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            <span>Соус {selectedSauce} выбран</span>
          </div>
        </div>
      )}

      {/* Всплывающее уведомление о добавлении гарнировки */}
      {showSidesAdded && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideUp">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            <span>Подгарнировка добавлена</span>
          </div>
        </div>
      )}

      {/* Всплывающее уведомление о добавлении дополнения */}
      {showExtraToast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideUp">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-500 mr-2" />
            <span>{showExtraToast} добавлен в корзину</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedProductView;
