-- Улучшение производительности загрузки данных

-- Установка нужных индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories(sort_order);
CREATE INDEX IF NOT EXISTS products_category_id_name_idx ON products(category_id, name);
CREATE INDEX IF NOT EXISTS components_type_name_idx ON components(type, name);
CREATE INDEX IF NOT EXISTS restaurant_products_restaurant_product_idx ON restaurant_products(restaurant_id, product_id);
CREATE INDEX IF NOT EXISTS users_user_role_email_idx ON users(user_role, email);

-- Выставление правильных прав для админа
DO $$
DECLARE
  admin_id UUID := 'c07b8ea3-1893-4ebd-b489-10505daabb8a';
  admin_count INTEGER;
  admin_role TEXT;
BEGIN
  -- Проверяем существующую роль админа
  SELECT COUNT(*), user_role INTO admin_count, admin_role
  FROM public.users 
  WHERE id = admin_id
  GROUP BY user_role;
  
  IF admin_count = 0 THEN
    -- Если админа нет, создаем его
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
    
    RAISE NOTICE 'Администратор создан';
  ELSIF admin_role != 'admin' THEN
    -- Если админ существует, но с неправильной ролью
    UPDATE public.users
    SET 
      user_role = 'admin',
      updated_at = NOW()
    WHERE id = admin_id;
    
    RAISE NOTICE 'Роль пользователя обновлена до admin';
  ELSE
    RAISE NOTICE 'Администратор уже существует с правильной ролью';
  END IF;
END $$;

-- Создаем функцию для отладки загрузки данных
CREATE OR REPLACE FUNCTION debug_data_loading()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'categories_count', (SELECT COUNT(*) FROM categories),
    'products_count', (SELECT COUNT(*) FROM products),
    'restaurants_count', (SELECT COUNT(*) FROM restaurants),
    'restaurant_products_count', (SELECT COUNT(*) FROM restaurant_products),
    'components_count', (SELECT COUNT(*) FROM components),
    'users_count', (SELECT COUNT(*) FROM public.users),
    'admin_exists', (SELECT EXISTS(SELECT 1 FROM public.users WHERE id = 'c07b8ea3-1893-4ebd-b489-10505daabb8a' AND user_role = 'admin'))
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Оптимизация триггера для обработки новых пользователей
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
      COALESCE(NEW.raw_user_meta_data->>'name', 'Пользователь'),
      COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
      -- Особая логика для админа
      CASE 
        WHEN NEW.id = 'c07b8ea3-1893-4ebd-b489-10505daabb8a' THEN 'admin'
        ELSE COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
      END
    );
    
    -- Создаем запись в журнале для отладки
    RAISE LOG 'Новый пользователь добавлен: %, роль: %', 
      NEW.id, 
      CASE 
        WHEN NEW.id = 'c07b8ea3-1893-4ebd-b489-10505daabb8a' THEN 'admin'
        ELSE COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
      END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Проверяем наличие достаточного количества данных для работы приложения
DO $$
DECLARE
  categories_count INTEGER;
  products_count INTEGER;
  restaurants_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO categories_count FROM categories;
  SELECT COUNT(*) INTO products_count FROM products;
  SELECT COUNT(*) INTO restaurants_count FROM restaurants;
  
  IF categories_count < 3 OR products_count < 5 OR restaurants_count < 2 THEN
    RAISE LOG 'Недостаточно данных для работы приложения. Категории: %, Продукты: %, Рестораны: %',
      categories_count, products_count, restaurants_count;
  ELSE
    RAISE LOG 'Проверка данных успешна. Категории: %, Продукты: %, Рестораны: %',
      categories_count, products_count, restaurants_count;
  END IF;
END $$;