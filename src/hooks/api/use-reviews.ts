import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, type CreateReviewData, type UpdateReviewData, type StoreResponseData } from '@/services/api/reviews.api';
import { reviewKeys, ordersKeys } from '@/config/query.config';

// Get store reviews
export const useStoreReviews = (storeId: string, params?: {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}) => {
  return useQuery({
    queryKey: [...reviewKeys.store(storeId), params],
    queryFn: () => reviewsApi.getStoreReviews(storeId, params),
    enabled: !!storeId,
  });
};

// Get user reviews
export const useMyReviews = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...reviewKeys.user(), params],
    queryFn: () => reviewsApi.getMyReviews(params),
  });
};

// Create review mutation
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsApi.createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.store(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.user() });
      // Invalidate orders to update review status
      queryClient.invalidateQueries({ queryKey: ordersKeys.my() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(variables.orderId) });
    },
  });
};

// Update review mutation
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewData }) =>
      reviewsApi.updateReview(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.user() });
    },
  });
};

// Add store response mutation
export const useAddStoreResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StoreResponseData }) =>
      reviewsApi.addStoreResponse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.id) });
    },
  });
};

// Mark helpful mutation
export const useMarkHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.markHelpful(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(id) });
    },
  });
};

// Report review mutation
export const useReportReview = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: 'spam' | 'fake' | 'inappropriate' | 'other' }) =>
      reviewsApi.reportReview(id, reason),
  });
};

// Admin: Get all reviews
export const useAllReviews = (params?: {
  status?: string;
  storeId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...reviewKeys.admin(), params],
    queryFn: () => reviewsApi.getAllReviews(params),
  });
};

// Admin: Moderate review mutation
export const useModerateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: { status: 'active' | 'reported' | 'hidden' | 'deleted'; moderationNotes?: string };
    }) => reviewsApi.moderateReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.admin() });
    },
  });
};



