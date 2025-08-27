import React, { useState, useEffect } from 'react';
const SearchResults = ({ searchQuery, onAddToCart }) => {
            const [searchResults, setSearchResults] = useState([]);

            useEffect(() => {
                if (!searchQuery.trim()) {
                    setSearchResults([]);
                    return;
                }

                // 🔍 SEARCH LOGIC: Search across BOTH restaurants AND grocery stores
                const allItems = [];
                const searchTerm = searchQuery.toLowerCase();

                // Search in restaurants (food)
                RESTAURANTS_DATA.forEach(restaurant => {
                    restaurant.items.forEach(item => {
                        if (
                            item.name.toLowerCase().includes(searchTerm) ||
                            item.description.toLowerCase().includes(searchTerm) ||
                            item.category.toLowerCase().includes(searchTerm) ||
                            restaurant.name.toLowerCase().includes(searchTerm) ||
                            restaurant.cuisine.toLowerCase().includes(searchTerm)
                        ) {
                            allItems.push({
                                ...item,
                                restaurant: restaurant,
                                source: 'restaurant'
                            });
                        }
                    });
                });

                // Search in grocery stores
                GROCERY_DATA.forEach(store => {
                    store.items.forEach(item => {
                        if (
                            item.name.toLowerCase().includes(searchTerm) ||
                            item.description.toLowerCase().includes(searchTerm) ||
                            item.category.toLowerCase().includes(searchTerm) ||
                            store.name.toLowerCase().includes(searchTerm) ||
                            store.category.toLowerCase().includes(searchTerm)
                        ) {
                            allItems.push({
                                ...item,
                                restaurant: store,
                                source: 'grocery'
                            });
                        }
                    });
                });

                // Sort by popularity and rating
                allItems.sort((a, b) => {
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    return b.restaurant.rating - a.restaurant.rating;
                });

                setSearchResults(allItems);
            }, [searchQuery]);

            if (!searchQuery.trim()) {
                return (
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center py-12">
                            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Start searching</h3>
                            <p className="text-gray-600">Type something to search across food and groceries</p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
                        <p className="text-gray-600">
                            Found {searchResults.length} items for "{searchQuery}"
                        </p>
                    </div>

                    {searchResults.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                            <p className="text-gray-600 mb-4">Try searching for "chicken", "pizza", "milk", or "bread"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map(item => (
                                <ItemCard
                                    key={`${item.source}-${item.id}`}
                                    item={item}
                                    restaurant={item.restaurant}
                                    onAddToCart={onAddToCart}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        };
export default SearchResults;