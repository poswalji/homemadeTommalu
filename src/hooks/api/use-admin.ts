import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminApi,
  type UsersQueryParams,
  type UpdateStoreMetadataData,
  type UpdateStoreCommissionData,
  type UpdateStoreDeliveryFeeData,
  type RejectStoreData,
  type ResetPasswordData,
} from '@/services/api/admin.api';

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  users: (params?: UsersQueryParams) => [...adminKeys.all, 'users', params] as const,
  user: (id: string) => [...adminKeys.all, 'user', id] as const,
  userOrders: (id: string) => [...adminKeys.user(id), 'orders'] as const,
  userTransactions: (id: string) => [...adminKeys.user(id), 'transactions'] as const,
  pendingStores: () => [...adminKeys.all, 'stores', 'pending'] as const,
  store: (id: string) => [...adminKeys.all, 'store', id] as const,
};

// Get users
export const useUsers = (params?: UsersQueryParams) => {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminApi.getUsers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Suspend user
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};

// Reactivate user
export const useReactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};

// Reset user password
export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordData }) =>
      adminApi.resetUserPassword(id, data),
  });
};

// Get user order history
export const useUserOrderHistory = (id: string, enabled = true) => {
  return useQuery({
    queryKey: adminKeys.userOrders(id),
    queryFn: () => adminApi.getUserOrderHistory(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get user transactions
export const useUserTransactions = (id: string, enabled = true) => {
  return useQuery({
    queryKey: adminKeys.userTransactions(id),
    queryFn: () => adminApi.getUserTransactions(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get pending stores
export const usePendingStores = () => {
  return useQuery({
    queryKey: adminKeys.pendingStores(),
    queryFn: () => adminApi.getPendingStores(),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

// Approve store
export const useApproveStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.approveStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingStores() });
    },
  });
};

// Reject store
export const useRejectStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: RejectStoreData }) =>
      adminApi.rejectStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingStores() });
    },
  });
};

// Suspend store
export const useSuspendStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.suspendStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingStores() });
    },
  });
};

// Update store metadata
export const useUpdateStoreMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreMetadataData }) =>
      adminApi.updateStoreMetadata(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.store(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingStores() });
    },
  });
};

// Update store commission
export const useUpdateStoreCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreCommissionData }) =>
      adminApi.updateStoreCommission(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.store(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingStores() });
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'stores'] });
    },
  });
};

// Update store delivery fee
export const useUpdateStoreDeliveryFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStoreDeliveryFeeData }) =>
      adminApi.updateStoreDeliveryFee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.store(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingStores() });
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'stores'] });
    },
  });
};

// Analytics hooks
export const useDashboardAnalytics = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'analytics', 'dashboard', params],
    queryFn: () => adminApi.getDashboardAnalytics(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useOrderAnalytics = (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'analytics', 'orders', params],
    queryFn: () => adminApi.getOrderAnalytics(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useStoreAnalytics = (params?: {
  category?: string;
  city?: string;
  top?: number;
}) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'analytics', 'stores', params],
    queryFn: () => adminApi.getStoreAnalytics(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRevenueAnalytics = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'analytics', 'revenue', params],
    queryFn: () => adminApi.getRevenueAnalytics(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Menu oversight hooks
export const useMenuItems = (params?: {
  storeId?: string;
  category?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'menu', 'items', params],
    queryFn: () => adminApi.listMenuItems(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useMenuItemById = (id: string) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'menu', 'items', id],
    queryFn: () => adminApi.getMenuItemById(id),
    enabled: !!id,
  });
};

export const useDisableMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.disableMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'menu', 'items'] });
    },
  });
};

// Get all stores with filters
export const useAllStores = (params?: {
  status?: string;
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...adminKeys.all, 'stores', 'all', params],
    queryFn: () => adminApi.getAllStores(params),
    staleTime: 1000 * 60 * 2,
  });
};

// Cancel order (admin override)
export const useCancelOrderAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

