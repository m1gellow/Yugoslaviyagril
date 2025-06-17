/*
  # Создание таблицы отзывов

  1. Новые Таблицы
    - `reviews` - Хранит отзывы пользователей о продуктах
      - `id` (uuid, первичный ключ)
      - `product_id` (uuid, ссылка на продукт)
      - `user_id` (uuid, ссылка на пользователя, может быть NULL для анонимных отзывов)
      - `order_id` (uuid, ссылка на заказ, может быть NULL)
      - `rating` (integer, оценка от 1 до 5)
      - `comment` (text, текст отзыва)
      - `user_name` (text, имя пользователя)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для управления отзывами
*/

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (доступно всем)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

-- Политика для авторизованных пользователей - могут создавать отзывы
CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Политика для пользователей - могут редактировать только свои отзывы
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Политика для пользователей - могут удалять только свои отзывы
CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_order_id_idx ON reviews(order_id);