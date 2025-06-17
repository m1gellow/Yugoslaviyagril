/*
  # Исправления для авторизации администратора

  1. Обеспечение правильной работы проверки ролей пользователей
  2. Исправление администратора в системе
  3. Упрощение логики проверки прав доступа
*/

-- Проверяем наличие администратора и обновляем его данные
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
    
    RAISE NOTICE 'Администратор добавлен';
  ELSE
    -- Если пользователь уже есть в таблице users, обновляем его роль до admin
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = 'yugoslaviagrill96@gmail.com',
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Администратор обновлен';
  END IF;
END $$;

-- Обновляем функцию обработки новых пользователей для правильного добавления ролей
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