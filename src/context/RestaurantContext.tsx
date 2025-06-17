import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Restaurant } from '../types';
import { useSupabase } from './SupabaseContext';

interface RestaurantContextType {
  selectedRestaurant: Restaurant;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  toggleRestaurantList: () => void;
  showRestaurantList: boolean;
  allRestaurants: Restaurant[];
  getProductPrice: (productId: string) => number;
  checkoutStep: number;
  setCheckoutStep: (step: number) => void;
  selectRestaurantBeforeCart: boolean;
  setSelectRestaurantBeforeCart: (value: boolean) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Ключ для localStorage
const SELECTED_RESTAURANT_KEY = 'yugoslavia_grill_selected_restaurant';

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const { restaurants, restaurantProducts, products, isLoading } = useSupabase();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showRestaurantList, setShowRestaurantList] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [selectRestaurantBeforeCart, setSelectRestaurantBeforeCart] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Инициализация выбранного ресторана при загрузке данных
  useEffect(() => {
    if (!initialized && restaurants.length > 0) {
      console.log('Инициализация контекста ресторана с', restaurants.length, 'ресторанами');

      try {
        // Проверяем, сохранен ли выбранный ресторан в localStorage
        const savedRestaurantJson = localStorage.getItem(SELECTED_RESTAURANT_KEY);

        if (savedRestaurantJson) {
          console.log('Найден сохраненный ресторан в localStorage');
          const savedRestaurantData = JSON.parse(savedRestaurantJson);
          const found = restaurants.find((r) => r.id === savedRestaurantData.id);

          if (found) {
            console.log('Восстанавливаем сохраненный ресторан:', found.name);
            setSelectedRestaurant(found);
            setInitialized(true);
            return;
          } else {
            console.log('Сохраненный ресторан не найден в загруженных данных');
          }
        } else {
          console.log('Сохраненный ресторан не найден в localStorage');
        }

        // Если нет сохраненного или он не найден, используем первый ресторан
        console.log('Устанавливаем ресторан по умолчанию:', restaurants[0]?.name);
        setSelectedRestaurant(restaurants[0]);
      } catch (error) {
        console.error('Ошибка при инициализации ресторана:', error);
        // В случае ошибки используем первый ресторан
        setSelectedRestaurant(restaurants[0]);
      }

      setInitialized(true);
    }
  }, [restaurants, initialized]);

  // Сохраняем выбранный ресторан в localStorage при его изменении
  useEffect(() => {
    if (selectedRestaurant) {
      try {
        console.log('Сохраняем ресторан в localStorage:', selectedRestaurant.id);
        localStorage.setItem(SELECTED_RESTAURANT_KEY, JSON.stringify(selectedRestaurant));
      } catch (error) {
        console.error('Ошибка при сохранении ресторана в localStorage:', error);
      }
    }
  }, [selectedRestaurant]);

  const toggleRestaurantList = () => {
    setShowRestaurantList(!showRestaurantList);
  };

  // Получение цены продукта с учетом выбранного ресторана
  const getProductPrice = (productId: string): number => {
    if (!selectedRestaurant) return 0;

    // Ищем цену продукта для данного ресторана
    const restaurantProduct = restaurantProducts.find(
      (rp) => rp.product_id === productId && rp.restaurant_id === selectedRestaurant.id,
    );

    // Если нашли специальную цену, возвращаем её
    if (restaurantProduct) {
      return restaurantProduct.price;
    }

    // Иначе возвращаем базовую цену продукта
    const product = products.find((p) => p.id === productId);
    return product ? product.price : 0;
  };

  // Если данные еще не загружены или ресторан не выбран, показываем заглушку
  if (isLoading && !selectedRestaurant) {
    console.log('Showing loading placeholder for restaurant context');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <div className="ml-3 text-lg">Загрузка данных ресторана...</div>
      </div>
    );
  }

  // Используем первый ресторан как значение по умолчанию, если ничего не выбрано
  const defaultRestaurant =
    selectedRestaurant ||
    (restaurants.length > 0
      ? restaurants[0]
      : {
          id: '0',
          name: 'Загрузка...',
          address: 'Пожалуйста, подождите',
          phone: '+7 (937) 000-03-07',
          url: '',
          min_order_amount: 1000,
          free_delivery_threshold: 5000,
          working_hours: '10:00 - 22:00',
          delivery_time: null,
          location_lat: null,
          location_lng: null,
          is_active: true,
          created_at: new Date().toISOString(),
        });

  return (
    <RestaurantContext.Provider
      value={{
        selectedRestaurant: defaultRestaurant,
        setSelectedRestaurant,
        toggleRestaurantList,
        showRestaurantList,
        allRestaurants: restaurants,
        getProductPrice,
        checkoutStep,
        setCheckoutStep,
        selectRestaurantBeforeCart,
        setSelectRestaurantBeforeCart,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextType => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
