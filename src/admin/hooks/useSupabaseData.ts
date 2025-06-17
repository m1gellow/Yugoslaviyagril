import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

// Хук для получения и обновления данных из Supabase
export function useSupabaseData<T>(
  tableName: string,
  options: {
    select?: string;
    filter?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    deps?: any[];
  } = {},
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { select = '*', filter, order, limit, deps = [] } = options;

  const fetchData = useCallback(async () => {
    try {
      console.log(`Загрузка данных из таблицы: ${tableName}`);
      setLoading(true);
      setError(null); // Сбрасываем ошибку перед новым запросом

      // Создаем базовый запрос
      let query = supabase.from(tableName).select(select);

      // Применяем фильтры
      if (filter) {
        Object.entries(filter).forEach(([column, value]) => {
          query = query.eq(column, value);
        });
      }

      // Применяем сортировку
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      // Применяем лимит
      if (limit) {
        query = query.limit(limit);
      }

      // Выполняем запрос с таймаутом
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Превышено время ожидания запроса к ${tableName}`)), 15000);
      });

      const result = (await Promise.race([query, timeoutPromise])) as any;

      const { data, error } = result;

      // Обрабатываем результат
      if (error) {
        console.error(`Ошибка загрузки данных из ${tableName}:`, error);
        setError(error);
      } else {
        console.log(`Успешно загружено ${data?.length || 0} записей из ${tableName}`);
        setData(data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Ошибка при выполнении запроса к ${tableName}:`, errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [tableName, select, JSON.stringify(filter), order?.column, order?.ascending, limit, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD операции
  const create = async (item: Omit<T, 'id'>) => {
    try {
      console.log(`Создание новой записи в ${tableName}:`, item);
      setLoading(true);
      const { data, error } = await supabase.from(tableName).insert(item).select().single();

      if (error) {
        console.error(`Ошибка создания записи в ${tableName}:`, error);
        throw error;
      }

      console.log(`Запись успешно создана в ${tableName}:`, data);
      setData((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Ошибка создания записи в ${tableName}:`, errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, changes: Partial<T>) => {
    try {
      console.log(`Обновление записи ${id} в ${tableName}:`, changes);
      setLoading(true);
      const { data, error } = await supabase.from(tableName).update(changes).eq('id', id).select().single();

      if (error) {
        console.error(`Ошибка обновления записи в ${tableName}:`, error);
        throw error;
      }

      console.log(`Запись ${id} успешно обновлена в ${tableName}`);
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item) as T));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Ошибка обновления записи в ${tableName}:`, errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      console.log(`Удаление записи ${id} из ${tableName}`);
      setLoading(true);
      const { error } = await supabase.from(tableName).delete().eq('id', id);

      if (error) {
        console.error(`Ошибка удаления записи из ${tableName}:`, error);
        throw error;
      }

      console.log(`Запись ${id} успешно удалена из ${tableName}`);
      setData((prev) => prev.filter((item) => (item as any).id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Ошибка удаления записи из ${tableName}:`, errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    create,
    update,
    remove,
  };
}
