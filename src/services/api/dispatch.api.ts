import apiClient from '@/lib/axios';

export interface UnifiedDeliveryItem {
  id: string;
  deliveryId: string;
  orderNumber: string;
  deliveryType: 'daily' | 'tiffin';
  displayType: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    landmark?: string;
    city: string;
    pincode: string;
    locationLink?: string;
  };
  area: string;
  timeSlot: 'lunch' | 'dinner' | 'any';
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  assignedTo: string | null;
  riderName: string | null;
  riderPhone: string | null;
  status: string;
  rawStatus: string;
  items: Array<{ name: string; quantity: number; price?: number }>;
  quantity: number;
  rotiPreference?: string;
  specialInstructions: string;
  createdAt: string;
  deliveryDate: string;
  failureReason?: string;
  deliverySequence?: number;
  sourceModel: 'Order' | 'HomemadeFoodOrder' | 'DailyDelivery';
}

export interface DispatchStatistics {
  totalToday: number;
  unassignedToday: number;
  assignedToday: number;
  outForDeliveryToday: number;
  deliveredToday: number;
  failedToday: number;
  activeRidersCount: number;
  dailyOrdersCount: number;
  tiffinDeliveriesCount: number;
  selectedDate: string;
}

export interface AreaClusterItem {
  _id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  deliveryLocations: string[];
  pincodes: string[];
  description: string;
  statistics: {
    totalDeliveries: number;
    unassignedDeliveries: number;
    assignedDeliveries: number;
    deliveredCount: number;
    assignedRidersCount: number;
  };
}

export interface RiderPerformanceItem {
  riderId: string;
  name: string;
  phone: string;
  isActive: boolean;
  performance: {
    totalAssigned: number;
    delivered: number;
    outForDelivery: number;
    pending: number;
    failed: number;
    completionPercentage: number;
    areaBreakdown: Record<string, number>;
  };
}

export const dispatchApi = {
  // 1. Unified Dispatch List
  getUnifiedDispatch: async (params?: {
    date?: string;
    type?: string;
    area?: string;
    slot?: string;
    assigned?: string;
    riderId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/delivery-boys/dispatch/unified', { params });
    return response.data;
  },

  // 2. Bulk Assignment
  bulkAssign: async (payload: {
    deliveryBoyId: string;
    deliveries: Array<{ id: string; type?: string; sourceModel?: string }>;
    confirmReassign?: boolean;
  }) => {
    const response = await apiClient.post('/delivery-boys/dispatch/assign', payload);
    return response.data;
  },

  // 3. Bulk Unassignment
  bulkUnassign: async (deliveries: Array<{ id: string; type?: string; sourceModel?: string }>) => {
    const response = await apiClient.post('/delivery-boys/dispatch/unassign', { deliveries });
    return response.data;
  },

  // 4. Manual Area Assignment
  assignArea: async (payload: { id: string; sourceModel: string; area: string }) => {
    const response = await apiClient.post('/delivery-boys/dispatch/assign-area', payload);
    return response.data;
  },

  // 5. Trigger Tiffin Delivery Generation
  triggerTiffinGeneration: async (date?: string) => {
    const response = await apiClient.post('/delivery-boys/dispatch/generate-tiffin-deliveries', { date });
    return response.data;
  },

  // 5b. Update Delivery Stop Sequence (Admin ordering stops)
  updateDeliverySequence: async (sequences: Array<{
    id: string;
    sourceModel: 'Order' | 'HomemadeFoodOrder' | 'DailyDelivery';
    deliverySequence: number;
  }>) => {
    const response = await apiClient.patch('/delivery-boys/dispatch/update-sequence', { sequences });
    return response.data;
  },

  // 6. Area Cluster Management
  getAreas: async () => {
    const response = await apiClient.get('/delivery-boys/areas');
    return response.data;
  },

  createArea: async (data: {
    name: string;
    displayName?: string;
    deliveryLocations?: string[];
    pincodes?: string[];
    description?: string;
    isActive?: boolean;
  }) => {
    const response = await apiClient.post('/delivery-boys/areas', data);
    return response.data;
  },

  updateArea: async (id: string, data: Partial<{
    name: string;
    displayName: string;
    deliveryLocations: string[];
    pincodes: string[];
    description: string;
    isActive: boolean;
  }>) => {
    const response = await apiClient.put(`/delivery-boys/areas/${id}`, data);
    return response.data;
  },

  deleteArea: async (id: string) => {
    const response = await apiClient.delete(`/delivery-boys/areas/${id}`);
    return response.data;
  },

  // 7. Rider Performance
  getRiderPerformance: async (date?: string) => {
    const response = await apiClient.get('/delivery-boys/performance', { params: { date } });
    return response.data;
  }
};
