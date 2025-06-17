/*
  # Создание таблицы промокодов

  1. Новые Таблицы
    - `promo_codes` - Хранит информацию о промокодах для скидок
      - `id` (uuid, первичный ключ)
      - `code` (text, код промокода)
      - `discount` (integer, размер скидки)
      - `type` (text, тип скидки - процентная или фиксированная)
      - `description` (text, описание промокода)
      - `min_order_amount` (integer, минимальная сумма заказа)
      - `start_date` (timestamp, дата начала действия)
      - `end_date` (timestamp, дата окончания действия)
      - `usage_limit` (integer, лимит использования)
      - `used_count` (integer, текущее количество использований)
      - `is_active` (boolean, активен ли промокод)
      - `created_at` (timestamp, время создания)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для чтения всеми пользователями
    - Добавление политик для управления только аутентифицированными пользователями
*/

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  description TEXT,
  min_order_amount INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Проверка валидности скидки для процентного типа
  CONSTRAINT valid_percent_discount CHECK (
    type != 'percent' OR (discount >= 1 AND discount <= 100)
  )
);

-- Включение Row Level Security
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (доступно всем)
CREATE POLICY "Promo codes are viewable by everyone"
  ON promo_codes
  FOR SELECT
  USING (true);

-- Политика для вставки/обновления/удаления (только для авторизованных пользователей)
CREATE POLICY "Promo codes can be modified by authenticated users"
  ON promo_codes
  FOR ALL
  TO authenticated
  USING (true);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS promo_codes_code_idx ON promo_codes(code);
CREATE INDEX IF NOT EXISTS promo_codes_start_end_date_idx ON promo_codes(start_date, end_date);
CREATE INDEX IF NOT EXISTS promo_codes_is_active_idx ON promo_codes(is_active);