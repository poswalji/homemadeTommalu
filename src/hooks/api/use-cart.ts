import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cartApi,
  type AddToCartData,
  type UpdateCartQuantityData,
  type RemoveFromCartData,
} from '@/services/api/cart.api';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'current'] as const,
};

// Get cart
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => cartApi.getCart(),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

// Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartData) => cartApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

// Update cart quantity
export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCartQuantityData) => cartApi.updateQuantity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

// Remove from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveFromCartData) => cartApi.removeFromCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

// Apply discount
export const useApplyDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountCode: string) => cartApi.applyDiscount(discountCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

// Remove discount
export const useRemoveDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.removeDiscount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

// Merge cart (on login)
export const useMergeCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.mergeCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
  });
};

