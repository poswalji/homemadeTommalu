import React, { useState, useEffect } from 'react';
const ItemCard = ({ item, restaurant, onAddToCart }) => {
            const [selectedWeight, setSelectedWeight] = useState(null);
            const [showWeightOptions, setShowWeightOptions] = useState(false);

            // Initialize with first weight option for items with weight options
            useEffect(() => {
                if (item.hasWeightOptions && item.weightOptions && item.weightOptions.length > 0 && !selectedWeight) {
                    setSelectedWeight(item.weightOptions[0]);
                }
            }, [item, selectedWeight]);

            const handleAddToCart = () => {
                if (item.hasWeightOptions && selectedWeight) {
                    // Create a modified item with selected weight
                    const itemWithWeight = {
                        ...item,
                        price: selectedWeight.price,
                        selectedWeight: selectedWeight,
                        displayName: `${item.name} (${selectedWeight.label})`
                    };
                    onAddToCart(itemWithWeight, restaurant);
                } else {
                    onAddToCart(item, restaurant);
                }
            };

            const displayPrice = item.hasWeightOptions && selectedWeight ? selectedWeight.price : item.price;
            const pricePerKg = item.hasWeightOptions && selectedWeight ? Math.round(selectedWeight.price / selectedWeight.weight) : null;

            return (
                <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
                    <div className="p-4">
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                                {item.image}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {restaurant.name} 
                                            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                                                {restaurant.type === 'restaurant' ? '🍽️ Restaurant' : '🛒 Grocery'}
                                            </span>
                                        </p>
                                    </div>
                                    {item.popular && (
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                            Popular
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                                
                                {/* Weight Selection for Grocery Items */}
                                {item.hasWeightOptions && item.weightOptions && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Select Weight:</span>
                                            {pricePerKg && (
                                                <span className="text-xs text-green-600">₹{pricePerKg}/kg</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {item.weightOptions.map((weightOption, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedWeight(weightOption)}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                        selectedWeight?.label === weightOption.label
                                                            ? 'bg-purple-500 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                                                    }`}
                                                >
                                                    {weightOption.label}
                                                    <span className="ml-1 text-xs">₹{weightOption.price}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="text-green-600 font-medium">
                                            ⭐ {restaurant.rating}
                                        </span>
                                        <span className="text-gray-500">
                                            🚚 {restaurant.deliveryTime}
                                        </span>
                                        <span className="text-gray-500">
                                            📍 {restaurant.distance}km
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <span className="text-xl font-bold text-gray-800">₹{displayPrice}</span>
                                            {item.hasWeightOptions && selectedWeight && (
                                                <p className="text-xs text-gray-500">{selectedWeight.label}</p>
                                            )}
                                        </div>
                                        <button 
                                            onClick={handleAddToCart}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm font-medium"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        export default ItemCard;