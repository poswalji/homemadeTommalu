import React, { useEffect, useState, useMemo, useCallback } from "react";
import ItemCard from "../../components/itemsCard/ItemCard";

const Food = React.memo(({ stores, onAddToCart }) => {
  const [allFoodItems, setAllFoodItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // ✅ Allowed categories - CONSTANT banaye (useMemo mein move karo)
  const allowedFoodCategories = useMemo(() => [
    "Veg Food",
    "Non-Veg Food",
    "Snacks",
    "Drinks",
    "Thali",
    "Sweets",
    "Fast Food"
  ], []);

  // ✅ Memoized food stores
  const foodStores = useMemo(() => 
    stores.filter(store => 
      store.category === "Restaurant" || store.category === "Cafe"
    ), 
    [stores]
  );

  // ✅ Load items only when foodStores changes
  useEffect(() => {
    const items = [];
    foodStores.forEach(store => {
      store.menu?.forEach(item => {
        if (allowedFoodCategories.includes(item.category)) {
          items.push({
            ...item,
            restaurant: store
          });
        }
      });
    });
    
    setAllFoodItems(items);
  }, [foodStores, allowedFoodCategories]);

  // ✅ Memoized categories for filter buttons
  const foodCategories = useMemo(() => [
    'all',
    ...new Set(
      allFoodItems
        .map(item => item.category)
        .filter(cat => allowedFoodCategories.includes(cat))
    )
  ], [allFoodItems, allowedFoodCategories]);

  // ✅ Memoized filtered items
  const filteredItems = useMemo(() => {
    let filtered = [...allFoodItems];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(
        item => item.category?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return (b.restaurant?.rating || 0) - (a.restaurant?.rating || 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.restaurant?.rating || 0) - (a.restaurant?.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allFoodItems, selectedFilter, sortBy]);

  // ✅ Memoized callbacks
  const handleFilterChange = useCallback((category) => {
    setSelectedFilter(category.toLowerCase());
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#ff6931] mb-2">Food Delivery</h1>
      <p className="text-gray-600">
        Delicious meals from {foodStores.length} restaurants & cafes
      </p>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 my-4">
        {foodCategories.map(category => (
          <button
            key={category}
            onClick={() => handleFilterChange(category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedFilter === category.toLowerCase()
                ? 'bg-[#ff6931] text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category === 'all' ? 'All Items' : category}
          </button>
        ))}
      </div>

      {/* Sort and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6">
        <div className="text-sm text-gray-600">
          {filteredItems.length} items found
        </div>
        
        <div className="flex items-center gap-4">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6931] focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item._id || item.id}
              item={item}
              restaurant={item.restaurant}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-16">
          <div className="text-gray-400 text-6xl mb-4">🍕</div>
          <p className="text-gray-500 text-lg mb-2">No food items found</p>
          <p className="text-gray-400 text-sm">
            {selectedFilter !== 'all' 
              ? `Try changing the filter or check back later for ${selectedFilter} items.`
              : 'No food items available from restaurants and cafes at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  );
});

export default Food;