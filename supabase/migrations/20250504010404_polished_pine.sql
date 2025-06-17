/*
  # Безопасность и проверка ролей

  1. Функции для проверки ролей пользователей
    - Создание функций для проверки роли в запросах
    - Настройка безопасных вызовов функций
    
  2. Защита критических операций
    - Защита операций с пользователями
    - Защита операций с заказами
    - Защита операций с настройками системы
*/

-- Функция для проверки, является ли пользователь администратором
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки, является ли пользователь менеджером или выше
CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки, является ли пользователь оператором или выше
CREATE OR REPLACE FUNCTION is_operator_or_above()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND user_role IN ('admin', 'manager', 'operator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для управления пользователями (только для администраторов)
CREATE OR REPLACE FUNCTION manage_users(
  operation text,
  user_id uuid,
  user_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Проверка прав доступа
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Недостаточно прав для управления пользователями';
  END IF;

  -- Операции над пользователями
  CASE operation
    WHEN 'get' THEN
      SELECT row_to_json(u)::jsonb INTO result
      FROM users u
      WHERE u.id = user_id;
      
    WHEN 'list' THEN
      SELECT json_agg(u)::jsonb INTO result
      FROM users u;
      
    WHEN 'update' THEN
      UPDATE users
      SET 
        user_role = COALESCE(user_data->>'user_role', user_role),
        name = COALESCE(user_data->>'name', name),
        phone = COALESCE(user_data->>'phone', phone),
        email = COALESCE(user_data->>'email', email)
      WHERE id = user_id
      RETURNING row_to_json(users)::jsonb INTO result;
      
    WHEN 'delete' THEN
      DELETE FROM users
      WHERE id = user_id
      RETURNING row_to_json(users)::jsonb INTO result;
      
    ELSE
      RAISE EXCEPTION 'Неизвестная операция: %', operation;
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для управления настройками системы (только для администраторов)
CREATE OR REPLACE FUNCTION manage_system_settings(
  operation text,
  setting_key text DEFAULT NULL,
  setting_value jsonb DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Проверка прав доступа
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Недостаточно прав для управления настройками системы';
  END IF;

  -- Создаем таблицу настроек, если она не существует
  CREATE TABLE IF NOT EXISTS system_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users
  );

  -- Операции над настройками
  CASE operation
    WHEN 'get' THEN
      IF setting_key IS NULL THEN
        -- Получить все настройки
        SELECT json_agg(row_to_json(s))::jsonb INTO result
        FROM system_settings s;
      ELSE
        -- Получить конкретную настройку
        SELECT row_to_json(s)::jsonb INTO result
        FROM system_settings s
        WHERE s.key = setting_key;
      END IF;
      
    WHEN 'set' THEN
      -- Вставить или обновить настройку
      INSERT INTO system_settings (key, value, updated_at, updated_by)
      VALUES (setting_key, setting_value, now(), auth.uid())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = setting_value,
        updated_at = now(),
        updated_by = auth.uid()
      RETURNING row_to_json(system_settings)::jsonb INTO result;
      
    WHEN 'delete' THEN
      -- Удалить настройку
      DELETE FROM system_settings
      WHERE key = setting_key
      RETURNING row_to_json(system_settings)::jsonb INTO result;
      
    ELSE
      RAISE EXCEPTION 'Неизвестная операция: %', operation;
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для управления заказами (для операторов и выше)
CREATE OR REPLACE FUNCTION manage_order(
  operation text,
  order_id uuid,
  order_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  current_order orders;
BEGIN
  -- Проверка прав доступа для всех операций, кроме создания
  IF operation != 'create' THEN
    -- Получаем текущий заказ
    SELECT * INTO current_order FROM orders WHERE id = order_id;
    
    -- Проверяем, принадлежит ли заказ текущему пользователю
    IF current_order.customer_id = auth.uid() THEN
      -- Пользователь может управлять своими заказами
      NULL;
    ELSIF is_operator_or_above() THEN
      -- Операторы, менеджеры и админы могут управлять всеми заказами
      NULL;
    ELSE
      RAISE EXCEPTION 'Недостаточно прав для управления этим заказом';
    END IF;
  END IF;

  -- Операции над заказами
  CASE operation
    WHEN 'get' THEN
      SELECT row_to_json(o)::jsonb INTO result
      FROM orders o
      WHERE o.id = order_id;
      
    WHEN 'update_status' THEN
      UPDATE orders
      SET 
        status = order_data->>'status',
        updated_at = now()
      WHERE id = order_id
      RETURNING row_to_json(orders)::jsonb INTO result;
      
    WHEN 'add_note' THEN
      UPDATE orders
      SET 
        comment = order_data->>'comment',
        updated_at = now()
      WHERE id = order_id
      RETURNING row_to_json(orders)::jsonb INTO result;
      
    WHEN 'assign_courier' THEN
      UPDATE orders
      SET 
        courier_info = order_data,
        updated_at = now()
      WHERE id = order_id
      RETURNING row_to_json(orders)::jsonb INTO result;
      
    ELSE
      RAISE EXCEPTION 'Неизвестная операция: %', operation;
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки прав доступа к разделу админ-панели
CREATE OR REPLACE FUNCTION check_admin_access(
  section text
)
RETURNS boolean AS $$
BEGIN
  -- Разделы, требующие роли admin
  IF section IN ('users', 'restaurants', 'settings') THEN
    RETURN is_admin();
  
  -- Разделы, требующие роли manager или admin
  ELSIF section IN ('menu', 'promo', 'content') THEN
    RETURN is_manager_or_above();
  
  -- Разделы, требующие роли operator, manager или admin
  ELSIF section IN ('dashboard', 'orders') THEN
    RETURN is_operator_or_above();
    
  -- По умолчанию, если раздел неизвестен, требуем роль admin (максимальные права)
  ELSE
    RETURN is_admin();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения популярных продуктов на основе заказов
CREATE OR REPLACE FUNCTION get_popular_products(limit_count integer DEFAULT 5)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY 
  SELECT p.*
  FROM products p
  JOIN (
    SELECT product_id, COUNT(*) as order_count
    FROM order_items
    JOIN orders o ON o.id = order_items.order_id
    WHERE o.status = 'completed'
    GROUP BY product_id
    ORDER BY order_count DESC
    LIMIT limit_count
  ) AS popular
  ON p.id = popular.product_id
  WHERE p.is_available = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;