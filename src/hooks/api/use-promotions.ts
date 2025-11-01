import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionsApi, type CreatePromotionData, type ValidatePromotionData, type ApplyPromotionData } from '@/services/api/promotions.api';

// Query keys
export const promotionKeys = {
  all: ['promotions'] as const,
  active: () => [...promotionKeys.all, 'active'] as const,
  admin: () => [...promotionKeys.all, 'admin'] as const,
  detail: (id: string) => [...promotionKeys.all, 'admin', id] as const,
};

// Get active promotions
export const useActivePromotions = (params?: {
  city?: string;
  storeId?: string;
}) => {
  return useQuery({
    queryKey: [...promotionKeys.active(), params],
    queryFn: () => promotionsApi.getActivePromotions(params),
  });
};

// Validate promotion mutation
export const useValidatePromotion = () => {
  return useMutation({
    mutationFn: (data: ValidatePromotionData) => promotionsApi.validatePromotion(data),
  });
};

// Apply promotion mutation
export const useApplyPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyPromotionData) => promotionsApi.applyPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.admin() });
    },
  });
};

// Admin: Get all promotions
export const useAllPromotions = (params?: {
  isActive?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...promotionKeys.admin(), params],
    queryFn: () => promotionsApi.getAllPromotions(params),
  });
};

// Admin: Get promotion by ID
export const usePromotionById = (id: string) => {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => promotionsApi.getPromotionById(id),
    enabled: !!id,
  });
};

// Admin: Create promotion mutation
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromotionData) => promotionsApi.createPromotion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.admin() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
    },
  });
};

// Admin: Update promotion mutation
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePromotionData> }) =>
      promotionsApi.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.admin() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
    },
  });
};

// Admin: Toggle promotion mutation
export const useTogglePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsApi.togglePromotion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.admin() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
    },
  });
};

// Admin: Delete promotion mutation
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsApi.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.admin() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.active() });
    },
  });
};

// Admin: Get promotion stats
export const usePromotionStats = (id: string) => {
  return useQuery({
    queryKey: [...promotionKeys.detail(id), 'stats'],
    queryFn: () => promotionsApi.getPromotionStats(id),
    enabled: !!id,
  });
};


