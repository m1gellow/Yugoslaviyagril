/*
  # Создание таблицы элементов заказа

  1. Новые Таблицы
    - `order_items` - Хранит информацию об элементах заказов
      - `id` (uuid, первичный ключ)
      - `order_id` (uuid, ссылка на заказ)
      - `product_id` (uuid, ссылка на продукт)
      - `quantity` (integer, количество)
      - `price` (integer, цена за единицу на момент заказа)
      - `total_price` (integer, общая цена позиции)
      - `selected_sauce` (text, выбранный соус, может быть NULL)
      - `selected_sides` (text[], выбранные гарниры, может быть NULL)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для управления элементами заказа
*/

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,  -- Сохраняем название товара на момент заказа
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,      -- Цена за единицу на момент заказа
  total_price INTEGER NOT NULL, -- Общая цена позиции (price * quantity)
  selected_sauce TEXT,         -- Выбранный соус
  selected_sides TEXT[],       -- Выбранные гарниры
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Политика для авторизованных пользователей - могут видеть элементы своих заказов
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid() OR auth.uid() IN (
        SELECT id FROM auth.users WHERE auth.uid() IS NOT NULL
      )
    )
  );

-- Политика для администраторов - могут управлять всеми элементами заказов
CREATE POLICY "Admins can manage all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.uid() IS NOT NULL
  ));

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);