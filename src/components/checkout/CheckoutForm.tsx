import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Calendar, Clock } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface CheckoutFormProps {
  onCancel: () => void;
  onComplete: () => void;
  isDarkMode?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onCancel, onComplete, isDarkMode = false }) => {
  const { getTotalPrice, clearCart, cartItems } = useCart();
  const { allRestaurants, selectedRestaurant } = useRestaurant();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    homeNumber: '',
    roomNumber: '',
    hallNumber: '',
    floorNumber: '',
    comment: '',
    date: '',
    time: '',
    venue: selectedRestaurant.name,
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    paymentMethod: 'cash' as 'cash' | 'card' | 'electron',
    urgent: false,
  });

  const [addressPickup, setAddressPickup] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDeliveryMethodChange = (method: 'pickup' | 'delivery') => {
    setFormData({
      ...formData,
      deliveryMethod: method,
    });
  };

  const handleUrgentToggle = (isUrgent: boolean) => {
    setFormData({
      ...formData,
      urgent: isUrgent,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you'd submit the order to your backend here
    console.log('Order submitted:', formData);

    // Show success message
    setOrderSubmitted(true);

    // Clear the cart
    clearCart();

    // Wait 2 seconds then close the modal
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const totalPrice = getTotalPrice();
  const isDeliveryAvailable = totalPrice >= 1000;
  const isFreeDelivery = totalPrice >= 4000;

  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const timeSlots = [
    '11:00–12:00',
    '12:00–13:00',
    '13:00–14:00',
    '14:00–15:00',
    '15:00–16:00',
    '16:00–17:00',
    '17:00–18:00',
    '18:00–19:00',
    '19:00–20:00',
    '20:00–21:00',
    '21:00–22:00',
  ];

  useEffect(() => {
    // Set today's date as default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setFormData((prev) => ({
      ...prev,
      date: formattedDate,
    }));
  }, []);

  if (orderSubmitted) {
    return (
      <div
        className={`p-6 text-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg max-w-lg mx-auto`}
      >
        <div className="po-sp-спасибо-за-заказ">
          <h3 className="text-xl font-bold mb-4">Спасибо за Ваш заказ! Ожидайте звонка диспетчера!</h3>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Обращаем Ваше внимание, что заказ считается подтвержденным после звонка!
          </p>
        </div>
      </div>
    );
  }

  if (showCalendar) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Calculate the first day of the month (0-based, 0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Adjust for Monday as first day (convert Sunday from 0 to 7)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    // Calculate days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Calculate days from previous month to show
    const daysFromPrevMonth = adjustedFirstDay;

    // Calculate days in previous month
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Generate calendar days
    const calendarDays = [];

    // Previous month days
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      calendarDays.push({ day: i, currentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({ day: i, currentMonth: true });
    }

    // Calculate how many days from next month are needed to complete the grid
    const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7;
    const daysFromNextMonth = totalCells - (daysFromPrevMonth + daysInMonth);

    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      calendarDays.push({ day: i, currentMonth: false });
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-4 w-full max-w-md mx-4`}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowCalendar(false)} className={`text-${isDarkMode ? 'white' : 'gray-500'}`}>
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Выберите дату</h2>
            <div></div> {/* Empty div for spacing */}
          </div>

          <div className="календарь mb-4">
            <div className="flex justify-between items-center mb-4">
              <button className="p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke={isDarkMode ? 'white' : 'black'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className="text-lg font-medium">{monthNames[currentMonth]}</span>
              <button className="p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke={isDarkMode ? 'white' : 'black'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map((day, index) => (
                <div
                  key={index}
                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} py-1`}
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  className={`py-2 text-sm rounded-full ${
                    day.currentMonth
                      ? day.day === today.getDate()
                        ? 'bg-orange-500 text-white'
                        : isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-orange-100'
                      : isDarkMode
                        ? 'text-gray-600'
                        : 'text-gray-400'
                  }`}
                  disabled={!day.currentMonth}
                  onClick={() => {
                    const selectedDate = new Date(currentYear, currentMonth, day.day);
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    setFormData((prev) => ({ ...prev, date: formattedDate }));
                    setShowCalendar(false);
                  }}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowCalendar(false)}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full"
          >
            Подтвердить
          </button>
        </div>
      </div>
    );
  }

  if (showTimeSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-4 w-full max-w-md mx-4`}>
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowTimeSelector(false)} className={`text-${isDarkMode ? 'white' : 'gray-500'}`}>
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold">Выберите время</h2>
            <div></div> {/* Empty div for spacing */}
          </div>

          <div className="время max-h-96 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`flex justify-between items-center p-3 border rounded-lg ${
                    isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-orange-50'
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, time: slot }));
                    setShowTimeSelector(false);
                  }}
                >
                  <span className="text-lg">{slot}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {index < 3 ? 'через 30-60 мин' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowTimeSelector(false)}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  if (formData.deliveryMethod === 'pickup') {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 max-w-lg mx-auto`}>
        <div className="самовывоз">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Способ получения заказа</h3>
            <button onClick={onCancel}>
              <X className="w-6 h-6 text-red-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex rounded-full overflow-hidden border border-orange-400 p-1 mb-6">
                <button
                  type="button"
                  className={`flex-1 p-2 text-center rounded-full ${formData.deliveryMethod === 'delivery' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' : ''}`}
                  onClick={() => handleDeliveryMethodChange('delivery')}
                >
                  Доставка
                </button>
                <button
                  type="button"
                  className={`flex-1 p-2 text-center rounded-full ${formData.deliveryMethod === 'pickup' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white' : ''}`}
                  onClick={() => handleDeliveryMethodChange('pickup')}
                >
                  Самовывоз
                </button>
              </div>

              <h4 className="font-medium mb-2">Екатеринбург</h4>
              <div className="relative mb-4">
                <div
                  className={`w-full p-3 border border-orange-300 rounded-lg cursor-pointer flex justify-between items-center ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : ''
                  }`}
                  onClick={() => setShowAddressList(!showAddressList)}
                >
                  <span className={isDarkMode ? 'text-gray-200' : ''}>
                    {addressPickup || 'Укажите адрес самовывоза'}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 6L8 10L12 6"
                      stroke={isDarkMode ? 'white' : 'black'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {showAddressList && (
                  <div
                    className={`absolute z-10 w-full mt-1 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    } border rounded-lg shadow-lg max-h-60 overflow-y-auto`}
                  >
                    {allRestaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className={`p-3 ${
                          isDarkMode
                            ? 'hover:bg-gray-600 border-b border-gray-600 last:border-b-0'
                            : 'hover:bg-orange-50 border-b border-gray-100 last:border-b-0'
                        } cursor-pointer`}
                        onClick={() => {
                          setAddressPickup(restaurant.address);
                          setShowAddressList(false);
                        }}
                      >
                        <span className={isDarkMode ? 'text-white' : ''}>{restaurant.address}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2">Контактные данные</h4>
              <div className="mb-4">
                <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} required`}>*Имя</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Имя"
                  className={`w-full p-3 rounded-lg mt-1 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                  } border`}
                />
              </div>

              <div className="mb-4">
                <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} required`}>*Телефон</label>
                <div className="flex">
                  <span
                    className={`flex items-center justify-center p-3 ${
                      isDarkMode ? 'bg-gray-600 border-gray-600' : 'bg-gray-100 border-orange-300'
                    } border rounded-l-lg`}
                  >
                    +7
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(999) 999-99-99"
                    className={`w-full p-3 rounded-r-lg border-l-0 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                    } border`}
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex space-x-2 mb-4">
                <button
                  type="button"
                  className={`flex-1 p-3 rounded-full border ${
                    formData.urgent
                      ? isDarkMode
                        ? 'border-gray-600'
                        : 'border-gray-300'
                      : 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                  }`}
                  onClick={() => handleUrgentToggle(false)}
                >
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Срочно</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex-1 p-3 rounded-full border ${
                    formData.urgent
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                      : isDarkMode
                        ? 'border-gray-600'
                        : 'border-gray-300'
                  }`}
                  onClick={() => handleUrgentToggle(true)}
                >
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Определенное время</span>
                  </div>
                </button>
              </div>

              {formData.urgent && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Дата</label>
                    <div
                      className={`relative border rounded-lg p-3 mt-1 cursor-pointer ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-orange-300'
                      }`}
                      onClick={() => setShowCalendar(true)}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          {formData.date ? new Date(formData.date).toLocaleDateString('ru-RU') : 'Выберите дату'}
                        </span>
                        <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Время</label>
                    <div
                      className={`relative border rounded-lg p-3 mt-1 cursor-pointer ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-orange-300'
                      }`}
                      onClick={() => setShowTimeSelector(true)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{formData.time || 'Выберите время'}</span>
                        <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Комментарий</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Сообщение"
                className={`w-full p-3 border rounded-lg mt-1 h-20 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                }`}
              ></textarea>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2">Оплата</h4>
              <div className="flex flex-wrap gap-3 mb-4">
                <label
                  className={`flex items-center border rounded-full p-2 cursor-pointer ${formData.paymentMethod === 'electron' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent' : isDarkMode ? 'border-gray-600' : 'border-orange-300'}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="electron"
                    checked={formData.paymentMethod === 'electron'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'electron' })}
                    className="hidden"
                  />
                  <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <circle
                      cx="12"
                      cy="12"
                      r="12"
                      fill={formData.paymentMethod === 'electron' ? 'white' : '#FF9400'}
                    ></circle>
                    <text
                      x="50%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill={formData.paymentMethod === 'electron' ? '#FF9400' : 'white'}
                      fontSize="8"
                    >
                      СБП
                    </text>
                  </svg>
                  <span>СБП</span>
                </label>

                <label
                  className={`flex items-center border rounded-full p-2 cursor-pointer ${formData.paymentMethod === 'cash' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent' : isDarkMode ? 'border-gray-600' : 'border-orange-300'}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                    className="hidden"
                  />
                  <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <circle
                      cx="12"
                      cy="12"
                      r="12"
                      fill={formData.paymentMethod === 'cash' ? 'white' : '#4CAF50'}
                    ></circle>
                    <text
                      x="50%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill={formData.paymentMethod === 'cash' ? '#4CAF50' : 'white'}
                      fontSize="8"
                    >
                      ₽
                    </text>
                  </svg>
                  <span>Наличными</span>
                </label>

                <label
                  className={`flex items-center border rounded-full p-2 cursor-pointer ${formData.paymentMethod === 'card' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent' : isDarkMode ? 'border-gray-600' : 'border-orange-300'}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className="hidden"
                  />
                  <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <rect
                      width="24"
                      height="24"
                      rx="12"
                      fill={formData.paymentMethod === 'card' ? 'white' : '#2196F3'}
                    ></rect>
                    <text
                      x="50%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill={formData.paymentMethod === 'card' ? '#2196F3' : 'white'}
                      fontSize="8"
                    >
                      CARD
                    </text>
                  </svg>
                  <span>Картой при получении</span>
                </label>
              </div>

              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-2 md:mb-0">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                    Минимальный заказ на доставку <span className="text-orange-500 font-bold">от 1000 руб</span>
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                    Бесплатная доставка при сумме заказа <span className="text-orange-500 font-bold">от 4000 руб</span>
                  </p>
                </div>
              </div>
            </div>

            <div className={`mb-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-4`}>
              <h4 className="font-medium mb-2">Заказ на сумму</h4>

              <div className={`max-h-40 overflow-y-auto mb-4 ${isDarkMode ? 'text-gray-200' : ''}`}>
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between mb-2">
                    <div className="flex">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.quantity} шт × {item.product.price} ₽
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{(item.product.price * item.quantity).toFixed(0)} ₽</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Итого:</span>
                <span>{totalPrice.toFixed(0)} ₽</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full font-medium"
            >
              Заказать
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <div className="доставка">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Способ получения заказа</h3>
          <button
            type="button"
            className={`rounded-md ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-gray-500'}`}
            onClick={onCancel}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center space-x-4 mb-4">
            <div
              className={`border rounded-full px-6 py-2 cursor-pointer ${
                formData.deliveryMethod === 'delivery'
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                  : isDarkMode
                    ? 'border-gray-600 text-white'
                    : 'border-orange-400'
              }`}
              onClick={() => handleDeliveryMethodChange('delivery')}
            >
              <input
                id="delivery-1"
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={formData.deliveryMethod === 'delivery'}
                onChange={() => {}}
                hidden
              />
              <label htmlFor="delivery-1" className="cursor-pointer">
                Доставка
              </label>
            </div>

            <div
              className={`border rounded-full px-6 py-2 cursor-pointer ${
                formData.deliveryMethod === 'pickup'
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                  : isDarkMode
                    ? 'border-gray-600 text-white'
                    : 'border-orange-400'
              }`}
              onClick={() => handleDeliveryMethodChange('pickup')}
            >
              <input
                id="delivery-2"
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={formData.deliveryMethod === 'pickup'}
                onChange={() => {}}
                hidden
              />
              <label htmlFor="delivery-2" className="cursor-pointer">
                Самовывоз
              </label>
            </div>
          </div>

          {formData.deliveryMethod === 'delivery' && !isDeliveryAvailable && (
            <div className="text-red-500 text-center mb-4">
              *Доставка не доступна при заказе ниже 1000₽. Только самовывоз.
            </div>
          )}

          {formData.deliveryMethod === 'delivery' && isDeliveryAvailable && isFreeDelivery && (
            <div className="text-green-500 text-center mb-4">*Бесплатная доставка!</div>
          )}

          <div className="mb-4">
            <div className="mb-4">
              <label className={`block font-medium mb-1 required ${isDarkMode ? 'text-gray-200' : ''}`}>*Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Имя"
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                }`}
              />
            </div>

            <div className="mb-4">
              <label className={`block font-medium mb-1 required ${isDarkMode ? 'text-gray-200' : ''}`}>
                *Телефон:
              </label>
              <div className="flex">
                <span
                  className={`flex items-center justify-center p-3 ${
                    isDarkMode ? 'bg-gray-600 border-gray-600' : 'bg-gray-100 border-orange-300'
                  } border rounded-l-lg`}
                >
                  +7
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(999) 999-99-99"
                  className={`w-full p-3 border rounded-r-lg border-l-0 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {formData.deliveryMethod === 'delivery' && (
            <div className="mb-4">
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    className={`flex-1 p-3 rounded-full border ${
                      formData.urgent
                        ? isDarkMode
                          ? 'border-gray-600'
                          : 'border-gray-300'
                        : 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                    }`}
                    onClick={() => handleUrgentToggle(false)}
                  >
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Срочно</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`flex-1 p-3 rounded-full border ${
                      formData.urgent
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent'
                        : isDarkMode
                          ? 'border-gray-600'
                          : 'border-gray-300'
                    }`}
                    onClick={() => handleUrgentToggle(true)}
                  >
                    <div className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Определенное время</span>
                    </div>
                  </button>
                </div>

                {formData.urgent && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-200' : ''}`}>
                        Дата доставки
                      </label>
                      <div
                        className={`relative border rounded-lg p-3 cursor-pointer ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-orange-300'
                        }`}
                        onClick={() => setShowCalendar(true)}
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {formData.date ? new Date(formData.date).toLocaleDateString('ru-RU') : 'Выберите дату'}
                          </span>
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-200' : ''}`}>
                        Время доставки
                      </label>
                      <div
                        className={`relative border rounded-lg p-3 cursor-pointer ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-orange-300'
                        }`}
                        onClick={() => setShowTimeSelector(true)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{formData.time || 'Выберите время'}</span>
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Время доставки с 11.00 до 22.00
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <label className={`block font-medium mb-1 required ${isDarkMode ? 'text-gray-200' : ''}`}>*Улица:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Ленина"
                className={`w-full p-3 border rounded-lg mb-4 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                }`}
              />

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={`block font-medium mb-1 required ${isDarkMode ? 'text-gray-200' : ''}`}>*Дом</label>
                  <input
                    type="text"
                    name="homeNumber"
                    value={formData.homeNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="1"
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-200' : ''}`}>Кв</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    placeholder="4"
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-200' : ''}`}>Подъезд</label>
                  <input
                    type="text"
                    name="hallNumber"
                    value={formData.hallNumber}
                    onChange={handleInputChange}
                    placeholder="2"
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-200' : ''}`}>Этаж</label>
                  <input
                    type="text"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleInputChange}
                    placeholder="3"
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className={`block font-medium mb-1 ${isDarkMode ? 'text-gray-200' : ''}`}>Комментарий</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={3}
              className={`w-full p-3 border rounded-lg ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-orange-300'
              }`}
              placeholder="Комментарий к заказу"
            ></textarea>
          </div>

          <div className="mb-6">
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>Оплата</h4>
            <div className="flex flex-wrap gap-3 mb-4">
              <label
                className={`flex items-center border rounded-full p-2 cursor-pointer ${formData.paymentMethod === 'electron' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent' : isDarkMode ? 'border-gray-600' : 'border-orange-300'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="electron"
                  checked={formData.paymentMethod === 'electron'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'electron' })}
                  className="hidden"
                />
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <circle
                    cx="12"
                    cy="12"
                    r="12"
                    fill={formData.paymentMethod === 'electron' ? 'white' : '#FF9400'}
                  ></circle>
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill={formData.paymentMethod === 'electron' ? '#FF9400' : 'white'}
                    fontSize="8"
                  >
                    СБП
                  </text>
                </svg>
                <span>СБП</span>
              </label>

              <label
                className={`flex items-center border rounded-full p-2 cursor-pointer ${formData.paymentMethod === 'cash' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent' : isDarkMode ? 'border-gray-600' : 'border-orange-300'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                  className="hidden"
                />
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <circle
                    cx="12"
                    cy="12"
                    r="12"
                    fill={formData.paymentMethod === 'cash' ? 'white' : '#4CAF50'}
                  ></circle>
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill={formData.paymentMethod === 'cash' ? '#4CAF50' : 'white'}
                    fontSize="8"
                  >
                    ₽
                  </text>
                </svg>
                <span>Наличными</span>
              </label>

              <label
                className={`flex items-center border rounded-full p-2 cursor-pointer ${formData.paymentMethod === 'card' ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-transparent' : isDarkMode ? 'border-gray-600' : 'border-orange-300'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className="hidden"
                />
                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <rect
                    width="24"
                    height="24"
                    rx="12"
                    fill={formData.paymentMethod === 'card' ? 'white' : '#2196F3'}
                  ></rect>
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill={formData.paymentMethod === 'card' ? '#2196F3' : 'white'}
                    fontSize="8"
                  >
                    CARD
                  </text>
                </svg>
                <span>Картой курьеру</span>
              </label>
            </div>

            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-2 md:mb-0">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                  Минимальный заказ на доставку <span className="text-orange-500 font-bold">от 1000 руб</span>
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>
                  Бесплатная доставка при сумме заказа <span className="text-orange-500 font-bold">от 4000 руб</span>
                </p>
              </div>
            </div>
          </div>

          <div className={`mb-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-4`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-gray-200' : ''}`}>Заказ на сумму</h4>

            <div className="max-h-40 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between mb-2">
                  <div className="flex">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded mr-2"
                    />
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.quantity} шт × {item.product.price} ₽
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">{(item.product.price * item.quantity).toFixed(0)} ₽</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Итого:</span>
              <span>{totalPrice.toFixed(0)} ₽</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full"
            disabled={formData.deliveryMethod === 'delivery' && !isDeliveryAvailable}
          >
            Заказать
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
