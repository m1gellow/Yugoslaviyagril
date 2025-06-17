/*
  # Создание таблицы продуктов

  1. Новые Таблицы
    - `products` - Хранит информацию о товарах в меню
      - `id` (uuid, первичный ключ)
      - `name` (text, название продукта)
      - `description` (text, описание продукта)
      - `price` (integer, базовая цена)
      - `weight` (text, вес/объем продукта)
      - `image` (text, URL изображения)
      - `category_id` (uuid, внешний ключ к таблице categories)
      - `rating` (float, рейтинг продукта)
      - `reviews_count` (integer, количество отзывов)
      - `is_available` (boolean, доступен ли продукт)
      - `created_at` (timestamp, время создания)
      - `updated_at` (timestamp, время обновления)
      
  2. Безопасность
    - Включение RLS на таблице products
    - Добавление политик для чтения продуктов всеми пользователями
    - Добавление политик для управления продуктами только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  weight TEXT,
  image TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  rating FLOAT DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Политика для чтения продуктов (доступно всем)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Products can be modified by authenticated users"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_is_available_idx ON products(is_available);