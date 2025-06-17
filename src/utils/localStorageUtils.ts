/**
 * Утилиты для работы с localStorage с обработкой ошибок
 */

/**
 * Безопасно получает данные из localStorage
 * @param key Ключ для получения данных
 * @param defaultValue Значение по умолчанию, если данные не найдены или произошла ошибка
 * @returns Полученные данные или значение по умолчанию
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Ошибка при получении ${key} из localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Безопасно сохраняет данные в localStorage
 * @param key Ключ для сохранения данных
 * @param value Значение для сохранения
 * @returns true, если сохранение прошло успешно, иначе false
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Ошибка при сохранении ${key} в localStorage:`, error);
    return false;
  }
}

/**
 * Безопасно удаляет данные из localStorage
 * @param key Ключ для удаления данных
 * @returns true, если удаление прошло успешно, иначе false
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Ошибка при удалении ${key} из localStorage:`, error);
    return false;
  }
}

/**
 * Безопасно очищает весь localStorage
 * @returns true, если очистка прошла успешно, иначе false
 */
export function clearStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Ошибка при очистке localStorage:', error);
    return false;
  }
}

/**
 * Проверяет, доступен ли localStorage
 * @returns true, если localStorage доступен, иначе false
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Кеширует данные с временем жизни
 * @param key Ключ для сохранения данных
 * @param value Значение для сохранения
 * @param ttlMs Время жизни кеша в миллисекундах
 * @returns true, если сохранение прошло успешно, иначе false
 */
export function cacheWithExpiry<T>(key: string, value: T, ttlMs: number): boolean {
  try {
    const item = {
      value,
      expiry: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Ошибка при кешировании ${key} в localStorage:`, error);
    return false;
  }
}

/**
 * Получает кешированные данные с проверкой срока жизни
 * @param key Ключ для получения данных
 * @returns Данные, если они существуют и не просрочены, иначе null
 */
export function getWithExpiry<T>(key: string): T | null {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (!item.expiry) return null;

    // Проверяем, не истек ли срок кеша
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value as T;
  } catch (error) {
    console.error(`Ошибка при получении кеша ${key} из localStorage:`, error);
    return null;
  }
}
