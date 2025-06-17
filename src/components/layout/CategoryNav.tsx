import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Coffee,
  Pizza,
  Salad,
  Sandwich,
  Beer,
  UtensilsCrossed,
  Soup,
  Drumstick,
  Beef,
  CakeSlice,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSupabase } from '../../context/SupabaseContext';

interface CategoryNavProps {
  onSelectCategory: (categoryId: string | null) => void;
  isDarkMode?: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ onSelectCategory, isDarkMode }) => {
  const { selectedRestaurant } = useRestaurant();
  const { categories, isLoading } = useSupabase();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Установка первой категории как активной при загрузке данных
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
      onSelectCategory(categories[0].id);
    }
  }, [categories, activeCategory, onSelectCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onSelectCategory(categoryId);
  };

  // Функция для получения иконки категории
  const getCategoryIcon = (iconName: string | undefined | null) => {
    switch (iconName) {
      case 'burger':
        return <Sandwich className="w-5 h-5 mr-2" />;
      case 'grill':
        return <Beef className="w-5 h-5 mr-2" />;
      case 'group':
        return <UtensilsCrossed className="w-5 h-5 mr-2" />;
      case 'fries':
        return <Utensils className="w-5 h-5 mr-2" />;
      case 'bread':
        return <CakeSlice className="w-5 h-5 mr-2" />;
      case 'sauce':
        return <Coffee className="w-5 h-5 mr-2" />;
      case 'drink':
        return <Beer className="w-5 h-5 mr-2" />;
      case 'soup':
        return <Soup className="w-5 h-5 mr-2" />;
      case 'fish':
        return <Utensils className="w-5 h-5 mr-2" />;
      case 'appetizer':
        return <Drumstick className="w-5 h-5 mr-2" />;
      case 'salad':
        return <Salad className="w-5 h-5 mr-2" />;
      default:
        return <Pizza className="w-5 h-5 mr-2" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <div
            className={`flex-1 h-px ${isDarkMode ? 'bg-gradient-to-r from-transparent to-gray-700' : 'bg-gradient-to-r from-transparent to-gray-300'}`}
          ></div>
          <div className="px-4 relative">
            <h2
              className={`text-2xl font-bold flex items-center flex-wrap justify-center ${isDarkMode ? 'text-white' : ''}`}
            >
              <span className="mr-2">Загрузка категорий...</span>
            </h2>
          </div>
          <div
            className={`flex-1 h-px ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-transparent' : 'bg-gradient-to-r from-gray-300 to-transparent'}`}
          ></div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-4 mb-5`}>
          <div className="flex justify-center">
            <div className="animate-pulse h-10 w-80 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        <div
          className={`flex-1 h-px ${isDarkMode ? 'bg-gradient-to-r from-transparent to-gray-700' : 'bg-gradient-to-r from-transparent to-gray-300'}`}
        ></div>
        <div className="px-4 relative">
          <h2
            className={`text-2xl font-bold flex items-center flex-wrap justify-center ${isDarkMode ? 'text-white' : ''}`}
          >
            <span className="mr-2">Меню</span>
            <span className="text-xl px-2 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg">
              {selectedRestaurant.address}
            </span>
          </h2>
        </div>
        <div
          className={`flex-1 h-px ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-transparent' : 'bg-gradient-to-r from-gray-300 to-transparent'}`}
        ></div>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-4 mb-5`}>
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`button-select__category whitespace-nowrap px-3 py-2 rounded-full border flex items-center ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                    : isDarkMode
                      ? 'bg-gray-700 hover:border-red-500 hover:bg-gray-600 border-gray-600 text-white'
                      : 'bg-white hover:border-red-500 hover:bg-orange-100 border-gray-300'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {getCategoryIcon(category.icon)}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
