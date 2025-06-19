/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
    extend: {},
    container: { // Добавьте эту секцию
      center: true, // Центрирует контейнер
      padding: '1rem', // Добавляет отступы по бокам
      screens: { // Определяет ширину контейнера на разных брейкпоинтах
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1180px', // Устанавливаем ширину 1180px для брейкпоинта 'xl'
        '2xl': '1536px',
      },
    },
  },
  darkMode: 'class', // Включаем темную тему
  plugins: [],
};
