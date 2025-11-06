import apiClient from '@/lib/axios';

// Types
export type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'OutForDelivery' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Rejected';

export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface DeliveryAddress {
  label?: AddressLabel;
  street: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
}

export interface OrderItem {
  menuItemId?: string;
  menuId?: string;
  itemName?: string;
  quantity?: number;
  itemPrice?: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  discount?: number;
  promoCode?: string;
  finalPrice: number;
  deliveryAddress: DeliveryAddress;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  discount?: number;
  promoCode?: string;
  finalPrice: number;
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  cancellationReason?: string;
  customerName?: string;
  customerEmail?: string;
  storeName?: string;
  storeEmail?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  total?: number;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrdersQueryParams {
  status?: OrderStatus;
}

// Orders API Service
export const ordersApi = {
  // Create an order (customer)
  createOrder: async (data: CreateOrderData): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/orders', data);
    return response.data;
  },

  // Get authenticated customer's order history
  getMyOrders: async (): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>('/orders');
    return response.data;
  },

  // Get order details (authorized roles)
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  // Update order status (admin or delivery)
  updateOrderStatus: async (id: string, data: UpdateOrderStatusData): Promise<OrderResponse> => {
    const response = await apiClient.put<OrderResponse>(`/orders/${id}/status`, data);
    return response.data;
  },

  // List all orders (admin)
  getAllOrders: async (params?: OrdersQueryParams): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>('/orders/admin', { params });
    return response.data;
  },

  // Cancel order (customer)
  cancelOrder: async (id: string, cancellationReason?: string): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>(`/orders/${id}/cancel`, {
      cancellationReason,
    });
    return response.data;
  },

  // Get public order tracking (no auth required)
  getOrderPublic: async (id: string): Promise<OrderResponse> => {
    const response = await apiClient.get<OrderResponse>(`/public/orders/${id}`);
    return response.data;
  },

  // Create order from cart (customer)
  createOrderFromCart: async (data: {
    deliveryAddress: DeliveryAddress;
    paymentMethod?: string;
  }): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/customer/orders/from-cart', data);
    return response.data;
  },
};






