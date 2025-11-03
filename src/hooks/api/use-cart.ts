import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cookieService } from '@/utills/cookies';
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
  const isAuthed = typeof window !== 'undefined' && cookieService.isAuthenticated();
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => cartApi.getCart(),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    enabled: isAuthed, // Avoid hitting auth-only endpoint when not logged in
    initialData: {
      success: true,
      data: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        deliveryCharge: 0,
        finalAmount: 0,
      },
    },
  });
};

// Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddToCartData) => {
      const isAuthed = typeof window !== 'undefined' && cookieService.isAuthenticated();
      if (!isAuthed) {
        const err = new Error('Please log in to add items to cart');
        (err as unknown as { code?: number }).code = 401;
        throw err;
      }
      return cartApi.addToCart(data);
    },
    onSuccess: (response) => {
      // If authenticated, refetch server cart; otherwise, set cache from response to avoid 401
      const isAuthed = typeof window !== 'undefined' && cookieService.isAuthenticated();
      if (isAuthed) {
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      } else if (response?.data) {
        queryClient.setQueryData(cartKeys.cart(), { success: true, data: response.data });
      }
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

