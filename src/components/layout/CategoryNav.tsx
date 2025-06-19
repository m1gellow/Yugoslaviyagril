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
import { useCategory } from '../../context/CategoryContext';
import { motion } from 'framer-motion';

interface CategoryNavProps {
  isDarkMode?: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ isDarkMode }) => {
  const { categories, isLoading } = useSupabase();
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId, setSelectedCategoryId]);

  const getCategoryIcon = (iconName: string | undefined | null) => {
    const iconClass = "w-4 h-4";
    switch (iconName) {
      case 'burger': return <Sandwich className={iconClass} />;
      case 'grill': return <Beef className={iconClass} />;
      case 'group': return <UtensilsCrossed className={iconClass} />;
      case 'fries': return <Utensils className={iconClass} />;
      case 'bread': return <CakeSlice className={iconClass} />;
      case 'sauce': return <Coffee className={iconClass} />;
      case 'drink': return <Beer className={iconClass} />;
      case 'soup': return <Soup className={iconClass} />;
      case 'fish': return <Utensils className={iconClass} />;
      case 'appetizer': return <Drumstick className={iconClass} />;
      case 'salad': return <Salad className={iconClass} />;
      default: return <Pizza className={iconClass} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3 px-4">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={`w-32 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
   
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <button
              onClick={() => setSelectedCategoryId(category.id)}
              className={`relative px-4 py-2 rounded-full transition-all duration-200
                ${selectedCategoryId === category.id
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${
                  selectedCategoryId === category.id 
                    ? 'bg-white/20' 
                    : isDarkMode 
                      ? 'bg-gray-600' 
                      : 'bg-gray-100'
                }`}>
                  {getCategoryIcon(category.icon)}
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.name}
                </span>
              
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;