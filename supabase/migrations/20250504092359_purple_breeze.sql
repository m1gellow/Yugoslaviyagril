/*
  # Создание системы отслеживания статуса пользователя онлайн/офлайн

  1. Новые Таблицы
    - `user_status` - Хранит информацию о статусе пользователя
      - `id` (uuid, первичный ключ)
      - `user_id` (uuid, ссылка на пользователя)
      - `is_online` (boolean, статус онлайн)
      - `last_activity` (timestamp, последнее обновление статуса)
      - `last_seen_at` (timestamp, время последней активности)
      - `device_info` (jsonb, информация об устройстве)
      - `updated_at` (timestamp, время обновления)
      
  2. Безопасность
    - Включение RLS на таблице
    - Добавление политик для просмотра и управления статусами
    
  3. Функции для работы со статусом
    - Функция обновления статуса
    - Функция получения списка активных пользователей
*/

-- Создаем таблицу статусов пользователей
CREATE TABLE IF NOT EXISTS user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  device_info JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_user_status UNIQUE (user_id)
);

-- Включение RLS
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS user_status_user_id_idx ON user_status(user_id);
CREATE INDEX IF NOT EXISTS user_status_is_online_idx ON user_status(is_online);
CREATE INDEX IF NOT EXISTS user_status_last_activity_idx ON user_status(last_activity);

-- Политика для чтения статусов всеми пользователями
CREATE POLICY "User status is viewable by everyone"
  ON user_status
  FOR SELECT
  USING (true);

-- Политика для обновления своего статуса
CREATE POLICY "Users can update their own status"
  ON user_status
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Политика для создания статуса
CREATE POLICY "Users can create their own status"
  ON user_status
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Функция для обновления статуса пользователя
CREATE OR REPLACE FUNCTION update_user_status(
  p_user_id UUID DEFAULT auth.uid(),
  p_is_online BOOLEAN DEFAULT true,
  p_device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Проверяем существование записи
  IF EXISTS (SELECT 1 FROM user_status WHERE user_id = p_user_id) THEN
    -- Обновляем существующую запись
    UPDATE user_status
    SET 
      is_online = p_is_online,
      last_activity = NOW(),
      last_seen_at = CASE WHEN p_is_online THEN NOW() ELSE last_seen_at END,
      device_info = CASE 
                      WHEN p_device_info IS NOT NULL AND p_device_info != '{}'::jsonb 
                      THEN p_device_info 
                      ELSE device_info 
                    END,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING to_jsonb(user_status) INTO result;
  ELSE
    -- Создаем новую запись
    INSERT INTO user_status (
      user_id, 
      is_online, 
      last_activity,
      last_seen_at,
      device_info
    )
    VALUES (
      p_user_id,
      p_is_online,
      NOW(),
      NOW(),
      p_device_info
    )
    RETURNING to_jsonb(user_status) INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для автоматического отключения неактивных пользователей
CREATE OR REPLACE FUNCTION auto_update_offline_status()
RETURNS void AS $$
BEGIN
  -- Обновляем статус пользователей, неактивных более 15 минут
  UPDATE user_status
  SET 
    is_online = false,
    updated_at = NOW()
  WHERE 
    is_online = true AND 
    last_activity < NOW() - INTERVAL '15 minutes';
    
  -- Записываем в журнал количество обновленных пользователей
  RAISE LOG 'Автоматическое обновление статуса: % пользователей переведены в офлайн', 
    (SELECT count(*) FROM user_status WHERE updated_at > NOW() - INTERVAL '1 second');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения статуса пользователя
CREATE OR REPLACE FUNCTION get_user_status(user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  status_data JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'user_id', us.user_id,
      'is_online', us.is_online,
      'last_seen_at', us.last_seen_at,
      'last_activity', us.last_activity
    ) INTO status_data
  FROM user_status us
  WHERE us.user_id = get_user_status.user_id;
  
  RETURN COALESCE(status_data, jsonb_build_object(
    'user_id', get_user_status.user_id,
    'is_online', false,
    'last_seen_at', NULL,
    'last_activity', NULL
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения онлайн-пользователей
CREATE OR REPLACE FUNCTION get_online_users(limit_count INT DEFAULT 10)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', us.user_id,
      'last_activity', us.last_activity,
      'user_name', u.name,
      'user_email', u.email
    )
  ) INTO result
  FROM user_status us
  JOIN users u ON us.user_id = u.id
  WHERE us.is_online = true
  ORDER BY us.last_activity DESC
  LIMIT limit_count;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для автоматического создания записи при регистрации пользователя
CREATE OR REPLACE FUNCTION create_user_status_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_status (user_id, is_online, last_activity, last_seen_at)
  VALUES (NEW.id, true, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания записи статуса
CREATE TRIGGER on_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_status_on_signup();

-- Заполняем статусы для существующих пользователей
INSERT INTO user_status (user_id, is_online, last_activity, last_seen_at)
SELECT id, false, NOW(), NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;