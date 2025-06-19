import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../../types';
import { X, Plus, Minus, Check, HelpCircle, ChevronRight, Star, MessageCircle, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSupabase } from '../../context/SupabaseContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.body.classList.contains('dark-mode'));
    const interval = setInterval(() => {
      setIsDarkMode(document.body.classList.contains('dark-mode'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen && product) {
      const fetchReviews = async () => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
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
      setShowSidesAdded(true);
      setTimeout(() => setShowSidesAdded(false), 1500);
    }
  };

  const handleSauceChange = (sauce: string) => {
    setSelectedSauce(sauce);
    setShowSauceToast(true);
    setTimeout(() => setShowSauceToast(false), 1500);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSauce, selectedSides);
    onClose();
  };

  const handleAddExtraToCart = (name: string, type: 'sauce' | 'side', price: number) => {
    const extraProduct: Product = {
      id: `${type}-${Math.random().toString(36).substring(2, 15)}`,
      name: type === 'sauce' ? `Соус ${name}` : name,
      description: `Дополнительно к заказу: ${name}`,
      price: price,
      weight: type === 'sauce' ? '50г' : '100г',
      image: type === 'sauce'
        ? 'https://images.pexels.com/photos/6941042/pexels-photo-6941042.jpeg'
        : 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg',
      category_id: type === 'sauce' ? (sauces.length > 0 ? sauces[0].id : '') : sides.length > 0 ? sides[0].id : '',
      rating: 0,
      reviews_count: 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addToCart(extraProduct, 1);
    setShowExtraToast(name);
    setTimeout(() => setShowExtraToast(null), 1500);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => quantity > 1 && setQuantity((prev) => prev - 1);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const rating = product.rating || 4.8;
  const reviewCount = product.reviews_count || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-500/75'} flex items-center justify-center p-4`}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-2xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto shadow-xl`}
        >
          <div className="relative">
            {/* Product Image */}
            <div className="relative h-64 overflow-hidden rounded-t-2xl">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-full p-2 shadow-lg transition-transform hover:scale-105`}
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
              </button>

              {/* Rating Badge */}
              <div className="absolute bottom-4 left-4">
                <div className={`flex items-center px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm shadow-sm`}>
                  <div className="flex items-center mr-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {rating.toFixed(1)}
                  </span>
                  <button
                    className={`text-xs ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'} ml-2 flex items-center transition-colors`}
                    onClick={() => setShowReviews(!showReviews)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {reviewCount} {showReviews ? 'Скрыть' : 'Смотреть'}
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Title and Price */}
              <div className="flex justify-between items-start mb-4">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.name}
                </h1>
                <p className={`text-xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                  {product.price.toFixed(0)} ₽
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {product.description}
                </p>
              </div>

              {/* Reviews Section */}
              {showReviews && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="border-t pt-4">
                    <h2 className={`text-lg font-semibold mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      <MessageCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                      Отзывы ({reviews.length})
                    </h2>

                    {reviews.length === 0 ? (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                        Пока нет отзывов. Будьте первым!
                      </p>
                    ) : (
                      <div className={`space-y-3 max-h-60 overflow-y-auto pr-2 ${isDarkMode ? 'bg-gray-700/50 rounded-lg p-2' : ''}`}>
                        {reviews.map((review) => (
                          <motion.div 
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-600' : 'bg-orange-100'} text-orange-500 mr-2`}>
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {review.user_name || 'Аноним'}
                                  </p>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(review.created_at).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {review.comment}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Customization Sections */}
              <div className="space-y-4">
                {/* Sides Section */}
                <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <button 
                    className="flex justify-between items-center w-full p-4"
                    onClick={() => toggleSection('sides')}
                  >
                    <div className="flex items-center">
                      <span className={`font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                        Подгарнировка
                      </span>
                      <HelpCircle className={`w-4 h-4 ml-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'sides' ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'sides' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="flex flex-wrap gap-2">
                          {sides.map((side) => (
                            <motion.button
                              key={side.id}
                              whileTap={{ scale: 0.95 }}
                              className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                                selectedSides.includes(side.name)
                                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md'
                                  : isDarkMode
                                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                    : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                              }`}
                              onClick={() => handleAddSide(side.name)}
                            >
                              {side.name}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sauce Section */}
                <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <button 
                    className="flex justify-between items-center w-full p-4"
                    onClick={() => toggleSection('sauce')}
                  >
                    <div className="flex items-center">
                      <span className={`font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                        Соус на выбор
                      </span>
                      <HelpCircle className={`w-4 h-4 ml-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'sauce' ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'sauce' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {sauces.map((sauce) => (
                            <motion.label
                              key={sauce.id}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedSauce === sauce.name
                                  ? isDarkMode
                                    ? 'bg-orange-500/20 border border-orange-500/50'
                                    : 'bg-orange-100 border border-orange-200'
                                  : isDarkMode
                                    ? 'bg-gray-600 hover:bg-gray-500'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200'
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
                              <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-3 transition-colors ${
                                selectedSauce === sauce.name
                                  ? 'bg-gradient-to-r from-orange-400 to-red-500'
                                  : isDarkMode
                                    ? 'border border-gray-400'
                                    : 'border border-gray-300'
                              }`}>
                                {selectedSauce === sauce.name && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="font-medium">{sauce.name}</span>
                            </motion.label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Extras Section */}
                <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <button 
                    className="flex justify-between items-center w-full p-4"
                    onClick={() => toggleSection('extras')}
                  >
                    <span className={`font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                      Добавить к заказу
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'extras' ? 'rotate-90' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeSection === 'extras' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {[...sauces, ...sides].map((item) => (
                            <motion.div
                              key={`extra-${item.id}`}
                              whileHover={{ y: -2 }}
                              className={`p-3 rounded-lg border transition-all ${
                                isDarkMode 
                                  ? 'bg-gray-600 border-gray-500 hover:border-orange-400' 
                                  : 'bg-white border-gray-200 hover:border-orange-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {item.name}
                                  </div>
                                  <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {item.price} ₽
                                  </div>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    isDarkMode 
                                      ? 'bg-orange-500 hover:bg-orange-600' 
                                      : 'bg-orange-400 hover:bg-orange-500'
                                  } text-white shadow-sm`}
                                  onClick={() => handleAddExtraToCart(
                                    item.name, 
                                    'name' in item ? 'sauce' : 'side', 
                                    item.price
                                  )}
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center border rounded-xl ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <button
                      className={`w-12 h-12 flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      onClick={decrementQuantity}
                    >
                      <Minus className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
                    </button>
                    <span className={`w-12 text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {quantity}
                    </span>
                    <button
                      className={`w-12 h-12 flex items-center justify-center transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      onClick={incrementQuantity}
                    >
                      <Plus className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
                    </button>
                  </div>
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(product.price * quantity).toFixed(0)} ₽
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-lg font-semibold shadow-lg shadow-orange-500/20"
                  onClick={handleAddToCart}
                >
                  В корзину
                </motion.button>

                <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Минимальная сумма заказа на доставку {selectedRestaurant.min_order_amount || 1000}₽</p>
                  <p>Бесплатная доставка от {selectedRestaurant.free_delivery_threshold || 4000}₽</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toast Notifications */}
        <AnimatePresence>
          {showSauceToast && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center"
            >
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span>Соус {selectedSauce} выбран</span>
            </motion.div>
          )}

          {showSidesAdded && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center"
            >
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span>Подгарнировка добавлена</span>
            </motion.div>
          )}

          {showExtraToast && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl z-50 flex items-center"
            >
              <Check className="w-5 h-5 text-green-400 mr-2" />
              <span>{showExtraToast} добавлен в корзину</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailedProductView;