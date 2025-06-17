import React, { useState } from 'react';
import { Percent, Plus, Search, Calendar, Edit, Trash, X, Tag, BarChart, Check } from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';

// Типы для промокодов и акций
interface Promo {
  id: string;
  code: string;
  discount: number; // В процентах
  type: 'percent' | 'fixed'; // Процентная или фиксированная скидка
  description: string;
  minOrderAmount: number; // Минимальная сумма заказа
  startDate: string;
  endDate: string;
  usageLimit: number; // Максимальное количество использований
  usedCount: number; // Сколько раз использовали
  isActive: boolean;
  categoryRestrictions?: number[]; // Ограничения по категориям (ID категорий)
}

// Моковые данные для промокодов
const mockPromos: Promo[] = [
  {
    id: 'PROMO-001',
    code: 'WELCOME2025',
    discount: 10,
    type: 'percent',
    description: 'Скидка 10% для новых клиентов',
    minOrderAmount: 1000,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    usageLimit: 1000,
    usedCount: 245,
    isActive: true,
  },
  {
    id: 'PROMO-002',
    code: 'SUMMER2025',
    discount: 15,
    type: 'percent',
    description: 'Летняя скидка 15% на все бургеры',
    minOrderAmount: 1500,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    usageLimit: 500,
    usedCount: 87,
    isActive: true,
    categoryRestrictions: [26], // ID категории "Бургеры"
  },
  {
    id: 'PROMO-003',
    code: 'SURPRISE500',
    discount: 500,
    type: 'fixed',
    description: 'Фиксированная скидка 500₽ при заказе от 3000₽',
    minOrderAmount: 3000,
    startDate: '2025-05-01',
    endDate: '2025-07-31',
    usageLimit: 200,
    usedCount: 34,
    isActive: true,
  },
  {
    id: 'PROMO-004',
    code: 'WINTER2025',
    discount: 12,
    type: 'percent',
    description: 'Зимняя скидка 12% на горячие блюда',
    minOrderAmount: 1200,
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    usageLimit: 300,
    usedCount: 0,
    isActive: false,
    categoryRestrictions: [27, 37], // ID категорий "Блюда на гриле" и "Супы"
  },
];

const PromoPage: React.FC = () => {
  const { isDarkMode } = useAdminTheme();
  const [promos, setPromos] = useState<Promo[]>(mockPromos);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

  // Фильтрация промокодов
  const filteredPromos = promos.filter((promo) => {
    const matchesSearch =
      !searchTerm ||
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActive = !showActiveOnly || promo.isActive;

    return matchesSearch && matchesActive;
  });

  const togglePromoStatus = (promoId: string) => {
    setPromos((prevPromos) =>
      prevPromos.map((promo) => (promo.id === promoId ? { ...promo, isActive: !promo.isActive } : promo)),
    );
  };

  const handleDeletePromo = (promoId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот промокод?')) {
      setPromos(promos.filter((promo) => promo.id !== promoId));
    }
  };

  // Форма для создания/редактирования промокодов
  const PromoForm = ({ promo, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      code: promo?.code || '',
      discount: promo?.discount || 10,
      type: promo?.type || 'percent',
      description: promo?.description || '',
      minOrderAmount: promo?.minOrderAmount || 1000,
      startDate: promo?.startDate || new Date().toISOString().split('T')[0],
      endDate: promo?.endDate || new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      usageLimit: promo?.usageLimit || 100,
      isActive: promo?.isActive !== undefined ? promo.isActive : true,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
        setFormData({
          ...formData,
          [name]: (e.target as HTMLInputElement).checked,
        });
      } else if (type === 'number') {
        setFormData({
          ...formData,
          [name]: parseFloat(value),
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newPromo: Promo = {
        id: promo?.id || `PROMO-${Date.now().toString().slice(-5)}`,
        ...formData,
        usedCount: promo?.usedCount || 0,
      };

      onSave(newPromo);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Код промокода</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
            placeholder="SUMMER2025"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип скидки</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            >
              <option value="percent">Процентная</option>
              <option value="fixed">Фиксированная сумма</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {formData.type === 'percent' ? 'Скидка (%)' : 'Скидка (₽)'}
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleInputChange}
              min="0"
              max={formData.type === 'percent' ? 100 : undefined}
              step={formData.type === 'percent' ? 1 : 10}
              required
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
            placeholder="Описание промокода"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Минимальная сумма заказа (₽)
          </label>
          <input
            type="number"
            name="minOrderAmount"
            value={formData.minOrderAmount}
            onChange={handleInputChange}
            min="0"
            step="100"
            required
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата начала</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата окончания</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className={`w-full p-2 border rounded-md ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Лимит использований</label>
          <input
            type="number"
            name="usageLimit"
            value={formData.usageLimit}
            onChange={handleInputChange}
            min="1"
            className={`w-full p-2 border rounded-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Активен
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-md ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-md hover:opacity-90"
          >
            {promo ? 'Сохранить изменения' : 'Добавить промокод'}
          </button>
        </div>
      </form>
    );
  };

  const handleSavePromo = (promo: Promo) => {
    if (editingPromo) {
      // Обновляем существующий промокод
      setPromos((prevPromos) => prevPromos.map((p) => (p.id === promo.id ? promo : p)));
      setEditingPromo(null);
    } else {
      // Добавляем новый промокод
      setPromos([...promos, promo]);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Управление промокодами</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-orange-500 dark:bg-orange-600 text-white rounded-md hover:bg-orange-600 dark:hover:bg-orange-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить промокод
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Поиск промокодов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active-only"
                  checked={showActiveOnly}
                  onChange={() => setShowActiveOnly(!showActiveOnly)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
                />
                <label htmlFor="active-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Только активные
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Код
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Скидка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Срок действия
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPromos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{promo.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {promo.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{promo.description}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Мин. заказ: {promo.minOrderAmount}₽
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {promo.type === 'percent' ? `${promo.discount}%` : `${promo.discount}₽`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(promo.startDate).toLocaleDateString('ru-RU')} -{' '}
                        {new Date(promo.endDate).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Использовано: {promo.usedCount} из {promo.usageLimit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          promo.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {promo.isActive ? 'Активен' : 'Не активен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => togglePromoStatus(promo.id)}
                        className={`${
                          promo.isActive
                            ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                            : 'text-green-600 dark:text-green-400 hover:text-green-800'
                        } mr-3`}
                        title={promo.isActive ? 'Деактивировать' : 'Активировать'}
                      >
                        {promo.isActive ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => setEditingPromo(promo)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                        title="Редактировать"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Удалить"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPromos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Промокоды не найдены</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowActiveOnly(false);
                  }}
                  className={`text-sm ${
                    isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600'
                  }`}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Статистика и информация */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <h3 className="font-medium mb-3 dark:text-white flex items-center">
              <Percent className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2" />
              Активные промокоды
            </h3>
            <div className="text-3xl font-bold dark:text-white">{promos.filter((p) => p.isActive).length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">из {promos.length} промокодов всего</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <h3 className="font-medium mb-3 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2" />
              Скоро заканчиваются
            </h3>
            <div className="space-y-2">
              {promos
                .filter((p) => {
                  const endDate = new Date(p.endDate);
                  const today = new Date();
                  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return p.isActive && diffDays <= 14 && diffDays > 0;
                })
                .slice(0, 3)
                .map((promo) => (
                  <div key={promo.id} className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium dark:text-white">{promo.code}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(promo.endDate).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                        {Math.ceil((new Date(promo.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}{' '}
                        дн.
                      </div>
                    </div>
                  </div>
                ))}

              {promos.filter((p) => {
                const endDate = new Date(p.endDate);
                const today = new Date();
                const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return p.isActive && diffDays <= 14 && diffDays > 0;
              }).length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Нет промокодов, истекающих в ближайшие 2 недели
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-medium mb-3 dark:text-white flex items-center">
              <BarChart className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2" />
              Статистика использования
            </h3>
            <div className="space-y-3">
              {promos
                .filter((p) => p.usedCount > 0)
                .sort((a, b) => b.usedCount - a.usedCount)
                .slice(0, 3)
                .map((promo) => (
                  <div key={promo.id} className="mb-2">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-medium dark:text-white">{promo.code}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {promo.usedCount} / {promo.usageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-orange-500 h-2.5 rounded-full"
                        style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

              {promos.filter((p) => p.usedCount > 0).length === 0 && (
                <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                  Нет статистики использования
                </div>
              )}

              <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                Популярные промокоды (количество использований)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно добавления промокода */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6`}>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Добавление промокода</h3>
            <PromoForm promo={null} onSave={handleSavePromo} onCancel={() => setIsAddModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Модальное окно редактирования промокода */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6`}>
            <h3 className="text-lg font-bold mb-4 dark:text-white">Редактирование промокода</h3>
            <PromoForm promo={editingPromo} onSave={handleSavePromo} onCancel={() => setEditingPromo(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoPage;
