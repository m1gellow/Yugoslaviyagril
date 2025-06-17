import React, { useState } from 'react';
import {
  X,
  Bell,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Printer,
  User,
  Phone,
  Calendar,
  MapPin,
  PenSquare,
  Save,
  UserPlus,
} from 'lucide-react';
import { getStatusBadgeClass } from '../../utils/adminHelpers';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { Order } from '../../../types';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  updateStatus: (orderId: string, status: 'new' | 'processing' | 'delivering' | 'completed' | 'cancelled') => void;
  onAddDeliveryNote: (orderId: string, note: string) => void;
  onAssignCourier: (orderId: string, courierInfo: any) => void;
  isDarkMode: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onClose,
  updateStatus,
  onAddDeliveryNote,
  onAssignCourier,
  isDarkMode,
}) => {
  const [deliveryNote, setDeliveryNote] = useState(order.deliveryNotes || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [showCourierForm, setShowCourierForm] = useState(false);
  const [courierInfo, setCourierInfo] = useState({
    name: order.courierInfo?.name || '',
    phone: order.courierInfo?.phone || '',
    estimatedArrival: order.courierInfo?.estimatedArrival || '',
  });

  const handleSaveNote = () => {
    onAddDeliveryNote(order.id, deliveryNote);
    setIsEditingNote(false);
  };

  const handleAssignCourier = () => {
    onAssignCourier(order.id, courierInfo);
    setShowCourierForm(false);
    // Если заказ еще не в статусе доставки, обновить
    if (order.status !== 'delivering') {
      updateStatus(order.id, 'delivering');
    }
  };

  return (
    <div className="w-1/2 lg:w-1/3 bg-white dark:bg-gray-800 overflow-auto">
      <div className="p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
        <h3 className="font-semibold dark:text-white">Детали заказа</h3>
        <button
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg dark:text-white">{order.id}</span>
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeClass(order.status)}`}
            >
              {order.status === 'new' && <Bell className="w-4 h-4 mr-1" />}
              {order.status === 'processing' && <Clock className="w-4 h-4 mr-1" />}
              {order.status === 'delivering' && <Truck className="w-4 h-4 mr-1" />}
              {order.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
              {order.status === 'cancelled' && <XCircle className="w-4 h-4 mr-1" />}
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
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            <p>{order.date}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <User className="w-4 h-4 mr-1" />
            Информация о клиенте
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p className="mb-1 dark:text-gray-300 flex items-center">
              <User className="w-4 h-4 mr-1 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Имя:</span> {order.customer}
            </p>
            <p className="mb-1 dark:text-gray-300 flex items-center">
              <Phone className="w-4 h-4 mr-1 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Телефон:</span> {order.phone}
            </p>
            <p className="mb-1 dark:text-gray-300 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Адрес:</span> {order.address}
            </p>
            <p className="mb-1 dark:text-gray-300 flex items-center">
              <span className="text-gray-500 dark:text-gray-400">Способ доставки:</span>
              {order.deliveryMethod === 'delivery' ? (
                <span className="ml-1 flex items-center">
                  <Truck className="w-4 h-4 mr-1 text-blue-500" /> Доставка
                </span>
              ) : (
                <span className="ml-1 flex items-center">
                  <User className="w-4 h-4 mr-1 text-green-500" /> Самовывоз
                </span>
              )}
            </p>
            <p className="dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400">Оплата:</span>
              {order.paymentMethod === 'cash'
                ? ' Наличные'
                : order.paymentMethod === 'card'
                  ? ' Картой при получении'
                  : ' Онлайн'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Заметка о доставке</h4>

          {isEditingNote ? (
            <div className="mb-3">
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="Добавьте заметку о доставке..."
                rows={3}
                className={`w-full p-2 border rounded-lg ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="mr-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-3 py-1 text-sm bg-orange-500 text-white rounded flex items-center"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`p-3 rounded-lg border ${
                isDarkMode
                  ? deliveryNote
                    ? 'bg-gray-700 border-gray-600'
                    : 'border-dashed border-gray-600 bg-transparent'
                  : deliveryNote
                    ? 'bg-orange-50 border-orange-100'
                    : 'border-dashed border-gray-300 bg-transparent'
              } min-h-[70px] relative`}
            >
              {deliveryNote ? (
                <p className="dark:text-white">{deliveryNote}</p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500">Нет заметок о доставке</p>
              )}
              <button
                onClick={() => setIsEditingNote(true)}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <PenSquare className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {order.deliveryMethod === 'delivery' && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Truck className="w-4 h-4 mr-1" />
              Информация о доставке
            </h4>

            {order.courierInfo ? (
              <div
                className={`bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg ${
                  isDarkMode ? 'text-blue-100' : 'text-blue-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{order.courierInfo.name}</p>
                    <p className="text-sm mt-1">{order.courierInfo.phone}</p>
                    <p className="text-sm flex items-center mt-1">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Ожидаемое время прибытия: {order.courierInfo.estimatedArrival}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCourierForm(true)}
                    className={`text-xs p-1 ${
                      isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <PenSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {showCourierForm ? (
                  <div className="space-y-3 p-3 border rounded-lg dark:border-gray-700">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Имя курьера</label>
                      <input
                        type="text"
                        value={courierInfo.name}
                        onChange={(e) => setCourierInfo({ ...courierInfo, name: e.target.value })}
                        placeholder="Имя курьера"
                        className={`w-full p-2 text-sm border rounded-md ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Телефон</label>
                      <input
                        type="text"
                        value={courierInfo.phone}
                        onChange={(e) => setCourierInfo({ ...courierInfo, phone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                        className={`w-full p-2 text-sm border rounded-md ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Ожидаемое время прибытия
                      </label>
                      <input
                        type="text"
                        value={courierInfo.estimatedArrival}
                        onChange={(e) => setCourierInfo({ ...courierInfo, estimatedArrival: e.target.value })}
                        placeholder="19:30"
                        className={`w-full p-2 text-sm border rounded-md ${
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setShowCourierForm(false)}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleAssignCourier}
                        className="px-3 py-1 text-sm bg-orange-500 text-white rounded flex items-center"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        Назначить
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCourierForm(true)}
                    className={`w-full py-2 border border-dashed rounded-md flex items-center justify-center ${
                      isDarkMode
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Назначить курьера
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Состав заказа</h4>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b dark:border-gray-600 last:border-0">
                <div>
                  <p className="font-medium dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} шт × {item.price} ₽
                  </p>
                </div>
                <p className="font-medium dark:text-white">{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</p>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-bold dark:text-white">
              <p>Итого:</p>
              <p>{order.total.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Изменить статус</h4>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center"
              onClick={() => updateStatus(order.id, 'new')}
              disabled={order.status === 'new'}
            >
              <Bell className="w-4 h-4 mr-1" />
              Новый
            </button>
            <button
              className="px-3 py-1.5 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/50 flex items-center"
              onClick={() => updateStatus(order.id, 'processing')}
              disabled={order.status === 'processing'}
            >
              <Clock className="w-4 h-4 mr-1" />
              Готовится
            </button>
            <button
              className="px-3 py-1.5 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center"
              onClick={() => updateStatus(order.id, 'delivering')}
              disabled={order.status === 'delivering'}
            >
              <Truck className="w-4 h-4 mr-1" />
              Доставляется
            </button>
            <button
              className="px-3 py-1.5 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center"
              onClick={() => updateStatus(order.id, 'completed')}
              disabled={order.status === 'completed'}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Выполнен
            </button>
            <button
              className="px-3 py-1.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center"
              onClick={() => updateStatus(order.id, 'cancelled')}
              disabled={order.status === 'cancelled'}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Отменен
            </button>
          </div>
        </div>

        <div>
          <button className="w-full py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 transition flex items-center justify-center">
            <Printer className="w-4 h-4 mr-2" />
            Распечатать чек
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
