/*
  # Создание таблицы связи продуктов и компонентов

  1. Новые Таблицы
    - `product_components` - Хранит информацию о связи между продуктами и дополнительными компонентами
      - `id` (uuid, первичный ключ)
      - `product_id` (uuid, ссылка на продукт)
      - `component_id` (uuid, ссылка на компонент)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для чтения всеми пользователями
    - Добавление политик для управления только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS product_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_product_component UNIQUE(product_id, component_id)
);

-- Включение Row Level Security
ALTER TABLE product_components ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (доступно всем)
CREATE POLICY "Product components are viewable by everyone"
  ON product_components
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Product components can be modified by authenticated users"
  ON product_components
  FOR ALL
  TO authenticated
  USING (true);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS product_components_product_id_idx ON product_components(product_id);
CREATE INDEX IF NOT EXISTS product_components_component_id_idx ON product_components(component_id);