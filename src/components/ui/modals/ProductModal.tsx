import React from 'react';
import { Product } from '../../../types';
import { X, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, isDarkMode }) => {
  const { addToCart } = useCart();
  const rating = 4.8; // Рейтинг товара (фиксированный для примера)

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`inline-block align-bottom ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg md:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto mx-4`}
      >
        <div className="relative">
          <button type="button" className="absolute right-4 top-4 bg-white rounded-full p-1 z-10" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {/* Изображение без лишних скруглений */}
          <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />

          {/* Рейтинг */}
          <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1 flex items-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold ml-1 text-gray-800">{rating}</span>
          </div>
        </div>

        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-xl font-medium leading-6 text-gray-900 mb-2" id="modal-title">
            {product.name}
          </h3>

          <div className="border-b-4 border-gradient-orange-red w-12 ml-5 mb-4"></div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div>
                <p className="m-3 font-light">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Описание:</span>
                  <br />
                  <span className={isDarkMode ? 'text-white' : ''}>{product.description}</span>
                </p>

                <p className="m-3 font-light">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Количество:</span>
                  <br />
                  <span className={isDarkMode ? 'text-white' : ''}>{product.weight}</span>
                </p>

                <p className="m-3 font-light">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Комплект:</span>
                  <br />
                  <span className={isDarkMode ? 'text-white' : ''}>
                    В комплекте: лепешка, салат из свежих овощей, соус на выбор
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t ${isDarkMode ? 'border-gray-600' : 'border-gradient-orange-red-light'}`}
        >
          <button
            type="button"
            className="py-2 px-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full flex items-center"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />В корзину
          </button>

          <button
            type="button"
            className={`mr-3 py-2 px-4 border rounded-full ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
