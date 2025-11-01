import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disputesApi, type CreateDisputeData, type ResolveDisputeData } from '@/services/api/disputes.api';

// Query keys
export const disputeKeys = {
  all: ['disputes'] as const,
  user: () => [...disputeKeys.all, 'user'] as const,
  store: () => [...disputeKeys.all, 'store'] as const,
  admin: () => [...disputeKeys.all, 'admin'] as const,
  detail: (id: string) => [...disputeKeys.all, id] as const,
};

// Customer: Get my disputes
export const useMyDisputes = (params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...disputeKeys.user(), params],
    queryFn: () => disputesApi.getMyDisputes(params),
  });
};

// Store Owner: Get store disputes
export const useStoreDisputes = (params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...disputeKeys.store(), params],
    queryFn: () => disputesApi.getStoreDisputes(params),
  });
};

// Get dispute by ID
export const useDisputeById = (id: string) => {
  return useQuery({
    queryKey: disputeKeys.detail(id),
    queryFn: () => disputesApi.getDisputeById(id),
    enabled: !!id,
  });
};

// Create dispute mutation
export const useCreateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisputeData) => disputesApi.createDispute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.user() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.admin() });
    },
  });
};

// Admin: Get all disputes
export const useAllDisputes = (params?: {
  status?: string;
  priority?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...disputeKeys.admin(), params],
    queryFn: () => disputesApi.getAllDisputes(params),
  });
};

// Admin: Resolve dispute mutation
export const useResolveDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveDisputeData }) =>
      disputesApi.resolveDispute(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.admin() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.user() });
      queryClient.invalidateQueries({ queryKey: disputeKeys.store() });
    },
  });
};

// Admin: Escalate dispute mutation
export const useEscalateDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      disputesApi.escalateDispute(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.admin() });
    },
  });
};

// Admin: Close dispute mutation
export const useCloseDispute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      disputesApi.closeDispute(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: disputeKeys.admin() });
    },
  });
};


