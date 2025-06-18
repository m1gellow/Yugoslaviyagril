import React, { useState, useEffect } from 'react';
import {
  Edit,
  Plus,
  Check,
  X,
  Pizza,
  Beef,
  Coffee,
  Utensils,
  UtensilsCrossed,
  Soup,
  Salad,
  Beer,
  CakeSlice,
  Sandwich,
} from 'lucide-react';
import { Category } from '../../../types';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, selectedCategory, setSelectedCategory }) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
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
        return <Utensils className="w-5 h-5 mr-2" />;
      case 'salad':
        return <Salad className="w-5 h-5 mr-2" />;
      default:
        return <Pizza className="w-5 h-5 mr-2" />;
    }
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon || '');
    setIsAddingNew(false);
  };

  const startAddingCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('pizza');
    setIsAddingNew(true);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setIsAddingNew(false);
    setCategoryName('');
    setCategoryIcon('');
  };

  const handleSaveCategory = () => {
    if (isAddingNew) {
      // В реальном приложении здесь был бы запрос к API для создания новой категории
      const newCategory: Category = {
        id: Math.random().toString(),
        name: categoryName,
        icon: categoryIcon || 'pizza',
        sort_order: 0,
        created_at: new Date().toISOString(),
      };
      console.log('Создаем новую категорию:', newCategory);
      // Здесь бы обновили список категорий
      // updateCategories([...categories, newCategory]);
    } else if (editingCategory) {
      // В реальном приложении здесь был бы запрос к API для обновления категории
      const updatedCategory = {
        ...editingCategory,
        name: categoryName,
        icon: categoryIcon,
      };
      console.log('Сохраняем категорию:', updatedCategory);
      // Здесь бы обновили категорию в списке
      // updateCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    }
    setIsAddingNew(false);
    setEditingCategory(null);
  };

  return (
    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
        <h3 className="font-medium dark:text-white">Категории меню</h3>
      </div>
      <div className="p-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer rounded-md flex justify-between items-center ${
              selectedCategory === category.id ? 'bg-orange-100 dark:bg-orange-900/30' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {editingCategory?.id === category.id ? (
              <div className="flex items-center w-full">
                <div className="flex-1 mr-2">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded ${'border-gray-300'}`}
                    placeholder="Название категории"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveCategory();
                    }}
                    className={`p-1 rounded-full ${'bg-green-100 text-green-600 hover:bg-green-200'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEditing();
                    }}
                    className={`p-1 rounded-full ml-1 ${'bg-red-100 text-red-600 hover:bg-red-200'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <span className={`inline-block w-6 h-6 text-center mr-2 ${'text-orange-500'}`}>
                    {getCategoryIcon(category.icon)}
                  </span>
                  <span className="dark:text-gray-300">{category.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingCategory(category);
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}

        {isAddingNew ? (
          <div className="px-3 py-2 rounded-md mt-4">
            <div className="flex items-center w-full">
              <div className="flex-1 mr-2">
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className={`w-full px-2 py-1 text-sm border rounded ${'border-gray-300'}`}
                  placeholder="Название категории"
                  autoFocus
                />
              </div>
              <div className="flex">
                <button
                  onClick={handleSaveCategory}
                  className={`p-1 rounded-full ${'bg-green-100 text-green-600 hover:bg-green-200'}`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEditing}
                  className={`p-1 rounded-full ml-1 ${'bg-red-100 text-red-600 hover:bg-red-200'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="w-full mt-4 px-3 py-2 text-orange-500 dark:text-orange-400 border border-dashed border-orange-300 dark:border-orange-700 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center justify-center"
            onClick={startAddingCategory}
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить категорию
          </button>
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;
