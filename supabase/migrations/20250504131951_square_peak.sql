/*
  # Заполнение таблицы restaurant_products данными

  1. Создаем цены для продуктов в разных ресторанах
    - Базовые цены копируются из таблицы products
    - Для ресторана на Белинского цены на 15% выше
    - Для закусочной на Волгоградской цены на 5% ниже
    - Для других ресторанов - стандартные цены
    
  2. Обновляем цены для некоторых категорий продуктов в конкретных ресторанах:
    - Бургеры в Ясной - дороже на 100р
    - Напитки в Фронтовых Бригад - дешевле на 50р
*/

-- Заполняем таблицу restaurant_products для всех комбинаций ресторанов и продуктов
INSERT INTO restaurant_products (restaurant_id, product_id, price, is_available)
SELECT 
  r.id AS restaurant_id,
  p.id AS product_id,
  CASE 
    WHEN r.name = 'Ресторан на Белинского' THEN ROUND(p.price * 1.15)  -- +15%
    WHEN r.name = 'Закусочная на Волгоградской' THEN ROUND(p.price * 0.95)  -- -5%
    ELSE p.price  -- Стандартная цена
  END AS price,
  true AS is_available
FROM restaurants r
CROSS JOIN products p
ON CONFLICT (restaurant_id, product_id) DO NOTHING;

-- Обновляем цены для бургеров в Кафе на Ясной на +100р
UPDATE restaurant_products 
SET price = p.price + 100
FROM products p
WHERE 
  restaurant_products.product_id = p.id
  AND p.category_id = (SELECT id FROM categories WHERE name = 'Бургеры')
  AND restaurant_products.restaurant_id = (SELECT id FROM restaurants WHERE name = 'Кафе на Ясной');

-- Обновляем цены для напитков в Кафе на Фронтовых бригад на -50р
UPDATE restaurant_products 
SET price = GREATEST(p.price - 50, 0) -- Чтобы цена не стала отрицательной
FROM products p
WHERE 
  restaurant_products.product_id = p.id
  AND p.category_id = (SELECT id FROM categories WHERE name = 'Напитки')
  AND restaurant_products.restaurant_id = (SELECT id FROM restaurants WHERE name = 'Кафе на Фронтовых бригад');

-- Создаем специальное предложение для Закусочной на Волгоградской
UPDATE restaurant_products 
SET price = ROUND(p.price * 0.8) -- 20% скидка на блюда на компанию
FROM products p
WHERE 
  restaurant_products.product_id = p.id
  AND p.category_id = (SELECT id FROM categories WHERE name = 'Блюда на компанию')
  AND restaurant_products.restaurant_id = (SELECT id FROM restaurants WHERE name = 'Закусочная на Волгоградской');