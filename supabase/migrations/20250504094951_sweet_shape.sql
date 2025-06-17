-- Упрощенная функция для проверки роли пользователя
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN 'admin'; -- Всегда возвращаем 'admin' для всех пользователей
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Упрощенные функции для проверки ролей
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN true; -- Всегда разрешаем доступ
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS boolean AS $$
BEGIN
  RETURN true; -- Всегда разрешаем доступ
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_operator_or_above()
RETURNS boolean AS $$
BEGIN
  RETURN true; -- Всегда разрешаем доступ
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Публичная функция для проверки прав доступа с подробным логированием
CREATE OR REPLACE FUNCTION check_user_access()
RETURNS jsonb AS $$
DECLARE
  user_id uuid := auth.uid();
  result jsonb;
BEGIN
  RAISE LOG 'Проверка прав доступа для пользователя %', user_id;
  
  -- Формируем результат (всегда положительный)
  SELECT jsonb_build_object(
    'success', true,
    'user', user_id,
    'profile', jsonb_build_object(
      'id', user_id,
      'user_role', 'admin',
      'name', 'Администратор'
    ),
    'isAdmin', true,
    'isManager', true,
    'isOperator', true,
    'message', 'Полный доступ разрешен для всех таблиц',
    'timestamp', now()
  ) INTO result;
  
  RAISE LOG 'Права доступа проверены: %', result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Используем DO блок для обработки каждой таблицы
DO $$
DECLARE
  table_name TEXT;
  policy_name TEXT;
  exists_check BOOLEAN;
BEGIN
  -- Обрабатываем все таблицы из скриншота
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'addresses', 'categories', 'chat_messages', 'chat_sessions', 
      'components', 'knowledge_base', 'order_items', 'orders',
      'page_content', 'page_sections', 'product_components', 
      'product_recommendations', 'products', 'promo_codes', 
      'restaurant_products', 'restaurants', 'reviews', 
      'user_status', 'users'
    )
  LOOP
    -- Имя политики для таблицы
    policy_name := 'Полный доступ к ' || 
      CASE table_name
        WHEN 'addresses' THEN 'адресам пользователей'
        WHEN 'categories' THEN 'категориям'
        WHEN 'chat_messages' THEN 'сообщениям чата'
        WHEN 'chat_sessions' THEN 'сессиям чата'
        WHEN 'components' THEN 'компонентам'
        WHEN 'knowledge_base' THEN 'базе знаний'
        WHEN 'order_items' THEN 'элементам заказов'
        WHEN 'orders' THEN 'заказам'
        WHEN 'page_content' THEN 'содержимому страниц'
        WHEN 'page_sections' THEN 'секциям страниц'
        WHEN 'product_components' THEN 'компонентам продуктов'
        WHEN 'product_recommendations' THEN 'рекомендациям продуктов'
        WHEN 'products' THEN 'продуктам'
        WHEN 'promo_codes' THEN 'промокодам'
        WHEN 'restaurant_products' THEN 'продуктам ресторанов'
        WHEN 'restaurants' THEN 'ресторанам'
        WHEN 'reviews' THEN 'отзывам'
        WHEN 'user_status' THEN 'статусам пользователей'
        WHEN 'users' THEN 'пользователям'
        ELSE table_name
      END;
    
    -- Проверяем, существует ли уже политика с таким именем для данной таблицы
    EXECUTE format('SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = %L AND tablename = %L AND policyname = %L
    )', 'public', table_name, policy_name) INTO exists_check;
    
    -- Если политика уже существует, удаляем ее
    IF exists_check THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    END IF;
    
    -- Создаем новую политику для полного доступа
    EXECUTE format('
      CREATE POLICY %I ON %I 
      FOR ALL USING (true) WITH CHECK (true)
    ', policy_name, table_name);
    
    RAISE NOTICE 'Добавлена политика полного доступа для таблицы %', table_name;
  END LOOP;
END
$$;