/*
  # Создание таблицы категорий меню

  1. Новые Таблицы
    - `categories` - Хранит информацию о категориях меню
      - `id` (uuid, первичный ключ)
      - `name` (text, название категории)
      - `icon` (text, иконка категории)
      - `sort_order` (integer, порядок отображения)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице categories
    - Добавление политик для чтения категорий всеми пользователями
    - Добавление политик для управления категориями только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Политика для чтения категорий (доступно всем)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Categories can be modified by authenticated users"
  ON categories
  FOR ALL
  TO authenticated
  USING (true);