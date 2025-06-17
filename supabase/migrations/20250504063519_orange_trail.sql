/*
  # Исправление доступа к админ-панели

  1. Улучшение SQL запросов для проверки ролей пользователей
  2. Оптимизация индексов для ускорения проверок доступа
  3. Добавление дополнительных логов и отладочной информации
*/

-- Добавляем функцию для диагностики доступа к админ-панели
CREATE OR REPLACE FUNCTION debug_admin_access(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  user_record users;
BEGIN
  -- Получаем информацию о пользователе
  SELECT * INTO user_record FROM users WHERE id = user_uuid;
  
  -- Формируем отладочную информацию
  SELECT jsonb_build_object(
    'user_exists', user_record IS NOT NULL,
    'user_id', COALESCE(user_record.id::text, 'not found'),
    'user_role', COALESCE(user_record.user_role, 'not set'),
    'is_admin', COALESCE(user_record.user_role = 'admin', false),
    'is_manager', COALESCE(user_record.user_role IN ('admin', 'manager'), false),
    'is_operator', COALESCE(user_record.user_role IN ('admin', 'manager', 'operator'), false),
    'auth_check', EXISTS (SELECT 1 FROM auth.users WHERE id = user_uuid),
    'timestamp', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем функции проверки ролей пользователей для повышения производительности
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_operator_or_above()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_role IN ('admin', 'manager', 'operator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Оптимизируем триггер для добавления новых пользователей
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_special_user boolean;
BEGIN
  -- Проверяем, является ли пользователь специальным административным аккаунтом
  is_special_user := NEW.id::text = 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  
  -- Проверяем, существует ли уже пользователь в таблице users
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Добавляем пользователя в таблицу users
    INSERT INTO public.users (
      id,
      email,
      name,
      phone,
      user_role
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь'),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      CASE 
        WHEN is_special_user THEN 'admin'
        ELSE COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
      END
    );
    
    -- Создаем запись в журнале для отладки
    PERFORM pg_notify(
      'new_user_added',
      json_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'is_special', is_special_user,
        'role', CASE 
          WHEN is_special_user THEN 'admin'
          ELSE COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
        END
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Проверяем и обновляем роль администратора
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  admin_email TEXT := 'yugoslaviagrill96@gmail.com';
  admin_exists BOOLEAN;
BEGIN
  -- Проверяем существование пользователя в таблице auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = admin_id
  ) INTO admin_exists;
  
  -- Проверяем пользователя в таблице public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = admin_id) THEN
    -- Обновляем существующего пользователя
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = admin_email,
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Администратор обновлен в таблице public.users: %', admin_id;
  ELSE
    -- Добавляем пользователя в public.users
    INSERT INTO public.users (
      id,
      email,
      name,
      user_role,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      admin_email,
      'Администратор ЮГ',
      'admin',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Администратор добавлен в таблицу public.users: %', admin_id;
  END IF;
END $$;

-- Создаем или обновляем индекс для быстрой проверки ролей
DROP INDEX IF EXISTS users_user_role_id_idx;
CREATE INDEX users_user_role_id_idx ON users(user_role, id);

-- Изменение политик доступа для таблиц, используемых в админ-панели,
-- чтобы операторы могли иметь к ним доступ
DROP POLICY IF EXISTS "Operators can view all data" ON products;
CREATE POLICY "Operators can view all data" ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_role IN ('admin', 'manager', 'operator')
    )
  );