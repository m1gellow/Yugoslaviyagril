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
  Check,
} from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';
import { Link } from 'react-router-dom';
import { useCategory } from '../../context/CategoryContext';
import { motion, AnimatePresence } from 'framer-motion';


interface CategoryNavProps {
  isDarkMode?: boolean;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ isDarkMode }) => {
  const { categories, isLoading } = useSupabase();
  const { selectedCategoryId, setSelectedCategoryId } = useCategory();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Установка первой категории как активной при загрузке данных
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId, setSelectedCategoryId]);

  const getCategoryIcon = (iconName: string | undefined | null) => {
    const iconClass = "w-6 h-6";
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
      <div className="container mx-auto px-4">
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Skeleton className={`h-12 w-48 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Skeleton className={`aspect-square rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </motion.div>
          ))}
        </div> */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`font-philosopher text-3xl md:text-4xl mb-6 md:mb-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
      >
        Наше меню
      </motion.h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <Link 
              to="/" 
              onClick={() => setSelectedCategoryId(category.id)}
              className={`relative block aspect-square rounded-2xl overflow-hidden shadow-sm transition-all duration-300
                ${selectedCategoryId === category.id ? 
                  'ring-3 ring-primary-500 shadow-lg' : 
                  isDarkMode ? 
                    'bg-gray-700 hover:bg-gray-600' : 
                    'bg-gray-100 hover:bg-gray-50'
                }`}
            >
              {/* Category Image Background (placeholder) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                isDarkMode ? 
                  'from-gray-600 to-gray-800' : 
                  'from-gray-200 to-gray-300'
              }`}></div>
              
              {/* Hover Overlay */}
              <AnimatePresence>
                {hoveredCategory === category.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/20"
                  />
                )}
              </AnimatePresence>
              
              {/* Selected Indicator */}
              {selectedCategoryId === category.id && (
                <motion.div 
                  className="absolute top-2 right-2 bg-primary-500 rounded-full p-1 shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                  animate={{
                    y: hoveredCategory === category.id ? -5 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`mb-2 p-3 rounded-full ${
                    isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'
                  }`}
                >
                  {getCategoryIcon(category.icon)}
                </motion.div>
                <motion.p
                  animate={{
                    y: hoveredCategory === category.id ? 5 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {category.name}
                </motion.p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;