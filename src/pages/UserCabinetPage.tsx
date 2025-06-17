import React, { useState, useEffect } from 'react';
import {
  User,
  Receipt,
  Calendar,
  Truck,
  Percent,
  Heart,
  Gift,
  LogOut,
  Star,
  ThumbsUp,
  MapPin,
  Edit,
  Plus,
  X,
} from 'lucide-react';


import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabase';
import { ProductReview } from '../types';
import AuthModal from '../components/AuthModal';
import { getFromStorage, saveToStorage } from '../utils/localStorageUtils';
import { useNavigate } from 'react-router-dom';

// Ключи для localStorage
const LIKED_ITEMS_KEY = 'yugoslavia_grill_liked_items';
const LIKED_ITEMS_INFO_KEY = 'yugoslavia_grill_liked_items_info';

interface UserCabinetPageProps {
  isDarkMode?: boolean;
}

interface FavoriteItem {
  productId: string;
  dateAdded: string;
  name: string;
  price: number;
  image: string;
  weight?: string;
  category_id?: string;
}

interface UserAddress {
  id: string;
  address: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
}

const UserCabinetPage: React.FC<UserCabinetPageProps> = ({ isDarkMode = false }) => {
  const { auth, signOut } = useSupabase();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<string>('profile');
  const [userReviews, setUserReviews] = useState<ProductReview[]>([]);
  const [pendingReview, setPendingReview] = useState<{
    productId: string;
    productName: string;
    rating: number;
    comment: string;
  } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: 'Екатеринбург',
    postal_code: '',
    is_default: false,
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Если пользователь не авторизован, показываем модальное окно авторизации
  useEffect(() => {
    if (!auth.user && !showAuthModal) {
      setShowAuthModal(true);
    }
  }, [auth.user, showAuthModal]);

  // Загружаем отзывы пользователя
  useEffect(() => {
    if (auth.user) {
      const loadUserData = async () => {
        try {
          // Загрузка отзывов
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false });

          if (reviewsError) {
            console.error('Ошибка при загрузке отзывов:', reviewsError);
          } else if (reviewsData) {
            console.log(`Загружено ${reviewsData.length} отзывов пользователя`);
            setUserReviews(reviewsData);
          }

          // Загрузка заказов
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(
              `
              *,
              items:order_items(*)
            `,
            )
            .eq('customer_id', auth.user.id)
            .order('ordered_at', { ascending: false });

          if (ordersError) {
            console.error('Ошибка при загрузке заказов:', ordersError);
          } else if (ordersData) {
            console.log(`Загружено ${ordersData.length} заказов пользователя`);
            setUserOrders(ordersData);
          }

          // Загрузка адресов
          const { data: addressesData, error: addressesError } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false });

          if (addressesError) {
            console.error('Ошибка при загрузке адресов:', addressesError);
          } else if (addressesData) {
            console.log(`Загружено ${addressesData.length} адресов пользователя`);
            setUserAddresses(addressesData);
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
        }
      };

      loadUserData();
    }
  }, [auth.user]);

  // Получаем избранные товары из localStorage
  useEffect(() => {
    try {
      // Получаем полную информацию о лайкнутых товарах
      const likedItemsInfo = getFromStorage<Record<string, any>>(LIKED_ITEMS_INFO_KEY, {});

      // Если есть информация о лайкнутых товарах, используем её
      if (Object.keys(likedItemsInfo).length > 0) {
        console.log('Загружены данные о избранных товарах из localStorage');
        const favoriteItemsArray = Object.values(likedItemsInfo) as FavoriteItem[];
        setFavoriteItems(favoriteItemsArray);
      } else {
        // Если нет информации, получаем ID лайкнутых товаров
        const likedItemIds = getFromStorage<string[]>(LIKED_ITEMS_KEY, []);

        if (likedItemIds.length > 0) {
          console.log('Найдены ID избранных товаров, загружаем данные из Supabase');
          // Получаем данные из Supabase
          const fetchFavoriteProducts = async () => {
            try {
              const { data, error } = await supabase.from('products').select('*').in('id', likedItemIds);

              if (error) {
                console.error('Ошибка при загрузке избранных товаров:', error);
                return;
              }

              if (data) {
                console.log(`Загружено ${data.length} избранных товаров`);
                const favItems: FavoriteItem[] = data.map((product) => ({
                  productId: product.id,
                  dateAdded: new Date().toISOString(),
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  weight: product.weight,
                  category_id: product.category_id,
                }));

                setFavoriteItems(favItems);
              }
            } catch (error) {
              console.error('Ошибка при загрузке избранных товаров:', error);
            }
          };

          fetchFavoriteProducts();
        } else {
          console.log('Избранные товары не найдены');
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранных товаров:', error);
    }
  }, []);

  // Обработчик выхода из системы
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Выход из системы успешно выполнен');
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  // Обработчик начала нового отзыва
  const startReview = (productId: string, productName: string) => {
    setPendingReview({
      productId,
      productName,
      rating: 5,
      comment: '',
    });
    setShowReviewModal(true);
  };

  // Обработчик отправки отзыва
  const submitReview = async () => {
    if (pendingReview && auth.user) {
      try {
        console.log('Отправка отзыва:', pendingReview);

        const { data, error } = await supabase
          .from('reviews')
          .insert({
            product_id: pendingReview.productId,
            user_id: auth.user.id,
            rating: pendingReview.rating,
            comment: pendingReview.comment,
            user_name: auth.profile?.name || 'Пользователь',
          })
          .select()
          .single();

        if (error) {
          console.error('Ошибка отправки отзыва:', error);
          throw error;
        }

        console.log('Отзыв успешно отправлен:', data);
        setUserReviews([data, ...userReviews]);
        setShowReviewModal(false);
        setPendingReview(null);
      } catch (error) {
        console.error('Ошибка отправки отзыва:', error);
        alert('Не удалось отправить отзыв. Пожалуйста, попробуйте снова.');
      }
    }
  };

  // Удаление товара из избранного
  const removeFromFavorites = (productId: string) => {
    try {
      console.log('Удаление товара из избранного:', productId);

      // Обновляем список избранных товаров в интерфейсе
      const updatedFavorites = favoriteItems.filter((item) => item.productId !== productId);
      setFavoriteItems(updatedFavorites);

      // Обновляем localStorage
      const likedItemIds = getFromStorage<string[]>(LIKED_ITEMS_KEY, []);
      const newLikedItems = likedItemIds.filter((id) => id !== productId);
      localStorage.setItem(LIKED_ITEMS_KEY, JSON.stringify(newLikedItems));

      // Обновляем информацию о лайкнутых товарах
      const likedItemsInfo = getFromStorage<Record<string, any>>(LIKED_ITEMS_INFO_KEY, {});
      if (likedItemsInfo[productId]) {
        delete likedItemsInfo[productId];
        localStorage.setItem(LIKED_ITEMS_INFO_KEY, JSON.stringify(likedItemsInfo));
      }
    } catch (error) {
      console.error('Ошибка при удалении товара из избранного:', error);
    }
  };

  // Добавление нового адреса
  const handleAddAddress = async () => {
    if (!auth.user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: auth.user.id,
          address: newAddress.address,
          city: newAddress.city,
          postal_code: newAddress.postal_code,
          is_default: newAddress.is_default,
        })
        .select()
        .single();

      if (error) throw error;

      // Если новый адрес установлен как адрес по умолчанию, обновляем остальные адреса
      if (newAddress.is_default) {
        await supabase.from('addresses').update({ is_default: false }).neq('id', data.id).eq('user_id', auth.user.id);
      }

      console.log('Адрес успешно добавлен:', data);

      // Обновляем список адресов
      setUserAddresses([
        data,
        ...userAddresses.map((addr) =>
          addr.is_default && newAddress.is_default ? { ...addr, is_default: false } : addr,
        ),
      ]);

      // Сбрасываем форму
      setNewAddress({
        address: '',
        city: 'Екатеринбург',
        postal_code: '',
        is_default: false,
      });

      setIsAddingAddress(false);
    } catch (error) {
      console.error('Ошибка при добавлении адреса:', error);
      alert('Не удалось добавить адрес. Пожалуйста, попробуйте снова.');
    }
  };

  // Удаление адреса
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Вы действительно хотите удалить этот адрес?')) return;

    try {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId);

      if (error) throw error;

      // Обновляем список адресов
      setUserAddresses(userAddresses.filter((addr) => addr.id !== addressId));
    } catch (error) {
      console.error('Ошибка при удалении адреса:', error);
      alert('Не удалось удалить адрес. Пожалуйста, попробуйте снова.');
    }
  };

  // Установка адреса по умолчанию
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      // Сначала сбрасываем флаг у всех адресов
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', auth.user?.id);

      // Затем устанавливаем флаг у выбранного адреса
      await supabase.from('addresses').update({ is_default: true }).eq('id', addressId);

      // Обновляем список адресов
      setUserAddresses(
        userAddresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        })),
      );
    } catch (error) {
      console.error('Ошибка при установке адреса по умолчанию:', error);
      alert('Не удалось обновить адрес. Пожалуйста, попробуйте снова.');
    }
  };

  // Редактирование адреса
  const handleUpdateAddress = async () => {
    if (!editingAddressId || !auth.user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .update({
          address: newAddress.address,
          city: newAddress.city,
          postal_code: newAddress.postal_code,
          is_default: newAddress.is_default,
        })
        .eq('id', editingAddressId)
        .select()
        .single();

      if (error) throw error;

      // Если адрес установлен как адрес по умолчанию, обновляем остальные адреса
      if (newAddress.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .neq('id', editingAddressId)
          .eq('user_id', auth.user.id);
      }

      // Обновляем список адресов
      setUserAddresses(
        userAddresses.map((addr) =>
          addr.id === editingAddressId
            ? data
            : addr.is_default && newAddress.is_default
              ? { ...addr, is_default: false }
              : addr,
        ),
      );

      // Сбрасываем форму
      setNewAddress({
        address: '',
        city: 'Екатеринбург',
        postal_code: '',
        is_default: false,
      });

      setEditingAddressId(null);
    } catch (error) {
      console.error('Ошибка при обновлении адреса:', error);
      alert('Не удалось обновить адрес. Пожалуйста, попробуйте снова.');
    }
  };

  // Начало редактирования адреса
  const startEditingAddress = (address: UserAddress) => {
    setNewAddress({
      address: address.address,
      city: address.city,
      postal_code: address.postal_code || '',
      is_default: address.is_default,
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(false);
  };

  // Если пользователь не авторизован и закрыл модальное окно авторизации, показываем сообщение
  if (!auth.user && !showAuthModal) {
    return (
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}
        style={{ backgroundImage: isDarkMode ? 'none' : "url('/assets/img/bg.png')" }}
      >
      

        <div className="container mx-auto px-4 py-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 mb-8 text-center`}>
            <h2 className="text-2xl font-bold mb-4">Для доступа к личному кабинету необходимо войти в систему</h2>
            <p className="mb-6">Пожалуйста, войдите или зарегистрируйтесь, чтобы получить доступ к личному кабинету</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full"
            >
              Войти в систему
            </button>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}
      style={{ backgroundImage: isDarkMode ? 'none' : "url('/assets/img/bg.png')" }}
    >
  

      <div className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 md:p-6 mb-8`}>
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Личный кабинет</h1>

          <div className="flex flex-wrap md:flex-nowrap gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedTab('profile')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    selectedTab === 'profile'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-orange-50'
                  }`}
                >
                  <User className="mr-3 h-5 w-5" />
                  <span>Профиль</span>
                </button>

                <button
                  onClick={() => setSelectedTab('addresses')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    selectedTab === 'addresses'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-orange-50'
                  }`}
                >
                  <MapPin className="mr-3 h-5 w-5" />
                  <span>Адреса доставки</span>
                </button>

                <button
                  onClick={() => setSelectedTab('orders')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    selectedTab === 'orders'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-orange-50'
                  }`}
                >
                  <Receipt className="mr-3 h-5 w-5" />
                  <span>История заказов</span>
                </button>

                <button
                  onClick={() => setSelectedTab('favorites')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    selectedTab === 'favorites'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-orange-50'
                  }`}
                >
                  <Heart className="mr-3 h-5 w-5" />
                  <span>Избранное</span>
                </button>

                <button
                  onClick={() => setSelectedTab('reviews')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    selectedTab === 'reviews'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-orange-50'
                  }`}
                >
                  <Star className="mr-3 h-5 w-5" />
                  <span>Мои отзывы</span>
                </button>

                <button
                  onClick={() => setSelectedTab('promo')}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    selectedTab === 'promo'
                      ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-orange-50'
                  }`}
                >
                  <Percent className="mr-3 h-5 w-5" />
                  <span>Промокоды и акции</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                    isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-500 hover:bg-red-50'
                  } mt-8`}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Выйти</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {selectedTab === 'profile' && (
                <div className={`user-cabinet-section ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h2 className={`user-cabinet-heading ${isDarkMode ? 'border-orange-500' : ''}`}>Ваш профиль</h2>

                  <div
                    className={`${isDarkMode ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-50'} p-4 rounded-lg mb-6 flex items-center`}
                  >
                    <Gift className={`w-8 h-8 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'} mr-3`} />
                    <div>
                      <p className="font-bold">Бонусная программа</p>
                      <p className={isDarkMode ? 'text-gray-300' : ''}>
                        {auth.user ? 'У вас 250 бонусных баллов' : 'Войдите, чтобы получать бонусы за заказы'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                      >
                        Имя
                      </label>
                      <input
                        type="text"
                        value={auth.profile?.name || ''}
                        readOnly
                        className={`w-full p-2 border rounded-md ${
                          isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={auth.profile?.email || auth.user?.email || ''}
                        readOnly
                        className={`w-full p-2 border rounded-md ${
                          isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                      >
                        Телефон
                      </label>
                      <input
                        type="text"
                        value={auth.profile?.phone || ''}
                        readOnly
                        className={`w-full p-2 border rounded-md ${
                          isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                    </div>

                    <div className="mt-4">
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-md">
                        Редактировать профиль
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'addresses' && (
                <div className={`user-cabinet-section ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h2 className={`user-cabinet-heading ${isDarkMode ? 'border-orange-500' : ''}`}>Адреса доставки</h2>

                  <div className="mb-4">
                    <button
                      onClick={() => {
                        setIsAddingAddress(true);
                        setEditingAddressId(null);
                        setNewAddress({
                          address: '',
                          city: 'Екатеринбург',
                          postal_code: '',
                          is_default: userAddresses.length === 0, // Делаем по умолчанию если это первый адрес
                        });
                      }}
                      className={`flex items-center px-4 py-2 rounded-md ${
                        isDarkMode
                          ? 'bg-orange-700 hover:bg-orange-600 text-white'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить новый адрес
                    </button>
                  </div>

                  {/* Форма для добавления/редактирования адреса */}
                  {(isAddingAddress || editingAddressId) && (
                    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <h3 className="font-medium text-lg mb-4">
                        {isAddingAddress ? 'Добавить новый адрес' : 'Редактировать адрес'}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label
                            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                          >
                            Адрес*
                          </label>
                          <input
                            type="text"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            required
                            className={`w-full p-2 border rounded-md ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                            }`}
                            placeholder="Улица, дом, квартира"
                          />
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                          >
                            Город*
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            required
                            className={`w-full p-2 border rounded-md ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}
                          >
                            Почтовый индекс
                          </label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                            className={`w-full p-2 border rounded-md ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                            }`}
                            placeholder="Необязательно"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor="is_default"
                            className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Использовать как адрес по умолчанию
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end mt-4 space-x-3">
                        <button
                          onClick={() => {
                            setIsAddingAddress(false);
                            setEditingAddressId(null);
                          }}
                          className={`px-4 py-2 rounded-md ${
                            isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-800 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          Отмена
                        </button>
                        <button
                          onClick={isAddingAddress ? handleAddAddress : handleUpdateAddress}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                        >
                          {isAddingAddress ? 'Добавить' : 'Сохранить'}
                        </button>
                      </div>
                    </div>
                  )}

                  {userAddresses.length === 0 && !isAddingAddress ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MapPin className="mx-auto w-12 h-12 mb-3 text-gray-300" />
                      <p>У вас пока нет сохраненных адресов доставки</p>
                      <p className="mt-2 text-sm">Добавьте адрес, чтобы упростить оформление заказов в будущем</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {userAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 rounded-lg border ${
                            address.is_default
                              ? isDarkMode
                                ? 'border-orange-500 bg-orange-900 bg-opacity-20'
                                : 'border-orange-500 bg-orange-50'
                              : isDarkMode
                                ? 'border-gray-600'
                                : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center">
                                <MapPin
                                  className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}
                                />
                                <p className="font-medium">
                                  {address.address}
                                  {address.is_default && (
                                    <span
                                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                        isDarkMode ? 'bg-orange-800 text-orange-200' : 'bg-orange-100 text-orange-700'
                                      }`}
                                    >
                                      По умолчанию
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {address.city}
                                {address.postal_code ? `, ${address.postal_code}` : ''}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {!address.is_default && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className={`p-1.5 rounded-md ${
                                    isDarkMode
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title="Сделать основным адресом"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => startEditingAddress(address)}
                                className={`p-1.5 rounded-md ${
                                  isDarkMode
                                    ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                                    : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                                }`}
                                title="Редактировать"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className={`p-1.5 rounded-md ${
                                  isDarkMode
                                    ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                                    : 'bg-gray-100 text-red-600 hover:bg-gray-200'
                                }`}
                                title="Удалить"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'orders' && (
                <div className={`user-cabinet-section ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h2 className={`user-cabinet-heading ${isDarkMode ? 'border-orange-500' : ''}`}>История заказов</h2>

                  {userOrders.length === 0 ? (
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} py-4`}>У вас пока нет заказов</p>
                  ) : (
                    <div className="space-y-6">
                      {userOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600' : ''}`}
                        >
                          <div
                            className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'} p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                          >
                            <div>
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
                                Заказ №{order.order_number}
                              </span>
                              <div className="flex items-center mt-1">
                                <Calendar
                                  className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} mr-1`}
                                />
                                <span className="text-sm">
                                  {new Date(order.ordered_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                            <div>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {order.status === 'completed'
                                  ? 'Выполнен'
                                  : order.status === 'processing'
                                    ? 'В обработке'
                                    : order.status === 'delivering'
                                      ? 'Доставляется'
                                      : order.status === 'new'
                                        ? 'Новый'
                                        : 'Отменен'}
                              </span>
                            </div>
                          </div>

                          <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : ''}`}>
                            {order.items &&
                              order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`flex justify-between py-2 ${
                                    isDarkMode ? 'border-b border-gray-600 last:border-b-0' : 'border-b last:border-b-0'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    {/* Здесь можно добавить изображение, если оно есть в item */}
                                    <div>
                                      <span>{item.product_name}</span>
                                      <span
                                        className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm ml-2`}
                                      >
                                        x{item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span>{item.price * item.quantity} ₽</span>
                                    {order.status === 'completed' && (
                                      <button
                                        className={`ml-4 text-sm ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'}`}
                                        onClick={() => startReview(item.product_id || '', item.product_name)}
                                      >
                                        <Star className="w-4 h-4 inline mr-1" />
                                        Оценить
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}

                            <div className="flex justify-between font-bold mt-4">
                              <span>Итого:</span>
                              <span>{order.total_amount} ₽</span>
                            </div>
                          </div>

                          <div
                            className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'} p-4 border-t ${isDarkMode ? 'border-gray-600' : ''}`}
                          >
                            <button
                              className={`${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'}`}
                            >
                              Повторить заказ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Остальные вкладки с реальными данными пользователя */}
              {selectedTab === 'favorites' && (
                <div className={`user-cabinet-section ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h2 className={`user-cabinet-heading ${isDarkMode ? 'border-orange-500' : ''}`}>Избранное</h2>

                  {favoriteItems.length === 0 ? (
                    <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Heart className="mx-auto w-12 h-12 mb-3 text-gray-300" />
                      <p>У вас пока нет избранных товаров</p>
                      <p className="mt-2 text-sm">
                        Нажмите на сердечко на карточке товара, чтобы добавить его в избранное
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {favoriteItems.map((item) => (
                        <div
                          key={item.productId}
                          className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-600 bg-gray-600' : ''}`}
                        >
                          <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                          <div className="p-3">
                            <h3 className="font-medium truncate">{item.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                                {item.price} ₽
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm"
                                  onClick={() => {
                                    /* Добавление в корзину */
                                  }}
                                >
                                  В корзину
                                </button>
                                <button
                                  className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-red-400 hover:text-red-300' : 'bg-gray-100 text-red-500 hover:text-red-600'}`}
                                  onClick={() => removeFromFavorites(item.productId)}
                                >
                                  <Heart className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div className={`user-cabinet-section ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h2 className={`user-cabinet-heading ${isDarkMode ? 'border-orange-500' : ''}`}>Мои отзывы</h2>

                  {userReviews.length === 0 ? (
                    <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Star className="mx-auto w-12 h-12 mb-3 text-gray-300" />
                      <p>У вас пока нет отзывов</p>
                      <p className="mt-2 text-sm">После заказа вы сможете оценить блюда и оставить отзыв</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-500' : 'bg-orange-100'} text-orange-500 mr-2`}
                              >
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <p className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{review.user_name}</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {review.comment || 'Пользователь оценил товар без комментария'}
                          </p>

                          <div className="flex justify-end">
                            <button
                              className={`text-sm ${isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'}`}
                            >
                              Редактировать
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Информация о возможности оценки заказов */}
                  <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-orange-50'}`}>
                    <h3 className="font-medium mb-2">Как оставить отзыв?</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      После получения заказа вы можете оценить каждое блюдо в разделе "История заказов". Ваши честные
                      отзывы помогают нам становиться лучше!
                    </p>
                  </div>
                </div>
              )}

              {selectedTab === 'promo' && (
                <div className={`user-cabinet-section ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h2 className={`user-cabinet-heading ${isDarkMode ? 'border-orange-500' : ''}`}>Промокоды и акции</h2>

                  <div className={`${isDarkMode ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-50'} p-4 rounded-lg mb-6`}>
                    <h3 className="font-medium text-lg mb-2">Ваши бонусы</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Доступно бонусов</p>
                        <p className="text-2xl font-bold">250 баллов</p>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm">
                        Использовать бонусы
                      </button>
                    </div>
                  </div>

                  <h3 className="font-medium text-lg mb-3">Доступные промокоды</h3>

                  <div className="space-y-4">
                    <div className={`promo-card ${isDarkMode ? 'bg-gray-600 border-orange-700' : ''}`}>
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium text-lg">WELCOME2025</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Скидка 10% на первый заказ
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} self-start`}
                        >
                          Активен
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Действует до 31.12.2025</p>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">Применить</button>
                      </div>
                    </div>

                    <div className={`promo-card ${isDarkMode ? 'bg-gray-600 border-orange-700' : ''}`}>
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium text-lg">SUMMER2025</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Скидка 15% на все бургеры
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'} self-start`}
                        >
                          Активен
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Действует до 31.08.2025</p>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">Применить</button>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-medium text-lg mt-6 mb-3">Завершенные акции</h3>

                  <div className="promo-card opacity-70">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-lg">WINTER2024</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Скидка 20% на все блюда на гриле
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'} self-start`}
                      >
                        Завершен
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Акция завершилась 28.02.2025
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для оценки товара */}
      {showReviewModal && pendingReview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`w-full max-w-md p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Оценка товара</h3>
            <p className="mb-4">{pendingReview.productName}</p>

            <div className="flex items-center mb-4">
              <p className={`mr-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ваша оценка:</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= pendingReview.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : isDarkMode
                          ? 'text-gray-600'
                          : 'text-gray-300'
                    }`}
                    onClick={() => setPendingReview({ ...pendingReview, rating: star })}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ваш отзыв:</label>
              <textarea
                value={pendingReview.comment}
                onChange={(e) => setPendingReview({ ...pendingReview, comment: e.target.value })}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
                placeholder="Напишите ваше мнение о блюде..."
                rows={4}
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className={`px-4 py-2 ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } rounded-lg`}
                onClick={() => setShowReviewModal(false)}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg"
                onClick={submitReview}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

 
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDarkMode={isDarkMode} />
    </div>
  );
};

export default UserCabinetPage;
