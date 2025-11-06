import { useQuery } from '@tanstack/react-query';
import {
  publicApi,
  type StoresQueryParams,
  type StoreSearchParams,
} from '@/services/api/public.api';
import { publicKeys } from '@/config/query.config';

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
    queryKey: publicKeys.stats(),
    queryFn: () => publicApi.getStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes - stats don't change frequently
    refetchOnWindowFocus: false,
  });
};

// Get all products
export const useProducts = (params?: {
  category?: string;
  foodType?: string;
  storeId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: publicKeys.products(params),
    queryFn: () => publicApi.getProducts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: publicKeys.categories(),
    queryFn: () => publicApi.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};






