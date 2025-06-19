import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryNav from '../components/layout/CategoryNav';
import HeroSlider from '../components/advertising/HeroSlider';
import RecommendationEngine from '../components/common/RecommendationEngine';
import SearchBar from '../components/common/SearchBar';
import { Product } from '../types';
import DetailedProductView from '../components/product/DetailedProductView';
import { ProductList } from '../components/product';
import RestaurantSelector from '../components/common/RestaurantSelector';

export const HomePage = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailedViewOpen(true);
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
      {/* Hero Slider with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HeroSlider isDarkMode={isDarkMode} />
      </motion.div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-[180px]">
        {/* Search and Restaurant Selector Section */}
        <motion.div 
          className="flex flex-col md:flex-row gap-4 my-6 md:my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Mobile: Stacked layout */}
          <div className="w-full md:hidden space-y-4">
            <RestaurantSelector isDarkMode={isDarkMode} />
            <SearchBar onSelectProduct={handleSelectProduct} isDarkMode={isDarkMode} />
          </div>

          {/* Desktop: Side by side */}
          <div className="hidden md:flex w-full gap-4">
            <div className="w-1/3 lg:w-1/4">
              <RestaurantSelector isDarkMode={isDarkMode} />
            </div>
            <div className="flex-1">
              <SearchBar onSelectProduct={handleSelectProduct} isDarkMode={isDarkMode} />
            </div>
          </div>
        </motion.div>

        {/* Recommendation Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 md:mb-10"
        >
          <RecommendationEngine isDarkMode={isDarkMode} />
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 md:mb-8"
        >
          <CategoryNav 
            isDarkMode={isDarkMode} 
            onCategorySelect={setSelectedCategoryId} 
          />
        </motion.div>

        {/* Product List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ProductList 
            isDarkMode={isDarkMode} 
            categoryId={selectedCategoryId}
            onProductSelect={handleSelectProduct}
          />
        </motion.div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <DetailedProductView
            product={selectedProduct}
            isOpen={isDetailedViewOpen}
            onClose={() => setIsDetailedViewOpen(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};