import React, { useState, useEffect } from 'react';

const ItemCard = ({ item, restaurant, onAddToCart }) => {
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [showWeightOptions, setShowWeightOptions] = useState(false);

  // ✅ Initialize with first weight option for items with weight options
  useEffect(() => {
    if (item.hasWeightOptions && item.weightOptions && item.weightOptions.length > 0 && !selectedWeight) {
      setSelectedWeight(item.weightOptions[0]);
    }
  }, [item, selectedWeight]);

  // ✅ Backend data structure ke hisaab se data extract karo
  const getItemImage = (item) => {
    if (item.image) return item.image;
    if (item.name) {
      return item.name.charAt(0).toUpperCase();
    }
    return "🍕"; // Default food icon
  };

  const getItemName = (item) => {
    return item.name || "Item";
  };

  const getItemDescription = (item) => {
    return item.description || "Delicious item";
  };

  const getItemPrice = (item) => {
    return item.price || 0;
  };

  const getFoodTypeBadge = (item) => {
    if (!item.foodType) return null;
    
    const foodTypeConfig = {
      'veg': { emoji: '🥬', color: 'bg-green-100 text-green-800', text: 'Veg' },
      'non-veg': { emoji: '🍗', color: 'bg-red-100 text-red-800', text: 'Non-Veg' },
      'egg': { emoji: '🥚', color: 'bg-yellow-100 text-yellow-800', text: 'Egg' }
    };
    
    const config = foodTypeConfig[item.foodType];
    if (!config) return null;
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.emoji} {config.text}
      </span>
    );
  };

  const getPreparationTime = (item) => {
    return item.preparationTime ? `${item.preparationTime} min` : "15-20 min";
  };

  // ✅ AVAILABILITY BADGE FUNCTION
  const getAvailabilityBadge = (item) => {
    const isAvailable = item.available !== false;
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
        isAvailable 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isAvailable ? '✅ Available' : '❌ Unavailable'}
      </span>
    );
  };

  const handleAddToCart = () => {
    // ✅ Check availability before adding to cart
    if (item.available === false) {
      alert('This item is currently unavailable');
      return;
    }

    if (item.hasWeightOptions && selectedWeight) {
      // Create a modified item with selected weight
      const itemWithWeight = {
        ...item,
        _id: item._id || item.id, // ✅ Backend compatible ID
        price: selectedWeight.price,
        selectedWeight: selectedWeight,
        displayName: `${getItemName(item)} (${selectedWeight.label})`
      };
      onAddToCart(itemWithWeight, restaurant);
    } else {
      onAddToCart(item, restaurant);
    }
  };

  const displayPrice = item.hasWeightOptions && selectedWeight ? selectedWeight.price : getItemPrice(item);
  const pricePerKg = item.hasWeightOptions && selectedWeight ? Math.round(selectedWeight.price / selectedWeight.weight) : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* ✅ Item Image - Backend compatible */}
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
            {item.image ? (
              <img 
                src={item.image} 
                alt={getItemName(item)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">{getItemImage(item)}</span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-lg truncate">
                  {getItemName(item)}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-sm text-gray-600 truncate">
                    {restaurant.storeName || restaurant.name} 
                  </p>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {restaurant.category === 'Grocery Store' ? '🛒 Grocery' : '🍽️ Restaurant'}
                  </span>
                  {/* ✅ Food Type Badge */}
                  {getFoodTypeBadge(item)}
                </div>
              </div>
              
              {/* ✅ Popular & Special Badges - Backend data ke hisaab se */}
              <div className="flex flex-col gap-1 items-end">
                {/* ✅ AVAILABILITY BADGE - ADDED HERE */}
                {getAvailabilityBadge(item)}
                
                {(item.timesOrdered > 10 || item.isPopular) && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    🔥 Popular
                  </span>
                )}
                {item.isSpecial && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    ⭐ Special
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {getItemDescription(item)}
            </p>
            
            
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                {/* ✅ Order Count - Backend data */}
                {item.timesOrdered > 0 && (
                  <span className="text-green-600 font-medium">
                    ⭐ {item.timesOrdered} orders
                  </span>
                )}
                {/* ✅ Preparation Time - Backend data */}
                <span className="text-gray-500">
                  🕒{item.preparationTime}
                </span>
                {/* ✅ Category Badge */}
                <span className="text-gray-500 text-xs bg-blue-50 px-2 py-1 rounded-full">
                  {item.category || "Item"}
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
                  disabled={item.available === false}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    item.available !== false
                      ? 'bg-[#ff6931] text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {item.available !== false ? 'Add' : 'Unavailable'}
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