import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, ThumbsUp, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSupabase } from '../context/SupabaseContext';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface RecommendationEngineProps {
  isDarkMode?: boolean;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ isDarkMode }) => {
  const { cartItems } = useCart();
  const { products } = useSupabase(); // Используем данные из Supabase
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Recommendations logic
  useEffect(() => {
    if (cartItems.length > 0) {
      setIsLoading(true);

      // This would be a call to a TensorFlow.js model in a real scenario
      // For now, we'll simulate ML recommendations with some basic logic
      setTimeout(() => {
        const cartProductIds = cartItems.map((item) => item.product.id);
        const cartCategories = cartItems.map((item) => item.product.category_id);

        // 1. Recommend items from categories that complement current cart items
        // 2. Don't recommend items already in cart
        // 3. Prioritize items that pair well with current selections

        let recommendedProducts: Product[] = [];

        // Simple recommendation logic
        if (cartCategories.some((cat) => cat.includes('burger'))) {
          // If there's a burger, recommend sides and drinks
          recommendedProducts = products.filter(
            (p) =>
              (p.category_id.includes('side') || p.category_id.includes('drink')) && !cartProductIds.includes(p.id),
          );
        } else if (cartCategories.some((cat) => cat.includes('grill'))) {
          // If there's a grilled item, recommend garnishes and sauces
          recommendedProducts = products.filter(
            (p) =>
              (p.category_id.includes('side') || p.category_id.includes('sauce')) && !cartProductIds.includes(p.id),
          );
        } else {
          // Default recommendations
          recommendedProducts = products.filter(
            (p) =>
              !cartProductIds.includes(p.id) &&
              ['burger', 'grill', 'group'].some((term) => p.category_id.includes(term)),
          );
        }

        // Limit recommendations to 3 items
        setRecommendations(recommendedProducts.slice(0, 3));
        setIsLoading(false);
      }, 800); // Simulate processing time
    } else {
      // If cart is empty, recommend popular items
      const popularItems = products
        .filter((p) => ['burger', 'grill'].some((term) => p.category_id.includes(term)))
        .slice(0, 3);
      setRecommendations(popularItems);
    }
  }, [cartItems, products]); // Добавляем products в зависимости

  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
      <div
        className={`p-3 flex justify-between items-center cursor-pointer ${
          isDarkMode ? 'bg-gradient-to-r from-orange-700 to-red-700' : 'bg-gradient-to-r from-orange-400 to-red-500'
        }`}
        onClick={() => setShowRecommendations(!showRecommendations)}
      >
        <div className="flex items-center text-white">
          <Lightbulb className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Персональные рекомендации</h3>
        </div>
        {showRecommendations ? (
          <ChevronUp className="h-5 w-5 text-white" />
        ) : (
          <ChevronDown className="h-5 w-5 text-white" />
        )}
      </div>

      {showRecommendations && (
        <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Подбираем рекомендации...</p>
            </div>
          ) : (
            <>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {cartItems.length > 0
                  ? 'Эти блюда идеально дополнят ваш заказ'
                  : 'Популярные блюда, которые могут вам понравиться'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((product) => (
                  <div
                    key={product.id}
                    className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                      isDarkMode ? 'border-gray-700 bg-gray-700' : ''
                    }`}
                  >
                    <div className="relative">
                      <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
                      {/* Рейтинг */}
                      <div className="absolute bottom-2 left-2 bg-white rounded-full px-2 py-0.5 flex items-center shadow-sm">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= Math.round(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium truncate">{product.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                          {product.price} ₽
                        </span>
                        <button className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm">
                          В корзину
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button
                  className={`flex items-center mx-auto ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'}`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">Это полезные рекомендации</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationEngine;
