import React, { useState, useEffect } from 'react';
import ItemCard from '../itemsCard/ItemCard';

const SearchResults = ({ searchQuery, onAddToCart, RESTAURANTS_DATA, GROCERY_DATA }) => {
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const allItems = [];
    const searchTerm = searchQuery.toLowerCase();

    // Search in restaurants
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
      return (b.restaurant.rating || 0) - (a.restaurant.rating || 0);
    });

    setSearchResults(allItems);
  }, [searchQuery, RESTAURANTS_DATA, GROCERY_DATA]);

  // 👉 If query is empty, show placeholder
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

  // 👉 When results exist, render them
  return (
    <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
      Results for "<span className="text-yellow-600">{searchQuery}</span>"
    </h2>
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              onAddToCart={onAddToCart}
              source={item.source}
              restaurant={item.restaurant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <i className="fas fa-utensils text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
          <p className="text-gray-600">We couldn’t find anything matching “{searchQuery}”</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
