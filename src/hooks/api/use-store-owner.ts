import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  storeOwnerApi,
  type CreateStoreData,
  type UpdateStoreData,
  type CreateMenuItemData,
  type UpdateMenuItemData,
  type UpdateOrderStatusData,
} from '@/services/api/store-owner.api';

// Query keys
export const storeOwnerKeys = {
  all: ['store-owner'] as const,
  profile: () => [...storeOwnerKeys.all, 'profile'] as const,
  stores: () => [...storeOwnerKeys.all, 'stores'] as const,
  store: (id: string) => [...storeOwnerKeys.stores(), id] as const,
  menu: (storeId: string) => [...storeOwnerKeys.all, 'menu', storeId] as const,
  orders: () => [...storeOwnerKeys.all, 'orders'] as const,
};

// Get store owner profile
export const useStoreOwnerProfile = () => {
  return useQuery({
    queryKey: storeOwnerKeys.profile(),
    queryFn: () => storeOwnerApi.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get owner's stores
export const useMyStores = () => {
  return useQuery({
    queryKey: storeOwnerKeys.stores(),
    queryFn: () => storeOwnerApi.getMyStores(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get store by ID
export const useStore = (id: string, enabled = true) => {
  return useQuery({
    queryKey: storeOwnerKeys.store(id),
    queryFn: () => storeOwnerApi.getStoreById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Create store
export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreData) => storeOwnerApi.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.stores() });
    },
  });
};

// Update store
export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreData }) =>
      storeOwnerApi.updateStore(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.store(variables.id) });
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.stores() });
    },
  });
};

// Delete store
export const useDeleteStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storeOwnerApi.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.stores() });
    },
  });
};

// Toggle store status
export const useToggleStoreStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storeOwnerApi.toggleStoreStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.store(id) });
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.stores() });
    },
  });
};

// Get store menu (store owner)
export const useStoreOwnerMenu = (storeId: string, enabled = true) => {
  return useQuery({
    queryKey: storeOwnerKeys.menu(storeId),
    queryFn: () => storeOwnerApi.getStoreMenu(storeId),
    enabled: enabled && !!storeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Create menu item
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: CreateMenuItemData }) =>
      storeOwnerApi.createMenuItem(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.menu(variables.storeId) });
    },
  });
};

// Update menu item
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuItemId, data }: { menuItemId: string; data: UpdateMenuItemData }) =>
      storeOwnerApi.updateMenuItem(menuItemId, data),
    onSuccess: () => {
      // Invalidate all menu queries to refresh the list
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.all });
    },
  });
};

// Delete menu item
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuItemId: string) => storeOwnerApi.deleteMenuItem(menuItemId),
    onSuccess: () => {
      // Invalidate all menu queries to refresh the list
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.all });
    },
  });
};

// Toggle menu item availability
export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuItemId: string) => storeOwnerApi.toggleMenuItemAvailability(menuItemId),
    onSuccess: () => {
      // Invalidate all menu queries to refresh the list
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.all });
    },
  });
};

// Get store owner orders
export const useStoreOwnerOrders = () => {
  return useQuery({
    queryKey: storeOwnerKeys.orders(),
    queryFn: () => storeOwnerApi.getOrders(),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

// Update order status (store owner)
export const useStoreOwnerUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderStatusData }) =>
      storeOwnerApi.updateOrderStatus(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeOwnerKeys.orders() });
      // ✅ Sync with customer orders view
      queryClient.invalidateQueries({ queryKey: ['orders', 'detail', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
    },
  });
};




