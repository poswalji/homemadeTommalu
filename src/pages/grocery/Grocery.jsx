import React, { useEffect, useState, useMemo } from "react";
import ItemCard from "../../components/itemsCard/ItemCard";

const Grocery = ({ stores, onAddToCart }) => {
  const [allGroceryItems, setAllGroceryItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // ✅ Only include Grocery Store category
  const groceryStores = useMemo(() => 
    stores.filter(store => store.category === "Grocery Store"), 
    [stores]
  );

  // ✅ Grocery-only categories
  const allowedGroceryCategories = [
    "Dairy",
    "Groceries", 
    "Fruits",
    "Vegetables",
    "Bakery",
    "Grains",
    "Meat"
  ];

  // Flatten items from GROCERY stores only
  useEffect(() => {
    const items = [];
    groceryStores.forEach(store => {
      store.menu?.forEach(item => {
        if (allowedGroceryCategories.includes(item.category)) {
          items.push({
            ...item,
            store: store
          });
        }
      });
    });
    setAllGroceryItems(items);
  }, [groceryStores]); // ✅ Dependency on groceryStores

  // ✅ Replace the problematic useEffect with useMemo
  const filteredItems = useMemo(() => {
    let filtered = [...allGroceryItems];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(
        item => item.category?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Create a new array before sorting to avoid mutating the original
    const sortedItems = [...filtered];
    
    sortedItems.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return (b.store?.rating || 0) - (a.store?.rating || 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.store?.rating || 0) - (a.store?.rating || 0);
        default:
          return 0;
      }
    });

    return sortedItems;
  }, [allGroceryItems, selectedFilter, sortBy]);

  // Unique categories from items
  const groceryCategories = useMemo(() => [
    'all',
    ...new Set(
      allGroceryItems
        .map(item => item.category)
        .filter(cat => allowedGroceryCategories.includes(cat))
    )
  ], [allGroceryItems]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-600 mb-2">Grocery Delivery</h1>
      <p className="text-gray-600">
        Fresh groceries from {groceryStores.length} stores
      </p>

      {/* Store Type Info */}
      <div className="mt-2 text-sm text-gray-500">
        Showing items from grocery stores only
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 my-4">
        {groceryCategories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedFilter(category.toLowerCase())}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedFilter.toLowerCase() === category.toLowerCase()
                ? 'bg-green-600 text-white shadow-md'
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
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
              restaurant={item.store}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-16">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-lg mb-2">No grocery items found</p>
          <p className="text-gray-400 text-sm">
            {selectedFilter !== 'all' 
              ? `Try changing the filter or check back later for ${selectedFilter} items.`
              : 'No grocery items available from grocery stores at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Grocery;