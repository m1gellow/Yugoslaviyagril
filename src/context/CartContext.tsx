import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useSupabase } from './SupabaseContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, sauce?: string, sides?: string[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  applyPromoCode: (code: string) => { success: boolean; message: string; discount?: number };
  removePromoCode: () => void;
  activePromoCode: string | null;
  promoDiscount: number;
  toggleCartOpen: () => void;
  isCartModalOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Ключи для localStorage
const CART_STORAGE_KEY = 'yugoslavia_grill_cart';
const PROMO_CODE_KEY = 'yugoslavia_grill_promo_code';
const PROMO_DISCOUNT_KEY = 'yugoslavia_grill_promo_discount';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activePromoCode, setActivePromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0); // Скидка в долях (0.1 = 10%)
  const { promoCodes } = useSupabase();

  const toggleCartOpen = () => {
    setIsCartModalOpen((prev) => (prev === false ? true : false));
  };

  // Загрузка состояния из localStorage при инициализации
  useEffect(() => {
    try {
      // Загрузка корзины
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
        console.log('Корзина загружена из localStorage');
      }

      // Загрузка промокода
      const savedPromoCode = localStorage.getItem(PROMO_CODE_KEY);
      if (savedPromoCode) {
        setActivePromoCode(savedPromoCode);
        console.log('Промокод загружен из localStorage');
      }

      // Загрузка скидки
      const savedDiscount = localStorage.getItem(PROMO_DISCOUNT_KEY);
      if (savedDiscount) {
        setPromoDiscount(parseFloat(savedDiscount));
        console.log('Скидка загружена из localStorage');
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных из localStorage:', error);
    }
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      console.log('Корзина сохранена в localStorage:', cartItems);
    } catch (error) {
      console.error('Ошибка при сохранении корзины в localStorage:', error);
    }
  }, [cartItems]);

  // Сохранение промокода в localStorage при изменении
  useEffect(() => {
    try {
      if (activePromoCode) {
        localStorage.setItem(PROMO_CODE_KEY, activePromoCode);
        console.log('Промокод сохранен в localStorage:', activePromoCode);
      } else {
        localStorage.removeItem(PROMO_CODE_KEY);
        console.log('Промокод удален из localStorage');
      }
    } catch (error) {
      console.error('Ошибка при сохранении промокода в localStorage:', error);
    }
  }, [activePromoCode]);

  // Сохранение скидки в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem(PROMO_DISCOUNT_KEY, promoDiscount.toString());
      console.log('Скидка сохранена в localStorage:', promoDiscount);
    } catch (error) {
      console.error('Ошибка при сохранении скидки в localStorage:', error);
    }
  }, [promoDiscount]);

  // Получаем доступные промо коды и преобразуем в удобный формат для использования
  const availablePromoCodes = promoCodes.reduce(
    (acc, promo) => {
      acc[promo.code] = {
        discount: promo.discount,
        type: promo.type,
        minOrderAmount: promo.min_order_amount,
        id: promo.id,
      };
      return acc;
    },
    {} as Record<string, { discount: number; type: 'percent' | 'fixed'; minOrderAmount: number; id: string }>,
  );

  const addToCart = (product: Product, quantity: number = 1, sauce?: string, sides?: string[]) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                selectedSauce: sauce || item.selectedSauce,
                selectedSides: sides || item.selectedSides,
              }
            : item,
        );
      }

      return [...prevItems, { product, quantity, selectedSauce: sauce, selectedSides: sides }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setActivePromoCode(null);
    setPromoDiscount(0);

    // Очищаем localStorage при очистке корзины
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(PROMO_CODE_KEY);
      localStorage.removeItem(PROMO_DISCOUNT_KEY);
      console.log('localStorage очищен при очистке корзины');
    } catch (error) {
      console.error('Ошибка при очистке localStorage:', error);
    }
  };

  const getTotalPrice = () => {
    const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    // Применяем скидку на итоговую сумму
    if (activePromoCode && availablePromoCodes[activePromoCode]) {
      const promoInfo = availablePromoCodes[activePromoCode];
      if (promoInfo) {
        if (promoInfo.type === 'percent') {
          return subtotal * (1 - promoInfo.discount / 100);
        } else {
          // Фиксированная скидка
          return Math.max(0, subtotal - promoInfo.discount);
        }
      }
    }

    return subtotal;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Метод для применения промокода
  const applyPromoCode = (code: string) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return { success: false, message: 'Введите промокод' };
    }

    // Проверяем существует ли такой промокод
    if (!availablePromoCodes[normalizedCode]) {
      return { success: false, message: 'Промокод не найден или истек срок действия' };
    }

    const promoInfo = availablePromoCodes[normalizedCode];
    const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

    // Проверяем минимальную сумму заказа
    if (subtotal < promoInfo.minOrderAmount) {
      return {
        success: false,
        message: `Минимальная сумма заказа для этого промокода ${promoInfo.minOrderAmount} ₽`,
      };
    }

    // Устанавливаем активный промокод и скидку
    setActivePromoCode(normalizedCode);
    setPromoDiscount(promoInfo.type === 'percent' ? promoInfo.discount / 100 : promoInfo.discount / subtotal);

    // Возвращаем информацию о примененном промокоде
    return {
      success: true,
      message:
        promoInfo.type === 'percent'
          ? `Промокод применен. Скидка ${promoInfo.discount}%`
          : `Промокод применен. Скидка ${promoInfo.discount} ₽`,
      discount: promoInfo.type === 'percent' ? promoInfo.discount / 100 : promoInfo.discount / subtotal,
    };
  };

  // Метод для удаления примененного промокода
  const removePromoCode = () => {
    setActivePromoCode(null);
    setPromoDiscount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        applyPromoCode,
        removePromoCode,
        activePromoCode,
        promoDiscount,
        toggleCartOpen,
        isCartModalOpen

      }}
    >
      {children}
    </CartContext.Provider>
  );
};


export const useCartInfo = () => {
  const {getTotalItems, getTotalPrice} = useCart()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return {
    totalItems: totalItems > 0 ? totalItems : null,
    totalPrice: totalPrice > 0 ? totalPrice : null
  }
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


