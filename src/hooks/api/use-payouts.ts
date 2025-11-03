import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payoutsApi, type RequestEarlyPayoutData } from '@/services/api/payouts.api';

// Query keys
export const payoutKeys = {
  all: ['payouts'] as const,
  storeOwner: () => [...payoutKeys.all, 'storeOwner'] as const,
  admin: () => [...payoutKeys.all, 'admin'] as const,
  detail: (id: string) => [...payoutKeys.all, id] as const,
  earnings: () => [...payoutKeys.all, 'earnings'] as const,
};

// Store Owner: Get my payouts
export const useMyPayouts = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...payoutKeys.storeOwner(), params],
    queryFn: () => payoutsApi.getMyPayouts(params),
  });
};

// Store Owner: Get payout by ID
export const usePayoutById = (id: string) => {
  return useQuery({
    queryKey: payoutKeys.detail(id),
    queryFn: () => payoutsApi.getPayoutById(id),
    enabled: !!id,
  });
};

// Store Owner: Request early payout mutation
export const useRequestEarlyPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestEarlyPayoutData) => payoutsApi.requestEarlyPayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.storeOwner() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
    },
  });
};

// Store Owner: Get earnings statement
export const useEarningsStatement = (params?: {
  storeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...payoutKeys.earnings(), params],
    queryFn: () => payoutsApi.getEarningsStatement(params),
  });
};

// Store Owner: Download statement
export const useDownloadStatement = () => {
  return useMutation({
    mutationFn: (params?: {
      storeId?: string;
      startDate?: string;
      endDate?: string;
    }) => payoutsApi.downloadStatement(params),
  });
};

// Admin: Get all payouts
export const useAllPayouts = (params?: {
  status?: string;
  storeId?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...payoutKeys.admin(), params],
    queryFn: () => payoutsApi.getAllPayouts(params),
  });
};

// Admin: Get payout by ID
export const usePayoutByIdAdmin = (id: string) => {
  return useQuery({
    queryKey: payoutKeys.detail(id),
    queryFn: () => payoutsApi.getPayoutByIdAdmin(id),
    enabled: !!id,
  });
};

// Admin: Generate payout mutation
export const useGeneratePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      storeId: string;
      periodStart: string;
      periodEnd: string;
    }) => payoutsApi.generatePayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.storeOwner() });
    },
  });
};

// Admin: Approve payout mutation
export const useApprovePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payoutsApi.approvePayout(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.storeOwner() });
    },
  });
};

// Admin: Complete payout mutation
export const useCompletePayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: { transferId: string; transferResponse?: any };
    }) => payoutsApi.completePayout(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.storeOwner() });
    },
  });
};



