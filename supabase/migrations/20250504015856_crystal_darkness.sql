/*
  # Исправление логина администратора и проблем с авторизацией

  1. Проверка и корректировка роли администратора
  2. Исправление функции обработки статуса новых пользователей
  3. Улучшение политик безопасности для предотвращения ошибок авторизации
*/

-- Проверяем и исправляем роль администратора в таблице users
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  admin_email TEXT := 'yugoslaviagrill96@gmail.com';
  admin_exists BOOLEAN;
BEGIN
  -- Проверяем существование пользователя в таблице users
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = admin_id
  ) INTO admin_exists;
  
  -- Если пользователя нет, добавляем его
  IF NOT admin_exists THEN
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
    
    RAISE NOTICE 'Администратор добавлен: %', admin_id;
  ELSE
    -- Если пользователь уже есть, обновляем его роль
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = admin_email,
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Администратор обновлен: %', admin_id;
  END IF;
END $$;

-- Исправляем функцию обработки новых пользователей для корректной работы
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, существует ли уже пользователь в таблице users
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = NEW.id
  ) THEN
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
      COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
    );
    
    RAISE NOTICE 'Новый пользователь добавлен: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Убеждаемся, что триггер для новых пользователей существует и работает корректно
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Исправляем политики доступа для предотвращения проблем с авторизацией
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;

-- Создаем актуальные политики доступа
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to users" ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Создаем индекс для оптимизации проверки роли пользователя
CREATE INDEX IF NOT EXISTS user_role_idx ON public.users(user_role);