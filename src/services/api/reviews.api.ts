import apiClient from '@/lib/axios';

// Types
export interface Review {
  id: string;
  _id?: string;
  orderId: string | { _id?: string; id?: string }; // Backend may populate
  userId: string | { _id?: string; name?: string; email?: string }; // Backend may populate
  storeId: string | { _id?: string; storeName?: string }; // Backend may populate
  storeRating: number;
  storeComment?: string;
  itemRatings?: ItemRating[];
  deliveryRating?: number;
  deliveryComment?: string;
  status: 'active' | 'reported' | 'hidden' | 'deleted';
  storeResponse?: {
    response: string;
    respondedAt: string | Date;
    respondedBy?: string | { _id?: string; name?: string }; // Backend may populate
  };
  helpfulCount?: number; // Backend may not always include
  helpfulUsers?: string[]; // Backend tracks helpful users
  reportedBy?: Array<{
    userId: string | { _id?: string; name?: string };
    reason: 'spam' | 'fake' | 'inappropriate' | 'other';
    reportedAt: string | Date;
  }>;
  moderatedBy?: string | { _id?: string; name?: string }; // Backend may populate
  moderationNotes?: string; // Backend has moderationNotes
  editableUntil?: string | Date; // Backend calculates editableUntil
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ItemRating {
  menuItemId: string;
  itemName: string;
  rating: number;
  comment?: string;
}

export interface CreateReviewData {
  orderId: string;
  storeRating: number;
  storeComment?: string;
  itemRatings?: ItemRating[];
  deliveryRating?: number;
  deliveryComment?: string;
}

export interface UpdateReviewData {
  storeRating?: number;
  storeComment?: string;
  itemRatings?: ItemRating[];
  deliveryRating?: number;
  deliveryComment?: string;
}

export interface StoreResponseData {
  response: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Reviews API
export const reviewsApi = {
  // Get reviews for a store
  getStoreReviews: async (
    storeId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    }
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      `/reviews/store/${storeId}`,
      { params }
    );
    return response.data;
  },

  // Create review (customer only)
  createReview: async (data: CreateReviewData): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post<ApiResponse<Review>>('/reviews', data);
    return response.data;
  },

  // Update review (within 24 hours)
  updateReview: async (id: string, data: UpdateReviewData): Promise<ApiResponse<Review>> => {
    const response = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}`, data);
    return response.data;
  },

  // Get user's reviews
  getMyReviews: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>('/reviews/customer/my-reviews', {
      params,
    });
    return response.data;
  },

  // Add store response to review
  addStoreResponse: async (id: string, data: StoreResponseData): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post<ApiResponse<Review>>(`/reviews/${id}/response`, data);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (id: string): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post<ApiResponse<Review>>(`/reviews/${id}/helpful`);
    return response.data;
  },

  // Report review
  reportReview: async (id: string, reason: 'spam' | 'fake' | 'inappropriate' | 'other'): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/reviews/${id}/report`, { reason });
    return response.data;
  },

  // Admin: Get all reviews
  getAllReviews: async (params?: {
    status?: string;
    storeId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>('/reviews/admin/all', {
      params,
    });
    return response.data;
  },

  // Admin: Moderate review
  moderateReview: async (
    id: string,
    data: { status: 'active' | 'reported' | 'hidden' | 'deleted'; moderationNotes?: string }
  ): Promise<ApiResponse<Review>> => {
    const response = await apiClient.patch<ApiResponse<Review>>(`/reviews/admin/${id}/moderate`, data);
    return response.data;
  },
};

