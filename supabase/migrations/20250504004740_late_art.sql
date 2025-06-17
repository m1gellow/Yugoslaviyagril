/*
  # Создание таблицы цен продуктов в ресторанах

  1. Новые Таблицы
    - `restaurant_products` - Хранит информацию о ценах продуктов в разных ресторанах
      - `id` (uuid, первичный ключ)
      - `restaurant_id` (uuid, ссылка на ресторан)
      - `product_id` (uuid, ссылка на продукт)
      - `price` (integer, цена продукта в конкретном ресторане)
      - `is_available` (boolean, доступен ли продукт в этом ресторане)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице restaurant_products
    - Добавление политик для чтения всеми пользователями
    - Добавление политик для управления только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS restaurant_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(restaurant_id, product_id)
);

-- Включение Row Level Security
ALTER TABLE restaurant_products ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (доступно всем)
CREATE POLICY "Restaurant products are viewable by everyone"
  ON restaurant_products
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Restaurant products can be modified by authenticated users"
  ON restaurant_products
  FOR ALL
  TO authenticated
  USING (true);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS restaurant_products_restaurant_id_idx ON restaurant_products(restaurant_id);
CREATE INDEX IF NOT EXISTS restaurant_products_product_id_idx ON restaurant_products(product_id);