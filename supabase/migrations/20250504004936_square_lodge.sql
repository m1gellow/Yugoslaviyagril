-- Заполнение таблицы категорий
INSERT INTO categories (name, icon, sort_order) VALUES
  ('Бургеры', 'burger', 1),
  ('Блюда на гриле', 'grill', 2),
  ('Блюда на компанию', 'group', 3),
  ('Гарниры', 'fries', 4),
  ('Домашняя выпечка', 'bread', 5),
  ('Соусы', 'sauce', 6),
  ('Напитки', 'drink', 7),
  ('Супы', 'soup', 8),
  ('Горячие блюда (рыба на гриле)', 'fish', 9),
  ('Горячие закуски', 'appetizer', 10),
  ('Салаты', 'salad', 11);

-- Заполнение таблицы ресторанов
INSERT INTO restaurants (name, address, phone, url, min_order_amount, free_delivery_threshold, working_hours, delivery_time, location_lat, location_lng) VALUES
  ('Закусочная на Латвийской', 'Волгоградская, 178', '+7 (937) 000-03-07', '/latviyskaya/', 1000, 4000, '10:00 - 22:00', '30-60 мин', 56.833802, 60.600434),
  ('Кафе на Фронтовых бригад', 'Фронтовых бригад, 33А', '+7 (919) 376-72-10', '/frontovickh/', 1000, 4000, '10:00 - 22:00', '30-60 мин', 56.828926, 60.649726),
  ('Кафе на Ясной', 'Ясная, 6', '+7 (937) 000-03-07', '/yasnaya/', 1500, 4000, '10:00 - 22:00', '30-60 мин', 56.830926, 60.588922),
  ('Ресторан на Белинского', 'Белинского, 200', '+7 (937) 000-03-07', '/belinskogo/', 2500, 4000, '10:00 - 22:00', '40-70 мин', 56.816850, 60.630733);

-- Заполнение таблицы продуктов (пример для бургеров)
INSERT INTO products (name, description, price, weight, image, category_id, is_available) VALUES
  ('Бургер XXXL', 'Свиная шея, куриное филе, плескавица для гурманов, бекон, приготовленные на гриле, с добавлением сыра, в сербской лепешке, с овощами и соусом на выбор.', 520, '700гр.', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', (SELECT id FROM categories WHERE name = 'Бургеры'), true),
  ('Фирменный бургер', 'Две сочные плескавицы из говядины (для гурманов и классическая), бекон, приготовленные на гриле, с лобавлением сыра, в сербской лепешке, с овощами и соусом на выбор.', 480, '500гр.', 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', (SELECT id FROM categories WHERE name = 'Бургеры'), true),
  ('Бургер с куриным окороком', 'Сочный окорок без кости, приготовленный на гриле, в сербской лепешке, с овощами и соусом на выбор.', 350, '400гр.', 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', (SELECT id FROM categories WHERE name = 'Бургеры'), true),
  ('Бургер с куриным филе', 'Нежное филе куриной грудки, приготовленное на гриле, в сербской лепешке, с овощами и соусом на выбор.', 340, '400гр.', 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', (SELECT id FROM categories WHERE name = 'Бургеры'), true);

-- Заполнение таблицы цен продуктов для разных ресторанов
INSERT INTO restaurant_products (restaurant_id, product_id, price) 
SELECT r.id, p.id, 
  CASE 
    WHEN r.name = 'Ресторан на Белинского' THEN p.price * 1.15 -- +15%
    WHEN r.name = 'Закусочная на Латвийской' THEN p.price * 0.95 -- -5%
    ELSE p.price -- Стандартная цена
  END
FROM restaurants r
CROSS JOIN products p;

-- Заполнение таблицы компонентов
INSERT INTO components (name, price, type, is_active) VALUES
  ('Сербский', 100, 'sauce', true),
  ('Чесночный', 100, 'sauce', true),
  ('Тар-тар', 100, 'sauce', true),
  ('Сметана с огурцом', 100, 'sauce', true),
  ('Томатный', 100, 'sauce', true),
  ('Картофель фри', 150, 'side', true),
  ('Картофельные дольки', 150, 'side', true),
  ('Овощи гриль', 180, 'side', true),
  ('Сербская лепешка', 100, 'side', true);

-- Заполнение таблицы связи продуктов и компонентов
INSERT INTO product_components (product_id, component_id)
SELECT p.id, c.id
FROM products p
CROSS JOIN components c
WHERE p.category_id = (SELECT id FROM categories WHERE name = 'Бургеры')
AND c.type = 'sauce';

-- Заполнение таблицы промокодов
INSERT INTO promo_codes (code, discount, type, description, min_order_amount, start_date, end_date, usage_limit, is_active) VALUES
  ('WELCOME', 10, 'percent', 'Скидка 10% для новых клиентов', 1000, '2025-01-01', '2025-12-31', 1000, true),
  ('SERBIA2025', 15, 'percent', 'Скидка 15% на бургеры и блюда на гриле', 1500, '2025-01-01', '2025-12-31', 500, true),
  ('SUMMER', 20, 'percent', 'Летняя скидка 20%', 2000, '2025-06-01', '2025-08-31', 300, true),
  ('500ROUBLES', 500, 'fixed', 'Фиксированная скидка 500₽', 3000, '2025-01-01', '2025-12-31', 200, true),
  ('300ROUBLES', 300, 'fixed', 'Фиксированная скидка 300₽', 2000, '2025-01-01', '2025-12-31', 300, true);