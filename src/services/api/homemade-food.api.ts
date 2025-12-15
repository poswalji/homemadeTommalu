import apiClient from '@/lib/axios';

// Types
export interface HomemadeFood {
    _id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    features: string[];
    isActive: boolean;
    isTodaysSpecial: boolean;
    availableQuantity: number;
    servingSize: string;
    preparationTime: string;
    cuisine: string;
    tags: string[];
    nutritionInfo?: {
        calories?: number;
        protein?: string;
        carbs?: string;
        fat?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface HomemadeFoodOrder {
    _id: string;
    orderNumber: string;
    customerName: string;
    mobileNumber: string;
    email?: string;
    userId?: string;
    deliveryAddress: {
        street: string;
        landmark?: string;
        city: string;
        state?: string;
        pincode: string;
    };
    foodItem: string | HomemadeFood;
    foodName: string;
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
    deliveryCharge: number;
    finalAmount: number;
    status: HomemadeFoodOrderStatus;
    paymentMethod: 'cash_on_delivery' | 'online' | 'upi';
    paymentStatus: 'pending' | 'received' | 'failed' | 'refunded';
    paymentId?: string;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
    adminNotes?: string;
    cancellationReason?: string;
    refundDetails?: {
        amount?: number;
        reason?: string;
        processedAt?: string;
        transactionId?: string;
    };
    specialInstructions?: string;
    preferredDeliverySlot: 'morning' | 'afternoon' | 'evening' | 'any';
    createdAt: string;
    updatedAt: string;
}

export type HomemadeFoodOrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'refund_initiated'
    | 'refund_completed'
    | 'payment_pending'
    | 'payment_received'
    | 'payment_failed';

export interface SubmitOrderData {
    customerName: string;
    mobileNumber: string;
    email?: string;
    street: string;
    landmark?: string;
    city: string;
    state?: string;
    pincode: string;
    foodItemId: string;
    quantity: number;
    specialInstructions?: string;
    preferredDeliverySlot?: string;
    paymentMethod?: string;
}

export interface CreateHomemadeFoodData {
    name: string;
    description: string;
    image: string;
    price: number;
    features?: string[];
    isActive?: boolean;
    isTodaysSpecial?: boolean;
    availableQuantity?: number;
    servingSize?: string;
    preparationTime?: string;
    cuisine?: string;
    tags?: string[];
}

export interface UpdateOrderStatusData {
    status: HomemadeFoodOrderStatus;
    adminNotes?: string;
    cancellationReason?: string;
    refundDetails?: {
        amount?: number;
        reason?: string;
        processedAt?: string;
        transactionId?: string;
    };
    estimatedDeliveryTime?: string;
}

export interface HomemadeFoodAnalytics {
    summary: {
        totalOrders: number;
        totalRevenue: number;
        avgOrderValue: number;
        totalDelivered: number;
        totalCancelled: number;
        totalPending: number;
        totalQuantitySold: number;
    };
    statusBreakdown: Array<{
        _id: string;
        count: number;
        revenue: number;
    }>;
    dailyRevenue: Array<{
        _id: string;
        revenue: number;
        orders: number;
    }>;
    popularItems: Array<{
        _id: string;
        totalOrders: number;
        totalQuantity: number;
        totalRevenue: number;
        foodName: string;
    }>;
}

// API Response types
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// ============================================
// PUBLIC API
// ============================================

export const homemadeFoodPublicApi = {
    // Get today's special
    getTodaysSpecial: async (): Promise<ApiResponse<HomemadeFood | null>> => {
        const response = await apiClient.get<ApiResponse<HomemadeFood | null>>('/public/homemade-food/todays-special');
        return response.data;
    },

    // Get all active homemade foods
    getActiveHomemadeFoods: async (): Promise<ApiResponse<HomemadeFood[]> & { total: number }> => {
        const response = await apiClient.get<ApiResponse<HomemadeFood[]> & { total: number }>('/public/homemade-food');
        return response.data;
    },

    // Submit order (no auth required)
    submitOrder: async (data: SubmitOrderData): Promise<ApiResponse<HomemadeFoodOrder>> => {
        const response = await apiClient.post<ApiResponse<HomemadeFoodOrder>>('/public/homemade-food/order', data);
        return response.data;
    },

    // Track order
    trackOrder: async (orderNumber: string, mobileNumber: string): Promise<ApiResponse<HomemadeFoodOrder>> => {
        const response = await apiClient.get<ApiResponse<HomemadeFoodOrder>>('/public/homemade-food/order/track', {
            params: { orderNumber, mobileNumber }
        });
        return response.data;
    }
};

// ============================================
// ADMIN API
// ============================================

export const homemadeFoodAdminApi = {
    // Get all food items (admin)
    getAllHomemadeFoods: async (params?: {
        isActive?: boolean;
        isTodaysSpecial?: boolean;
    }): Promise<ApiResponse<HomemadeFood[]> & { total: number }> => {
        const response = await apiClient.get<ApiResponse<HomemadeFood[]> & { total: number }>('/admin/homemade-food', { params });
        return response.data;
    },

    // Create food item
    createHomemadeFood: async (data: CreateHomemadeFoodData): Promise<ApiResponse<HomemadeFood>> => {
        const response = await apiClient.post<ApiResponse<HomemadeFood>>('/admin/homemade-food', data);
        return response.data;
    },

    // Update food item
    updateHomemadeFood: async (id: string, data: Partial<CreateHomemadeFoodData>): Promise<ApiResponse<HomemadeFood>> => {
        const response = await apiClient.put<ApiResponse<HomemadeFood>>(`/admin/homemade-food/${id}`, data);
        return response.data;
    },

    // Delete food item
    deleteHomemadeFood: async (id: string): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(`/admin/homemade-food/${id}`);
        return response.data;
    },

    // Set today's special
    setTodaysSpecial: async (id: string): Promise<ApiResponse<HomemadeFood>> => {
        const response = await apiClient.patch<ApiResponse<HomemadeFood>>(`/admin/homemade-food/${id}/set-todays-special`);
        return response.data;
    },

    // Get all orders
    getAllOrders: async (params?: {
        status?: string;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
    }): Promise<PaginatedResponse<HomemadeFoodOrder>> => {
        const response = await apiClient.get<PaginatedResponse<HomemadeFoodOrder>>('/admin/homemade-food/orders', { params });
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id: string): Promise<ApiResponse<HomemadeFoodOrder>> => {
        const response = await apiClient.get<ApiResponse<HomemadeFoodOrder>>(`/admin/homemade-food/orders/${id}`);
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (id: string, data: UpdateOrderStatusData): Promise<ApiResponse<HomemadeFoodOrder>> => {
        const response = await apiClient.patch<ApiResponse<HomemadeFoodOrder>>(`/admin/homemade-food/orders/${id}/status`, data);
        return response.data;
    },

    // Update payment status
    updatePaymentStatus: async (id: string, data: { paymentStatus: string; paymentId?: string }): Promise<ApiResponse<HomemadeFoodOrder>> => {
        const response = await apiClient.patch<ApiResponse<HomemadeFoodOrder>>(`/admin/homemade-food/orders/${id}/payment`, data);
        return response.data;
    },

    // Get analytics
    getAnalytics: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<HomemadeFoodAnalytics>> => {
        const response = await apiClient.get<ApiResponse<HomemadeFoodAnalytics>>('/admin/homemade-food/analytics', { params });
        return response.data;
    },

    // Export orders
    exportOrders: async (params?: {
        startDate?: string;
        endDate?: string;
        status?: string;
        format?: 'json' | 'csv';
    }): Promise<ApiResponse<HomemadeFoodOrder[]> & { total: number }> => {
        const response = await apiClient.get<ApiResponse<HomemadeFoodOrder[]> & { total: number }>('/admin/homemade-food/orders/export', { params });
        return response.data;
    }
};
