/*
  # Создание таблицы рекомендаций продуктов

  1. Новые Таблицы
    - `product_recommendations` - Хранит информацию о рекомендуемых товарах для каждого продукта
      - `id` (uuid, первичный ключ)
      - `product_id` (uuid, ссылка на основной продукт)
      - `recommended_product_id` (uuid, ссылка на рекомендуемый продукт)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для чтения всеми пользователями
    - Добавление политик для управления только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_recommendation UNIQUE(product_id, recommended_product_id)
);

-- Запрещаем рекомендовать продукт самому себе
ALTER TABLE product_recommendations
ADD CONSTRAINT no_self_recommendation 
CHECK (product_id != recommended_product_id);

-- Включение Row Level Security
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (доступно всем)
CREATE POLICY "Product recommendations are viewable by everyone"
  ON product_recommendations
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Product recommendations can be modified by authenticated users"
  ON product_recommendations
  FOR ALL
  TO authenticated
  USING (true);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS product_recommendations_product_id_idx ON product_recommendations(product_id);
CREATE INDEX IF NOT EXISTS product_recommendations_recommended_product_id_idx ON product_recommendations(recommended_product_id);