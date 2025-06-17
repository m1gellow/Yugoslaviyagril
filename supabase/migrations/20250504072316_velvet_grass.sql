-- Эта миграция исправляет проблемы с аутентификацией и уровнями доступа

-- Удаляем кэш сессии и проверяем права доступа заново
CREATE OR REPLACE FUNCTION get_user_role_direct()
RETURNS TEXT AS $$
DECLARE
  role_result TEXT;
BEGIN
  -- Получаем роль напрямую без кэширования
  SELECT user_role INTO role_result 
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Выводим отладочную информацию для проверки
  RAISE LOG 'Проверка роли для пользователя %: роль = %', auth.uid(), COALESCE(role_result, 'неизвестно');
  
  RETURN COALESCE(role_result, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки администратора
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT get_user_role_direct() INTO user_role;
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки менеджера или выше
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT get_user_role_direct() INTO user_role;
  RETURN user_role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки оператора или выше
CREATE OR REPLACE FUNCTION is_operator_or_above()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT get_user_role_direct() INTO user_role;
  RETURN user_role IN ('admin', 'manager', 'operator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем администратора и делаем проверку
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  admin_email TEXT := 'yugoslaviagrill96@gmail.com';
  admin_exists BOOLEAN;
BEGIN
  -- В auth.users
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_build_object(
    'name', 'Администратор ЮГ',
    'user_role', 'admin'
  )
  WHERE id = admin_id;
  
  -- В public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = admin_id) THEN
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = admin_email,
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Администратор обновлен: %', admin_id;
  ELSE
    -- Добавляем админа, если его нет
    INSERT INTO public.users (
      id, email, name, user_role, created_at, updated_at
    ) VALUES (
      admin_id, admin_email, 'Администратор ЮГ', 'admin', NOW(), NOW()
    );
    
    RAISE NOTICE 'Администратор добавлен: %', admin_id;
  END IF;
END $$;

-- Создаем открытую функцию для проверки доступа
CREATE OR REPLACE FUNCTION check_user_access(user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  user_role TEXT;
BEGIN
  -- Получаем роль пользователя
  SELECT users.user_role INTO user_role
  FROM users 
  WHERE id = user_id;

  -- Формируем результат
  SELECT jsonb_build_object(
    'user_id', user_id,
    'user_role', COALESCE(user_role, 'не найдено'),
    'is_admin', COALESCE(user_role = 'admin', FALSE),
    'is_manager', COALESCE(user_role IN ('admin', 'manager'), FALSE),
    'is_operator', COALESCE(user_role IN ('admin', 'manager', 'operator'), FALSE),
    'in_auth_users', EXISTS(SELECT 1 FROM auth.users WHERE id = user_id),
    'in_public_users', EXISTS(SELECT 1 FROM public.users WHERE id = user_id),
    'checked_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем политики для основных таблиц

-- Обновляем политики для таблицы users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Managers can view all users" ON users;
DROP POLICY IF EXISTS "Operators can view all users" ON users;

-- Создаем политики заново
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

-- Обновляем политики для продуктов
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be modified by authenticated users" ON products;
DROP POLICY IF EXISTS "Operators can manage products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to view products" ON products;
DROP POLICY IF EXISTS "Allow unauthenticated users to view products" ON products;

-- Создаем политики заново для продуктов
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage products" ON products
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- Обновляем политики для категорий
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories can be modified by authenticated users" ON categories;
DROP POLICY IF EXISTS "Operators can manage categories" ON categories;

-- Создаем политики заново для категорий
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage categories" ON categories
  FOR ALL
  TO authenticated
  USING (is_operator_or_above());

-- Проверяем наличие индекса для эффективного поиска по ролям
CREATE INDEX IF NOT EXISTS users_user_role_id_idx ON users(user_role, id);