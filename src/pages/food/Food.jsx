import React, { useEffect, useState } from "react";
const Food = ({ onAddToCart,RESTAURANTS_DATA, ItemCard}) => {
            const [allFoodItems, setAllFoodItems] = useState([]);
            const [filteredItems, setFilteredItems] = useState([]);
            const [selectedFilter, setSelectedFilter] = useState('all');
            const [sortBy, setSortBy] = useState('popular');

            // Get unique food categories
            const foodCategories = ['all', ...new Set(
                RESTAURANTS_DATA.flatMap(restaurant => 
                    restaurant.items.map(item => item.category.toLowerCase())
                )
            )];

            useEffect(() => {
                const items = [];
                RESTAURANTS_DATA.forEach(restaurant => {
                    restaurant.items.forEach(item => {
                        items.push({
                            ...item,
                            restaurant: restaurant
                        });
                    });
                });
                setAllFoodItems(items);
                setFilteredItems(items);
            }, []);

            useEffect(() => {
                let filtered = [...allFoodItems];

                // Apply category filter
                if (selectedFilter !== 'all') {
                    filtered = filtered.filter(item => 
                        item.category.toLowerCase() === selectedFilter
                    );
                }

                // Apply sorting
                filtered.sort((a, b) => {
                    switch (sortBy) {
                        case 'popular':
                            if (a.popular && !b.popular) return -1;
                            if (!a.popular && b.popular) return 1;
                            return b.restaurant.rating - a.restaurant.rating;
                        case 'price-low':
                            return a.price - b.price;
                        case 'price-high':
                            return b.price - a.price;
                        case 'rating':
                            return b.restaurant.rating - a.restaurant.rating;
                        default:
                            return 0;
                    }
                });

                setFilteredItems(filtered);
            }, [allFoodItems, selectedFilter, sortBy]);

            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Food Delivery</h1>
                        <p className="text-gray-600">Delicious meals from {RESTAURANTS_DATA.length} restaurants</p>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-8 mb-8">
                        {/* Filter Header */}
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <i className="fas fa-filter text-white text-sm"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Filter & Sort</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Category Filter */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <i className="fas fa-tags text-purple-500"></i>
                                    <span className="font-semibold text-gray-800">Categories</span>
                                </div>
                                <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                                    {foodCategories.map(category => {
                                        const categoryIcons = {
                                            'all': '🏠',
                                            'indian': '🍛',
                                            'pizza': '🍕',
                                            'burgers': '🍔',
                                            'italian': '🍝',
                                            'fast food': '🍟'
                                        };
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedFilter(category)}
                                                className={`group flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 flex-shrink-0 ${
                                                    selectedFilter === category
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 shadow-md border border-gray-200'
                                                }`}
                                            >
                                                <span className="text-lg">{categoryIcons[category] || '🍽️'}</span>
                                                <span className="whitespace-nowrap">{category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                                {selectedFilter === category && (
                                                    <i className="fas fa-check text-xs"></i>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <i className="fas fa-sort text-purple-500"></i>
                                    <span className="font-semibold text-gray-800">Sort By</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full md:w-64 px-5 py-3 bg-white border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 font-medium shadow-md appearance-none cursor-pointer"
                                    >
                                        <option value="popular">🔥 Most Popular</option>
                                        <option value="rating">⭐ Highest Rated</option>
                                        <option value="price-low">💰 Price: Low to High</option>
                                        <option value="price-high">💎 Price: High to Low</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                        <i className="fas fa-chevron-down text-purple-500"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="mt-6 pt-6 border-t border-purple-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                        <i className="fas fa-list text-white text-xs"></i>
                                    </div>
                                    <p className="text-gray-700 font-medium">
                                        Showing <span className="text-purple-600 font-bold">{filteredItems.length}</span> of <span className="text-gray-500">{allFoodItems.length}</span> items
                                    </p>
                                </div>
                                {selectedFilter !== 'all' && (
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                                            <i className="fas fa-tag mr-1"></i>
                                            {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                                        </span>
                                        <button
                                            onClick={() => setSelectedFilter('all')}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                            title="Clear filter"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Grid */}
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map(item => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    restaurant={item.restaurant}
                                    onAddToCart={onAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <i className="fas fa-utensils text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
                            <p className="text-gray-600">Try selecting a different category or sorting option</p>
                        </div>
                    )}
                </div>
            );
        };
        export default Food;