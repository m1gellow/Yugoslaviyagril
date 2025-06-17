/*
  # Добавление привязки пользователей к ресторанам

  1. Изменения в таблицах
    - Добавляем поле `restaurant_id` в таблицу `users`
    - Создаем связь между менеджерами продуктов и ресторанами
    
  2. Обновление индексов и политик
    - Добавляем индекс по restaurant_id для ускорения поисков
    - Обновляем политики доступа с учетом новой роли product_manager
*/

-- Добавление колонки restaurant_id в таблицу users
ALTER TABLE users 
ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS users_restaurant_id_idx ON users(restaurant_id);

-- Создаем комбинированные индексы для оптимизации запросов по роли и ресторану
CREATE INDEX IF NOT EXISTS users_role_restaurant_idx ON users(user_role, restaurant_id);

-- Добавляем проверку на роль product_manager
ALTER TABLE users
ADD CONSTRAINT check_user_role
CHECK (user_role IN ('admin', 'manager', 'operator', 'product_manager', 'user'));

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