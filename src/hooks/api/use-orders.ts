import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ordersApi,
  type CreateOrderData,
  type UpdateOrderStatusData,
  type OrdersQueryParams,
  type DeliveryAddress,
} from '@/services/api/orders.api';

// Query keys
export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (params?: OrdersQueryParams) => [...ordersKeys.lists(), params] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  myOrders: () => [...ordersKeys.all, 'my'] as const,
  allOrders: (params?: OrdersQueryParams) => [...ordersKeys.all, 'admin', params] as const,
};

// Create order (customer)
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.myOrders() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Create order from cart (customer)
export const useCreateOrderFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { deliveryAddress: DeliveryAddress; paymentMethod?: string }) =>
      ordersApi.createOrderFromCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.myOrders() });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// Get customer's orders
export const useMyOrders = () => {
  return useQuery({
    queryKey: ordersKeys.myOrders(),
    queryFn: () => ordersApi.getMyOrders(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get order by ID
export const useOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Update order status (admin or delivery)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusData }) =>
      ordersApi.updateOrderStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.myOrders() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.allOrders() });
      // ✅ Sync with store owner orders view
      queryClient.invalidateQueries({ queryKey: ['store-owner', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'public', variables.id] });
    },
  });
};

// Get all orders (admin)
export const useAllOrders = (params?: OrdersQueryParams) => {
  return useQuery({
    queryKey: ordersKeys.allOrders(params),
    queryFn: () => ordersApi.getAllOrders(params),
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

// Cancel order (customer)
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cancellationReason }: { id: string; cancellationReason?: string }) =>
      ordersApi.cancelOrder(id, cancellationReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.myOrders() });
    },
  });
};

// Get public order tracking (no auth)
export const useOrderPublic = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['orders', 'public', id],
    queryFn: () => ordersApi.getOrderPublic(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};




