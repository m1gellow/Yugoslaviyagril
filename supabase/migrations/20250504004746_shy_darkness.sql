/*
  # Создание таблицы компонентов (соусы, гарниры и т.д.)

  1. Новые Таблицы
    - `components` - Хранит информацию о дополнительных компонентах
      - `id` (uuid, первичный ключ)
      - `name` (text, название компонента)
      - `price` (integer, цена)
      - `type` (text, тип компонента - 'sauce' или 'side')
      - `is_active` (boolean, активен ли компонент)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для чтения всеми пользователями
    - Добавление политик для управления только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sauce', 'side')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (доступно всем)
CREATE POLICY "Components are viewable by everyone"
  ON components
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Components can be modified by authenticated users"
  ON components
  FOR ALL
  TO authenticated
  USING (true);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS components_type_idx ON components(type);
CREATE INDEX IF NOT EXISTS components_is_active_idx ON components(is_active);