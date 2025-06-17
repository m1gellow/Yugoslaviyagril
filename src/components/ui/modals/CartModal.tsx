import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { X, Plus, Minus, ShoppingBag, Percent, Check } from 'lucide-react';
import { useRestaurant } from '../../../context/RestaurantContext';
import CheckoutForm from '../../checkout/CheckoutForm';

const CartModal = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    activePromoCode,
    promoDiscount,
  } = useCart();
  const { selectedRestaurant } = useRestaurant();
  const [showCheckout, setShowCheckout] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const { isCartModalOpen, toggleCartOpen } = useCart();

  // Получаем темную тему из App компонента через DOM
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Обработчик применения промокода
  const handleApplyPromoCode = () => {
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim() === '') {
      setPromoError('Введите промокод');
      return;
    }

    const result = applyPromoCode(promoCode);

    if (result.success) {
      setPromoSuccess(result.message);
      // Очищаем поле ввода после успешного применения
      setPromoCode('');
    } else {
      setPromoError(result.message);
    }
  };

  // Расчет финальной суммы с учетом скидки
  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Рассчитываем сумму скидки
  const discountAmount =
    promoDiscount > 0
      ? (activePromoCode && activePromoCode === '500ROUBLES') || activePromoCode === '300ROUBLES'
        ? activePromoCode === '500ROUBLES'
          ? 500
          : 300
        : subtotal * promoDiscount
      : 0;

  const finalPrice = subtotal - discountAmount;

  // Получаем стоимость доставки
  const getDeliveryPrice = () => {
    if (subtotal >= (selectedRestaurant.free_delivery_threshold || 4000)) {
      return 0;
    }
    return 200; // Стандартная стоимость доставки
  };

  const deliveryPrice = getDeliveryPrice();

  if (!isCartModalOpen) return null;

  if (showCheckout) {
    return (
      <div
        className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-gray-900 bg-opacity-75' : 'bg-gray-500 bg-opacity-75'}`}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            className={`inline-block align-middle ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-4`}
          >
            <CheckoutForm onCancel={() => setShowCheckout(false)} onComplete={toggleCartOpen} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    );
  }

  // Корзина адаптирована под темную тему системы
  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'bg-gray-900 bg-opacity-90' : 'bg-gray-500 bg-opacity-75'}`}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        <div
          className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl w-full max-w-md mx-auto shadow-xl overflow-hidden`}
        >
          <div
            className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <h3 className="text-xl font-bold">Корзина</h3>
            <button
              onClick={toggleCartOpen}
              className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingBag className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>Ваша корзина пуста</p>
              <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-2`}>
                Добавьте что-нибудь из меню, чтобы сделать заказ
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto p-4 max-h-[50vh]">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className={`flex items-center mb-4 border-b pb-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className={`${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {item.selectedSauce && (
                        <div
                          className={`text-xs ${isDarkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-orange-50'} mt-1 px-2 py-1 rounded-full inline-block mr-1`}
                        >
                          Соус: {item.selectedSauce}
                        </div>
                      )}
                      {item.selectedSides && item.selectedSides.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.selectedSides.map((side, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-green-50 text-gray-500'
                              }`}
                            >
                              {side}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <div className={`flex items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className={`p-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className={`p-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-bold">{(item.product.price * item.quantity).toFixed(0)} ₽</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center mb-3">
                  <Percent className={`w-4 h-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-2`} />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Введите промокод"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className={`w-full py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        isDarkMode
                          ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600'
                          : 'border border-orange-300'
                      }`}
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-orange-500 text-white rounded-md text-xs"
                    >
                      Ввести
                    </button>
                  </div>
                </div>

                {promoError && <p className="text-red-500 text-xs mb-2">{promoError}</p>}

                {promoSuccess && (
                  <p className="text-green-500 text-xs mb-2">
                    <Check className="w-3 h-3 inline mr-1" />
                    {promoSuccess}
                  </p>
                )}

                {activePromoCode && (
                  <div
                    className={`${
                      isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-50'
                    } p-2 rounded-lg mb-3 flex justify-between items-center`}
                  >
                    <div>
                      <p className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'} text-sm font-bold`}>
                        Применен промокод: {activePromoCode}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Скидка:{' '}
                        {activePromoCode === '500ROUBLES' || activePromoCode === '300ROUBLES'
                          ? activePromoCode === '500ROUBLES'
                            ? '500 ₽'
                            : '300 ₽'
                          : `${(promoDiscount * 100).toFixed(0)}%`}
                      </p>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className={`text-xs ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}
                    >
                      Отменить
                    </button>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Товаров на сумму</span>
                    <span>{subtotal.toFixed(0)} ₽</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-orange-500">
                      <span>Скидка</span>
                      <span>-{discountAmount.toFixed(0)} ₽</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Доставка</span>
                    <span>{deliveryPrice} ₽</span>
                  </div>

                  <div
                    className={`flex justify-between font-bold text-lg pt-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <span>Итого</span>
                    <span>{(finalPrice + deliveryPrice).toFixed(0)} ₽</span>
                  </div>
                </div>

                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  Время доставки: 70-100 мин
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg font-medium flex items-center justify-center"
                >
                  Перейти к оформлению{' '}
                  <span className="ml-2 font-bold">{(finalPrice + deliveryPrice).toFixed(0)} ₽</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
