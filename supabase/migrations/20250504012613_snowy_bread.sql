/*
  # Создание таблицы пользователей и настройка авторизации для админ-панели

  1. Новые таблицы
    - `users` - основная таблица для хранения данных пользователей
      - `id` (uuid, primary key) - соответствует auth.users.id
      - `email` (text) - email пользователя
      - `name` (text) - имя пользователя
      - `phone` (text) - телефон пользователя
      - `user_role` (text) - роль пользователя (admin, manager, operator, user)
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления
  
  2. Функции и триггеры
    - Функция `handle_new_user` - обрабатывает регистрацию новых пользователей
    - Триггер `on_auth_user_created` - срабатывает при создании пользователя в auth.users
  
  3. Администратор
    - Добавление администратора в таблицу users
*/

-- Создаем таблицу пользователей, если она еще не существует
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text,
  name text,
  phone text,
  user_role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Настраиваем RLS для таблицы пользователей
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Политика для чтения своего профиля всеми аутентифицированными пользователями
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Политика для обновления своего профиля
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Политика для администраторов - могут видеть и редактировать всех пользователей
CREATE POLICY "Admins have full access to users" ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Функция для обработки новых зарегистрированных пользователей
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
      user_role -- По умолчанию 'user', если не указано иное
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Проверяем и создаем триггер
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Добавление администратора, если его еще нет
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
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
      'yugoslaviagrill96@gmail.com',
      'Администратор ЮГ',
      'admin',
      NOW(),
      NOW()
    );
  ELSE
    -- Если пользователь уже есть в таблице users, обновляем его роль до admin
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = 'yugoslaviagrill96@gmail.com',
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = admin_id;
  END IF;
END $$;