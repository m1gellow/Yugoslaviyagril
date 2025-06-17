/*
  # Создание таблицы ресторанов

  1. Новые Таблицы
    - `restaurants` - Хранит информацию о ресторанах сети
      - `id` (uuid, первичный ключ)
      - `name` (text, название ресторана)
      - `address` (text, адрес ресторана)
      - `phone` (text, телефон ресторана)
      - `url` (text, URL-путь для маршрутизации)
      - `min_order_amount` (integer, минимальная сумма заказа)
      - `free_delivery_threshold` (integer, порог бесплатной доставки)
      - `working_hours` (text, часы работы)
      - `delivery_time` (text, время доставки)
      - `location_lat` (float, широта)
      - `location_lng` (float, долгота)
      - `is_active` (boolean, активен ли ресторан)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице restaurants
    - Добавление политик для чтения ресторанов всеми пользователями
    - Добавление политик для управления ресторанами только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  url TEXT,
  min_order_amount INTEGER DEFAULT 1000,
  free_delivery_threshold INTEGER DEFAULT 4000,
  working_hours TEXT DEFAULT '10:00 - 22:00',
  delivery_time TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Политика для чтения ресторанов (доступно всем)
CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Restaurants can be modified by authenticated users"
  ON restaurants
  FOR ALL
  TO authenticated
  USING (true);