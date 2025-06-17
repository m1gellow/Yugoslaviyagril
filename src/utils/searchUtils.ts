// Функция для вычисления расстояния Левенштейна между двумя строками
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Инициализация матрицы
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  // Заполнение матрицы
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // удаление
        matrix[i][j - 1] + 1, // вставка
        matrix[i - 1][j - 1] + cost, // замена или совпадение
      );
    }
  }

  return matrix[a.length][b.length];
}

// Функция для нормализации строки (удаление диакритических знаков, приведение к нижнему регистру и т.д.)
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zа-яё0-9]/g, ' ')
    .trim();
}

// Проверка соответствия текста запросу с использованием расстояния Левенштейна
export function levenshteinMatch(text: string, query: string, threshold: number = 2): boolean {
  if (!text || !query) return false;

  // Нормализуем текст и запрос
  const normalizedText = normalizeString(text);
  const normalizedQuery = normalizeString(query);

  // Если запрос короткий, ищем его как подстроку с учетом возможных опечаток
  if (normalizedQuery.length <= 4) {
    return normalizedText.includes(normalizedQuery);
  }

  // Для более длинных запросов разбиваем текст и запрос на слова
  const textWords = normalizedText.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);

  // Для каждого слова в запросе ищем наиболее близкое слово в тексте
  for (const queryWord of queryWords) {
    if (queryWord.length <= 2) continue; // Пропускаем очень короткие слова

    let minDistance = Infinity;
    for (const textWord of textWords) {
      if (textWord.length <= 2) continue;

      const distance = levenshteinDistance(textWord, queryWord);
      minDistance = Math.min(minDistance, distance);

      // Если найдено точное совпадение или очень близкое, сразу возвращаем true
      if (minDistance <= (threshold * queryWord.length) / 8) {
        return true;
      }
    }

    // Если для данного слова запроса не найдено близкого соответствия,
    // но допустимое расстояние достаточно велико - считаем, что есть совпадение
    if (minDistance <= threshold) {
      return true;
    }
  }

  return false;
}

// Функция для поиска по массиву объектов с использованием расстояния Левенштейна
export function fuzzySearch<T>(items: T[], searchTerm: string, fields: (keyof T)[], threshold: number = 2): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  return items.filter((item) => {
    for (const field of fields) {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string' && levenshteinMatch(fieldValue, searchTerm, threshold)) {
        return true;
      }
    }
    return false;
  });
}

// Функция для поиска рекомендуемых товаров
export function findRecommendedProducts<T>(
  product: T,
  allProducts: T[],
  categoryField: keyof T,
  priceField: keyof T,
  idField: keyof T,
  maxRecommendations: number = 4,
): T[] {
  // Фильтруем, чтобы исключить сам продукт
  const otherProducts = allProducts.filter((p) => p[idField] !== product[idField]);

  // Находим товары из той же категории
  const sameCategoryProducts = otherProducts
    .filter((p) => p[categoryField] === product[categoryField])
    .slice(0, maxRecommendations);

  // Если нашли достаточно товаров той же категории, возвращаем их
  if (sameCategoryProducts.length >= maxRecommendations) {
    return sameCategoryProducts;
  }

  // Иначе дополняем товарами с близкой ценой
  const productPrice = Number(product[priceField]);
  const remainingCount = maxRecommendations - sameCategoryProducts.length;

  const otherCategoryProducts = otherProducts
    .filter((p) => p[categoryField] !== product[categoryField])
    .sort((a, b) => {
      const priceA = Number(a[priceField]);
      const priceB = Number(b[priceField]);
      return Math.abs(priceA - productPrice) - Math.abs(priceB - productPrice);
    })
    .slice(0, remainingCount);

  return [...sameCategoryProducts, ...otherCategoryProducts];
}
