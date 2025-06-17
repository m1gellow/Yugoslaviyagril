/*
  # Создание триггера для обновления рейтинга продуктов

  Этот триггер автоматически обновляет поля rating и reviews_count в таблице products
  на основе данных из таблицы reviews каждый раз, когда добавляется, обновляется
  или удаляется отзыв.

  Это обеспечивает актуальность данных о рейтинге продуктов без необходимости
  ручного обновления.
*/

-- Функция для обновления рейтинга продукта
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating FLOAT;
  reviews_count INTEGER;
BEGIN
  -- Если отзыв удаляется, обновляем рейтинг для старого product_id
  IF (TG_OP = 'DELETE') THEN
    -- Получаем среднюю оценку и количество отзывов
    SELECT AVG(rating)::FLOAT, COUNT(*)::INTEGER
    INTO avg_rating, reviews_count
    FROM reviews
    WHERE product_id = OLD.product_id;
    
    -- Обновляем продукт
    UPDATE products
    SET rating = COALESCE(avg_rating, 0),
        reviews_count = reviews_count
    WHERE id = OLD.product_id;
    
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Если меняется связанный продукт, обновляем рейтинг для обоих продуктов
    IF OLD.product_id != NEW.product_id THEN
      -- Для старого продукта
      SELECT AVG(rating)::FLOAT, COUNT(*)::INTEGER
      INTO avg_rating, reviews_count
      FROM reviews
      WHERE product_id = OLD.product_id;
      
      UPDATE products
      SET rating = COALESCE(avg_rating, 0),
          reviews_count = reviews_count
      WHERE id = OLD.product_id;
      
      -- Для нового продукта
      SELECT AVG(rating)::FLOAT, COUNT(*)::INTEGER
      INTO avg_rating, reviews_count
      FROM reviews
      WHERE product_id = NEW.product_id;
      
      UPDATE products
      SET rating = COALESCE(avg_rating, 0),
          reviews_count = reviews_count
      WHERE id = NEW.product_id;
    ELSE
      -- Если продукт не меняется, просто обновляем его рейтинг
      SELECT AVG(rating)::FLOAT, COUNT(*)::INTEGER
      INTO avg_rating, reviews_count
      FROM reviews
      WHERE product_id = NEW.product_id;
      
      UPDATE products
      SET rating = COALESCE(avg_rating, 0),
          reviews_count = reviews_count
      WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
  ELSE -- INSERT
    -- Обновляем рейтинг продукта
    SELECT AVG(rating)::FLOAT, COUNT(*)::INTEGER
    INTO avg_rating, reviews_count
    FROM reviews
    WHERE product_id = NEW.product_id;
    
    UPDATE products
    SET rating = COALESCE(avg_rating, 0),
        reviews_count = reviews_count
    WHERE id = NEW.product_id;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер, который будет вызывать функцию при изменении отзывов
CREATE TRIGGER update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();