/*
  # Добавление привязки продуктов к ресторанам

  1. Изменения в таблицах
    - Добавляем поле `restaurant_id` в таблицу `products`
    - Создаем связь между продуктами и ресторанами
    
  2. Обновление индексов
    - Добавляем индекс по restaurant_id для ускорения поисков
*/

-- Добавление колонки restaurant_id в таблицу products
ALTER TABLE products 
ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS products_restaurant_id_idx ON products(restaurant_id);

-- Обновляем продукты, которые еще не привязаны к ресторанам
-- Присваиваем им ресторан по умолчанию (первый в списке)
UPDATE products
SET restaurant_id = (
  SELECT id FROM restaurants 
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE restaurant_id IS NULL;

-- Обновляем политику доступа к продуктам
DROP POLICY IF EXISTS "Operators can manage products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

-- Создаем новые политики доступа для продуктов
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage products" ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_role IN ('admin', 'manager', 'operator', 'product_manager')
    )
  );

-- Добавляем новый тип пользователя product_manager в проверки ролей
CREATE OR REPLACE FUNCTION is_product_manager_or_above()
RETURNS boolean AS $$
DECLARE
  role TEXT;
BEGIN
  role := get_user_role();
  RETURN role IN ('admin', 'manager', 'product_manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем политику для product_manager, который может управлять только продуктами своего ресторана
CREATE POLICY "Product managers can manage only their restaurant products" ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_role = 'product_manager'
      AND restaurant_id = products.restaurant_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND user_role = 'product_manager' 
      AND restaurant_id = products.restaurant_id
    )
  );