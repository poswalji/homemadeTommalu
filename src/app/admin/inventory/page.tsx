'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Package,
  UtensilsCrossed,
  Calculator,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  ShoppingBag,
  History,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  TrendingUp,
  Coins,
  Flame,
  Fuel,
  FileText,
  Scale,
  DollarSign,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  inventoryApi,
  InventoryItemData,
  InventoryCategory,
  UnifiedDishItem,
  KitchenDemandForecast,
  CostBenchmarks,
} from '@/services/api/inventory.api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

// User's Real Master Costing Benchmark for 50 Orders
const fallbackBenchmarks: CostBenchmarks = {
  baseOrdersCount: 50,
  benchmarkSellingPrice: 99,
  rawMaterials: [
    { name: 'Aata (Wheat Flour)', spec: '50 kg / 3 days (16.67 kg/day)', costPer50: 580, costPerMeal: 11.60, unit: 'kg', dailyQtyFor50: '16.67 kg' },
    { name: 'Cooking Oil (Tel)', spec: '15 kg / 10 days (₹2,500 / tin)', costPer50: 250, costPerMeal: 5.00, unit: 'liters', dailyQtyFor50: '1.50 L' },
    { name: 'Namak (Salt)', spec: 'Daily Cooking', costPer50: 5, costPerMeal: 0.10, unit: 'kg', dailyQtyFor50: '500 g' },
    { name: 'Mirch (Red Chilli Powder)', spec: 'Seasoning & Tadka', costPer50: 54, costPerMeal: 1.08, unit: 'grams', dailyQtyFor50: '250 g' },
    { name: 'Haldi (Turmeric)', spec: 'Daily Spices', costPer50: 15, costPerMeal: 0.30, unit: 'grams', dailyQtyFor50: '100 g' },
    { name: 'Hing / Masale', spec: 'Aromatic Garam Masale', costPer50: 16, costPerMeal: 0.32, unit: 'grams', dailyQtyFor50: '50 g' },
    { name: 'Saunf (Fennel Seeds)', spec: 'Tadka & Flavoring', costPer50: 16, costPerMeal: 0.32, unit: 'grams', dailyQtyFor50: '100 g' },
    { name: 'Jeera (Cumin Seeds)', spec: 'Tempering & Tadka', costPer50: 6.17, costPerMeal: 0.123, unit: 'grams', dailyQtyFor50: '100 g' },
    { name: 'Kali Mirch', spec: 'Crushed Peppercorns', costPer50: 0, costPerMeal: 0, unit: 'grams', dailyQtyFor50: 'Buffer' },
    { name: 'Kasuri Methi', spec: 'Aroma & Gravy', costPer50: 6.25, costPerMeal: 0.125, unit: 'grams', dailyQtyFor50: '50 g' },
    { name: 'Lahsun (Garlic)', spec: 'Tadka & Chutney', costPer50: 10, costPerMeal: 0.20, unit: 'grams', dailyQtyFor50: '200 g' },
    { name: 'Hari Mirch (Green Chilli)', spec: 'Fresh Chillies', costPer50: 5, costPerMeal: 0.10, unit: 'kg', dailyQtyFor50: '250 g' },
    { name: 'Pyaj (Onion)', spec: 'Daily Gravy & Salad', costPer50: 70, costPerMeal: 1.40, unit: 'kg', dailyQtyFor50: '2.50 kg' },
    { name: 'Dal (Daily Pulses)', spec: 'Toor / Moong Daily Dal', costPer50: 135, costPerMeal: 2.70, unit: 'kg', dailyQtyFor50: '1.50 kg' },
    { name: 'Chawal (Rice)', spec: 'Steamed / Basmati Grains', costPer50: 120, costPerMeal: 2.40, unit: 'kg', dailyQtyFor50: '3.00 kg' }
  ],
  operationalExpenses: [
    { name: 'Main Sabji (Fresh Veggies)', spec: 'Seasonal Daily Sabzi Basket', costPer50: 300, costPerMeal: 6.00, dailyQtyFor50: '50 portions' },
    { name: 'Cooking Gas (Commercial LPG)', spec: 'Burners & Tandoor Flame', costPer50: 200, costPerMeal: 4.00, dailyQtyFor50: 'Daily LPG' },
    { name: 'Packing (Boxes, Trays, Foils)', spec: 'Meal Trays, Containers, Foils', costPer50: 188, costPerMeal: 3.76, dailyQtyFor50: '50 sets' },
    { name: 'Delivery Petrol (Rider Fuel)', spec: 'Rider Bike Conveyance', costPer50: 166.67, costPerMeal: 3.33, dailyQtyFor50: 'Daily Fuel' },
    { name: 'Hidden & Miscellaneous Cost', spec: 'Cleaning, Wastage, Kitchen Buffer', costPer50: 100, costPerMeal: 2.00, dailyQtyFor50: 'Contingency' }
  ],
  totals: {
    rawMaterialTotal50: 1288.42,
    operationalTotal50: 954.67,
    grandTotalCost50: 2243.09,
    costPerMeal: 44.86,
    rawMaterialPerMeal: 25.77,
    operationalPerMeal: 19.09,
    benchmarkRevenue50: 4950,
    benchmarkNetProfit50: 2706.91,
    profitMarginPercent: 54.7,
    blendedRevenue50: 4285,
    blendedNetProfit50: 2041.91,
    blendedMarginPercent: 47.7,
    fixedSubMealRate: 80,
    onDemandMealRate: 99
  },
  revenueBreakdown: {
    subscriberMeals: 35,
    subscriberRevenue: 2800,
    avgSubscriberPerMealRate: 80,
    subscriberCostEstimate: 1570,
    subscriberNetProfit: 1230,
    subscriberMarginPercent: 43.9,

    onDemandMeals: 15,
    onDemandRevenue: 1485,
    avgOnDemandPerMealRate: 99,
    onDemandCostEstimate: 673,
    onDemandNetProfit: 812,
    onDemandMarginPercent: 54.7,

    totalMeals: 50,
    blendedTotalRevenue: 4285,
    blendedEffectivePerMealRate: 85.70,
    kitchenProductionCost: 2243,
    costPerThali: 44.86,
    trueNetProfit: 2042,
    trueProfitMarginPercent: 47.7,
    monthlyProjectedProfit: 61260,
    naiveRevenueAt99: 4950,
    naiveProfitAt99: 2707,
    profitAdjustmentDueToSubscriptions: 665
  }
};

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<'supplies' | 'dishes' | 'estimator' | 'logs'>('supplies');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inventory items & stats state
  const [items, setItems] = useState<InventoryItemData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [demandForecast, setDemandForecast] = useState<KitchenDemandForecast | null>(null);
  const [costBenchmarks, setCostBenchmarks] = useState<CostBenchmarks | null>(null);
  const [dishes, setDishes] = useState<UnifiedDishItem[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);

  // 50-Orders Simulator & Pricing State
  const [simulatorMeals, setSimulatorMeals] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(99);
  const [costFilterTab, setCostFilterTab] = useState<'all' | 'grocery' | 'operations'>('all');
  const [scalingMode, setScalingMode] = useState<'economies_of_scale' | 'linear'>('economies_of_scale');

  // Dual-Stream Fixed Tiffins vs Daily Orders Simulator State
  const [pricingModel, setPricingModel] = useState<'dual_stream' | 'flat'>('dual_stream');
  const [simFixedCount, setSimFixedCount] = useState<number>(35);
  const [simFixedRate, setSimFixedRate] = useState<number>(80);
  const [simDailyCount, setSimDailyCount] = useState<number>(15);
  const [simDailyRate, setSimDailyRate] = useState<number>(99);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [dishStatusFilter, setDishStatusFilter] = useState<'all' | 'instock' | 'soldout'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemData | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItemData | null>(null);
  const [adjustType, setAdjustType] = useState<'restock' | 'usage' | 'wastage'>('restock');
  const [adjustQty, setAdjustQty] = useState<number | ''>('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustCost, setAdjustCost] = useState<number | ''>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for add/edit item
  const [formData, setFormData] = useState({
    name: '',
    category: 'packaging' as InventoryCategory,
    currentStock: 0,
    unit: 'pieces',
    minThreshold: 10,
    costPerUnit: 0,
    notes: '',
  });

  const fetchOverview = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await inventoryApi.getOverview({
        category: categoryFilter,
        search: searchQuery,
        lowStockOnly: lowStockOnly,
      });

      if (res.success && res.data) {
        setItems(res.data.items || []);
        setStats(res.data.stats || null);
        setDemandForecast(res.data.demandForecast || null);
        if (res.data.costBenchmarks) {
          setCostBenchmarks(res.data.costBenchmarks);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDishes = async () => {
    try {
      setDishesLoading(true);
      const res = await inventoryApi.getDishes();
      if (res.success && res.dishes) {
        setDishes(res.dishes);
      }
    } catch (err: any) {
      console.error('Failed to load menu dishes', err);
    } finally {
      setDishesLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [categoryFilter, lowStockOnly]);

  useEffect(() => {
    if (activeTab === 'dishes' && dishes.length === 0) {
      fetchDishes();
    }
  }, [activeTab]);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleOpenAddModal = (item?: InventoryItemData) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        currentStock: item.currentStock,
        unit: item.unit,
        minThreshold: item.minThreshold,
        costPerUnit: item.costPerUnit || 0,
        notes: item.notes || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'packaging',
        currentStock: 0,
        unit: 'pieces',
        minThreshold: 10,
        costPerUnit: 0,
        notes: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.unit) {
      alert('Please enter item name and unit');
      return;
    }

    try {
      setActionLoading(true);
      if (editingItem) {
        await inventoryApi.updateItem(editingItem._id, formData);
        showToast(`Updated "${formData.name}" successfully`);
      } else {
        await inventoryApi.createItem(formData);
        showToast(`Added "${formData.name}" to inventory`);
      }
      setIsAddModalOpen(false);
      fetchOverview(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error saving inventory item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAdjustModal = (item: InventoryItemData, type: 'restock' | 'usage') => {
    setAdjustingItem(item);
    setAdjustType(type);
    setAdjustQty('');
    setAdjustNote('');
    setAdjustCost('');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || !adjustQty || Number(adjustQty) <= 0) {
      alert('Please enter a valid quantity greater than 0');
      return;
    }

    try {
      setActionLoading(true);
      await inventoryApi.adjustStock(adjustingItem._id, {
        quantity: Number(adjustQty),
        type: adjustType,
        note: adjustNote,
        totalCost: adjustCost ? Number(adjustCost) : undefined,
      });

      showToast(`Stock updated for ${adjustingItem.name}`);
      setAdjustingItem(null);
      fetchOverview(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (item: InventoryItemData) => {
    if (!confirm(`Are you sure you want to remove "${item.name}" from active inventory tracking?`)) {
      return;
    }

    try {
      await inventoryApi.deleteItem(item._id);
      showToast(`Removed "${item.name}"`);
      fetchOverview(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleToggleDish = async (dish: UnifiedDishItem) => {
    const nextState = !dish.isAvailable;
    // Optimistic UI update
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: nextState, inStock: nextState } : d))
    );

    try {
      await inventoryApi.toggleDish({
        dishId: dish.id,
        sourceType: dish.sourceType,
        isAvailable: nextState,
      });
      showToast(`${dish.name} marked as ${nextState ? 'In Stock (Available)' : 'Sold Out'}`);
    } catch (err: any) {
      // Revert optimistic update
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: !nextState, inStock: !nextState } : d))
      );
      alert('Could not update dish availability. Please try again.');
    }
  };

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch =
        dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
        dish.category.toLowerCase().includes(dishSearchQuery.toLowerCase());

      const matchesStatus =
        dishStatusFilter === 'all'
          ? true
          : dishStatusFilter === 'instock'
          ? dish.isAvailable
          : !dish.isAvailable;

      return matchesSearch && matchesStatus;
    });
  }, [dishes, dishSearchQuery, dishStatusFilter]);

  // Aggregate recent logs across items
  const allRecentLogs = useMemo(() => {
    const logs: Array<{
      itemName: string;
      unit: string;
      log: any;
    }> = [];

    items.forEach((item) => {
      if (item.recentLogs && item.recentLogs.length > 0) {
        item.recentLogs.forEach((l) => {
          logs.push({
            itemName: item.name,
            unit: item.unit,
            log: l,
          });
        });
      }
    });

    return logs.sort((a, b) => new Date(b.log.createdAt).getTime() - new Date(a.log.createdAt).getTime());
  }, [items]);

  // Active Benchmarks & Dynamic Scale Calculation (Fixed vs Variable Cost Curve)
  const activeBenchmarks = costBenchmarks || fallbackBenchmarks;

  const sim = useMemo(() => {
    let n = 50;
    let rev = 0;
    let avgSp = 99;
    let subRevenue = 0;
    let dailyRevenue = 0;
    let subMeals = 0;
    let dailyMeals = 0;

    if (pricingModel === 'dual_stream') {
      subMeals = Math.max(0, Number(simFixedCount) || 0);
      dailyMeals = Math.max(0, Number(simDailyCount) || 0);
      n = Math.max(1, subMeals + dailyMeals);
      const subR = Math.max(1, Number(simFixedRate) || 80);
      const dailyR = Math.max(1, Number(simDailyRate) || 99);

      subRevenue = subMeals * subR;
      dailyRevenue = dailyMeals * dailyR;
      rev = subRevenue + dailyRevenue;
      avgSp = n > 0 ? rev / n : dailyR;
    } else {
      n = Math.max(1, Number(simulatorMeals) || 1);
      avgSp = Math.max(1, Number(sellingPrice) || 99);
      rev = n * avgSp;
      dailyMeals = n;
      dailyRevenue = rev;
    }

    let rawCost = 0;
    let opCost = 0;
    let gasCost = 0;
    let petrolCost = 0;
    let packingCost = 0;
    let sabziCost = 0;
    let hiddenCost = 0;

    if (scalingMode === 'economies_of_scale') {
      // Real-World Economies of Scale Physics:
      // Fixed & semi-fixed costs scale sub-linearly
      gasCost = 200 * Math.pow(n / 50, 0.48);       // Burners & tandoor baseline
      petrolCost = 166.67 * Math.pow(n / 50, 0.52); // Route density & delivery clusters
      packingCost = 188 * Math.pow(n / 50, 0.96);   // 1 box/meal with bulk box discount
      sabziCost = 300 * Math.pow(n / 50, 0.90);     // Mandi wholesale crate rates
      hiddenCost = 100 * Math.pow(n / 50, 0.45);    // Semi-fixed cleaning & overhead
      rawCost = 1288.42 * Math.pow(n / 50, 0.94);   // Bulk grain & spice batching
      opCost = gasCost + petrolCost + packingCost + sabziCost + hiddenCost;
    } else {
      // Linear multiplication model
      rawCost = n * 25.7684;
      opCost = n * 19.0934;
      gasCost = (200 / 50) * n;
      petrolCost = (166.67 / 50) * n;
      packingCost = (188 / 50) * n;
      sabziCost = (300 / 50) * n;
      hiddenCost = (100 / 50) * n;
    }

    const totalCost = rawCost + opCost;
    const costPerMeal = totalCost / n;
    const rawCostPerMeal = rawCost / n;
    const opCostPerMeal = opCost / n;
    const netProfit = rev - totalCost;
    const profitMargin = rev > 0 ? (netProfit / rev) * 100 : 0;

    // Linear reference for comparison
    const linearTotalCost = n * 44.8618;
    const linearSavings = linearTotalCost - totalCost;

    // Stream-level profit contributions
    const subCost = subMeals * costPerMeal;
    const subNetProfit = subRevenue - subCost;
    const subMargin = subRevenue > 0 ? (subNetProfit / subRevenue) * 100 : 0;

    const dailyCost = dailyMeals * costPerMeal;
    const dailyNetProfit = dailyRevenue - dailyCost;
    const dailyMargin = dailyRevenue > 0 ? (dailyNetProfit / dailyRevenue) * 100 : 0;

    // Itemized scaling for table:
    const rawScaleFactor = rawCost / 1288.42;
    const scaledRaw = activeBenchmarks.rawMaterials.map((item) => ({
      ...item,
      scaledCost: item.costPer50 * rawScaleFactor,
      scaledCostPerMeal: (item.costPer50 * rawScaleFactor) / n,
      scaledPortionQty: (
        n *
        (item.name.includes('Aata')
          ? 0.333
          : item.name.includes('Oil')
          ? 0.03
          : item.name.includes('Rice')
          ? 0.06
          : item.name.includes('Dal')
          ? 0.03
          : item.name.includes('Pyaj')
          ? 0.05
          : 0.01)
      ).toFixed(2),
    }));

    const scaledOp = activeBenchmarks.operationalExpenses.map((item) => {
      let cost = 0;
      if (item.name.includes('Gas')) cost = gasCost;
      else if (item.name.includes('Delivery')) cost = petrolCost;
      else if (item.name.includes('Packing')) cost = packingCost;
      else if (item.name.includes('Sabji')) cost = sabziCost;
      else cost = hiddenCost;

      return {
        ...item,
        scaledCost: cost,
        scaledCostPerMeal: cost / n,
      };
    });

    return {
      mealCount: n,
      sellingPrice: Number(avgSp.toFixed(2)),
      rawCost,
      opCost,
      totalCost,
      costPerMeal,
      rawCostPerMeal,
      opCostPerMeal,
      revenue: rev,
      netProfit,
      profitMargin,
      monthlyProfit: netProfit * 30,
      linearTotalCost,
      linearSavings,
      pricingModel,
      subMeals,
      dailyMeals,
      subRevenue,
      dailyRevenue,
      subNetProfit,
      dailyNetProfit,
      subMargin,
      dailyMargin,
      breakdown: {
        gasCost,
        petrolCost,
        packingCost,
        sabziCost,
        hiddenCost,
      },
      scaledRaw,
      scaledOp,
    };
  }, [
    activeBenchmarks,
    pricingModel,
    simFixedCount,
    simFixedRate,
    simDailyCount,
    simDailyRate,
    simulatorMeals,
    sellingPrice,
    scalingMode,
  ]);

  // Pre-calculated volume comparisons for the economies of scale table
  const volumeComparisons = useMemo(() => {
    const sp = Math.max(1, Number(sim.sellingPrice) || 99);
    return [25, 50, 75, 100, 200].map((cnt) => {
      const gas = 200 * Math.pow(cnt / 50, 0.48);
      const petrol = 166.67 * Math.pow(cnt / 50, 0.52);
      const packing = 188 * Math.pow(cnt / 50, 0.96);
      const sabzi = 300 * Math.pow(cnt / 50, 0.90);
      const hidden = 100 * Math.pow(cnt / 50, 0.45);
      const raw = 1288.42 * Math.pow(cnt / 50, 0.94);
      const op = gas + petrol + packing + sabzi + hidden;
      const total = raw + op;
      const perThali = total / cnt;
      const rev = cnt * sp;
      const profit = rev - total;
      const margin = (profit / rev) * 100;
      const linearTotal = cnt * 44.8618;
      const savingsVsLinear = linearTotal - total;

      return {
        orders: cnt,
        rawCost: Math.round(raw),
        gasCost: Math.round(gas),
        petrolCost: Math.round(petrol),
        packingCost: Math.round(packing),
        sabziCost: Math.round(sabzi),
        opCost: Math.round(op),
        totalCost: Math.round(total),
        costPerThali: Number(perThali.toFixed(2)),
        revenue: Math.round(rev),
        profit: Math.round(profit),
        margin: Number(margin.toFixed(1)),
        monthlyProfit: Math.round(profit * 30),
        savingsVsLinear: Math.round(savingsVsLinear),
      };
    });
  }, [sim.sellingPrice]);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-100 text-orange-700 rounded-xl">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kitchen & Inventory Management</h1>
              <p className="text-sm text-gray-500">
                Packaging Supplies, Kitchen Raw Material Estimation & Dish Availability
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchOverview(true);
              if (activeTab === 'dishes') fetchDishes();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenAddModal()}
            className="bg-[lab(66%_50.34_52.19)] hover:bg-[lab(60%_50.34_52.19)] text-white flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </Button>
        </div>
      </div>

      {/* Success notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Items Monitored
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {stats?.totalItemsCount || items.length}
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Packaging & Raw Groceries</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            (stats?.lowStockCount || 0) > 0
              ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
              : 'bg-white border-gray-200'
          }`}
        >
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              Low Stock Warnings
              {(stats?.lowStockCount || 0) > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </span>
            <span className="text-2xl font-bold text-amber-900 mt-1 block">
              {stats?.lowStockCount || 0}
            </span>
            <span className="text-xs text-amber-600 mt-0.5 block">
              {lowStockOnly ? 'Showing Low Stock Only (Click to Reset)' : 'Click to filter low stock items'}
            </span>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Tiffins Packaging Demand */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Today's Meal Demand
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {demandForecast?.todayMealsTotal || 0}{' '}
              <span className="text-xs font-normal text-gray-500">Meals</span>
            </span>
            <span className="text-xs text-emerald-600 font-medium mt-0.5 block">
              ☀️ {demandForecast?.lunchCount || 0} Lunch | 🌙 {demandForecast?.dinnerCount || 0} Dinner
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
        </div>

        {/* Estimated Stock Value */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Inventory Asset Value
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              ₹{(stats?.estimatedTotalValue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-400 mt-0.5 block">Estimated packaging & grocery</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('supplies')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'supplies'
                ? 'border-[lab(66%_50.34_52.19)] text-[lab(66%_50.34_52.19)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Packaging & Kitchen Supplies</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dishes')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'dishes'
                ? 'border-[lab(66%_50.34_52.19)] text-[lab(66%_50.34_52.19)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Menu Dishes ("Sold Out" Toggle)</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
              {dishes.length || 'Live'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'estimator'
                ? 'border-[lab(66%_50.34_52.19)] text-[lab(66%_50.34_52.19)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>50-Orders Cost & Kitchen Estimator</span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 rounded">
              ₹44.86 / Thali
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3.5 px-2 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'logs'
                ? 'border-[lab(66%_50.34_52.19)] text-[lab(66%_50.34_52.19)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock History Logs</span>
          </button>
        </nav>
      </div>

      {/* 4. TAB CONTENT */}

      {/* TAB 1: PACKAGING & KITCHEN SUPPLIES */}
      {activeTab === 'supplies' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search item name (e.g. Trays, Foil, Atta)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOverview()}
                />
              </div>

              <select
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="packaging">Packaging Supplies</option>
                <option value="tiffin_boxes">Tiffin Boxes & Dabbas</option>
                <option value="raw_grocery">Raw Grocery & Grains</option>
                <option value="spices_oil">Spices & Cooking Oil</option>
                <option value="dairy_perishables">Dairy & Perishables</option>
                <option value="cleaning_other">Cleaning & Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={lowStockOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={lowStockOnly ? 'bg-amber-600 text-white hover:bg-amber-700' : ''}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                <span>Low Stock Only</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Item Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Current Stock</th>
                    <th className="py-3.5 px-4">Min. Threshold</th>
                    <th className="py-3.5 px-4">Cost / Unit</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Spinner className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                        <span>Loading inventory supplies...</span>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="font-medium text-gray-600">No inventory items found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try changing filters or click "Add Inventory Item" above.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const isLow = item.currentStock <= item.minThreshold && item.currentStock > 0;
                      const isOut = item.currentStock === 0;

                      return (
                        <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            {item.notes && <div className="text-xs text-gray-400 truncate max-w-xs">{item.notes}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                              {item.category.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-base font-bold text-gray-900">{item.currentStock}</span>{' '}
                            <span className="text-xs text-gray-500">{item.unit}</span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 text-xs">
                            <span className="font-semibold">{item.minThreshold}</span> {item.unit}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-gray-700">
                            {item.costPerUnit ? `₹${item.costPerUnit}` : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                🔴 Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                ⚠️ Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                🟢 In Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenAdjustModal(item, 'restock')}
                                title="Add Stock"
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                              >
                                + Restock
                              </button>
                              <button
                                onClick={() => handleOpenAdjustModal(item, 'usage')}
                                title="Log Usage"
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
                              >
                                - Use
                              </button>
                              <button
                                onClick={() => handleOpenAddModal(item)}
                                title="Edit Item"
                                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                title="Delete Item"
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU DISHES & "SOLD OUT" TOGGLE */}
      {activeTab === 'dishes' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>Live Menu Dishes Availability</span>
                <span className="px-2 py-0.5 text-xs rounded-md bg-orange-200/60 text-orange-800 font-semibold">
                  Kitchen Control
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Switch dishes to <b>"Sold Out"</b> with 1-click if a pot of sabzi, dal or thali runs out in the kitchen.
                Changes reflect on customer app instantly.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchDishes}
              disabled={dishesLoading}
              className="bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${dishesLoading ? 'animate-spin' : ''}`} />
              <span>Reload Dishes</span>
            </Button>
          </div>

          {/* Dish filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search dish (e.g. Dal Baati, Shahi Paneer, Thali)..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={dishSearchQuery}
                onChange={(e) => setDishSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-stretch sm:self-auto">
              <button
                onClick={() => setDishStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dishStatusFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({dishes.length})
              </button>
              <button
                onClick={() => setDishStatusFilter('instock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dishStatusFilter === 'instock'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🟢 In Stock ({dishes.filter((d) => d.isAvailable).length})
              </button>
              <button
                onClick={() => setDishStatusFilter('soldout')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dishStatusFilter === 'soldout'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔴 Sold Out ({dishes.filter((d) => !d.isAvailable).length})
              </button>
            </div>
          </div>

          {/* Dishes Grid */}
          {dishesLoading && dishes.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border text-center text-gray-500">
              <Spinner className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <span>Fetching live menu dishes...</span>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border text-center text-gray-500">
              <UtensilsCrossed className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No dishes match the filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    dish.isAvailable
                      ? 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {dish.category}
                        </span>
                        {dish.sourceType === 'homemade_special' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                            Homemade Special
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-gray-900">{dish.name}</h4>
                      <span className="text-sm font-bold text-gray-900 mt-1 block">₹{dish.price}</span>
                    </div>

                    {/* Toggle Button */}
                    <div className="flex flex-col items-end">
                      <button
                        type="button"
                        onClick={() => handleToggleDish(dish)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          dish.isAvailable ? 'bg-emerald-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            dish.isAvailable ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[11px] font-bold mt-1.5 ${
                          dish.isAvailable ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {dish.isAvailable ? 'In Stock' : 'SOLD OUT'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 50-ORDERS COSTING & KITCHEN MATERIAL ESTIMATOR */}
      {activeTab === 'estimator' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-800/40">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    50-Orders Master Costing
                  </span>
                  <span className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-400/30 text-orange-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    ₹44.86 / Thali Cost
                  </span>
                  <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    54.7% Profit Margin
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Kitchen Expenses, Ration & Profit Estimator
                </h2>
                <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                  Real operational culinary data calibrated for Tommalu Central Kitchen: <strong className="text-white">₹1,288 Raw Grocery</strong> + <strong className="text-white">₹955 Daily Operations</strong> = <strong className="text-emerald-300">₹2,243 for 50 orders (₹44.86 per Thali)</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSimulatorMeals(50);
                    setSellingPrice(99);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset 50 Orders</span>
                </Button>
              </div>
            </div>

            {/* Live Today's Order Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/60">
              <div>
                <span className="text-xs text-emerald-300/80 block">Today's Active Orders:</span>
                <span className="text-2xl font-black text-white">{demandForecast?.todayMealsTotal || 0} Thalis</span>
              </div>
              <div>
                <span className="text-xs text-emerald-300/80 block">Lunch Slot Demand:</span>
                <span className="text-xl font-bold text-white">☀️ {demandForecast?.lunchCount || 0} Meals</span>
              </div>
              <div>
                <span className="text-xs text-emerald-300/80 block">Dinner Slot Demand:</span>
                <span className="text-xl font-bold text-white">🌙 {demandForecast?.dinnerCount || 0} Meals</span>
              </div>
              <div>
                <span className="text-xs text-emerald-300/80 block">Active Subscribers:</span>
                <span className="text-xl font-bold text-white">{demandForecast?.activeSubscribers || 0} Users</span>
              </div>
            </div>
          </div>

          {/* 🌟 1. DUAL-STREAM REVENUE & TRUE FINAL NET PROFIT CARD */}
          {(() => {
            const rev = demandForecast?.revenueBreakdown || activeBenchmarks.revenueBreakdown;
            if (!rev) return null;

            return (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header Banner */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                      <Coins className="w-3.5 h-3.5" />
                      <span>फिक्स्ड टिफिन बनाम डेली आर्डर: शुद्ध कमाई व फाइनल मुनाफा</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>वास्तविक दैनिक बिक्री व शुद्ध मुनाफा (True Final Net Profit)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                      फिक्स्ड टिफिन ग्राहक 30 दिन का रियायती पैकेज (₹75-₹80/थाली) लेते हैं, जबकि डेली ग्राहक ₹99/थाली देते हैं। सिस्टम ने दोनों की वास्तविक कमाई जोड़कर असली शुद्ध मुनाफा निकाला है।
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[210px] text-right">
                    <span className="text-xs text-emerald-300 font-bold block uppercase tracking-wider">
                      दैनिक वास्तविक शुद्ध मुनाफा
                    </span>
                    <span className="text-3xl font-black text-white mt-0.5 block">
                      ₹{rev.trueNetProfit.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-300 block mt-1 font-medium">
                      मार्जिन: <strong className="text-emerald-300">{rev.trueProfitMarginPercent}%</strong> • ₹{rev.monthlyProjectedProfit.toLocaleString('en-IN')}/माह
                    </span>
                  </div>
                </div>

                {/* 3 Columns: Fixed Tiffins | Daily Orders | Blended Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  {/* Stream 1: Fixed Subscription Tiffins */}
                  <div className="p-5 sm:p-6 space-y-4 bg-orange-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                          <Boxes className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">📦 फिक्स्ड सब्सक्रिप्शन टिफिन</h4>
                          <span className="text-[11px] text-gray-500">Monthly/Weekly Prepaid Subscribers</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-black">
                        {rev.subscriberMeals} थाली
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-orange-100">
                        <span className="text-gray-500">औसत पैकेज दर:</span>
                        <strong className="text-gray-900 font-bold">~₹{rev.avgSubscriberPerMealRate} / थाली</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-orange-100">
                        <span className="text-gray-500">कुल टिफिन बिक्री आय:</span>
                        <strong className="text-gray-900 font-black text-sm">₹{rev.subscriberRevenue.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-orange-100">
                        <span className="text-gray-500">रसोई उत्पादन लागत (₹{rev.costPerThali}/थाली):</span>
                        <span className="text-rose-700 font-semibold">-₹{rev.subscriberCostEstimate.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-orange-100/60 px-2.5 rounded-xl font-bold">
                        <span className="text-orange-950">टिफिन से शुद्ध मुनाफा:</span>
                        <span className="text-emerald-700 font-black text-sm">
                          +₹{rev.subscriberNetProfit.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] text-gray-500 font-normal">({rev.subscriberMarginPercent}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-orange-200 text-[11px] text-gray-600 leading-relaxed">
                      💡 <strong>बिजनेस फायदा:</strong> प्रति थाली मुनाफा कम (₹{(rev.avgSubscriberPerMealRate - rev.costPerThali).toFixed(1)}) होता है, लेकिन पूरा पैसा 30 दिन पहले एडवांस मिल जाता है और डिलीवरी पक्की रहती है!
                    </div>
                  </div>

                  {/* Stream 2: On-Demand Daily Orders */}
                  <div className="p-5 sm:p-6 space-y-4 bg-emerald-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">🛍️ डेली फूड ऑर्डर्स (थाली)</h4>
                          <span className="text-[11px] text-gray-500">On-Demand Daily Orders</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                        {rev.onDemandMeals} थाली
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-emerald-100">
                        <span className="text-gray-500">औसत बिक्री मूल्य:</span>
                        <strong className="text-gray-900 font-bold">~₹{rev.avgOnDemandPerMealRate} / थाली</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-100">
                        <span className="text-gray-500">कुल आर्डर बिक्री आय:</span>
                        <strong className="text-gray-900 font-black text-sm">₹{rev.onDemandRevenue.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-100">
                        <span className="text-gray-500">रसोई उत्पादन लागत (₹{rev.costPerThali}/थाली):</span>
                        <span className="text-rose-700 font-semibold">-₹{rev.onDemandCostEstimate.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-emerald-100/60 px-2.5 rounded-xl font-bold">
                        <span className="text-emerald-950">डेली ऑर्डर्स से शुद्ध मुनाफा:</span>
                        <span className="text-emerald-700 font-black text-sm">
                          +₹{rev.onDemandNetProfit.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] text-gray-500 font-normal">({rev.onDemandMarginPercent}%)</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] text-gray-600 leading-relaxed">
                      🚀 <strong>हाई मार्जिन:</strong> डेली ऑर्डर्स पर पूरा मेन्यू रेट मिलता है, इसलिए प्रति थाली ज्यादा मुनाफा (₹{(rev.avgOnDemandPerMealRate - rev.costPerThali).toFixed(1)}) बचता है!
                    </div>
                  </div>

                  {/* Stream 3: Blended Total P&L & Reality Check */}
                  <div className="p-5 sm:p-6 space-y-4 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                            <Calculator className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">🏆 दोनों का संयुक्त परिणाम</h4>
                            <span className="text-[11px] text-gray-500">Real Combined Kitchen P&L</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-black">
                          {rev.totalMeals} कुल थाली
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">कुल संयुक्त बिक्री (Blended Revenue):</span>
                          <span className="font-black text-gray-900 text-sm">₹{rev.blendedTotalRevenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1 text-gray-500">
                          <span>औसत प्रति थाली बिक्री दर:</span>
                          <span className="font-bold text-gray-800">₹{rev.blendedEffectivePerMealRate} / थाली</span>
                        </div>
                        <div className="flex justify-between py-1 text-rose-700">
                          <span>कुल रसोई खर्च (राशन + ऑपरेशन्स):</span>
                          <span className="font-bold">-₹{rev.kitchenProductionCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-b border-gray-300 font-black text-sm text-emerald-700">
                          <span>वास्तविक अंतिम शुद्ध लाभ:</span>
                          <span className="text-base">₹{rev.trueNetProfit.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reality check callout */}
                    {rev.profitAdjustmentDueToSubscriptions && rev.profitAdjustmentDueToSubscriptions > 0 && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-950">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>सटीक कैलकुलेशन का अंतर:</span>
                        </div>
                        <p>
                          अगर सब कुछ ₹99 पर मान लिया जाता, तो ₹{rev.naiveProfitAt99?.toLocaleString('en-IN')} दिखता। फिक्स्ड टिफिन के रियायती रेट होने से असली शुद्ध लाभ <strong>₹{rev.trueNetProfit.toLocaleString('en-IN')}</strong> है।
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive Simulation & Pricing Control Bar */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                  <span>Interactive Kitchen Volume & Profit Scaler</span>
                </h3>
                <p className="text-xs text-gray-500">
                  फिक्स्ड टिफिन और डेली ऑर्डर्स का अनुपात बदल कर देखें कि आपके कुल मुनाफे पर क्या प्रभाव पड़ता है।
                </p>
              </div>

              {/* Mode Switchers */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Pricing Stream Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setPricingModel('dual_stream')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      pricingModel === 'dual_stream'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>फिक्स्ड + डेली मिक्स (Recommended)</span>
                  </button>
                  <button
                    onClick={() => setPricingModel('flat')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      pricingModel === 'flat'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>Single Flat Price</span>
                  </button>
                </div>

                {/* Economies of scale toggle */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setScalingMode('economies_of_scale')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      scalingMode === 'economies_of_scale'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real Curve (लागत घटेगी/बढ़ेगी)</span>
                  </button>
                  <button
                    onClick={() => setScalingMode('linear')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      scalingMode === 'linear'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>Linear (सीधा गुणा)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            {pricingModel === 'dual_stream' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-2xl border border-gray-200">
                {/* Fixed Tiffins Inputs */}
                <div className="space-y-3 p-3 bg-white rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-orange-600" />
                      <span>📦 1. फिक्स्ड टिफिन (Subscription Volume):</span>
                    </span>
                    <span className="text-xs font-black text-orange-600">{simFixedCount} थाली</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border border-gray-300 rounded-xl px-2.5 py-1 bg-gray-50 flex-1">
                      <span className="text-xs text-gray-500">थाली संख्या:</span>
                      <input
                        type="number"
                        min="0"
                        value={simFixedCount}
                        onChange={(e) => setSimFixedCount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full text-xs font-black text-gray-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 font-medium">दर:</span>
                      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                        {[75, 80, 85].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setSimFixedRate(rate)}
                            className={`px-2 py-0.5 text-xs font-bold rounded ${
                              simFixedRate === rate
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            ₹{rate}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center border border-gray-300 rounded-lg px-1.5 py-0.5 w-16 bg-white">
                        <span className="text-xs text-gray-400">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={simFixedRate}
                          onChange={(e) => setSimFixedRate(Number(e.target.value) || 0)}
                          className="w-10 text-xs font-bold text-gray-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Orders Inputs */}
                <div className="space-y-3 p-3 bg-white rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>🛍️ 2. डेली ऑर्डर्स (On-Demand Orders):</span>
                    </span>
                    <span className="text-xs font-black text-emerald-600">{simDailyCount} थाली</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 border border-gray-300 rounded-xl px-2.5 py-1 bg-gray-50 flex-1">
                      <span className="text-xs text-gray-500">थाली संख्या:</span>
                      <input
                        type="number"
                        min="0"
                        value={simDailyCount}
                        onChange={(e) => setSimDailyCount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full text-xs font-black text-gray-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 font-medium">दर:</span>
                      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
                        {[99, 119, 199].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setSimDailyRate(rate)}
                            className={`px-2 py-0.5 text-xs font-bold rounded ${
                              simDailyRate === rate
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            ₹{rate}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center border border-gray-300 rounded-lg px-1.5 py-0.5 w-16 bg-white">
                        <span className="text-xs text-gray-400">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={simDailyRate}
                          onChange={(e) => setSimDailyRate(Number(e.target.value) || 0)}
                          className="w-10 text-xs font-bold text-gray-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Flat Single Price Mode Inputs */
              <div className="flex items-center justify-between gap-4 flex-wrap p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Avg Selling Price:</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                    {[99, 119, 199].map((p) => (
                      <button
                        key={p}
                        onClick={() => setSellingPrice(p)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          sellingPrice === p
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        ₹{p}
                      </button>
                    ))}
                    <div className="flex items-center gap-1 px-2 py-0.5 border-l border-gray-200 ml-1">
                      <span className="text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                        className="w-14 text-xs font-bold text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Total Thalis:</span>
                  <input
                    type="number"
                    min="1"
                    value={simulatorMeals}
                    onChange={(e) => setSimulatorMeals(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-black text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Quick Presets Bar */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500 mr-1">Quick Mix Presets:</span>
              <button
                onClick={() => {
                  setPricingModel('dual_stream');
                  setSimFixedCount(35);
                  setSimFixedRate(80);
                  setSimDailyCount(15);
                  setSimDailyRate(99);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pricingModel === 'dual_stream' && simFixedCount === 35 && simDailyCount === 15
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>⭐ 35 Fixed + 15 Daily (50 Meals Master)</span>
              </button>

              {demandForecast && demandForecast.todayMealsTotal > 0 && (
                <button
                  onClick={() => {
                    setPricingModel('dual_stream');
                    setSimFixedCount(demandForecast.subscriberMealsTotal || 0);
                    setSimFixedRate(demandForecast.revenueBreakdown?.avgSubscriberPerMealRate || 80);
                    setSimDailyCount(demandForecast.onDemandMealsTotal || 0);
                    setSimDailyRate(demandForecast.revenueBreakdown?.avgOnDemandPerMealRate || 99);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-800 hover:bg-orange-100 transition-all flex items-center gap-1.5"
                >
                  <span>🎯 आज का लाइव लोड ({demandForecast.subscriberMealsTotal || 0} Fixed + {demandForecast.onDemandMealsTotal || 0} Daily)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setPricingModel('dual_stream');
                  setSimFixedCount(50);
                  setSimFixedRate(80);
                  setSimDailyCount(0);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                🔒 100% फिक्स्ड टिफिन (50 @ ₹80)
              </button>

              <button
                onClick={() => {
                  setPricingModel('dual_stream');
                  setSimFixedCount(0);
                  setSimDailyCount(50);
                  setSimDailyRate(99);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                🛍️ 100% डेली ऑर्डर्स (50 @ ₹99)
              </button>

              <button
                onClick={() => {
                  setPricingModel('dual_stream');
                  setSimFixedCount(70);
                  setSimFixedRate(80);
                  setSimDailyCount(30);
                  setSimDailyRate(99);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-all"
              >
                🚀 100 थाली (70 Fixed + 30 Daily)
              </button>

              <button
                onClick={() => {
                  setPricingModel('dual_stream');
                  setSimFixedCount(140);
                  setSimFixedRate(80);
                  setSimDailyCount(60);
                  setSimDailyRate(99);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-all"
              >
                ⚡ 200 थाली (140 Fixed + 60 Daily)
              </button>
            </div>
          </div>

          {/* Financial P&L Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Target Volume
              </span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">
                {sim.mealCount} <span className="text-xs font-normal text-gray-500">Thalis</span>
              </span>
              <span className="text-xs text-gray-500 mt-0.5 block">
                {pricingModel === 'dual_stream'
                  ? `${sim.subMeals} Fixed + ${sim.dailyMeals} Daily`
                  : `☀️ ${Math.ceil(sim.mealCount * 0.5)} L | 🌙 ${Math.floor(sim.mealCount * 0.5)} D`}
              </span>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Raw Grocery Cost
              </span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                ₹{Math.round(sim.rawCost).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-700 mt-0.5 block font-medium">
                ₹{sim.rawCostPerMeal.toFixed(2)} / meal (57.4%)
              </span>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Operating & Delivery
              </span>
              <span className="text-2xl font-black text-amber-950 mt-1 block">
                ₹{Math.round(sim.opCost).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-amber-700 mt-0.5 block font-medium">
                ₹{sim.opCostPerMeal.toFixed(2)} / meal (42.6%)
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 shadow-sm">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Total Kitchen Cost
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{Math.round(sim.totalCost).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-600 mt-0.5 block font-bold">
                ₹{sim.costPerMeal.toFixed(2)} / Thali
              </span>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Projected Revenue
              </span>
              <span className="text-2xl font-black text-blue-950 mt-1 block">
                ₹{Math.round(sim.revenue).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-blue-700 mt-0.5 block font-medium">
                @ ₹{sim.sellingPrice} avg / Thali
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-md">
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">
                Net Kitchen Profit
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                ₹{Math.round(sim.netProfit).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-emerald-100 mt-0.5 block font-medium">
                {sim.profitMargin.toFixed(1)}% margin • ₹{Math.round(sim.monthlyProfit).toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>

          {/* Stream-level Profit Distribution Sub-Bar */}
          {pricingModel === 'dual_stream' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-950 block">
                    📦 फिक्स्ड टिफिन मुनाफा ({sim.subMeals} थाली @ ₹{simFixedRate}):
                  </span>
                  <span className="text-[11px] text-orange-700 mt-0.5 block">
                    कमाई ₹{Math.round(sim.subRevenue).toLocaleString('en-IN')} - लागत ₹{Math.round(sim.subMeals * sim.costPerMeal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-700 block">
                    +₹{Math.round(sim.subNetProfit).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold block">
                    ₹{(simFixedRate - sim.costPerMeal).toFixed(2)}/थाली ({sim.subMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    🛍️ डेली ऑर्डर्स मुनाफा ({sim.dailyMeals} थाली @ ₹{simDailyRate}):
                  </span>
                  <span className="text-[11px] text-emerald-700 mt-0.5 block">
                    कमाई ₹{Math.round(sim.dailyRevenue).toLocaleString('en-IN')} - लागत ₹{Math.round(sim.dailyMeals * sim.costPerMeal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-700 block">
                    +₹{Math.round(sim.dailyNetProfit).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold block">
                    ₹{(simDailyRate - sim.costPerMeal).toFixed(2)}/थाली ({sim.dailyMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Unit Economics Highlight Banner */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 text-orange-700 rounded-2xl">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Single Thali Unit Economics: Selling @ ₹{sim.sellingPrice} | Total Production Cost ₹{sim.costPerMeal.toFixed(2)}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Gross Profit per Thali: <strong className="text-emerald-700 font-bold">₹{(sim.sellingPrice - sim.costPerMeal).toFixed(2)}</strong> ({sim.profitMargin.toFixed(1)}% profit margin).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-gray-700">Raw Grocery: ₹{sim.rawCostPerMeal.toFixed(2)} ({( (sim.rawCost / sim.totalCost) * 100 ).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-gray-700">Operations: ₹{sim.opCostPerMeal.toFixed(2)} ({( (sim.opCost / sim.totalCost) * 100 ).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ECONOMIES OF SCALE ANALYSIS: 25 vs 50 vs 100 vs 200 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                    <Scale className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    Economies of Scale Analysis: 25 vs 50 vs 100 vs 200 Orders
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ऑर्डर्स बढ़ने पर प्रति थाली लागत कम क्यों होती है और 25 ऑर्डर्स पर थाली महंगी क्यों पड़ती है? (Fixed vs Variable Cost Analysis)
                </p>
              </div>

              {scalingMode === 'economies_of_scale' && (
                <div className="flex items-center gap-2">
                  {sim.mealCount < 50 ? (
                    <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{sim.mealCount} थाली: फिक्स्ड खर्च भारी पड़ा (लागत ₹{sim.costPerMeal.toFixed(2)} / थाली)</span>
                    </div>
                  ) : sim.mealCount === 50 ? (
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>50 थाली: आपका बेस बेंचमार्क (लागत ₹44.86 / थाली)</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{sim.mealCount} थाली पर स्केल की बचत: +₹{Math.round(sim.linearSavings).toLocaleString('en-IN')} / दिन!</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">ऑर्डर वॉल्यूम (Scale)</th>
                    <th className="py-3 px-4 text-right">कच्चा राशन</th>
                    <th className="py-3 px-4 text-right">गैस (LPG)</th>
                    <th className="py-3 px-4 text-right">डिलीवरी पेट्रोल</th>
                    <th className="py-3 px-4 text-right">मेन सब्जी</th>
                    <th className="py-3 px-4 text-right">पैकिंग + बफर</th>
                    <th className="py-3 px-4 text-right">कुल दैनिक खर्च</th>
                    <th className="py-3 px-4 text-right font-black text-gray-900">
                      👉 प्रति थाली लागत (Cost/Thali)
                    </th>
                    <th className="py-3 px-4 text-right font-bold text-emerald-700">
                      दैनिक शुद्ध मुनाफा (@ ₹{sim.sellingPrice})
                    </th>
                    <th className="py-3 px-4 text-center">प्रॉफिट मार्जिन %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {volumeComparisons.map((row) => {
                    const isSelected = sim.mealCount === row.orders;
                    const isBase = row.orders === 50;

                    return (
                      <tr
                        key={row.orders}
                        onClick={() => {
                          if (pricingModel === 'dual_stream') {
                            const fixed = Math.round(row.orders * 0.7);
                            const daily = row.orders - fixed;
                            setSimFixedCount(fixed);
                            setSimDailyCount(daily);
                          } else {
                            setSimulatorMeals(row.orders);
                          }
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-orange-50/80 font-bold border-l-4 border-l-orange-500'
                            : isBase
                            ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-gray-900">{row.orders} थाली</span>
                            {isBase && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                बेस बेंचमार्क
                              </span>
                            )}
                            {row.orders === 100 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                                2x ऑर्डर्स
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">₹{row.rawCost.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">₹{row.gasCost}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">₹{row.petrolCost}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">₹{row.sabziCost}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                          ₹{row.packingCost + Math.round(row.totalCost - (row.rawCost + row.gasCost + row.petrolCost + row.sabziCost + row.packingCost))}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                          ₹{row.totalCost.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block ${
                              row.orders < 50
                                ? 'bg-rose-100 text-rose-800'
                                : row.orders === 50
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            ₹{row.costPerThali.toFixed(2)} / थाली
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-800">
                          ₹{row.profit.toLocaleString('en-IN')} / दिन
                          <span className="block text-[10px] font-normal text-gray-400">
                            (₹{row.monthlyProfit.toLocaleString('en-IN')}/माह)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                            {row.margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4 Real-Life Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-orange-50/60 border border-orange-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>1. रसोई गैस (LPG Efficiency)</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  50 के बजाय 100 थाली की दाल-सब्जी बनाने में बर्नर ₹400 नहीं, सिर्फ ₹279 गैस लेता है। प्रति थाली गैस ₹4.00 से घटकर ₹2.70 रह जाती है।
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <span>2. डिलीवरी रूट डेंसिटी (Petrol)</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  उसी हॉस्टल/सोसायटी में 1 की जगह 3 टिफिन जाते हैं। राइडर का शहर का चक्कर एक ही रहता है, इसलिए पेट्रोल ₹333 नहीं केवल ₹239 लगता है।
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>3. थोक मंडी डिस्काउंट (Bulk Mandi)</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  100 थाली पर सब्जी की पूरी क्रेट और राशन के कट्टे थोक मंडी भाव पर 6-8% सस्ते मिलते हैं।
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>4. 25 ऑर्डर्स पर थाली महंगी क्यों?</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  25 थाली पर भी पूरे शहर का रूट और बेस बर्नर जलता है, जिससे फिक्स्ड खर्च 25 थाली पर भारी पड़ता है और लागत ₹50.5/थाली हो जाती है।
                </p>
              </div>
            </div>
          </div>

          {/* Expense Filter Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCostFilterTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  costFilterTab === 'all'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All 20 Expense Items
              </button>
              <button
                onClick={() => setCostFilterTab('grocery')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  costFilterTab === 'grocery'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                1. Raw Grocery (15 Items - ₹1,288 approx)
              </button>
              <button
                onClick={() => setCostFilterTab('operations')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  costFilterTab === 'operations'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                2. Daily Operating & Delivery (5 Items - ₹955 approx)
              </button>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Scaling for {sim.mealCount} orders
            </span>
          </div>

          {/* TABLE 1: RAW GROCERY & SPICES (15 Items) */}
          {(costFilterTab === 'all' || costFilterTab === 'grocery') && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-white border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>1. Raw Grocery & Masale Costing (कच्चा राशन एवं मसाले)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    15 culinary ingredients calibrated for 50 orders • Benchmark Total: ₹1,288.42 (~₹25.77 / meal)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Shift Cost: ₹{Math.round(sim.rawCost).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Standard Formula / Spec</th>
                      <th className="py-3 px-4 text-right">50-Orders Benchmark</th>
                      <th className="py-3 px-4 text-right font-bold text-emerald-800">
                        Cost for {sim.mealCount} Meals
                      </th>
                      <th className="py-3 px-4 text-right">Cost / Single Thali</th>
                      <th className="py-3 px-4 text-center">Measure / Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {sim.scaledRaw.map((item, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-medium">{item.spec}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-600">
                          ₹{item.costPer50.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-900 bg-emerald-50/40">
                          ₹{item.scaledCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-700">
                          ₹{item.costPerMeal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-mono">
                            {item.dailyQtyFor50 || item.unit}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50/60 border-t-2 border-emerald-200 font-bold text-xs text-gray-900">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-emerald-900 uppercase tracking-wider">
                        Raw Grocery Subtotal (15 Items)
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">₹1,288.42</td>
                      <td className="py-3 px-4 text-right text-emerald-950 font-black text-sm">
                        ₹{Math.round(sim.rawCost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-900 font-black">
                        ₹{sim.rawCostPerMeal.toFixed(2)} / thali
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">57.4% portion</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TABLE 2: OTHER DAILY EXPENSES (5 Items) */}
          {(costFilterTab === 'all' || costFilterTab === 'operations') && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-amber-50 to-white border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>2. Other Daily Kitchen & Delivery Expenses (दैनिक संचालन व डिलीवरी खर्च)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Gas, Delivery fuel, Main sabzi, Packaging & Contingency • Benchmark Total: ₹954.67 (~₹19.09 / meal)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                    Shift Cost: ₹{Math.round(sim.opCost).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Expense Head</th>
                      <th className="py-3 px-4">Specification & Details</th>
                      <th className="py-3 px-4 text-right">50-Orders Benchmark</th>
                      <th className="py-3 px-4 text-right font-bold text-amber-800">
                        Cost for {sim.mealCount} Meals
                      </th>
                      <th className="py-3 px-4 text-right">Cost / Single Thali</th>
                      <th className="py-3 px-4 text-center">Standard Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {sim.scaledOp.map((item, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-medium">{item.spec}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-600">
                          ₹{item.costPer50.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-950 bg-amber-50/40">
                          ₹{item.scaledCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-700">
                          ₹{item.costPerMeal.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-mono">
                            {item.dailyQtyFor50 || 'Daily'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-amber-50/60 border-t-2 border-amber-200 font-bold text-xs text-gray-900">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-amber-900 uppercase tracking-wider">
                        Operating & Delivery Subtotal (5 Items)
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">₹954.67</td>
                      <td className="py-3 px-4 text-right text-amber-950 font-black text-sm">
                        ₹{Math.round(sim.opCost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-900 font-black">
                        ₹{sim.opCostPerMeal.toFixed(2)} / thali
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500">42.6% portion</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* COMBINED GRAND TOTAL FOOTER BANNER */}
          <div className="bg-gradient-to-r from-slate-900 to-gray-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-gray-800">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                Total Kitchen Production Summary
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                Grand Total Kitchen & Delivery Cost for {sim.mealCount} Thalis
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Raw Grocery (₹{Math.round(sim.rawCost)}) + Operations (₹{Math.round(sim.opCost)}) = Total ₹{Math.round(sim.totalCost)}
              </p>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <span className="text-xs text-gray-400 block">Total Shift Expense:</span>
                <span className="text-2xl font-black text-white">
                  ₹{Math.round(sim.totalCost).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-l border-gray-700 pl-6">
                <span className="text-xs text-gray-400 block">Production Cost:</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{sim.costPerMeal.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ thali</span>
                </span>
              </div>
              <div className="border-l border-gray-700 pl-6">
                <span className="text-xs text-gray-400 block">Net Profit (@ ₹{sim.sellingPrice}):</span>
                <span className="text-2xl font-black text-amber-400">
                  ₹{Math.round(sim.netProfit).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Material Requirements Shift Prep Grid */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span>Kitchen Shift Preparation & Ration Sheet</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Physical weight & portions needed for kitchen chef to prepare {sim.mealCount} Thalis today
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Kitchen Sheet</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wider block">
                    Wheat Atta (Phulkas / Rotis)
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {(sim.mealCount * 0.333).toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span>
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    50 kg / 3 days (16.7 kg for 50 orders)
                  </span>
                </div>
                <div className="p-3 bg-orange-100 text-orange-700 rounded-xl">🌾</div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    Rice (Steamed / Basmati)
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {(sim.mealCount * 0.06).toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span>
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    ~3.0 kg for 50 orders (₹120)
                  </span>
                </div>
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">🍚</div>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                    Dal / Pulses (Yellow Tadka)
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {(sim.mealCount * 0.03).toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span>
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    ~1.5 kg for 50 orders (₹135)
                  </span>
                </div>
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">🍲</div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                    Main Sabji (Fresh Veggies)
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    ₹{Math.round(sim.mealCount * 6.00).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    ₹300 for 50 orders (₹6.00 / thali)
                  </span>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">🥬</div>
              </div>

              <div className="p-4 bg-yellow-50/60 border border-yellow-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider block">
                    Cooking Oil (Tel)
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {(sim.mealCount * 0.03).toFixed(2)} <span className="text-sm font-normal text-gray-500">Liters</span>
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    15 kg / 10 days (1.50 L for 50 orders)
                  </span>
                </div>
                <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl">🫗</div>
              </div>

              <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                    Meal Packaging Trays & Boxes
                  </span>
                  <span className="text-2xl font-black text-gray-900 mt-1 block">
                    {sim.mealCount} <span className="text-sm font-normal text-gray-500">Pcs</span>
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    ₹188 for 50 orders (₹3.76 / thali)
                  </span>
                </div>
                <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">📦</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECENT STOCK LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Inventory Stock Audit Logs</h3>
              <p className="text-xs text-gray-500">Record of stock adjustments, restocks, and kitchen usage</p>
            </div>
          </div>

          {allRecentLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No stock history logs recorded yet. Logs will appear whenever an item is restocked or usage is logged.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {allRecentLogs.slice(0, 40).map((entry, idx) => {
                const isRestock = entry.log.type === 'restock';

                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl text-xs font-bold ${
                          isRestock ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isRestock ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{entry.itemName}</div>
                        <div className="text-xs text-gray-500">
                          {entry.log.note || (isRestock ? 'Stock Restocked' : 'Shift Usage Recorded')} •{' '}
                          {new Date(entry.log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${isRestock ? 'text-emerald-700' : 'text-gray-900'}`}
                      >
                        {isRestock ? `+${entry.log.quantityChanged}` : `-${entry.log.quantityChanged}`} {entry.unit}
                      </span>
                      <div className="text-xs text-gray-400">
                        Stock: {entry.log.previousStock} ➔ {entry.log.newStock}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. ADD / EDIT ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Compartment Meal Trays, Basmati Rice"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                  >
                    <option value="packaging">Packaging Supplies</option>
                    <option value="tiffin_boxes">Tiffin Boxes & Dabbas</option>
                    <option value="raw_grocery">Raw Grocery & Grains</option>
                    <option value="spices_oil">Spices & Cooking Oil</option>
                    <option value="dairy_perishables">Dairy & Perishables</option>
                    <option value="cleaning_other">Cleaning & Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Measurement Unit *
                  </label>
                  <select
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="pieces">pieces</option>
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="rolls">rolls</option>
                    <option value="kits">kits</option>
                    <option value="boxes">boxes</option>
                    <option value="tins">tins</option>
                    <option value="bags">bags</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Low Alert (Min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cost/Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Notes / Supplier Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or supplier contact..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-[lab(66%_50.34_52.19)] hover:bg-[lab(60%_50.34_52.19)] text-white"
                >
                  {actionLoading ? 'Saving...' : editingItem ? 'Update Item' : 'Add to Inventory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. QUICK ADJUST STOCK MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {adjustType === 'restock' ? '📦 Restock Inventory' : '📉 Record Kitchen Usage'}
                </h3>
                <p className="text-xs text-gray-500">
                  Item: <span className="font-semibold text-gray-800">{adjustingItem.name}</span> (Current: {adjustingItem.currentStock} {adjustingItem.unit})
                </p>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('restock')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      adjustType === 'restock'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    + Restock (+ Added)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('usage')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      adjustType === 'usage'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    - Shift Usage (- Deducted)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Quantity ({adjustingItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder={`Enter quantity in ${adjustingItem.unit}`}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value ? Number(e.target.value) : '')}
                />
              </div>

              {adjustType === 'restock' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Total Purchase Cost (₹, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Total amount paid to supplier"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={adjustCost}
                    onChange={(e) => setAdjustCost(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Note / Reason
                </label>
                <input
                  type="text"
                  placeholder={adjustType === 'restock' ? 'e.g. Bought from local wholesaler' : 'e.g. Evening shift packaging'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustingItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading || !adjustQty}
                  className={
                    adjustType === 'restock'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }
                >
                  {actionLoading ? 'Saving...' : adjustType === 'restock' ? 'Confirm Restock' : 'Deduct Usage'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
