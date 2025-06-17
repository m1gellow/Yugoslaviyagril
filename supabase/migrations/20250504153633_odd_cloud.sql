-- Создаем функцию для получения пользователей онлайн в разрезе ролей
CREATE OR REPLACE FUNCTION get_online_users_by_role(limit_count INT DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_role TEXT,
  restaurant_id UUID,
  restaurant_name TEXT,
  last_activity TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id, 
    u.name as user_name,
    u.user_role,
    u.restaurant_id,
    r.name as restaurant_name,
    us.last_activity,
    us.last_seen_at
  FROM user_status us
  JOIN users u ON us.user_id = u.id
  LEFT JOIN restaurants r ON u.restaurant_id = r.id
  WHERE us.is_online = true
  ORDER BY u.user_role, us.last_activity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения статистики по продуктам для конкретного ресторана
CREATE OR REPLACE FUNCTION get_restaurant_product_stats(restaurant_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'restaurant_id', restaurant_uuid,
    'restaurant_name', (SELECT name FROM restaurants WHERE id = restaurant_uuid),
    'total_products', (
      SELECT COUNT(*) 
      FROM products 
      WHERE restaurant_id = restaurant_uuid
    ),
    'total_categories', (
      SELECT COUNT(DISTINCT category_id) 
      FROM products 
      WHERE restaurant_id = restaurant_uuid
    ),
    'product_managers', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'name', name,
        'email', email
      ))
      FROM users
      WHERE restaurant_id = restaurant_uuid AND user_role = 'product_manager'
    ),
    'most_expensive_products', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'name', name,
        'price', price,
        'category', (SELECT name FROM categories WHERE id = category_id)
      ))
      FROM products
      WHERE restaurant_id = restaurant_uuid
      ORDER BY price DESC
      LIMIT 5
    ),
    'products_by_category', (
      SELECT jsonb_object_agg(c.name, product_count)
      FROM (
        SELECT 
          c.id, 
          c.name, 
          COUNT(p.id) as product_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.restaurant_id = restaurant_uuid
        GROUP BY c.id, c.name
        ORDER BY c.sort_order
      ) as stats
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;