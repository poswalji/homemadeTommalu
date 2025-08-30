import React, { useState, useEffect } from 'react';
import ItemCard from '../../components/itemsCard/ItemCard';

import { Link,useParams } from 'react-router-dom';
const CategoryProducts = ({ RESTAURANTS_DATA,GROCERY_DATA,CATEGORIES_DATA, onAddToCart}) => {
            const [categoryItems, setCategoryItems] = useState([]);
const { categoryName } = useParams();
 const selectedCategory =
    CATEGORIES_DATA.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    ) || { id: 'all', name: categoryName, color: 'from-gray-300 to-gray-400', icon: '🍽️' };
            useEffect(() => {
                const items = [];
                const categoryName = selectedCategory.name.toLowerCase();

                // Search in both restaurants and grocery stores
                [...RESTAURANTS_DATA, ...GROCERY_DATA].forEach(store => {
                    store.items.forEach(item => {
                        const itemCategory = item.category.toLowerCase();
                        const storeCuisine = (store.cuisine || store.category || '').toLowerCase();
                        
                        if (selectedCategory.id === 'all' || 
                            itemCategory.includes(categoryName) || 
                            storeCuisine.includes(categoryName) ||
                            item.name.toLowerCase().includes(categoryName)) {
                            items.push({
                                ...item,
                                restaurant: store
                            });
                        }
                    });
                });

                // Sort by popularity and rating
                items.sort((a, b) => {
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    return b.restaurant.rating - a.restaurant.rating;
                });

                setCategoryItems(items);
            }, [selectedCategory]);

            return (
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Link
                        to='/'
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mb-6"
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span>Back to Home</span>
                    </Link>

                    {/* Category Header */}
                    <div className="  text-center mb-8">
                          <div
      className={` items-center mx-auto
        w-20 h-20 sm:w-24 sm:h-24  md:w-28 md:h-28
        bg-gradient-to-r ${selectedCategory.color} 
        rounded-full flex items-center justify-center
        mb-2
        group-hover:scale-110 transition-all duration-300
        shadow-lg cursor-pointer
        border-4 border-transparent hover:border-purple-500
      `}
    >
      <img
        src={selectedCategory.icon}
        alt={selectedCategory.name}
        className="w-full h-full object-cover rounded-full"
      />
    </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedCategory.name}</h1>
                        <p className="text-gray-600">Found {categoryItems.length} items in this category</p>
                    </div>

                    {/* Products Grid */}
                    {categoryItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryItems.map(item => (
                                <ItemCard
                                    key={`${item.restaurant.id}-${item.id}`}
                                    item={item}
                                    restaurant={item.restaurant}
                                    onAddToCart={onAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
                            <p className="text-gray-600">Try selecting a different category</p>
                        </div>
                    )}
                </div>
            );
        };

export default CategoryProducts;