import React from 'react';

interface DeliveryTrackingMapProps {
  isDarkMode: boolean;
}

const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({ isDarkMode }) => {
  // В реальном приложении здесь была бы интеграция с Google Maps или другим картографическим сервисом
  return (
    <div
      className={`w-full h-64 ${
        isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-200 border border-gray-300'
      } rounded-lg flex items-center justify-center`}
    >
      <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="text-lg font-medium mb-2">Карта отслеживания</p>
        <p className="text-sm">В этом месте будет отображена интерактивная карта с местоположением курьера</p>
        <div className="mt-4 inline-block">
          <div className="relative h-3 w-48 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
            <div className="absolute h-full bg-green-500 animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Ресторан</span>
            <span>В пути</span>
            <span>Клиент</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingMap;
