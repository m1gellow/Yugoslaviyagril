/*
  # Исправление политик пользователей для предотвращения дубликатов

  1. Сначала удаляем существующие политики, если они есть
  2. Затем создаем новые политики
*/

-- Удаляем существующие политики (в случае, если они уже были созданы)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;

-- Создаем новые политики
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

-- Проверяем наличие администратора
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.users 
  WHERE id = 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  
  IF admin_count = 0 THEN
    INSERT INTO public.users (
      id,
      email,
      name,
      user_role,
      created_at,
      updated_at
    ) VALUES (
      'c07b8ea3-1893-4ebd-b489-10505daabb8a',
      'yugoslaviagrill96@gmail.com',
      'Администратор ЮГ',
      'admin',
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Администратор добавлен';
  ELSE
    UPDATE public.users
    SET 
      user_role = 'admin',
      email = 'yugoslaviagrill96@gmail.com',
      name = 'Администратор ЮГ',
      updated_at = NOW()
    WHERE id = 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
    RAISE NOTICE 'Администратор обновлен';
  END IF;
END $$;