import { supabase } from '../../lib/supabase';

// API сервисы для админ-панели

// Категории
export const categoryService = {
  async getAll() {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');

    if (error) throw error;
    return data;
  },

  async create(category) {
    const { data, error } = await supabase.from('categories').insert(category).select().single();

    if (error) throw error;
    return data;
  },

  async update(id, changes) {
    const { data, error } = await supabase.from('categories').update(changes).eq('id', id).select().single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;
    return true;
  },
};

// Продукты
export const productService = {
  async getAll(restaurantId = null) {
    let query = supabase.from('products').select(`
        *,
        category:category_id(*),
        restaurant:restaurant_id(*)
      `);

    // Если указан ID ресторана, фильтруем по нему
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data, error } = await query.order('category_id');

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:category_id(*),
        restaurant:restaurant_id(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(product) {
    // Сохраняем цены в разных ресторанах для последующего использования
    const restaurantPrices = product.restaurantPrices;

    // Удаляем лишние поля перед вставкой в таблицу products
    const { restaurantPrices: _, ...productData } = product;

    const { data, error } = await supabase.from('products').insert(productData).select().single();

    if (error) throw error;

    // Если есть цены для ресторанов, добавляем их в таблицу restaurant_products
    if (restaurantPrices && Object.keys(restaurantPrices).length > 0) {
      const restaurantProductEntries = Object.entries(restaurantPrices).map(([restaurantId, price]) => ({
        product_id: data.id,
        restaurant_id: restaurantId,
        price,
        is_available: true,
      }));

      const { error: restaurantProductsError } = await supabase
        .from('restaurant_products')
        .insert(restaurantProductEntries);

      if (restaurantProductsError) throw restaurantProductsError;
    }

    return {
      ...data,
      restaurantPrices,
    };
  },

  async update(id, changes) {
    // Сохраняем цены в разных ресторанах для последующего использования
    const restaurantPrices = changes.restaurantPrices;

    // Удаляем лишние поля перед обновлением таблицы products
    const { restaurantPrices: _, ...productChanges } = changes;

    const { data, error } = await supabase
      .from('products')
      .update({
        ...productChanges,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Обновляем цены для ресторанов
    if (restaurantPrices && Object.keys(restaurantPrices).length > 0) {
      for (const [restaurantId, price] of Object.entries(restaurantPrices)) {
        // Проверяем, существует ли уже запись
        const { data: existingData, error: checkError } = await supabase
          .from('restaurant_products')
          .select('id')
          .eq('product_id', id)
          .eq('restaurant_id', restaurantId)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingData) {
          // Обновляем существующую запись
          const { error: updateError } = await supabase
            .from('restaurant_products')
            .update({
              price,
              is_available: true,
            })
            .eq('id', existingData.id);

          if (updateError) throw updateError;
        } else {
          // Добавляем новую запись
          const { error: insertError } = await supabase.from('restaurant_products').insert({
            product_id: id,
            restaurant_id: restaurantId,
            price,
            is_available: true,
          });

          if (insertError) throw insertError;
        }
      }
    }

    return {
      ...data,
      restaurantPrices,
    };
  },

  async delete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;
    return true;
  },

  // Получение рекомендаций продукта
  async getRecommendations(productId) {
    const { data, error } = await supabase
      .from('product_recommendations')
      .select(
        `
        *,
        recommended_product:recommended_product_id(*)
      `,
      )
      .eq('product_id', productId);

    if (error) throw error;
    return data;
  },

  // Обновление рекомендаций продукта
  async updateRecommendations(productId, recommendedProductIds) {
    // Сначала удаляем существующие рекомендации
    const { error: deleteError } = await supabase.from('product_recommendations').delete().eq('product_id', productId);

    if (deleteError) throw deleteError;

    // Затем добавляем новые
    if (recommendedProductIds.length > 0) {
      const recommendations = recommendedProductIds.map((recId) => ({
        product_id: productId,
        recommended_product_id: recId,
      }));

      const { error: insertError } = await supabase.from('product_recommendations').insert(recommendations);

      if (insertError) throw insertError;
    }

    return true;
  },

  // Получение продуктов по ресторану
  async getByRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        category:category_id(*),
        restaurant:restaurant_id(*)
      `,
      )
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return data;
  },
};

// Рестораны
export const restaurantService = {
  async getAll() {
    const { data, error } = await supabase.from('restaurants').select('*').order('name');

    if (error) throw error;
    return data;
  },

  async create(restaurant) {
    const { data, error } = await supabase.from('restaurants').insert(restaurant).select().single();

    if (error) throw error;
    return data;
  },

  async update(id, changes) {
    const { data, error } = await supabase.from('restaurants').update(changes).eq('id', id).select().single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('restaurants').delete().eq('id', id);

    if (error) throw error;
    return true;
  },
};

// Цены продуктов в ресторанах
export const restaurantProductService = {
  async getByRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('restaurant_products')
      .select(
        `
        *,
        product:product_id(*)
      `,
      )
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return data;
  },

  async updatePrice(restaurantId, productId, price) {
    const { data, error } = await supabase
      .from('restaurant_products')
      .upsert({
        restaurant_id: restaurantId,
        product_id: productId,
        price: price,
        is_available: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProductPricesForAllRestaurants(productId) {
    const { data, error } = await supabase
      .from('restaurant_products')
      .select('restaurant_id, price, is_available')
      .eq('product_id', productId);

    if (error) throw error;

    // Преобразуем в удобный формат
    const prices: { [restaurantId: string]: number } = {};
    data?.forEach((item) => {
      if (item.is_available) {
        prices[item.restaurant_id] = item.price;
      }
    });

    return prices;
  },
};

// Промокоды
export const promoCodeService = {
  async getAll() {
    const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(promoCode) {
    const { data, error } = await supabase.from('promo_codes').insert(promoCode).select().single();

    if (error) throw error;
    return data;
  },

  async update(id, changes) {
    const { data, error } = await supabase.from('promo_codes').update(changes).eq('id', id).select().single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleActive(id, isActive) {
    const { data, error } = await supabase
      .from('promo_codes')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Заказы
export const orderService = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        restaurant:restaurant_id(*),
        items:order_items(*)
      `,
      )
      .order('ordered_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        restaurant:restaurant_id(*),
        items:order_items(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addDeliveryNote(id, note) {
    // В реальном приложении это поле было бы в таблице orders
    // Здесь имитируем обновление
    return {
      id,
      deliveryNotes: note,
    };
  },
};

// Компоненты (соусы, гарниры)
export const componentService = {
  async getAll() {
    const { data, error } = await supabase.from('components').select('*').order('name');

    if (error) throw error;
    return data;
  },

  async getByType(type: 'sauce' | 'side') {
    const { data, error } = await supabase.from('components').select('*').eq('type', type).order('name');

    if (error) throw error;
    return data;
  },

  async create(component) {
    const { data, error } = await supabase.from('components').insert(component).select().single();

    if (error) throw error;
    return data;
  },

  async update(id, changes) {
    const { data, error } = await supabase.from('components').update(changes).eq('id', id).select().single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('components').delete().eq('id', id);

    if (error) throw error;
    return true;
  },
};

// Пользователи и управление ролями
export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        restaurant:restaurant_id(*)
      `,
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        restaurant:restaurant_id(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, changes) {
    const { data, error } = await supabase.from('users').update(changes).eq('id', id).select().single();

    if (error) throw error;
    return data;
  },

  async updateRole(id, role, restaurantId = null) {
    const { data, error } = await supabase
      .from('users')
      .update({
        user_role: role,
        restaurant_id: role === 'product_manager' ? restaurantId : null, // Привязываем ресторан только для product_manager
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;
    return true;
  },
};
