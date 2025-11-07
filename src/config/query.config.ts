/**
 * Centralized Query Keys Configuration
 * 
 * This file contains all React Query keys organized by feature/module.
 * Using this centralized approach prevents conflicts and makes it easier
 * to manage and refactor query keys across the application.
 */

export const queryKeys = {
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.orders.lists(), params] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    my: () => [...queryKeys.orders.all, 'my'] as const,
    public: (id: string) => [...queryKeys.orders.all, 'public', id] as const,
    admin: (params?: any) => [...queryKeys.orders.all, 'admin', params] as const,
  },

  // Cart
  cart: {
    all: ['cart'] as const,
    current: () => [...queryKeys.cart.all, 'current'] as const,
  },

  // Store Owner
  storeOwner: {
    all: ['store-owner'] as const,
    profile: () => [...queryKeys.storeOwner.all, 'profile'] as const,
    stores: () => [...queryKeys.storeOwner.all, 'stores'] as const,
    store: (id: string) => [...queryKeys.storeOwner.stores(), id] as const,
    menu: (storeId: string) => [...queryKeys.storeOwner.all, 'menu', storeId] as const,
    orders: () => [...queryKeys.storeOwner.all, 'orders'] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    users: (params?: any) => [...queryKeys.admin.all, 'users', params || ''] as const,
    user: (id: string) => [...queryKeys.admin.all, 'user', id] as const,
    userOrders: (id: string) => [...queryKeys.admin.user(id), 'orders'] as const,
    userTransactions: (id: string) => [...queryKeys.admin.user(id), 'transactions'] as const,
    pendingStores: () => [...queryKeys.admin.all, 'stores', 'pending'] as const,
    store: (id: string) => [...queryKeys.admin.all, 'store', id] as const,
    stores: () => [...queryKeys.admin.all, 'stores'] as const,
    storesAll: (params?: any) => [...queryKeys.admin.all, 'stores', 'all', params || ''] as const,
    analytics: {
      dashboard: (params?: any) => [...queryKeys.admin.all, 'analytics', 'dashboard', params || ''] as const,
      orders: (params?: any) => [...queryKeys.admin.all, 'analytics', 'orders', params || ''] as const,
      stores: (params?: any) => [...queryKeys.admin.all, 'analytics', 'stores', params || ''] as const,
      revenue: (params?: any) => [...queryKeys.admin.all, 'analytics', 'revenue', params || ''] as const,
    },
    menu: {
      items: (params?: any) => [...queryKeys.admin.all, 'menu', 'items', params || ''] as const,
      item: (id: string) => [...queryKeys.admin.all, 'menu', 'items', id] as const,
    },
  },

  // Payouts
  payouts: {
    all: ['payouts'] as const,
    storeOwner: () => [...queryKeys.payouts.all, 'storeOwner'] as const,
    admin: () => [...queryKeys.payouts.all, 'admin'] as const,
    detail: (id: string) => [...queryKeys.payouts.all, id] as const,
    earnings: () => [...queryKeys.payouts.all, 'earnings'] as const,
  },

  // Public
  public: {
    all: ['public'] as const,
    stores: (params?: any) => [...queryKeys.public.all, 'stores', params || ''] as const,
    storeMenu: (storeId: string) => [...queryKeys.public.all, 'menu', storeId] as const,
    search: (params?: any) => [...queryKeys.public.all, 'search', params || ''] as const,
    stats: () => [...queryKeys.public.all, 'stats'] as const,
    products: (params?: any) => [...queryKeys.public.all, 'products', params || ''] as const,
    categories: () => [...queryKeys.public.all, 'categories'] as const,
  },

  // Reviews
  reviews: {
    all: ['reviews'] as const,
    store: (storeId: string) => [...queryKeys.reviews.all, 'store', storeId] as const,
    user: () => [...queryKeys.reviews.all, 'user'] as const,
    detail: (id: string) => [...queryKeys.reviews.all, id] as const,
    admin: () => [...queryKeys.reviews.all, 'admin'] as const,
  },

  // Promotions
  promotions: {
    all: ['promotions'] as const,
    active: () => [...queryKeys.promotions.all, 'active'] as const,
    admin: () => [...queryKeys.promotions.all, 'admin'] as const,
    detail: (id: string) => [...queryKeys.promotions.all, 'admin', id] as const,
  },

  // Disputes
  disputes: {
    all: ['disputes'] as const,
    user: () => [...queryKeys.disputes.all, 'user'] as const,
    store: () => [...queryKeys.disputes.all, 'store'] as const,
    admin: () => [...queryKeys.disputes.all, 'admin'] as const,
    detail: (id: string) => [...queryKeys.disputes.all, id] as const,
  },
} as const;

// Export individual key groups for backward compatibility
export const ordersKeys = queryKeys.orders;
export const cartKeys = queryKeys.cart;
export const storeOwnerKeys = queryKeys.storeOwner;
export const adminKeys = queryKeys.admin;
export const payoutKeys = queryKeys.payouts;
export const publicKeys = queryKeys.public;
export const reviewKeys = queryKeys.reviews;
export const promotionKeys = queryKeys.promotions;
export const disputeKeys = queryKeys.disputes;

