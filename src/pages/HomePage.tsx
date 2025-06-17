import { useState } from 'react';
import CategoryNav from '../components/layout/CategoryNav';
import HeroSlider from '../components/advertising/HeroSlider';
import ProductList from '../components/product/ProductList';
import RecommendationEngine from '../components/common/RecommendationEngine';
import RestaurantSelector from '../components/common/RestaurantSelector';
import SearchBar from '../components/common/SearchBar';
import { Product } from '../types';
import DetailedProductView from '../components/product/DetailedProductView';

export const HomePage = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailedViewOpen(true);
  };

  return (
    <>
      <HeroSlider />
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 my-8">
          <div className="w-full md:w-1/4">
            <RestaurantSelector isDarkMode={isDarkMode} />
          </div>
          <div className="w-full md:w-3/4">
            <SearchBar onSelectProduct={handleSelectProduct} isDarkMode={isDarkMode} />
          </div>
        </div>

        <RecommendationEngine isDarkMode={isDarkMode} />

        <CategoryNav onSelectCategory={setSelectedCategoryId} isDarkMode={isDarkMode} />
        <ProductList selectedCategoryId={selectedCategoryId} isDarkMode={isDarkMode} />
      </div>

      {selectedProduct && (
        <DetailedProductView
          product={selectedProduct}
          isOpen={isDetailedViewOpen}
          onClose={() => setIsDetailedViewOpen(false)}
        />
      )}
    </>
  );
};
