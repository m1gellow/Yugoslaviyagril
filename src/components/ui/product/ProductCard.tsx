import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { HelpCircle, ShoppingCart, Heart, Star, MapPin } from 'lucide-react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { useSupabase } from '../../../context/SupabaseContext';
import { getFromStorage, saveToStorage } from '../../../utils/localStorageUtils';
import ProductModal from '../modals/ProductModal';
import DetailedProductView from '../../product/DetailedProductView';
import MainButton from '../buttons/MainButton';

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

  const rating = product.rating || 0;
  const reviewsCount = product.reviews_count || 0;

  useEffect(() => {
    if (restaurantId) {
      const price = getProductPriceForRestaurant(product.id, restaurantId);
      setCalculatedPrice(price);
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      setRestaurantName(restaurant?.name || null);
    } else {
      setCalculatedPrice(getProductPrice(product.id));
      setRestaurantName(null);
    }
  }, [product.id, getProductPrice, selectedRestaurant, restaurantId, getProductPriceForRestaurant, restaurants]);

  useEffect(() => {
    try {
      const likedItems = getFromStorage<string[]>(LIKED_ITEMS_KEY, []);
      setIsLiked(likedItems.includes(product.id));
    } catch (error) {
      console.error('Ошибка при проверке избранных товаров:', error);
    }
  }, [product.id]);

  const handleOpenDetailedView = () => {
    setIsDetailedViewOpen(true);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    try {
      const likedItems = getFromStorage<string[]>(LIKED_ITEMS_KEY, []);
      let newLikedItems: string[];

      if (isLiked) {
        newLikedItems = likedItems.filter((id) => id !== product.id);
      } else {
        newLikedItems = [...likedItems, product.id];
      }

      saveToStorage(LIKED_ITEMS_KEY, newLikedItems);
      setIsLiked(!isLiked);

      const likedItemsInfo = getFromStorage<Record<string, any>>(LIKED_ITEMS_INFO_KEY, {});

      if (!isLiked) {
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
      <div className="product col-span-1 my-3 cursor-pointer group" onClick={handleOpenDetailedView}>
        <div
          className={`wrapper-product ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
          } shadow-lg rounded-3xl h-full flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl ${
            isShaking ? 'animate-[wiggle_0.5s_ease-in-out]' : ''
          }`}
        >
          <div className="relative overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full rounded-t-3xl object-cover h-56 transition-transform duration-500 group-hover:scale-105" 
            />
            
            <button
              className={`absolute top-4 right-4 p-2 rounded-full ${
                isLiked ? 'bg-red-500 text-white' : isDarkMode ? 'bg-gray-700/80 text-gray-300' : 'bg-white/80 text-gray-400'
              } shadow-md transition-all duration-300 hover:scale-110 backdrop-blur-sm`}
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

            <div
              className={`absolute top-4 left-4 ${
                isDarkMode ? 'bg-gray-700/90 text-white' : 'bg-white/90 text-gray-800'
              } px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm backdrop-blur-sm flex items-center`}
            >
              <MapPin className="w-3 h-3 mr-1.5 text-orange-500" />
              <span>{restaurantName || selectedRestaurant.address}</span>
            </div>

            {rating > 0 && (
              <div
                className={`absolute bottom-4 left-4 ${
                  isDarkMode ? 'bg-gray-700/90 text-white' : 'bg-white/90 text-gray-800'
                } rounded-full px-3 py-1.5 flex items-center shadow-sm backdrop-blur-sm`}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold ml-1.5">{rating.toFixed(1)}</span>
                <span className="text-xs ml-1 text-gray-500">({reviewsCount})</span>
              </div>
            )}
          </div>

          <div className="p-5 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-3">
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } transition-colors duration-200 group-hover:text-orange-500`}
              >
                {product.name}
              </h3>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {product.weight}
              </span>
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <div className={`text-xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {calculatedPrice.toFixed(0)} ₽
                </div>

                <MainButton
                  className="flex gap-2 items-center transition-transform duration-200 hover:scale-105"
                  variant="primary"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDetailedView();
                  }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  В корзину
                </MainButton>
              </div>

              <button
                type="button"
                className={`mt-3 flex items-center text-sm ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                } transition-colors duration-200`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                Подробнее <HelpCircle className="ml-1 w-4 h-4" />
              </button>
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