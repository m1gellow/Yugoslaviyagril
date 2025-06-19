import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL env variable');
}
if (!supabaseKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY env variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': 'yugoslavia-grill-app',
    },
    // Увеличиваем таймаут для запросов
    fetch: (url, options) => {
      const timeoutId = setTimeout(
        () => console.warn('Supabase request is taking longer than expected', { url }),
        10000,
      );
      return fetch(url, options).finally(() => clearTimeout(timeoutId));
    },
  },
  // Устанавливаем более агрессивное переподключение
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// Проверка соединения
export async function checkSupabaseConnection() {
  try {
    console.log('Проверка соединения с Supabase...');
    const start = Date.now();

    // Устанавливаем таймаут для запроса
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const { data, error } = await supabase.from('restaurants').select('count').single();

      // Очищаем таймаут если запрос успешно выполнился
      clearTimeout(timeoutId);

      const duration = Date.now() - start;

      if (error) {
        console.error('Ошибка подключения к Supabase:', error);
        return {
          success: false,
          message: error.message,
          duration,
        };
      }

      console.log(`Соединение с Supabase успешно установлено за ${duration}мс`);
      return {
        success: true,
        message: `Connection successful (${duration}ms)`,
        data,
        duration,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error('Соединение с Supabase прервано по таймауту');
        return {
          success: false,
          message: 'Превышено время ожидания соединения',
        };
      }

      throw fetchError;
    }
  } catch (error) {
    console.error('Непредвиденная ошибка при проверке соединения Supabase:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('user_role')
    .eq('id', user.id)
    .single();
    
  if (error || !data) return null;
  return data.user_role;
}

// Упрощенная проверка прав доступа пользователя
export async function checkUserAccess() {
  try {
    // Получаем текущую сессию
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: 'Не авторизован',
      };
    }

    // Получаем данные пользователя из таблицы users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: 'Пользователь не найден',
      };
    }

    // Определяем права доступа напрямую
    const isAdmin = userData.user_role === 'admin';
    const isManager = ['admin', 'manager'].includes(userData.user_role);
    const isOperator = ['admin', 'manager', 'operator'].includes(userData.user_role);
    const isProductManager = userData.user_role === 'product_manager';

    return {
      success: true,
      profile: userData,
      isAdmin,
      isManager,
      isOperator,
      isProductManager,
    };
  } catch (error) {
    console.error('Ошибка проверки доступа:', error);
    return {
      success: false,
      message: 'Ошибка при проверке прав',
    };
  }
}
