export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      components: {
        Row: {
          id: string;
          name: string;
          price: number;
          type: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          type: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          type?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          price: number;
          total_price: number;
          selected_sauce: string | null;
          selected_sides: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          price: number;
          total_price: number;
          selected_sauce?: string | null;
          selected_sides?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          price?: number;
          total_price?: number;
          selected_sauce?: string | null;
          selected_sides?: string[] | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          restaurant_id: string;
          order_number: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string | null;
          delivery_method: string;
          payment_method: string;
          status: string;
          total_amount: number;
          promo_code_id: string | null;
          discount_amount: number;
          delivery_cost: number;
          comment: string | null;
          ordered_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          restaurant_id: string;
          order_number: string;
          customer_name: string;
          customer_phone: string;
          customer_address?: string | null;
          delivery_method: string;
          payment_method: string;
          status: string;
          total_amount: number;
          promo_code_id?: string | null;
          discount_amount?: number;
          delivery_cost?: number;
          comment?: string | null;
          ordered_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          restaurant_id?: string;
          order_number?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string | null;
          delivery_method?: string;
          payment_method?: string;
          status?: string;
          total_amount?: number;
          promo_code_id?: string | null;
          discount_amount?: number;
          delivery_cost?: number;
          comment?: string | null;
          ordered_at?: string;
          updated_at?: string;
        };
      };
      product_components: {
        Row: {
          id: string;
          product_id: string;
          component_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          component_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          component_id?: string;
          created_at?: string;
        };
      };
      product_recommendations: {
        Row: {
          id: string;
          product_id: string;
          recommended_product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          recommended_product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          recommended_product_id?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          weight: string | null;
          image: string;
          category_id: string;
          rating: number;
          reviews_count: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          weight?: string | null;
          image: string;
          category_id: string;
          rating?: number;
          reviews_count?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          weight?: string | null;
          image?: string;
          category_id?: string;
          rating?: number;
          reviews_count?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount: number;
          type: string;
          description: string | null;
          min_order_amount: number;
          start_date: string;
          end_date: string;
          usage_limit: number | null;
          used_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount: number;
          type: string;
          description?: string | null;
          min_order_amount?: number;
          start_date: string;
          end_date: string;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount?: number;
          type?: string;
          description?: string | null;
          min_order_amount?: number;
          start_date?: string;
          end_date?: string;
          usage_limit?: number | null;
          used_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      restaurant_products: {
        Row: {
          id: string;
          restaurant_id: string;
          product_id: string;
          price: number;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          product_id: string;
          price: number;
          is_available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          product_id?: string;
          price?: number;
          is_available?: boolean;
          created_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          url: string | null;
          min_order_amount: number;
          free_delivery_threshold: number;
          working_hours: string;
          delivery_time: string | null;
          location_lat: number | null;
          location_lng: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          phone: string;
          url?: string | null;
          min_order_amount?: number;
          free_delivery_threshold?: number;
          working_hours?: string;
          delivery_time?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          phone?: string;
          url?: string | null;
          min_order_amount?: number;
          free_delivery_threshold?: number;
          working_hours?: string;
          delivery_time?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          order_id: string | null;
          rating: number;
          comment: string | null;
          user_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          order_id?: string | null;
          rating: number;
          comment?: string | null;
          user_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          order_id?: string | null;
          rating?: number;
          comment?: string | null;
          user_name?: string;
          created_at?: string;
        };
      };
    };
  };
}
