/*
  # Исправление проблем с доступом администратора

  1. Обновление функций проверки ролей и учетных данных администратора
  2. Настройка дополнительных индексов для улучшения производительности
  3. Исправление политик доступа для правильной работы админ-панели
*/

-- Проверяем наличие и роль администратора
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  admin_email TEXT := 'yugoslaviagrill96@gmail.com';
  admin_exists BOOLEAN;
  admin_auth_exists BOOLEAN;
BEGIN
  -- Проверяем существование пользователя в таблице users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = admin_id
  ) INTO admin_exists;

  -- Проверяем существование пользователя в auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = admin_id
  ) INTO admin_auth_exists;
  
  RAISE NOTICE 'Проверка администратора: id=%, существует в users=%, существует в auth.users=%', 
    admin_id, admin_exists, admin_auth_exists;
  
  -- Обновление пользователя в таблице users
  IF admin_exists THEN
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = admin_email,
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Администратор обновлен в таблице public.users: %', admin_id;
  ELSE
    -- Добавляем пользователя в public.users, если он отсутствует
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
  
  -- Если пользователь существует в auth.users, обновляем его метаданные
  IF admin_auth_exists THEN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'name', 'Администратор ЮГ',
      'user_role', 'admin'
    )
    WHERE id = admin_id;
    
    RAISE NOTICE 'Метаданные пользователя обновлены в auth.users: %', admin_id;
  END IF;
END $$;

-- Оптимизация функции получения роли пользователя
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Используем индекс для быстрого поиска
  SELECT u.user_role INTO user_role 
  FROM public.users u 
  WHERE u.id = auth.uid();
  
  -- Логируем для отладки
  RAISE LOG 'get_user_role() вызвана для пользователя %, результат: %', 
    auth.uid(), COALESCE(user_role, 'не найдено');
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем функции проверки ролей
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
  role TEXT;
BEGIN
  SELECT get_user_role() INTO role;
  RETURN role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS boolean AS $$
DECLARE
  role TEXT;
BEGIN
  SELECT get_user_role() INTO role;
  RETURN role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_operator_or_above()
RETURNS boolean AS $$
DECLARE
  role TEXT;
BEGIN
  SELECT get_user_role() INTO role;
  RETURN role IN ('admin', 'manager', 'operator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Публичная функция для проверки прав доступа
CREATE OR REPLACE FUNCTION check_user_access()
RETURNS jsonb AS $$
DECLARE
  user_id uuid;
  user_role text;
  user_profile jsonb;
  result jsonb;
BEGIN
  -- Получаем текущего пользователя
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Не авторизован',
      'auth_uid', null
    );
  END IF;
  
  -- Получаем роль и профиль пользователя
  SELECT 
    u.user_role, 
    to_jsonb(u) 
  INTO 
    user_role, 
    user_profile 
  FROM public.users u WHERE u.id = user_id;
  
  -- Проверяем наличие пользователя
  IF user_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Пользователь не найден в таблице users',
      'auth_uid', user_id
    );
  END IF;
  
  -- Формируем результат
  SELECT jsonb_build_object(
    'success', true,
    'user', user_id,
    'profile', user_profile,
    'isAdmin', user_role = 'admin',
    'isManager', user_role IN ('admin', 'manager'),
    'isOperator', user_role IN ('admin', 'manager', 'operator'),
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем индексы для повышения производительности
CREATE INDEX IF NOT EXISTS users_id_user_role_idx ON public.users(id, user_role);
CREATE INDEX IF NOT EXISTS users_user_role_idx ON public.users(user_role);

-- Удаляем существующие политики для переопределения
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be modified by authenticated users" ON categories;
DROP POLICY IF EXISTS "Operators can manage categories" ON categories;

-- Создаем новые политики для категорий
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Operators can manage categories" ON categories
  FOR ALL TO authenticated
  USING (is_operator_or_above());

-- Диагностическая функция для аудита безопасности
CREATE OR REPLACE FUNCTION audit_user_permissions(user_id uuid DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  target_id uuid;
  result jsonb;
BEGIN
  -- Если пользователь не указан, используем текущего пользователя
  target_id := COALESCE(user_id, auth.uid());
  
  -- Получаем информацию о пользователе и его правах
  WITH user_info AS (
    SELECT 
      u.id,
      u.email,
      u.user_role,
      u.name,
      u.created_at,
      u.user_role = 'admin' AS is_admin,
      u.user_role IN ('admin', 'manager') AS is_manager,
      u.user_role IN ('admin', 'manager', 'operator') AS is_operator,
      EXISTS (SELECT 1 FROM auth.users WHERE id = u.id) AS exists_in_auth
    FROM public.users u
    WHERE u.id = target_id
  )
  SELECT jsonb_build_object(
    'user_id', ui.id,
    'email', ui.email,
    'name', ui.name,
    'role', ui.user_role,
    'created_at', ui.created_at,
    'permissions', jsonb_build_object(
      'is_admin', ui.is_admin,
      'is_manager', ui.is_manager,
      'is_operator', ui.is_operator,
      'exists_in_auth', ui.exists_in_auth,
      'auth_current_user', auth.uid(),
      'checked_at', now()
    )
  ) INTO result
  FROM user_info ui;
  
  RETURN COALESCE(result, jsonb_build_object(
    'error', 'User not found',
    'user_id', target_id
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;