-- Проверяем и обеспечиваем правильные связи между продуктами и ресторанами

-- Проверяем наличие колонки restaurant_id в таблице products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products' AND column_name = 'restaurant_id'
    ) THEN
        -- Добавляем колонку, если она не существует
        ALTER TABLE products ADD COLUMN restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL;
        RAISE NOTICE 'Добавлена колонка restaurant_id в таблицу products';
    ELSE
        RAISE NOTICE 'Колонка restaurant_id уже существует в таблице products';
    END IF;
END $$;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS products_restaurant_id_idx ON products(restaurant_id);

-- Создаем политику для product_manager, который может управлять только продуктами своего ресторана
DROP POLICY IF EXISTS "Product managers can manage only their restaurant products" ON products;

CREATE POLICY "Product managers can manage only their restaurant products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND user_role = 'product_manager'
          AND restaurant_id = products.restaurant_id
        )
    )
  )
  WITH CHECK (
    (
        EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.uid()
          AND user_role = 'product_manager' 
          AND restaurant_id = products.restaurant_id
        )
    )
  );

-- Обновляем значения restaurant_id для продуктов, где они не установлены
UPDATE products
SET restaurant_id = (
  SELECT id FROM restaurants ORDER BY created_at ASC LIMIT 1
)
WHERE restaurant_id IS NULL;