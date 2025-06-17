-- Создаем таблицу базы знаний
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Создаем таблицу сессий чата
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  topic TEXT NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

-- Создаем таблицу сообщений чата
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'operator', 'manager', 'admin', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS knowledge_base_is_active_idx ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS knowledge_base_sort_order_idx ON knowledge_base(sort_order);

CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_restaurant_id_idx ON chat_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS chat_sessions_status_idx ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS chat_sessions_last_message_at_idx ON chat_sessions(last_message_at);

CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_is_read_idx ON chat_messages(is_read);

-- Включаем RLS для всех таблиц
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Создаем политики для базы знаний
CREATE POLICY "Knowledge base is viewable by everyone"
  ON knowledge_base
  FOR SELECT
  USING (true);

CREATE POLICY "Knowledge base can be modified by administrators"
  ON knowledge_base
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'manager', 'operator')
    )
  );

-- Создаем политики для сессий чата
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() 
    AND user_role IN ('admin', 'manager', 'operator')
  ));

CREATE POLICY "Users can create chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anonymous users can view active sessions"
  ON chat_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Staff can update chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'manager', 'operator')
    )
  );

-- Создаем политики для сообщений чата
CREATE POLICY "Users can view messages from their sessions"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'manager', 'operator')
    )
  );

CREATE POLICY "Users can add messages to their sessions"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'manager', 'operator')
    )
  );

CREATE POLICY "Admins can manage all chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND user_role IN ('admin', 'manager', 'operator')
    )
  );

-- Создаем функцию для поиска статей базы знаний с использованием Левенштейна
CREATE OR REPLACE FUNCTION search_knowledge_base(
  search_query TEXT,
  max_distance INTEGER DEFAULT 3,
  max_results INTEGER DEFAULT 10
)
RETURNS SETOF knowledge_base AS $$
BEGIN
  RETURN QUERY
  WITH ranked_results AS (
    SELECT 
      kb.*,
      -- Рассчитываем расстояние Левенштейна для вопроса и запроса
      LEAST(
        -- Расстояние для вопроса целиком
        levenshtein(LOWER(kb.question), LOWER(search_query)),
        -- Расстояние для частей вопроса
        (
          SELECT MIN(levenshtein(LOWER(word), LOWER(search_query)))
          FROM unnest(string_to_array(kb.question, ' ')) AS word
          WHERE length(word) > 3
        ),
        -- Расстояние для категории
        levenshtein(LOWER(kb.category), LOWER(search_query))
      ) AS distance
    FROM knowledge_base kb
    WHERE kb.is_active = true
  )
  SELECT * FROM ranked_results
  WHERE distance <= max_distance
  ORDER BY distance, sort_order
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения непрочитанных сообщений для операторов
CREATE OR REPLACE FUNCTION get_unread_operator_messages(
  operator_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  session_id UUID,
  session_name TEXT,
  unread_count BIGINT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ
) AS $$
BEGIN
  -- Проверяем роль пользователя
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = operator_id
    AND user_role IN ('admin', 'manager', 'operator')
  ) THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    cs.id AS session_id,
    cs.name AS session_name,
    COUNT(cm.id) AS unread_count,
    MAX(cm.content) AS last_message,
    MAX(cm.created_at) AS last_message_time
  FROM chat_sessions cs
  JOIN chat_messages cm ON cs.id = cm.session_id
  WHERE 
    cs.status = 'active'
    AND cm.is_read = false
    AND cm.sender_type = 'user'
  GROUP BY cs.id, cs.name
  ORDER BY MAX(cm.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для создания новой сессии чата
-- ИСПРАВЛЕНО: сначала идут обязательные параметры, затем с дефолтными значениями
CREATE OR REPLACE FUNCTION create_chat_session(
  p_name TEXT,
  p_topic TEXT,
  p_email TEXT DEFAULT NULL,
  p_restaurant_id UUID DEFAULT NULL,
  p_first_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_session_id UUID;
  v_result JSONB;
BEGIN
  -- Получаем ID текущего пользователя, если он авторизован
  v_user_id := auth.uid();
  
  -- Создаем новую сессию чата
  INSERT INTO chat_sessions (
    user_id,
    name,
    email,
    topic,
    restaurant_id
  ) VALUES (
    v_user_id,
    p_name,
    p_email,
    p_topic,
    p_restaurant_id
  ) RETURNING id INTO v_session_id;
  
  -- Добавляем первое сообщение, если оно предоставлено
  IF p_first_message IS NOT NULL AND p_first_message != '' THEN
    INSERT INTO chat_messages (
      session_id,
      user_id,
      sender_type,
      content
    ) VALUES (
      v_session_id,
      v_user_id,
      'user',
      p_first_message
    );
    
    -- Добавляем системное сообщение-приветствие
    INSERT INTO chat_messages (
      session_id,
      sender_type,
      content
    ) VALUES (
      v_session_id,
      'system',
      'Благодарим за обращение! Наши операторы свяжутся с вами в ближайшее время. Обычно мы отвечаем в течение 5-15 минут в рабочее время (10:00-22:00).'
    );
  END IF;
  
  -- Формируем результат
  SELECT jsonb_build_object(
    'success', true,
    'session_id', v_session_id,
    'user_id', v_user_id,
    'name', p_name,
    'email', p_email,
    'topic', p_topic,
    'restaurant_id', p_restaurant_id,
    'created_at', NOW()
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки непрочитанных сообщений у пользователя
CREATE OR REPLACE FUNCTION get_unread_user_messages(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM chat_messages cm
  JOIN chat_sessions cs ON cm.session_id = cs.id
  WHERE 
    cs.user_id = p_user_id
    AND cs.status = 'active'
    AND cm.is_read = false
    AND (cm.sender_type IN ('operator', 'manager', 'admin', 'system'));
    
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Заполняем базу знаний начальными данными
INSERT INTO knowledge_base (category, question, answer, sort_order, is_active) VALUES
('Доставка', 'Сколько стоит доставка?', 'Стоимость доставки составляет 200₽ для расстояний до 10 км от ресторана. Для отдаленных районов (свыше 10 км) стоимость — 400₽. При заказе на сумму от 4000₽ доставка бесплатная.', 10, true),
('Доставка', 'Как долго выполняется доставка?', 'Обычно доставка занимает от 30 до 90 минут в зависимости от загруженности ресторана и дорожной ситуации. При оформлении заказа вы получите примерное время доставки.', 20, true),
('Доставка', 'В какое время работает доставка?', 'Наша доставка работает ежедневно с 10:00 до 22:00. Последний заказ принимается в 21:15.', 30, true),
('Заказы', 'Как оформить заказ?', 'Вы можете оформить заказ несколькими способами: через наш сайт, по телефону +7 (912) 669-61-28, или в приложении. При заказе через сайт добавьте выбранные позиции в корзину и перейдите к оформлению заказа.', 40, true),
('Заказы', 'Какая минимальная сумма заказа?', 'Минимальная сумма заказа на доставку — 1000₽. Для ресторана на Белинского — 2500₽. При заказе меньшей суммы доступен самовывоз.', 50, true),
('Заказы', 'Как оплатить заказ?', 'Доступны следующие способы оплаты: наличными курьеру, банковской картой курьеру, онлайн через СБП (Систему Быстрых Платежей).', 60, true),
('Меню', 'Есть ли у вас вегетарианские блюда?', 'Да, в нашем меню есть вегетарианские блюда: различные салаты, закуски, овощи гриль. Обратите внимание на соответствующие обозначения в меню.', 70, true),
('Меню', 'Что такое плескавица?', 'Плескавица — это традиционная сербская котлета из говяжьего фарша с добавлением специй, приготовленная на гриле. Наша фирменная плескавица готовится по семейному рецепту и подается в лепешке с соусом и овощами.', 80, true),
('Меню', 'Можно ли заказать блюдо без определенных ингредиентов?', 'Да, при оформлении заказа вы можете указать свои пожелания в комментарии. Мы постараемся учесть ваши предпочтения и приготовить блюдо без нежелательных ингредиентов, если это возможно.', 90, true),
('Акции', 'Есть ли у вас бонусная программа?', 'Да, за каждый заказ вы получаете бонусные баллы в размере 5% от суммы заказа. Накопленными баллами можно оплатить до 50% стоимости следующих заказов.', 100, true),
('Акции', 'Как применить промокод?', 'При оформлении заказа на сайте или в приложении введите промокод в соответствующее поле в корзине и нажмите кнопку "Применить". Скидка будет учтена автоматически.', 110, true),
('Рестораны', 'Можно ли забронировать стол?', 'Да, вы можете забронировать стол, позвонив напрямую в выбранный ресторан. Рекомендуем делать это заранее, особенно в выходные дни.', 120, true),
('Рестораны', 'Есть ли у вас парковка?', 'Да, у всех наших ресторанов есть бесплатная парковка для гостей. Количество парковочных мест может различаться в зависимости от расположения ресторана.', 130, true),
('Контакты', 'Как связаться с поддержкой?', 'Вы можете связаться с нами по телефону +7 (912) 669-61-28, через форму обратной связи на сайте, по электронной почте info@yugoslavia-grill.ru, или напрямую в чате.', 140, true);

-- Создаем функцию для обновления времени обновления
CREATE OR REPLACE FUNCTION update_kb_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для обновления времени
CREATE TRIGGER update_knowledge_base_timestamp
BEFORE UPDATE ON knowledge_base
FOR EACH ROW
EXECUTE FUNCTION update_kb_timestamp();

CREATE TRIGGER update_chat_sessions_timestamp
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION update_kb_timestamp();