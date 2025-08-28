import React, { useState, useEffect } from 'react';
import ItemCard from '../itemsCard/ItemCard';
const SearchResults = ({ searchQuery, onAddToCart, RESTAURANTS_DATA, GROCERY_DATA }) => {
      
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
        }
export default SearchResults;