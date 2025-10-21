import React, { useState, useEffect } from 'react';
import ItemCard from '../../components/itemsCard/ItemCard';
import { Link, useParams } from 'react-router-dom';

const CategoryProducts = ({ stores, CATEGORIES_DATA, onAddToCart }) => {
    const [categoryItems, setCategoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { categoryName } = useParams();
    
    const selectedCategory = (CATEGORIES_DATA || []).find(
        (cat) => cat.name.toLowerCase() === categoryName?.toLowerCase()
    ) || { 
        id: 'all', 
        name: categoryName || 'All Items', 
        color: 'from-gray-300 to-gray-400', 
        icon: '🍽️' 
    };

    useEffect(() => {
        console.log('🔄 EFFECT TRIGGERED - Category:', selectedCategory.name);
        
        const processCategoryItems = () => {
            try {
                console.log('🔍 PROCESSING CATEGORY:', selectedCategory.name);
                
                if (!stores || stores.length === 0) {
                    console.log('❌ No stores available');
                    setCategoryItems([]);
                    setLoading(false);
                    return;
                }

                const items = [];
                const searchTerm = selectedCategory.name.toLowerCase();
                const backendCategory = selectedCategory.backendCategory?.toLowerCase() || '';

                // Har store ke menu items check karna
                stores.forEach(store => {
                    if (store.menu && Array.isArray(store.menu)) {
                        store.menu.forEach(item => {
                            const itemCategory = item.category?.toLowerCase() || '';
                            
                            // Category matching logic
                            const matches = 
                                selectedCategory.id === 'all' || 
                                itemCategory.includes(searchTerm) || 
                                itemCategory.includes(backendCategory) ||
                                item.category === selectedCategory.name ||
                                item.category === selectedCategory.backendCategory;

                            if (matches) {
                                items.push({
                                    ...item,
                                    id: item._id || item.id,
                                    restaurant: {
                                        id: store._id || store.id,
                                        name: store.storeName,
                                        rating: store.rating || 0,
                                        deliveryTime: store.deliveryTime || '25-35 min',
                                        cuisine: store.category || 'General',
                                        image: store.image,
                                        isOpen: store.isOpen !== false
                                    },
                                    popular: (item.timesOrdered || 0) > 10
                                });
                            }
                        });
                    }
                });

                // Sort items
                items.sort((a, b) => {
                    if (a.popular && !b.popular) return -1;
                    if (!a.popular && b.popular) return 1;
                    return b.restaurant.rating - a.restaurant.rating;
                });

                console.log(`✅ ${selectedCategory.name}: Found ${items.length} items`);
                setCategoryItems(items);

            } catch (err) {
                console.error('Error processing category items:', err);
                setCategoryItems([]);
            } finally {
                setLoading(false);
            }
        };

        processCategoryItems();
    }, [selectedCategory.id, stores]); // ONLY specific dependencies

    // Final debug - ONLY when categoryItems actually change
    useEffect(() => {
        if (categoryItems.length > 0) {
            console.log('🎯 FINAL RESULT:', {
                category: selectedCategory.name,
                itemsCount: categoryItems.length
            });
        }
    }, [categoryItems]); // ONLY categoryItems dependency

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link to='/' className="flex items-center space-x-2 text-[#ff6931] hover:text-[#fa6934] mb-6">
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Home</span>
                </Link>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6931] mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading {selectedCategory.name} items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to='/' className="flex items-center space-x-2 text-[#ff6931] hover:text-[#fa6934] mb-6">
                <i className="fas fa-arrow-left"></i>
                <span>Back to Home</span>
            </Link>

            <div className="text-center mb-8">
                <div className={`items-center mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-r ${selectedCategory.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg cursor-pointer border-4 border-transparent hover:text-[#ff6931]`}>
                    {selectedCategory.icon && typeof selectedCategory.icon === 'string' && selectedCategory.icon.includes('/') ? (
                        <img src={selectedCategory.icon} alt={selectedCategory.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                        <span className="text-2xl">{selectedCategory.icon}</span>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedCategory.name}</h1>
                <p className="text-gray-600">Found {categoryItems.length} items in this category</p>
            </div>

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
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found in {selectedCategory.name}</h3>
                    <p className="text-gray-600">No items available in this category yet</p>
                    <Link to="/" className="bg-[#ff6931] text-white px-6 py-2 rounded-lg hover:bg-[#fa6934] transition-colors inline-block mt-4">
                        Browse All Categories
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CategoryProducts;