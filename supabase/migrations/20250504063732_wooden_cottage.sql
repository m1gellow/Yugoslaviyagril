/*
  # Исправление прав доступа для админ-панели

  1. Обновление политик доступа для всех таблиц
  2. Улучшение функций проверки ролей пользователей
  3. Добавление специальных полномочий для администраторов
*/

-- Создаем более эффективную функцию для проверки ролей пользователя
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT users.user_role INTO user_role 
  FROM users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновленные функции для проверки ролей пользователей
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS boolean AS $$
DECLARE
  role TEXT;
BEGIN
  role := get_user_role();
  RETURN role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_operator_or_above()
RETURNS boolean AS $$
DECLARE
  role TEXT;
BEGIN
  role := get_user_role();
  RETURN role IN ('admin', 'manager', 'operator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для диагностики доступа
CREATE OR REPLACE FUNCTION check_user_access()
RETURNS jsonb AS $$
DECLARE
  user_id uuid := auth.uid();
  user_role text;
  result jsonb;
BEGIN
  SELECT users.user_role INTO user_role 
  FROM users 
  WHERE id = user_id;
  
  SELECT jsonb_build_object(
    'user_id', user_id,
    'user_role', COALESCE(user_role, 'not found'),
    'is_admin', COALESCE(user_role = 'admin', false),
    'is_manager', COALESCE(user_role IN ('admin', 'manager'), false),
    'is_operator', COALESCE(user_role IN ('admin', 'manager', 'operator'), false),
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старые политики
DROP POLICY IF EXISTS "Operators can view all data" ON products;

-- ОБНОВЛЯЕМ ПОЛИТИКИ ДОСТУПА ДЛЯ ТАБЛИЦЫ USERS

-- Обновляем политики для таблицы users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access to users" ON users;

-- Создаем политики с приоритетом для администраторов
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Managers can view all users" ON users
  FOR SELECT
  TO authenticated
  USING (is_manager_or_above());

CREATE POLICY "Operators can view all users" ON users
  FOR SELECT
  TO authenticated
  USING (is_operator_or_above());

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ОБНОВЛЯЕМ ПОЛИТИКИ ДОСТУПА ДЛЯ ТАБЛИЦЫ RESTAURANTS

-- Операторы могут просматривать и управлять ресторанами
CREATE POLICY "Operators can view and manage restaurants" ON restaurants
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- ОБНОВЛЯЕМ ПОЛИТИКИ ДОСТУПА ДЛЯ ТАБЛИЦЫ ORDERS

-- Операторы могут управлять всеми заказами
CREATE POLICY "Operators can manage all orders" ON orders
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- ОБНОВЛЯЕМ ПОЛИТИКИ ДОСТУПА ДЛЯ ТАБЛИЦЫ PRODUCTS

-- Операторы могут управлять продуктами
CREATE POLICY "Operators can manage products" ON products
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- ОБНОВЛЯЕМ ПОЛИТИКИ ДОСТУПА ДЛЯ ТАБЛИЦЫ CATEGORIES

-- Операторы могут управлять категориями
CREATE POLICY "Operators can manage categories" ON categories
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- ОБНОВЛЯЕМ ПОЛИТИКИ ДОСТУПА ДЛЯ ТАБЛИЦЫ PROMO_CODES

-- Операторы могут управлять промокодами
CREATE POLICY "Operators can manage promo codes" ON promo_codes
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- Убеждаемся, что администратор правильно настроен
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  admin_exists BOOLEAN;
BEGIN
  -- Проверяем существование пользователя в таблице users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = admin_id
  ) INTO admin_exists;
  
  IF admin_exists THEN
    -- Обновляем роль пользователя
    UPDATE public.users
    SET user_role = 'admin'
    WHERE id = admin_id;
    
    RAISE NOTICE 'Администратор обновлен: %', admin_id;
  ELSE
    -- Добавляем администратора, если его нет
    INSERT INTO public.users (
      id,
      email,
      name,
      user_role,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      'yugoslaviagrill96@gmail.com',
      'Администратор ЮГ',
      'admin',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Администратор добавлен: %', admin_id;
  END IF;
END $$;