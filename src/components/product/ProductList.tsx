import React, { useState, useEffect } from 'react';

import { Product } from '../../types';
import { useSupabase } from '../../context/SupabaseContext';
import { ProductCard } from '../ui';

interface ProductListProps {
  selectedCategoryId: string | null;
  selectedRestaurantId?: string | null;
  isDarkMode?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ selectedCategoryId, selectedRestaurantId = null, isDarkMode }) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products, isLoading, restaurantProducts } = useSupabase();

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

      // Если для продукта нет специальной записи в restaurant_products,
      // считаем его доступным со стандартной ценой
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

  if (filteredProducts.length === 0) {
    return (
      <div className="container mx-auto text-center py-8">
        <div
          className={`max-w-md mx-auto p-6 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} rounded-lg shadow-md`}
        >
          <h3 className="text-xl font-semibold mb-2">В этой категории пока нет товаров</h3>
          <p>Пожалуйста, выберите другую категорию или вернитесь позже.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
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
