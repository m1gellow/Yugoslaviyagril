import React, { useState, useEffect } from 'react';
import { Search, X, Filter, MapPin, Star } from 'lucide-react';
import { products, categories } from '../../utils/mockData';
import { useRestaurant } from '../../context/RestaurantContext';
import { Product } from '../../types';
import { fuzzySearch, levenshteinMatch } from '../../utils/searchUtils';

interface SearchBarProps {
  onSelectProduct?: (product: Product) => void;
  isDarkMode?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectProduct, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilters, setActiveFilters] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const { selectedRestaurant, allRestaurants, setSelectedRestaurant } = useRestaurant();

  useEffect(() => {
    if (searchTerm.length > 1) {
      // Используем нечеткий поиск для фильтрации продуктов
      let results = fuzzySearch(products, searchTerm, ['name', 'description'], 2);

      // Apply category filters if any
      if (activeFilters.length > 0) {
        results = results.filter((product) => activeFilters.includes(product.categoryId));
      }

      // Apply price range filter
      results = results.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);

      setFilteredProducts(results);
      setShowResults(true);

      // Генерируем подсказки для поиска
      generateSearchSuggestions(searchTerm);
    } else {
      setShowResults(false);
      setSearchSuggestions([]);
    }
  }, [searchTerm, activeFilters, priceRange]);

  // Генерация поисковых подсказок на основе опечаток или сходных слов
  const generateSearchSuggestions = (query: string) => {
    if (query.length < 3) return;

    // Собираем все названия и ключевые слова из продуктов
    const allKeywords = new Set<string>();

    products.forEach((product) => {
      // Добавляем само название продукта
      allKeywords.add(product.name.toLowerCase());

      // Добавляем отдельные слова из названия и описания
      const words = (product.name + ' ' + product.description)
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);

      words.forEach((word) => allKeywords.add(word));
    });

    // Находим близкие по Левенштейну слова
    const queryWords = query.toLowerCase().split(/\s+/);
    const suggestions: string[] = [];

    queryWords.forEach((queryWord) => {
      if (queryWord.length < 3) return;

      let closestMatches = Array.from(allKeywords)
        .map((keyword) => {
          // Проверяем только слова, которые могут быть потенциальными исправлениями
          if (Math.abs(keyword.length - queryWord.length) > 3) return null;

          // Если слово уже содержит запрос, пропускаем его
          if (keyword.includes(queryWord)) return null;

          // Проверяем, достаточно ли близки слова
          if (levenshteinMatch(keyword, queryWord, 2)) {
            return {
              keyword,
              original: queryWord,
            };
          }
          return null;
        })
        .filter(Boolean) as { keyword: string; original: string }[];

      // Добавляем самые близкие соответствия в подсказки
      closestMatches.slice(0, 3).forEach((match) => {
        if (match) {
          const correctedQuery = query.replace(new RegExp(match.original, 'i'), match.keyword);
          suggestions.push(correctedQuery);
        }
      });
    });

    setSearchSuggestions([...new Set(suggestions)].slice(0, 3));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
    setSearchSuggestions([]);
  };

  const toggleFilter = (categoryId: number) => {
    setActiveFilters((prevFilters) =>
      prevFilters.includes(categoryId) ? prevFilters.filter((id) => id !== categoryId) : [...prevFilters, categoryId],
    );
  };

  const handleProductClick = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setShowResults(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(e.target.value);
    setPriceRange((prev) => {
      const newRange = [...prev] as [number, number];
      newRange[index] = value;
      return newRange;
    });
  };

  const handleRestaurantChange = (restaurantId: number) => {
    const restaurant = allRestaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      // Всегда показываем предупреждение при смене ресторана
      const confirmChange = window.confirm(
        `При выборе ресторана "${restaurant.name}" цены на товары могут отличаться от текущего ресторана. Продолжить?`,
      );

      if (confirmChange) {
        setSelectedRestaurant(restaurant);
      }
    }
  };

  // Подсветка совпадающего текста
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || !text) {
      return <span>{text}</span>;
    }

    // Проверяем, есть ли прямое совпадение для подсветки
    const index = text.toLowerCase().indexOf(query.toLowerCase());

    if (index >= 0) {
      return (
        <span>
          {text.substring(0, index)}
          <mark className="bg-yellow-200 dark:bg-yellow-700 dark:text-white">
            {text.substring(index, index + query.length)}
          </mark>
          {text.substring(index + query.length)}
        </span>
      );
    }

    // Если прямого совпадения нет, но товар прошел фильтр нечеткого поиска,
    // просто возвращаем текст без подсветки
    return <span>{text}</span>;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center">
        <div className="relative flex-1">
          <div
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
          >
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Найти блюдо в нашем меню (поиск работает даже с ошибками)..."
            className={`block w-full pl-10 pr-10 py-2 ${
              isDarkMode
                ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:ring-orange-400 focus:border-orange-400'
                : 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
            } rounded-l-md border`}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <X
                className={`h-5 w-5 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              />
            </button>
          )}
        </div>

      
      </div>

      {/* Поисковые подсказки */}
      {searchSuggestions.length > 0 && searchTerm && (
        <div
          className={`absolute z-20 w-full mt-1 ${
            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
          } border rounded-md shadow-lg p-2`}
        >
          <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Возможно, вы имели в виду:</p>
          <div className="space-y-1">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`block w-full text-left px-3 py-1.5 rounded-md text-sm ${
                  isDarkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-orange-50 text-gray-700'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}


      {showResults && (
        <div
          className={`absolute z-10 mt-2 w-full ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
          } shadow-lg rounded-md max-h-96 overflow-y-auto`}
        >
          {filteredProducts.length > 0 ? (
            <ul>
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className={`border-b ${
                    isDarkMode
                      ? 'border-gray-700 last:border-b-0 hover:bg-gray-700'
                      : 'border-gray-100 last:border-b-0 hover:bg-orange-50'
                  } cursor-pointer`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="flex items-center p-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{highlightMatch(product.name, searchTerm)}</p>
                        {/* Отображаем рейтинг */}
                        <div className="flex items-center">
                          <Star
                            className={`w-3 h-3 ${isDarkMode ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-500 fill-yellow-500'} mr-0.5`}
                          />
                          <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {product.rating?.toFixed(1) || '4.5'}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate max-w-md`}>
                        {highlightMatch(product.description, searchTerm)}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`${isDarkMode ? 'text-orange-400' : 'text-orange-500'} font-bold`}>
                          {product.price} ₽
                        </span>
                        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                          {product.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="mb-2">Ничего не найдено. Попробуйте изменить параметры поиска.</p>
              {searchTerm.length > 2 && (
                <p className="text-sm">Возможно, в запросе есть опечатка. Проверьте правильность написания.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
