import { useQuery } from '@tanstack/react-query';
import {
  publicApi,
  type StoresQueryParams,
  type StoreSearchParams,
} from '@/services/api/public.api';

// Query keys
export const publicKeys = {
  all: ['public'] as const,
  stores: (params?: StoresQueryParams) => [...publicKeys.all, 'stores', params] as const,
  storeMenu: (storeId: string) => [...publicKeys.all, 'menu', storeId] as const,
  search: (params?: StoreSearchParams) => [...publicKeys.all, 'search', params] as const,
};

// Get stores
export const useStores = (params?: StoresQueryParams) => {
  return useQuery({
    queryKey: publicKeys.stores(params),
    queryFn: () => publicApi.getStores(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get store menu
export const useStoreMenu = (storeId: string, enabled = true) => {
  return useQuery({
    queryKey: publicKeys.storeMenu(storeId),
    queryFn: () => publicApi.getStoreMenu(storeId),
    enabled: enabled && !!storeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Search stores
export const useSearchStores = (params?: StoreSearchParams, enabled = true) => {
  return useQuery({
    queryKey: publicKeys.search(params),
    queryFn: () => publicApi.searchStores(params),
    enabled: enabled && !!params?.q,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get public stats
export const usePublicStats = () => {
  return useQuery({
    queryKey: [...publicKeys.all, 'stats'],
    queryFn: () => publicApi.getStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes - stats don't change frequently
    refetchOnWindowFocus: false,
  });
};


