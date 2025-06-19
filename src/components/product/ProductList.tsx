import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { useSupabase } from '../../context/SupabaseContext';
import { ProductCard } from '../ui';
import { useCategory } from '../../context/CategoryContext';

interface ProductListProps {
  selectedRestaurantId?: string | null;
  isDarkMode?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ selectedRestaurantId = null, isDarkMode }) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products, isLoading, restaurantProducts, categories } = useSupabase();
  const { selectedCategoryId } = useCategory();

  // Находим выбранную категорию
  const selectedCategory = categories.find(category => category.id === selectedCategoryId);
  // Если категория не выбрана, используем "Все категории"
  const categoryTitle = selectedCategory ? selectedCategory.name : "Все категории";

  useEffect(() => {
    // Фильтрация продуктов по категории
    let filtered = selectedCategoryId ? products.filter((p) => p.category_id === selectedCategoryId) : products;

    // Если выбран конкретный ресторан, фильтруем продукты по доступности в этом ресторане
    if (selectedRestaurantId) {
      const availableProductIds = new Set(
        restaurantProducts
          .filter((rp) => rp.restaurant_id === selectedRestaurantId && rp.is_available)
          .map((rp) => rp.product_id),
      );

      filtered = filtered.filter(
        (p) =>
          availableProductIds.has(p.id) ||
          !restaurantProducts.some((rp) => rp.product_id === p.id && rp.restaurant_id === selectedRestaurantId),
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategoryId, selectedRestaurantId, products, restaurantProducts]);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`animate-pulse h-96 rounded-3xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-3xl"></div>
              <div className="p-4 space-y-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto ">
      <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        {categoryTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            restaurantId={selectedRestaurantId || undefined}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;