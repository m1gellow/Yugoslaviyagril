export const APP_ROUTES = {
  HOME: '/',
  DELIVERY: '/delivery',
  CABINET: '/cabinet',
  RESTAURANT: {
    pattern: '/restaurant/:id',
    create: (id: string | number) => `/restaurant/${id}`
  },
  ADMIN: '/admin/*',
  PRIVACY_POLICY: '/privacy-policy',
  PROMOTIONS: '/promotions',
  KNOWLEDGE_BASE: '/knowledge-base', 

  ADMIN_SUBROUTES: {
    DASHBOARD: 'dashboard',
    ORDERS: 'orders',
    MENU: 'menu',
    SETTINGS: 'settings'
  }
} as const;

export type AppRoute = keyof typeof APP_ROUTES;

export const routeHelpers = {
  getRestaurantRoute: (id: string | number) => `/restaurant/${id}`,
  getAdminSubroute: (subroute: string) => `/admin/${subroute}`
};
