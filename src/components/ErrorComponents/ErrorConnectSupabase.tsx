import React from 'react';

export const ErrorConnectSupabase = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка подключения</h1>
        <p className="mb-4">
          Не удалось подключиться к базе данных Supabase. Пожалуйста, проверьте подключение к интернету и попробуйте
          снова.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          Повторить попытку
        </button>
      </div>
    </div>
  );
};
