-- Пропускаем добавление колонки restaurant_id, так как она уже существует
-- Проверяем наличие колонки и связей перед созданием индексов
DO $$
BEGIN
  -- Проверяем, существует ли внешний ключ для restaurant_id
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'users' 
    AND ccu.column_name = 'restaurant_id'
  ) THEN
    -- Добавляем внешний ключ если его нет
    EXECUTE 'ALTER TABLE users 
            ADD FOREIGN KEY (restaurant_id) 
            REFERENCES restaurants(id) ON DELETE SET NULL';
  END IF;
END $$;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS users_restaurant_id_idx ON users(restaurant_id);

-- Создаем комбинированные индексы для оптимизации запросов по роли и ресторану
CREATE INDEX IF NOT EXISTS users_role_restaurant_idx ON users(user_role, restaurant_id);

-- Проверяем существование проверки на роль
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'check_user_role'
    AND table_name = 'users'
  ) THEN
    -- Добавляем проверку на роль product_manager если её нет
    EXECUTE 'ALTER TABLE users
            ADD CONSTRAINT check_user_role
            CHECK (user_role IN (''admin'', ''manager'', ''operator'', ''product_manager'', ''user''))';
  END IF;
END $$;

-- Удаляем политику если она уже существует
DROP POLICY IF EXISTS "Product managers can view users in their restaurant" ON users;

-- Обновляем политики доступа для пользователей
-- Менеджер продуктов может видеть только пользователей своего ресторана
CREATE POLICY "Product managers can view users in their restaurant"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() 
    AND u.user_role = 'product_manager'
    AND u.restaurant_id = users.restaurant_id
  )
);