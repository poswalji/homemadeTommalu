import apiClient from '@/lib/axios';

export type InventoryCategory =
  | 'packaging'
  | 'raw_grocery'
  | 'spices_oil'
  | 'dairy_perishables'
  | 'tiffin_boxes'
  | 'cleaning_other';

export interface InventoryLogItem {
  _id?: string;
  type: 'restock' | 'usage' | 'wastage' | 'correction';
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  cost?: number;
  note?: string;
  createdAt: string;
}

export interface InventoryItemData {
  _id: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  notes?: string;
  supplier?: {
    name?: string;
    contact?: string;
  };
  lastRestockedAt?: string;
  recentLogs?: InventoryLogItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryOverviewStats {
  totalItemsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  estimatedTotalValue: number;
  packagingItemsCount: number;
  groceryItemsCount: number;
  costPerThali?: number;
}

export interface CostBenchmarkItem {
  name: string;
  spec: string;
  costPer50: number;
  costPerMeal: number;
  unit?: string;
  dailyQtyFor50?: string;
}

export interface RevenueStreamDetails {
  subscriberMeals: number;
  subscriberRevenue: number;
  avgSubscriberPerMealRate: number;
  subscriberCostEstimate: number;
  subscriberNetProfit: number;
  subscriberMarginPercent: number;

  onDemandMeals: number;
  onDemandRevenue: number;
  avgOnDemandPerMealRate: number;
  onDemandCostEstimate: number;
  onDemandNetProfit: number;
  onDemandMarginPercent: number;

  totalMeals: number;
  blendedTotalRevenue: number;
  blendedEffectivePerMealRate: number;
  kitchenProductionCost: number;
  costPerThali: number;
  trueNetProfit: number;
  trueProfitMarginPercent: number;
  monthlyProjectedProfit: number;

  naiveRevenueAt99?: number;
  naiveProfitAt99?: number;
  profitAdjustmentDueToSubscriptions?: number;
}

export interface CostBenchmarks {
  baseOrdersCount: number;
  benchmarkSellingPrice: number;
  rawMaterials: CostBenchmarkItem[];
  operationalExpenses: CostBenchmarkItem[];
  totals: {
    rawMaterialTotal50: number;
    operationalTotal50: number;
    grandTotalCost50: number;
    costPerMeal: number;
    rawMaterialPerMeal: number;
    operationalPerMeal: number;
    benchmarkRevenue50: number;
    benchmarkNetProfit50: number;
    profitMarginPercent: number;
    blendedRevenue50?: number;
    blendedNetProfit50?: number;
    blendedMarginPercent?: number;
    fixedSubMealRate?: number;
    onDemandMealRate?: number;
  };
  revenueBreakdown?: RevenueStreamDetails;
}

export interface KitchenDemandForecast {
  todayMealsTotal: number;
  lunchCount: number;
  dinnerCount: number;
  subscriberMealsTotal?: number;
  onDemandMealsTotal?: number;
  activeSubscribers: number;
  revenueBreakdown?: RevenueStreamDetails;
  costSummary?: {
    estimatedTodayRawCost: number;
    estimatedTodayOperationsCost: number;
    estimatedTodayTotalCost: number;
    estimatedTodayRevenue: number;
    estimatedTodayProfit: number;
    costPerThali: number;
    linearCostPerThali?: number;
    blendedEffectiveRate?: number;
  };
  estimatedMaterials: {
    wheatAttaKg: string;
    riceKg: string;
    dalKg: string;
    vegetablesKg?: string;
    vegetablesExpense?: number;
    cookingOilLiters: string;
    packagingTraysPcs: number;
    packagingExpense?: number;
    cutleryKitsPcs?: number;
  };
}

export interface InventoryOverviewResponse {
  success: boolean;
  data: {
    stats: InventoryOverviewStats;
    lowStockList: Array<{
      id: string;
      name: string;
      category: string;
      currentStock: number;
      minThreshold: number;
      unit: string;
    }>;
    demandForecast: KitchenDemandForecast;
    costBenchmarks?: CostBenchmarks;
    items: InventoryItemData[];
  };
}

export interface UnifiedDishItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  inStock: boolean;
  stockQuantity: number | string;
  foodType: string;
  sourceType: 'regular_menu' | 'homemade_special';
  isTodaysSpecial?: boolean;
}

export const inventoryApi = {
  // 1. Get Inventory Overview & Items
  getOverview: async (params?: { category?: string; search?: string; lowStockOnly?: boolean }) => {
    const response = await apiClient.get<InventoryOverviewResponse>('/inventory', { params });
    return response.data;
  },

  // 2. Add New Inventory Item
  createItem: async (data: {
    name: string;
    category: InventoryCategory;
    currentStock: number;
    unit: string;
    minThreshold: number;
    costPerUnit?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/inventory', data);
    return response.data;
  },

  // 3. Update Existing Item
  updateItem: async (
    id: string,
    data: Partial<{
      name: string;
      category: InventoryCategory;
      unit: string;
      minThreshold: number;
      costPerUnit: number;
      notes: string;
    }>
  ) => {
    const response = await apiClient.put(`/inventory/${id}`, data);
    return response.data;
  },

  // 4. Quick Stock Adjustment (+ Restock or - Deduct Usage)
  adjustStock: async (
    id: string,
    payload: {
      quantity: number;
      type: 'restock' | 'usage' | 'wastage' | 'correction';
      note?: string;
      totalCost?: number;
    }
  ) => {
    const response = await apiClient.post(`/inventory/${id}/adjust`, payload);
    return response.data;
  },

  // 5. Delete Item
  deleteItem: async (id: string) => {
    const response = await apiClient.delete(`/inventory/${id}`);
    return response.data;
  },

  // 6. Get Menu Items & Homemade Dishes for live stock
  getDishes: async () => {
    const response = await apiClient.get<{
      success: boolean;
      totalDishes: number;
      inStockCount: number;
      outOfStockCount: number;
      dishes: UnifiedDishItem[];
    }>('/inventory/dishes');
    return response.data;
  },

  // 7. Toggle Dish Availability (1-Click In-Stock vs Sold-Out)
  toggleDish: async (payload: { dishId: string; sourceType: string; isAvailable: boolean }) => {
    const response = await apiClient.post('/inventory/dishes/toggle', payload);
    return response.data;
  },
};
