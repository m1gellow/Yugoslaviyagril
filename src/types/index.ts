import { Database } from '../lib/database.types';

// Используем типы из базы данных Supabase
export type Category = Database['public']['Tables']['categories']['Row'];
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type BaseProduct = Database['public']['Tables']['products']['Row'];

// Расширенный тип для продукта с дополнительными полями
export type Product = BaseProduct & {
  restaurantPrices?: { [restaurantId: string]: number };
  restaurant_id?: string | null;
  category?: Category;
  restaurant?: Restaurant;
};

export type RestaurantProduct = Database['public']['Tables']['restaurant_products']['Row'];

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSauce?: string;
  selectedSides?: string[];
}

export interface DeliveryInfo {
  name: string;
  phone: string;
  address?: string;
  homeNumber?: string;
  roomNumber?: string;
  hallNumber?: string;
  floorNumber?: string;
  date?: string;
  time?: string;
  comment?: string;
  venue: string;
  deliveryMethod: 'delivery' | 'pickup';
  paymentMethod: 'electron' | 'cash' | 'card';
  urgent?: boolean;
}

export type SauceOption = Database['public']['Tables']['components']['Row'] & { type: 'sauce' };
export type SideDish = Database['public']['Tables']['components']['Row'] & { type: 'side' };

export interface LikedItem {
  productId: string;
  dateAdded: string;
}

export type ProductReview = Database['public']['Tables']['reviews']['Row'];

export interface UserActivity {
  lastActive: string;
  orderCount: number;
  totalSpent: number;
  favoriteProducts: string[];
  lastReviews: ProductReview[];
  loyaltyPoints: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type Order = Database['public']['Tables']['orders']['Row'] & {
  courierInfo?: {
    name: string;
    phone: string;
    estimatedArrival: string;
  };
  deliveryNotes?: string;
};

// Обновленный интерфейс пользователя
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  user_role: 'admin' | 'manager' | 'operator' | 'product_manager' | 'user';
  restaurant_id?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}
