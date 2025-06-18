import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { HelpCircle, ShoppingCart, Heart, Star, MapPin } from 'lucide-react';
import { useRestaurant } from '../../../context/RestaurantContext';


import { useSupabase } from '../../../context/SupabaseContext';
import { getFromStorage, saveToStorage } from '../../../utils/localStorageUtils';
import ProductModal from '../modals/ProductModal';
import DetailedProductView from '../../product/DetailedProductView';

// Ключ для localStorage
const LIKED_ITEMS_KEY = 'yugoslavia_grill_liked_items';
const LIKED_ITEMS_INFO_KEY = 'yugoslavia_grill_liked_items_info';

interface ProductCardProps {
  product: Product;
  restaurantId?: string;
  isDarkMode?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, restaurantId, isDarkMode }) => {
  const { getProductPrice, selectedRestaurant } = useRestaurant();
  const { getProductPriceForRestaurant, restaurants } = useSupabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(product.price);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  // Используем рейтинги из данных продукта
  const rating = product.rating || 0;
  const reviewsCount = product.reviews_count || 0;

  // Получаем цену для выбранного ресторана и название ресторана
  useEffect(() => {
    // Если передан ID ресторана через пропсы, используем его для определения цены
    if (restaurantId) {
      const price = getProductPriceForRestaurant(product.id, restaurantId);
      setCalculatedPrice(price);

      // Находим название ресторана
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      setRestaurantName(restaurant?.name || null);
    } else {
      // Иначе используем функцию из контекста
      setCalculatedPrice(getProductPrice(product.id));
      setRestaurantName(null);
    }
  }, [product.id, getProductPrice, selectedRestaurant, restaurantId, getProductPriceForRestaurant, restaurants]);

  // Проверяем из localStorage, лайкнут ли продукт
  useEffect(() => {
    try {
      const likedItems = getFromStorage<string[]>(LIKED_ITEMS_KEY, []);
      setIsLiked(likedItems.includes(product.id));
    } catch (error) {
      console.error('Ошибка при проверке избранных товаров:', error);
    }
  }, [product.id]);

  const handleOpenDetailedView = () => {
    // Создаем продукт с актуальной ценой для выбранного ресторана
    const productWithCorrectPrice = {
      ...product,
      price: calculatedPrice,
    };

    // Открываем детальный просмотр с обновленным продуктом
    setIsDetailedViewOpen(true);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Анимация сердечка
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);

    // Анимация дрожания карточки
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    try {
      // Сохраняем состояние лайка в localStorage
      const likedItems = getFromStorage<string[]>(LIKED_ITEMS_KEY, []);
      let newLikedItems: string[];

      if (isLiked) {
        newLikedItems = likedItems.filter((id) => id !== product.id);
      } else {
        newLikedItems = [...likedItems, product.id];
      }

      saveToStorage(LIKED_ITEMS_KEY, newLikedItems);
      setIsLiked(!isLiked);

      // Добавляем информацию о времени добавления в избранное
      const likedItemsInfo = getFromStorage<Record<string, any>>(LIKED_ITEMS_INFO_KEY, {});

      if (!isLiked) {
        // Если добавляем в избранное, то сохраняем информацию о товаре
        likedItemsInfo[product.id] = {
          dateAdded: new Date().toISOString(),
          productId: product.id,
          name: product.name,
          price: calculatedPrice,
          image: product.image,
          category_id: product.category_id,
          weight: product.weight,
        };
      } else {
        // Если удаляем из избранного, то удаляем информацию
        if (likedItemsInfo[product.id]) {
          delete likedItemsInfo[product.id];
        }
      }

      saveToStorage(LIKED_ITEMS_INFO_KEY, likedItemsInfo);
    } catch (error) {
      console.error('Ошибка при обновлении избранных товаров:', error);
    }
  };

  return (
    <>
      <div className="product col-span-1 my-3">
        <div
          className={`wrapper-product ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-md rounded-3xl h-full flex flex-col justify-between ${isShaking ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
        >
          <div className="relative">
            <img src={product.image} alt={product.name} className="w-full rounded-t-3xl object-cover h-48" />
            <button
              className={`absolute top-4 right-4 p-2 rounded-full ${isLiked ? 'bg-red-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-400'} shadow-md transition-all duration-300 hover:scale-110`}
              onClick={handleLikeToggle}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </button>

            {showHeartAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-ping absolute h-16 w-16 rounded-full bg-red-400 opacity-30"></div>
                <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-[heartBeat_1s_ease-in-out]" />
              </div>
            )}

            {/* Бейдж с адресом ресторана */}
            <div
              className={`absolute top-4 left-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} px-2 py-1 rounded-lg text-xs font-medium shadow-sm`}
            >
              {restaurantName ? (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-orange-500" />
                  <span>{restaurantName}</span>
                </div>
              ) : (
                selectedRestaurant.address
              )}
            </div>

            {/* Рейтинг */}
            {rating > 0 && (
              <div
                className={`absolute bottom-4 left-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} rounded-full px-2 py-1 flex items-center shadow-sm`}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold ml-1">{rating.toFixed(1)}</span>
                <span className="text-xs ml-1 text-gray-500">({reviewsCount})</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex justify-start mb-2">
              <button
                type="button"
                className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} flex items-center text-sm`}
                onClick={() => setIsModalOpen(true)}
              >
                Подробнее <HelpCircle className="ml-1 w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-start">
              <h3
                className={`mb-3 mt-0 ps-3 text-lg font-medium border-l-4 border-gradient-orange-red ${isDarkMode ? 'text-white' : ''}`}
              >
                {product.name}
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-0`}>{product.weight}</p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className={`font-bold text-lg pl-4 ${isDarkMode ? 'text-orange-400' : ''}`}>
                {calculatedPrice.toFixed(0)} ₽
              </div>

              <form className="text-center">
                <button
                  type="button"
                  className="m-3 py-2 px-6 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-l-2xl rounded-r-md flex items-center"
                  onClick={handleOpenDetailedView}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />В корзину
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        product={{ ...product, price: calculatedPrice }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      <DetailedProductView
        product={{ ...product, price: calculatedPrice }}
        isOpen={isDetailedViewOpen}
        onClose={() => setIsDetailedViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
