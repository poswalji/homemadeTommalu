import { Link } from "react-router-dom";
const RestaurantCard = ({  type,restaurant }) => {
     const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-")
            return (
                <Link to={`/items/${type}/${createSlug(restaurant.name)}`}>
                <div 
                   
                    className="bg-white rounded-lg shadow-md overflow-hidden card-hover cursor-pointer flex-shrink-0 w-80"
                >
                    <div className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                                {restaurant.image}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 text-lg">{restaurant.name}</h3>
                                <p className="text-sm text-gray-600">{restaurant.cuisine || restaurant.category}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mb-4">
                            <span className="text-green-600 font-medium">
                                ⭐ {restaurant.rating}
                            </span>
                           
                            <span className="text-gray-500">
                                📍 {restaurant.distance}km
                            </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {restaurant.items.slice(0, 3).map(item => (
                                <span key={item.id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                    {item.name}
                                </span>
                            ))}
                            {restaurant.items.length > 3 && (
                                <span className="text-gray-500 text-xs">
                                    +{restaurant.items.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                </Link>
            );
        };
        export default RestaurantCard;