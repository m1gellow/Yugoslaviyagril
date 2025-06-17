-- Исправляем проблемы с внешними ключами restaurant_id в таблице users

-- Проверяем наличие дублирующихся внешних ключей и удаляем их
DO $$
DECLARE
    fk_count INTEGER;
    constraint_names TEXT[];
    constraint_to_keep TEXT;
BEGIN
    -- Получаем список всех внешних ключей для restaurant_id в users
    SELECT array_agg(tc.constraint_name)
    INTO constraint_names
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'users' 
      AND tc.constraint_type = 'FOREIGN KEY' 
      AND ccu.column_name = 'restaurant_id';
    
    -- Проверяем количество найденных внешних ключей
    IF array_length(constraint_names, 1) > 1 THEN
        -- Сохраняем первый внешний ключ
        constraint_to_keep := constraint_names[1];
        
        -- Удаляем все остальные внешние ключи
        FOR i IN 2..array_length(constraint_names, 1) LOOP
            EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || constraint_names[i];
            RAISE NOTICE 'Удален дублирующий внешний ключ: %', constraint_names[i];
        END LOOP;
        
        RAISE NOTICE 'Оставлен внешний ключ: %', constraint_to_keep;
    ELSE
        RAISE NOTICE 'Дублирующихся внешних ключей не найдено';
    END IF;
END $$;

-- Проверяем, есть ли колонка restaurant_id в таблице users
DO $$
BEGIN
    -- Проверяем существование колонки restaurant_id
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'restaurant_id'
    ) THEN
        -- Добавляем колонку, если она не существует
        ALTER TABLE users ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Добавлена колонка restaurant_id в таблицу users';
    ELSE
        RAISE NOTICE 'Колонка restaurant_id уже существует в таблице users';
    END IF;
END $$;

-- Создаем или обновляем индексы
CREATE INDEX IF NOT EXISTS users_id_restaurant_id_idx ON users(id, restaurant_id);
CREATE INDEX IF NOT EXISTS users_restaurant_id_idx ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS users_role_restaurant_idx ON users(user_role, restaurant_id);

-- Обновляем политики доступа для таблицы users
DROP POLICY IF EXISTS "Product managers can view users in their restaurant" ON users;

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

-- Обновляем проверку типа роли
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role;
ALTER TABLE users 
  ADD CONSTRAINT check_user_role 
  CHECK (user_role = ANY (ARRAY['admin', 'manager', 'operator', 'product_manager', 'user']));