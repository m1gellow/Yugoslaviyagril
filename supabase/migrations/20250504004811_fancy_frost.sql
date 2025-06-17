/*
  # Создание таблицы заказов

  1. Новые Таблицы
    - `orders` - Хранит информацию о заказах
      - `id` (uuid, первичный ключ)
      - `customer_id` (uuid, ссылка на пользователя, может быть NULL для анонимных заказов)
      - `restaurant_id` (uuid, ссылка на ресторан)
      - `order_number` (text, номер заказа для внешнего отображения)
      - `customer_name` (text, имя клиента)
      - `customer_phone` (text, телефон клиента)
      - `customer_address` (text, адрес доставки, может быть NULL для самовывоза)
      - `delivery_method` (text, метод доставки - 'delivery' или 'pickup')
      - `payment_method` (text, метод оплаты - 'cash', 'card', 'online')
      - `status` (text, статус заказа)
      - `total_amount` (integer, общая сумма)
      - `promo_code_id` (uuid, примененный промокод, может быть NULL)
      - `discount_amount` (integer, сумма скидки)
      - `delivery_cost` (integer, стоимость доставки)
      - `comment` (text, комментарий к заказу)
      - `ordered_at` (timestamp, время создания заказа)
      - `updated_at` (timestamp, время обновления заказа)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для управления заказами
*/

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('delivery', 'pickup')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'online')),
  status TEXT NOT NULL CHECK (status IN ('new', 'processing', 'delivering', 'completed', 'cancelled')),
  total_amount INTEGER NOT NULL,
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  discount_amount INTEGER DEFAULT 0,
  delivery_cost INTEGER DEFAULT 0,
  comment TEXT,
  ordered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Политика для авторизованных пользователей - могут видеть свои заказы
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.uid() IS NOT NULL
  ));

-- Политика для администраторов - могут управлять всеми заказами
CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.uid() IS NOT NULL
  ));

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_restaurant_id_idx ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_ordered_at_idx ON orders(ordered_at);