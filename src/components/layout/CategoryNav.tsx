import React, { useEffect, useState } from 'react';
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
import { useSupabase } from '../../context/SupabaseContext';
import { Link } from 'react-router-dom';
import { useCategory } from '../../context/CategoryContext';

interface CategoryNavProps {
  isDarkMode?: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ isDarkMode }) => {
  const { categories, isLoading } = useSupabase();
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();

  


  // Установка первой категории как активной при загрузке данных
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId, setSelectedCategoryId]);

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
      <div className="container mx-auto">
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
    <div className="container mx-auto px-4">

      <h2 className={` font-philosopher text-[40px]  mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Меню
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link 
            to="/" 
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`relative aspect-square rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105
              ${selectedCategoryId === category.id ? 'ring-2 ring-primary-500' : ''}
              ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center">
                {getCategoryIcon(category.icon)}
                <p className={`text-xl font-philosopher ${isDarkMode ? 'text-white' : 'text-white'}`}>
                  {category.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;