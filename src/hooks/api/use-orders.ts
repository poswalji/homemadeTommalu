import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
   ordersApi,
   type CreateOrderData,
   type UpdateOrderStatusData,
   type OrdersQueryParams,
   type DeliveryAddress,
} from '@/services/api/orders.api';
import { ordersKeys, cartKeys, storeOwnerKeys } from '@/config/query.config';

// Create order (customer)
export const useCreateOrder = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: CreateOrderData) => ordersApi.createOrder(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
         queryClient.invalidateQueries({ queryKey: cartKeys.all });
      },
   });
};

// Create order from cart (customer)
export const useCreateOrderFromCart = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: (data: {
         deliveryAddress: DeliveryAddress;
         paymentMethod?: string;
      }) => ordersApi.createOrderFromCart(data),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
         queryClient.invalidateQueries({ queryKey: cartKeys.all });
      },
   });
};

// Get customer's orders
export const useMyOrders = () => {
   return useQuery({
      queryKey: ordersKeys.my(),
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
         queryClient.invalidateQueries({
            queryKey: ordersKeys.detail(variables.id),
         });
         queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
         queryClient.invalidateQueries({ queryKey: ordersKeys.admin() });
         // ✅ Sync with store owner orders view
         queryClient.invalidateQueries({ queryKey: storeOwnerKeys.orders() });
         queryClient.invalidateQueries({
            queryKey: ordersKeys.public(variables.id),
         });
      },
   });
};

// Get all orders (admin)
export const useAllOrders = (params?: OrdersQueryParams) => {
   return useQuery({
      queryKey: ordersKeys.admin(params),
      queryFn: () => ordersApi.getAllOrders(params),
      staleTime: 1000 * 60 * 1, // 1 minute
   });
};

// Cancel order (customer)
export const useCancelOrder = () => {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: ({
         id,
         cancellationReason,
      }: {
         id: string;
         cancellationReason?: string;
      }) => ordersApi.cancelOrder(id, cancellationReason),
      onSuccess: (_, variables) => {
         queryClient.invalidateQueries({
            queryKey: ordersKeys.detail(variables.id),
         });
         queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
      },
   });
};

// Get public order tracking (no auth)
export const useOrderPublic = (id: string, enabled = true) => {
   return useQuery({
      queryKey: ordersKeys.public(id),
      queryFn: () => ordersApi.getOrderPublic(id),
      enabled: enabled && !!id,
      staleTime: 1000 * 60 * 1, // 1 minute,
      refetchInterval: 1000 * 60 * 1, // 1 minute
   });
};
