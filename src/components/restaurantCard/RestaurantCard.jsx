import { Link } from "react-router-dom";

const RestaurantCard = ({ type, restaurant, onRestaurantClick }) => {
  
  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  const getStoreImage = (store) => store.storeName?.charAt(0).toUpperCase() || "🏪";
  const getStoreName = (store) => store.storeName || "Store";
  const getStoreCategory = (store) => store.category || "Local Store";
  
  // ✅ Simple rating
  const getStoreRating = (store) => {
    if (!store.rating) return "New";
    return typeof store.rating === 'number' ? store.rating.toFixed(1) : store.rating;
  };

  const getDeliveryTime = (store) => store.deliveryTime || "15-25 min";
  const getOrderCount = (store) => store.timesOrdered || 0;
  const isStoreOpen = (store) => store.isOpen !== false;

  // ✅ Menu count & top 3 popular items
  const menuItemsCount = restaurant.menu?.length || 0;
  const popularItems = restaurant.menu?.slice(0, 3) || [];

  const handleClick = () => onRestaurantClick?.(restaurant);
  const isOpen = isStoreOpen(restaurant);
  const orderCount = getOrderCount(restaurant);

  return (
    <Link 
      to={`/items/${type}/${createSlug(getStoreName(restaurant))}`}
      onClick={handleClick}
      state={{ restaurant }}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer flex-shrink-0 w-80 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              <span>{getStoreImage(restaurant)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-lg truncate">{getStoreName(restaurant)}</h3>
                  <p className="text-sm text-gray-600 truncate">{getStoreCategory(restaurant)}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{restaurant.address}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                  isOpen ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ Simple Ratings - No license info */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-green-600 font-medium">⭐ {getStoreRating(restaurant)}</span>
              {orderCount > 0 && <span className="text-gray-600">📦 {orderCount} orders</span>}
            </div>
            <span className="text-gray-500">🕒 {getDeliveryTime(restaurant)}</span>
          </div>

          {/* ✅ Simple Badges - No license badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {/* ✅ Only verified store badge (optional) */}
            {restaurant.isVerified && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                ✅ Verified
              </span>
            )}
            {restaurant.isFreeDelivery && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                🚚 Free Delivery
              </span>
            )}
            {restaurant.isPureVeg && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                🥬 Pure Veg
              </span>
            )}
          </div>

          {/* Menu Preview */}
          {menuItemsCount > 0 ? (
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Popular Items ({menuItemsCount} total)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularItems.map(item => (
                  <span 
                    key={item._id || item.id} 
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full truncate max-w-24"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                ))}
                {menuItemsCount > 3 && (
                  <span className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded-full">
                    +{menuItemsCount - 3} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-100 pt-3 text-center py-2">
              <span className="text-gray-400 text-sm bg-gray-50 px-3 py-1 rounded-full inline-block">
                🍽️ Menu coming soon
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;