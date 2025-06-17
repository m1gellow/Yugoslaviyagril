-- Функция для создания новой чат-сессии с первичным сообщением
-- и автоматическим ответом системы
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
    restaurant_id,
    status,
    last_message_at
  ) VALUES (
    v_user_id,
    p_name,
    p_email,
    p_topic,
    p_restaurant_id,
    'active',
    NOW()
  ) RETURNING id INTO v_session_id;
  
  -- Добавляем первое сообщение от пользователя, если оно предоставлено
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
    
    -- Добавляем автоматическое сообщение системы
    INSERT INTO chat_messages (
      session_id,
      sender_type,
      content
    ) VALUES (
      v_session_id,
      'system',
      'Ваше обращение принято. Оператор ответит вам в ближайшее время. Обычное время ожидания: 5-15 минут в рабочее время (10:00-22:00).'
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

-- Функция для получения статистики по чату
CREATE OR REPLACE FUNCTION get_chat_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', (SELECT COUNT(*) FROM chat_sessions),
    'active_sessions', (SELECT COUNT(*) FROM chat_sessions WHERE status = 'active'),
    'resolved_sessions', (SELECT COUNT(*) FROM chat_sessions WHERE status = 'resolved'),
    'closed_sessions', (SELECT COUNT(*) FROM chat_sessions WHERE status = 'closed'),
    'today_sessions', (SELECT COUNT(*) FROM chat_sessions WHERE created_at >= CURRENT_DATE),
    'total_messages', (SELECT COUNT(*) FROM chat_messages),
    'unread_messages', (
      SELECT COUNT(*) FROM chat_messages 
      WHERE is_read = false
      AND sender_type = 'user'
      AND session_id IN (SELECT id FROM chat_sessions WHERE status = 'active')
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Оптимизируем поиск по чату для операторов
CREATE INDEX IF NOT EXISTS chat_messages_sender_type_idx ON chat_messages(sender_type);
CREATE INDEX IF NOT EXISTS chat_sessions_topic_idx ON chat_sessions(topic);

-- Проверяем наличие политик перед созданием новых
DO $$
DECLARE
  policy_exists_messages BOOLEAN;
  policy_exists_sessions BOOLEAN;
BEGIN
  -- Проверяем существование политики для chat_messages
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' 
    AND policyname = 'Полный доступ к сообщениям чата'
  ) INTO policy_exists_messages;
  
  -- Проверяем существование политики для chat_sessions
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_sessions' 
    AND policyname = 'Полный доступ к сессиям чата'
  ) INTO policy_exists_sessions;
  
  -- Создаем политики только если они не существуют
  IF NOT policy_exists_messages THEN
    EXECUTE 'CREATE POLICY "Полный доступ к сообщениям чата" 
      ON chat_messages FOR ALL USING (true) WITH CHECK (true)';
    RAISE NOTICE 'Создана политика "Полный доступ к сообщениям чата"';
  ELSE
    RAISE NOTICE 'Политика "Полный доступ к сообщениям чата" уже существует';
  END IF;
  
  IF NOT policy_exists_sessions THEN
    EXECUTE 'CREATE POLICY "Полный доступ к сессиям чата" 
      ON chat_sessions FOR ALL USING (true) WITH CHECK (true)';
    RAISE NOTICE 'Создана политика "Полный доступ к сессиям чата"';
  ELSE
    RAISE NOTICE 'Политика "Полный доступ к сессиям чата" уже существует';
  END IF;
END
$$;

-- Обновляем систему "онлайн" для пользователей и статусов
DROP FUNCTION IF EXISTS auto_update_offline_status();

CREATE OR REPLACE FUNCTION auto_update_offline_status()
RETURNS void AS $$
BEGIN
  -- Обновляем статус пользователей, неактивных более 10 минут
  UPDATE user_status
  SET 
    is_online = false,
    updated_at = NOW()
  WHERE 
    is_online = true AND 
    last_activity < NOW() - INTERVAL '10 minutes';
    
  -- Записываем в журнал количество обновленных пользователей
  RAISE LOG 'Автоматическое обновление статуса: % пользователей переведены в офлайн', 
    (SELECT count(*) FROM user_status WHERE updated_at > NOW() - INTERVAL '1 second');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для обновления статуса пользователя при любой активности
CREATE OR REPLACE FUNCTION refresh_user_status()
RETURNS TRIGGER AS $$
BEGIN
  -- При активности пользователя обновляем его статус онлайн
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO user_status (
      user_id,
      is_online,
      last_activity,
      last_seen_at
    ) VALUES (
      NEW.user_id,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      is_online = true,
      last_activity = NOW(),
      last_seen_at = NOW(),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматического обновления статуса при активности
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'refresh_user_status_on_chat_message'
  ) THEN
    CREATE TRIGGER refresh_user_status_on_chat_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION refresh_user_status();
  END IF;
END
$$;