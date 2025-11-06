import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cookieService } from '@/utills/cookies';
import {
  cartApi,
  type AddToCartData,
  type UpdateCartQuantityData,
  type RemoveFromCartData,
} from '@/services/api/cart.api';
import { cartKeys } from '@/config/query.config';

// Get cart
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.current(),
    queryFn: () => cartApi.getCart(),
    refetchOnWindowFocus: true,
  
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
        queryClient.invalidateQueries({ queryKey: cartKeys.current() });
      } else if (response?.data) {
        queryClient.setQueryData(cartKeys.current(), { success: true, data: response.data });
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
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
};

// Remove from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveFromCartData) => cartApi.removeFromCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
};

// Apply discount
export const useApplyDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountCode: string) => cartApi.applyDiscount(discountCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
};

// Remove discount
export const useRemoveDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.removeDiscount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
};

// Merge cart (on login)
export const useMergeCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.mergeCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.current() });
    },
  });
};

