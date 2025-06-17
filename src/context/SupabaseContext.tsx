import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, checkSupabaseConnection, checkUserAccess } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Session, User } from '@supabase/supabase-js';

type Category = Database['public']['Tables']['categories']['Row'];
type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type RestaurantProduct = Database['public']['Tables']['restaurant_products']['Row'];
type Component = Database['public']['Tables']['components']['Row'];
type PromoCode = Database['public']['Tables']['promo_codes']['Row'];

interface UserProfile {
  id: string;
  user_role: 'admin' | 'manager' | 'operator' | 'product_manager' | 'user';
  name: string | null;
  phone: string | null;
  email: string | null;
  restaurant_id: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isManager: boolean;
  isOperator: boolean;
  isProductManager: boolean;
  isLoading: boolean;
}

interface SupabaseContextType {
  isLoading: boolean;
  categories: Category[];
  restaurants: Restaurant[];
  products: Product[];
  restaurantProducts: RestaurantProduct[];
  sauces: Component[];
  sides: Component[];
  promoCodes: PromoCode[];
  auth: AuthState;
  signIn: (email: string, password: string) => Promise<{ redirectToAdmin: boolean }>;
  signUp: (email: string, password: string, userData: { name?: string; phone?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
  checkAccess: () => Promise<any>;
  getProductPriceForRestaurant: (productId: string, restaurantId: string) => number;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isAdmin: false,
    isManager: false,
    isOperator: false,
    isProductManager: false,
    isLoading: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurantProducts, setRestaurantProducts] = useState<RestaurantProduct[]>([]);
  const [sauces, setSauces] = useState<Component[]>([]);
  const [sides, setSides] = useState<Component[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Проверка соединения с Supabase
  useEffect(() => {
    const checkConnection = async () => {
      console.log('Проверка соединения с Supabase...');
      setIsReconnecting(true);

      // Если было больше 5 попыток, увеличиваем задержку
      const delay = connectionAttempts > 5 ? 5000 : 2000;

      // Если это повторная попытка, делаем небольшую паузу
      if (connectionAttempts > 0) {
        console.log(`Задержка ${delay}мс перед повторной попыткой подключения...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const result = await checkSupabaseConnection();

      if (result.success) {
        console.log(`✅ Соединение с Supabase установлено (${result.duration}ms)`);
        setConnectionChecked(true);
        setConnectionError(null);
        setIsReconnecting(false);
      } else {
        console.error('❌ Ошибка подключения к Supabase:', result.message);
        setConnectionError(result.message);

        // Увеличиваем счетчик попыток и пробуем еще раз, но не более 10 попыток
        const newAttempts = connectionAttempts + 1;
        setConnectionAttempts(newAttempts);

        if (newAttempts < 10) {
          console.log(`Повторная попытка подключения ${newAttempts}/10...`);
          setTimeout(checkConnection, delay);
        } else {
          console.error('Достигнуто максимальное количество попыток подключения');
          setIsReconnecting(false);
        }
      }
    };

    checkConnection();
  }, [connectionAttempts]);

  // Загрузка данных пользователя и проверка прав доступа
  useEffect(() => {
    if (!connectionChecked) return;

    if (connectionError) {
      console.error('Не удалось установить соединение с Supabase:', connectionError);
      setAuth((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const checkCurrentUser = async () => {
      try {
        console.log('Проверка текущей сессии...');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('Найдена текущая сессия для пользователя:', session.user.id);

          // Проверка прав доступа и получение профиля
          const accessCheck = await checkUserAccess();
          console.log('Результат проверки доступа:', accessCheck);

          if (accessCheck.success) {
            console.log('Доступ подтвержден, роль пользователя:', accessCheck.profile?.user_role);

            setAuth({
              user: session.user,
              session,
              profile: accessCheck.profile,
              isAdmin: accessCheck.isAdmin,
              isManager: accessCheck.isManager,
              isOperator: accessCheck.isOperator,
              isProductManager: accessCheck.profile?.user_role === 'product_manager',
              isLoading: false,
            });
          } else {
            console.log('Ошибка при проверке доступа:', accessCheck.message);
            // Устанавливаем пользователя, но без специальных прав
            setAuth({
              user: session.user,
              session,
              profile: null,
              isAdmin: false,
              isManager: false,
              isOperator: false,
              isProductManager: false,
              isLoading: false,
            });
          }
        } else {
          console.log('Активная сессия не найдена');
          setAuth((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Ошибка при проверке текущего пользователя:', error);
        setAuth((prev) => ({ ...prev, isLoading: false }));
      }

      // Загрузка данных приложения независимо от состояния аутентификации
      if (!dataInitialized) {
        fetchData();
      }
    };

    // Запускаем проверку пользователя
    checkCurrentUser();

    // Подписка на изменения авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_OUT') {
        console.log('Пользователь вышел из системы, очищаем состояние');
        setAuth({
          user: null,
          session: null,
          profile: null,
          isAdmin: false,
          isManager: false,
          isOperator: false,
          isProductManager: false,
          isLoading: false,
        });
        return;
      }

      if (session?.user) {
        console.log('Обработка изменения состояния авторизации для пользователя:', session.user.id);
        setAuth((prev) => ({ ...prev, isLoading: true }));

        try {
          // Проверка прав доступа и получение профиля
          const accessCheck = await checkUserAccess();
          console.log('Результат проверки доступа после изменения авторизации:', accessCheck);

          if (accessCheck.success) {
            console.log('Доступ подтвержден, роль пользователя:', accessCheck.profile?.user_role);

            setAuth({
              user: session.user,
              session,
              profile: accessCheck.profile,
              isAdmin: accessCheck.isAdmin,
              isManager: accessCheck.isManager,
              isOperator: accessCheck.isOperator,
              isProductManager: accessCheck.profile?.user_role === 'product_manager',
              isLoading: false,
            });

            console.log('Состояние авторизации обновлено:', {
              userId: session.user.id,
              role: accessCheck.profile?.user_role,
              isAdmin: accessCheck.isAdmin,
              isManager: accessCheck.isManager,
              isOperator: accessCheck.isOperator,
              isProductManager: accessCheck.profile?.user_role === 'product_manager',
            });
          } else {
            console.log('Ошибка при проверке доступа после изменения авторизации:', accessCheck.message);
            // Устанавливаем пользователя, но без специальных прав
            setAuth({
              user: session.user,
              session,
              profile: null,
              isAdmin: false,
              isManager: false,
              isOperator: false,
              isProductManager: false,
              isLoading: false,
            });
          }

          // После успешной авторизации проверяем, загружены ли данные
          if (!dataInitialized) {
            fetchData();
          }
        } catch (error) {
          console.error('Ошибка при обработке изменения авторизации:', error);
          setAuth({
            user: session.user,
            session,
            profile: null,
            isAdmin: false,
            isManager: false,
            isOperator: false,
            isProductManager: false,
            isLoading: false,
          });
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [connectionChecked, dataInitialized, connectionError]);

  // Функция для обновления всех данных
  const fetchData = async () => {
    console.log('Начинаем загрузку данных приложения...');
    setIsLoading(true);
    try {
      const maxRetries = 3;

      // Функция с повторными попытками для выполнения запроса
      const fetchWithRetry = async (fn, name) => {
        let retries = 0;
        while (retries < maxRetries) {
          try {
            const result = await fn();
            console.log(`✅ ${name} успешно загружены:`, result?.length || 0);
            return result;
          } catch (error) {
            console.error(`❌ Ошибка при загрузке ${name} (попытка ${retries + 1}/${maxRetries}):`, error);
            retries++;
            if (retries >= maxRetries) throw error;
            // Экспоненциальная задержка между попытками
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
          }
        }
        throw new Error(`Не удалось загрузить ${name} после ${maxRetries} попыток`);
      };

      const [
        categoriesData,
        restaurantsData,
        productsData,
        restaurantProductsData,
        saucesData,
        sidesData,
        promoCodesData,
      ] = await Promise.all([
        // Получаем категории
        fetchWithRetry(() => supabase.from('categories').select('*').order('sort_order'), 'категории'),

        // Получаем рестораны
        fetchWithRetry(() => supabase.from('restaurants').select('*').eq('is_active', true), 'рестораны'),

        // Получаем продукты - избегаем использования restaurant:restaurant_id(*)
        fetchWithRetry(
          () =>
            supabase
              .from('products')
              .select(
                `
            *,
            category:category_id(*)
          `,
              )
              .eq('is_available', true),
          'продукты',
        ),

        // Получаем цены продуктов по ресторанам
        fetchWithRetry(() => supabase.from('restaurant_products').select('*'), 'цены продуктов'),

        // Получаем соусы
        fetchWithRetry(
          () => supabase.from('components').select('*').eq('type', 'sauce').eq('is_active', true),
          'соусы',
        ),

        // Получаем гарниры
        fetchWithRetry(
          () => supabase.from('components').select('*').eq('type', 'side').eq('is_active', true),
          'гарниры',
        ),

        // Получаем промокоды
        fetchWithRetry(() => supabase.from('promo_codes').select('*').eq('is_active', true), 'промокоды'),
      ]);

      // Устанавливаем загруженные данные в состояние
      setCategories(categoriesData.data || []);
      setRestaurants(restaurantsData.data || []);
      setProducts(productsData.data || []);
      setRestaurantProducts(restaurantProductsData.data || []);
      setSauces(saucesData.data || []);
      setSides(sidesData.data || []);
      setPromoCodes(promoCodesData.data || []);

      console.log('Все данные успешно загружены', {
        categories: categoriesData.data?.length || 0,
        restaurants: restaurantsData.data?.length || 0,
        products: productsData.data?.length || 0,
        restaurantProducts: restaurantProductsData.data?.length || 0,
        sauces: saucesData.data?.length || 0,
        sides: sidesData.data?.length || 0,
        promoCodes: promoCodesData.data?.length || 0,
      });

      setDataInitialized(true);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция получения цены продукта для конкретного ресторана
  const getProductPriceForRestaurant = (productId: string, restaurantId: string): number => {
    // Ищем специфическую цену для данного ресторана
    const restaurantProduct = restaurantProducts.find(
      (rp) => rp.product_id === productId && rp.restaurant_id === restaurantId,
    );

    if (restaurantProduct) {
      return restaurantProduct.price;
    }

    // Иначе возвращаем базовую цену продукта
    const product = products.find((p) => p.id === productId);
    return product ? product.price : 0;
  };

  // Функция входа в систему с повторными попытками
  const signIn = async (email: string, password: string) => {
    let attempts = 0;
    const maxAttempts = 3;

    try {
      // Устанавливаем состояние загрузки при начале авторизации
      setAuth((prev) => ({ ...prev, isLoading: true }));
      console.log('Попытка входа с email:', email);

      let error = null;

      // Пробуем войти несколько раз в случае временных проблем с соединением
      while (attempts < maxAttempts) {
        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            error = signInError;
            throw signInError;
          }

          console.log('Вход успешен, пользователь:', data.user.id);

          try {
            // Проверяем права доступа
            const accessRights = await checkUserAccess();
            console.log('Права доступа пользователя:', accessRights);

            // Определяем, нужно ли перенаправлять пользователя в админ-панель
            const redirectToAdmin =
              accessRights.success &&
              (accessRights.isOperator ||
                accessRights.isManager ||
                accessRights.isAdmin ||
                accessRights.profile?.user_role === 'product_manager');

            console.log('Перенаправление в админ-панель:', redirectToAdmin, 'Роль:', accessRights.profile?.user_role);

            return { redirectToAdmin };
          } catch (e) {
            console.error('Ошибка при обработке успешного входа:', e);
            setAuth((prev) => ({ ...prev, isLoading: false }));
            return { redirectToAdmin: false };
          }
        } catch (signInError) {
          console.warn(`Ошибка при входе (попытка ${attempts + 1}/${maxAttempts}):`, signInError);
          error = signInError;
          attempts++;

          // Если ошибка связана с неверными учетными данными, не пытаемся снова
          if (signInError.message?.includes('Invalid login credentials')) {
            throw signInError;
          }

          // Ждем перед следующей попыткой
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1000 * attempts));
          }
        }
      }

      // Если мы дошли до этой точки, значит все попытки неудачны
      throw error || new Error('Не удалось войти после нескольких попыток');
    } catch (error) {
      console.error('Ошибка при входе:', error);
      // В случае ошибки выключаем индикатор загрузки
      setAuth((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Функция регистрации с повторными попытками
  const signUp = async (email: string, password: string, userData: { name?: string; phone?: string }) => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
            },
          },
        });

        if (error) throw error;
        return;
      } catch (error) {
        console.warn(`Ошибка при регистрации (попытка ${attempts + 1}/${maxAttempts}):`, error);
        attempts++;

        if (attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1000 * attempts));
        } else {
          throw error;
        }
      }
    }
  };

  // Функция выхода
  const signOut = async () => {
    try {
      setAuth((prev) => ({ ...prev, isLoading: true }));

      // Перед выходом очищаем локальные данные
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Сбрасываем состояние после выхода
      setAuth({
        user: null,
        session: null,
        profile: null,
        isAdmin: false,
        isManager: false,
        isOperator: false,
        isProductManager: false,
        isLoading: false,
      });

      console.log('Пользователь успешно вышел из системы');
      return { success: true };
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      setAuth((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Функция для обновления данных
  const refreshData = async () => {
    await fetchData();
  };

  // Функция проверки доступа
  const checkAccess = async () => {
    return await checkUserAccess();
  };

  // Если есть ошибка соединения, возвращаем компонент с ошибкой
  if (connectionError && !isLoading && !isReconnecting && connectionAttempts >= 10) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка подключения</h1>
          <p className="mb-4">
            Не удалось подключиться к базе данных Supabase: {connectionError}. Пожалуйста, проверьте подключение к
            интернету и попробуйте снова.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider
      value={{
        isLoading,
        categories,
        restaurants,
        products,
        restaurantProducts,
        sauces,
        sides,
        promoCodes,
        auth,
        signIn,
        signUp,
        signOut,
        refreshData,
        checkAccess,
        getProductPriceForRestaurant,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }

  return context;
};
