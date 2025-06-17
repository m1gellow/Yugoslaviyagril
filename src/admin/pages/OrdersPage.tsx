import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Filter,
  Search,
  X,
  AlertTriangle,
  GridIcon,
  List,
  MapPin,
  User,
  Calendar,
  Clock as ClockIcon,
  Phone,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import OrderDetails from '../components/orders/OrderDetails';
import { useAdminTheme } from '../context/AdminThemeContext';
import { Order } from '../../types';
import DeliveryTrackingMap from '../components/orders/DeliveryTrackingMap';
import { getStatusBadgeClass, getStatusText, getStatusIcon } from '../utils/adminHelpers';
import { supabase } from '../../lib/supabase';

const OrdersPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const {
    data: orders,
    loading,
    refresh,
    update,
  } = useSupabaseData<Order>('orders', {
    select: `
      *,
      restaurant:restaurant_id(name, address)
    `,
    order: { column: 'ordered_at', ascending: false },
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMap, setShowMap] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);

  // Фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    if (orderFilter !== 'all' && order.status !== orderFilter) {
      return false;
    }

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchTermLower) ||
        order.customer_name.toLowerCase().includes(searchTermLower) ||
        order.customer_phone.includes(searchTerm) ||
        (order.customer_address && order.customer_address.toLowerCase().includes(searchTermLower)) ||
        order.restaurant?.name?.toLowerCase().includes(searchTermLower) ||
        false
      );
    }

    return true;
  });

  // Загружать детали выбранного заказа
  useEffect(() => {
    if (selectedOrder) {
      const loadOrderDetails = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select(
            `
            *,
            restaurant:restaurant_id(*),
            items:order_items(*)
          `,
          )
          .eq('id', selectedOrder.id)
          .single();

        if (data && !error) {
          setSelectedOrder(data as Order);
        }
      };

      loadOrderDetails();
    }
  }, [selectedOrder?.id]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: 'new' | 'processing' | 'delivering' | 'completed' | 'cancelled',
  ) => {
    try {
      // Обновляем статус заказа в базе данных
      const { error } = await update(orderId, {
        status: newStatus,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Обновляем локальное состояние
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = {
          ...selectedOrder,
          status: newStatus,
        };

        // Если статус изменен на "доставляется", добавляем информацию о курьере
        if (newStatus === 'delivering' && !selectedOrder.courier_info) {
          updatedOrder.courier_info = {
            name: 'Дмитрий Иванов',
            phone: '+7 (900) 123-45-67',
            estimatedArrival: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }

        setSelectedOrder(updatedOrder);
      }

      // Обновляем список заказов
      refresh();

      // Если статус изменен на "доставляется", предлагаем открыть карту
      if (newStatus === 'delivering' && !showMap) {
        const confirmMap = window.confirm('Открыть карту отслеживания доставки?');
        if (confirmMap) {
          const deliveringOrder = orders.find((o) => o.id === orderId);
          if (deliveringOrder) {
            setActiveDelivery(deliveringOrder);
            setShowMap(true);
          }
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddDeliveryNote = async (orderId: string, note: string) => {
    try {
      const { error } = await update(orderId, {
        comment: note,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          comment: note,
        });
      }

      refresh();
    } catch (error) {
      console.error('Error adding delivery note:', error);
    }
  };

  const assignCourier = async (orderId: string, courierInfo: any) => {
    try {
      const { error } = await update(orderId, {
        courier_info: courierInfo,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          courier_info: courierInfo,
        });
      }

      refresh();
    } catch (error) {
      console.error('Error assigning courier:', error);
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredOrders.map((order) => {
        // Получаем иконку на основе статуса
        let StatusIcon;
        switch (order.status) {
          case 'new':
            StatusIcon = Bell;
            break;
          case 'processing':
            StatusIcon = Clock;
            break;
          case 'delivering':
            StatusIcon = Truck;
            break;
          case 'completed':
            StatusIcon = CheckCircle;
            break;
          case 'cancelled':
            StatusIcon = XCircle;
            break;
          default:
            StatusIcon = AlertTriangle;
        }

        return (
          <div
            key={order.id}
            className={`rounded-lg shadow ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
            } transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'ring-2 ring-orange-500' : ''}`}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-semibold dark:text-white">{order.order_number}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                    {new Date(order.ordered_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeClass(order.status)}`}
                >
                  <StatusIcon className="w-3.5 h-3.5 mr-1" />
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="text-sm mb-3">
                <p className="dark:text-gray-300 flex items-center mb-1">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">Клиент:</span> {order.customer_name}
                </p>
                <p className="dark:text-gray-300 flex items-center mb-1">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">Телефон:</span> {order.customer_phone}
                </p>
                <p className="dark:text-gray-300 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">Ресторан:</span> {order.restaurant?.name}
                </p>
                {order.delivery_method === 'delivery' && order.customer_address && (
                  <p className="dark:text-gray-300 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                    <span>{order.customer_address}</span>
                  </p>
                )}
                {order.courier_info && (
                  <div className={`mt-2 p-2 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-orange-50'}`}>
                    <p className="text-xs font-medium mb-1">Информация о доставке:</p>
                    <p className="text-xs">Курьер: {order.courier_info.name}</p>
                    <p className="text-xs">Прибытие: {order.courier_info.estimatedArrival}</p>
                  </div>
                )}
              </div>

              <div className="border-t dark:border-gray-600 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span
                      className={`inline-flex items-center text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {order.delivery_method === 'delivery' ? (
                        <Truck className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      ) : (
                        <User className="w-3.5 h-3.5 mr-1 text-green-500" />
                      )}
                      {order.delivery_method === 'delivery' ? 'Доставка' : 'Самовывоз'}
                    </span>

                    <span
                      className={`inline-flex items-center text-xs ml-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {order.payment_method === 'cash' ? (
                        <span>💵</span>
                      ) : order.payment_method === 'card' ? (
                        <span>💳</span>
                      ) : (
                        <span>🔄</span>
                      )}
                      <span className="ml-1">
                        {order.payment_method === 'cash'
                          ? 'Наличные'
                          : order.payment_method === 'card'
                            ? 'Картой'
                            : 'Онлайн'}
                      </span>
                    </span>
                  </div>
                  <div className="font-bold dark:text-white">{order.total_amount.toLocaleString('ru-RU')} ₽</div>
                </div>
              </div>
            </div>

            {order.comment && (
              <div
                className={`px-4 py-2 border-t ${isDarkMode ? 'border-gray-600 bg-gray-600' : 'border-orange-100 bg-orange-50'}`}
              >
                <p className="text-xs italic">📝 {order.comment}</p>
              </div>
            )}

            <div className={`flex rounded-b-lg overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <button
                className={`flex-1 p-2 text-sm text-center ${isDarkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-200'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(order);
                }}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Просмотр
              </button>

              {order.status === 'delivering' && (
                <button
                  className={`flex-1 p-2 text-sm text-center ${
                    isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-100'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDelivery(order);
                    setShowMap(true);
                  }}
                >
                  <Truck className="w-4 h-4 inline mr-1" />
                  Отслеживание
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full">
      <div className={`${selectedOrder ? 'w-1/2 lg:w-2/3 border-r dark:border-gray-700' : 'w-full'} overflow-auto`}>
        <div className="p-4 border-b bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Поиск заказов..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Список"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-orange-500 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Сетка"
              >
                <GridIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-md ${orderFilter === 'all' ? 'bg-gray-800 dark:bg-gray-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setOrderFilter('all')}
              >
                Все
              </button>
              <button
                className={`px-3 py-1.5 rounded-md flex items-center ${orderFilter === 'new' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}
                onClick={() => setOrderFilter('new')}
              >
                {orderFilter === 'new' && <Bell className="w-4 h-4 mr-1" />}
                Новые
              </button>
              <button
                className={`px-3 py-1.5 rounded-md flex items-center ${orderFilter === 'processing' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}
                onClick={() => setOrderFilter('processing')}
              >
                {orderFilter === 'processing' && <Clock className="w-4 h-4 mr-1" />}
                Готовится
              </button>
              <button
                className={`px-3 py-1.5 rounded-md flex items-center ${orderFilter === 'delivering' ? 'bg-purple-600 text-white' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}
                onClick={() => setOrderFilter('delivering')}
              >
                {orderFilter === 'delivering' && <Truck className="w-4 h-4 mr-1" />}
                Доставляется
              </button>
              <button
                className={`px-3 py-1.5 rounded-md flex items-center ${orderFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}
                onClick={() => setOrderFilter('completed')}
              >
                {orderFilter === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                Выполнены
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 dark:border-gray-600"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка заказов...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Заказы не найдены</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Сбросить поиск
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                // Получаем иконку на основе статуса
                let StatusIcon;
                switch (order.status) {
                  case 'new':
                    StatusIcon = Bell;
                    break;
                  case 'processing':
                    StatusIcon = Clock;
                    break;
                  case 'delivering':
                    StatusIcon = Truck;
                    break;
                  case 'completed':
                    StatusIcon = CheckCircle;
                    break;
                  case 'cancelled':
                    StatusIcon = XCircle;
                    break;
                  default:
                    StatusIcon = AlertTriangle;
                }

                return (
                  <div
                    key={order.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold dark:text-white">{order.order_number}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                          {new Date(order.ordered_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeClass(order.status)}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 mr-1" />
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="text-sm mb-2">
                      <div className="grid grid-cols-2 gap-2">
                        <p className="dark:text-gray-300 flex items-center">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">Клиент:</span> {order.customer_name}
                        </p>
                        <p className="dark:text-gray-300 flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">Телефон:</span> {order.customer_phone}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <p className="dark:text-gray-300 flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">Заведение:</span> {order.restaurant?.name}
                        </p>
                        {order.delivery_method === 'delivery' && order.customer_address && (
                          <p className="dark:text-gray-300 flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                            <span>Адрес:</span> {order.customer_address}
                          </p>
                        )}
                      </div>
                    </div>

                    {order.comment && (
                      <div className={`p-2 mb-2 rounded text-sm ${isDarkMode ? 'bg-gray-600' : 'bg-orange-50'}`}>
                        <span className="font-medium">Заметки:</span> {order.comment}
                      </div>
                    )}

                    {order.courier_info && (
                      <div
                        className={`p-2 mb-2 rounded ${isDarkMode ? 'bg-blue-900/20 text-blue-100' : 'bg-blue-50 text-blue-700'} text-sm flex`}
                      >
                        <div className="flex-1">
                          <p>
                            Курьер: <span className="font-medium">{order.courier_info.name}</span>
                          </p>
                          <p>Телефон: {order.courier_info.phone}</p>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          <span>
                            Прибытие: <span className="font-bold">{order.courier_info.estimatedArrival}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {order.delivery_method === 'delivery' ? 'Доставка' : 'Самовывоз'} •
                          {order.payment_method === 'cash'
                            ? ' Наличные'
                            : order.payment_method === 'card'
                              ? ' Картой при получении'
                              : ' Онлайн'}
                        </span>
                        {order.status === 'delivering' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDelivery(order);
                              setShowMap(true);
                            }}
                            className="ml-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Truck className="w-3.5 h-3.5 inline mr-1" />
                            Отследить
                          </button>
                        )}
                      </div>
                      <div className="font-bold dark:text-white">{order.total_amount.toLocaleString('ru-RU')} ₽</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          updateStatus={updateOrderStatus}
          onAddDeliveryNote={handleAddDeliveryNote}
          onAssignCourier={assignCourier}
          isDarkMode={isDarkMode}
        />
      )}

      {showMap && activeDelivery && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
          <div
            className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-4xl mx-auto overflow-hidden`}
          >
            <div
              className={`p-4 flex justify-between items-center border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <h3 className="font-semibold dark:text-white">
                Отслеживание доставки заказа {activeDelivery.order_number}
              </h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-1 dark:text-white">Информация о доставке</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Адрес: {activeDelivery.customer_address}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Клиент: {activeDelivery.customer_name}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Телефон: {activeDelivery.customer_phone}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className="font-medium mb-1 dark:text-white">Статус доставки</h4>
                  <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                    <Truck className="w-4 h-4 inline mr-1" />В пути
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    <ClockIcon className="w-4 h-4 inline mr-1" />
                    Ожидаемое прибытие: {activeDelivery.courier_info?.estimatedArrival || '19:30'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  <h4 className="font-medium mb-1 dark:text-white">Информация о курьере</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <User className="w-4 h-4 inline mr-1" />
                    {activeDelivery.courier_info?.name || 'Дмитрий Иванов'}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <Phone className="w-4 h-4 inline mr-1" />
                    {activeDelivery.courier_info?.phone || '+7 (900) 123-45-67'}
                  </p>
                </div>
              </div>

              <DeliveryTrackingMap isDarkMode={isDarkMode} />

              <div className="mt-2">
                <h4 className="font-medium mb-2 dark:text-white">Статус заказа</h4>
                <div className="flex justify-between items-center">
                  <ol className={`relative border-s ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <li className="mb-5 ms-4">
                      <div className="absolute w-3 h-3 rounded-full -start-1.5 border border-white dark:border-gray-900 bg-green-500"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        19:00
                      </time>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Заказ принят</h3>
                    </li>
                    <li className="mb-5 ms-4">
                      <div className="absolute w-3 h-3 rounded-full -start-1.5 border border-white dark:border-gray-900 bg-green-500"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        19:05
                      </time>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Заказ готовится</h3>
                    </li>
                    <li className="mb-5 ms-4">
                      <div className="absolute w-3 h-3 rounded-full -start-1.5 border border-white dark:border-gray-900 bg-green-500"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        19:15
                      </time>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Передан курьеру</h3>
                    </li>
                    <li className="ms-4">
                      <div className="absolute w-3 h-3 rounded-full -start-1.5 border border-white dark:border-gray-900 bg-blue-500 animate-pulse"></div>
                      <time className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        19:30
                      </time>
                      <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Ожидаемое прибытие</h3>
                    </li>
                  </ol>

                  <button
                    onClick={() => setShowMap(false)}
                    className={`px-4 py-2 border rounded-md ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Закрыть карту
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
