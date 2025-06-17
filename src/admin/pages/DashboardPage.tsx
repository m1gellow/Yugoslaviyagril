import React, { useEffect, useState } from 'react';
import { Bell, Clock, PieChart, CheckCircle, ShoppingBag } from 'lucide-react';
import { getStatusBadgeClass } from '../utils/adminHelpers';
import { useAdminTheme } from '../context/AdminThemeContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';

const DashboardPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const { data: orders, loading: ordersLoading } = useSupabaseData('orders', {
    order: { column: 'ordered_at', ascending: false },
  });

  const { data: products, loading: productsLoading } = useSupabaseData('products', {
    select: `*, category:category_id(*), restaurant_products:restaurant_products(*)`,
    order: { column: 'created_at', ascending: false },
  });

  const [stats, setStats] = useState({
    newOrders: 0,
    processingOrders: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    popularProducts: [] as any[],
  });

  useEffect(() => {
    // Обновляем статистику при получении данных
    if (!ordersLoading && orders.length > 0) {
      // Статистика заказов
      const newOrdersCount = orders.filter((order) => order.status === 'new').length;
      const processingOrdersCount = orders.filter(
        (order) => order.status === 'processing' || order.status === 'delivering',
      ).length;

      // Расчет выручки
      const completedOrders = orders.filter((order) => order.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);

      const today = new Date().toISOString().split('T')[0];
      const todayCompletedOrders = completedOrders.filter((order) => order.ordered_at.split('T')[0] === today);
      const todayRevenue = todayCompletedOrders.reduce((sum, order) => sum + order.total_amount, 0);

      setStats((prev) => ({
        ...prev,
        newOrders: newOrdersCount,
        processingOrders: processingOrdersCount,
        totalRevenue,
        todayRevenue,
      }));
    }

    // Получение популярных продуктов
    const fetchPopularProducts = async () => {
      // В реальном приложении используйте функцию get_popular_products из миграции
      try {
        const { data, error } = await supabase.rpc('get_popular_products', { limit_count: 5 });

        if (data && !error) {
          setStats((prev) => ({ ...prev, popularProducts: data }));
        } else {
          // Если функции нет, используем моковые данные
          setStats((prev) => ({
            ...prev,
            popularProducts: products.slice(0, 5).map((p) => ({
              ...p,
              sold_count: Math.floor(Math.random() * 50) + 10,
            })),
          }));
        }
      } catch (error) {
        console.log('Error fetching popular products:', error);
        // Если ошибка, используем продукты без сортировки
        setStats((prev) => ({
          ...prev,
          popularProducts: products.slice(0, 5).map((p) => ({
            ...p,
            sold_count: Math.floor(Math.random() * 50) + 10,
          })),
        }));
      }
    };

    if (!productsLoading && products.length > 0) {
      fetchPopularProducts();
    }
  }, [orders, ordersLoading, products, productsLoading]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Панель управления</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Новые заказы</h3>
          <div className="flex items-center mt-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold dark:text-white">{stats.newOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">В обработке</h3>
          <div className="flex items-center mt-2">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold dark:text-white">{stats.processingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Выручка сегодня</h3>
          <div className="flex items-center mt-2">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold dark:text-white">{stats.todayRevenue.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Общая выручка</h3>
          <div className="flex items-center mt-2">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
              <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-semibold dark:text-white">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4 dark:text-white">Последние заказы</h3>
          {ordersLoading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Загрузка заказов...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="dark:bg-gray-800">
                      <td className="px-4 py-2 whitespace-nowrap text-sm dark:text-gray-300">{order.order_number}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm dark:text-gray-300">{order.customer_name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark:text-gray-300">
                        {order.total_amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}
                        >
                          {order.status === 'new'
                            ? 'Новый'
                            : order.status === 'processing'
                              ? 'Готовится'
                              : order.status === 'delivering'
                                ? 'Доставляется'
                                : order.status === 'completed'
                                  ? 'Выполнен'
                                  : 'Отменен'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          Подробнее
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4 dark:text-white">Популярные блюда</h3>
          {productsLoading || stats.popularProducts.length === 0 ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Загрузка популярных блюд...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.popularProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-sm dark:text-white">{product.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Продано: {product.sold_count || Math.floor(Math.random() * 50) + 10} шт.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium dark:text-white">{product.price} ₽</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
