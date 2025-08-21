import React from "react";
const RestaurantCard = ({ restaurant, onClick }) => {
            const getIconClass = (name) => {
                const icons = {
                    'Pizza Palace': 'fas fa-pizza-slice',
                    'Burger Hub': 'fas fa-hamburger',
                    'Fresh Market': 'fas fa-shopping-basket',
                    'Sushi Zen': 'fas fa-fish',
                    'Spice Garden': 'fas fa-pepper-hot',
                    'Curry House': 'fas fa-fire',
                    'Tandoor Express': 'fas fa-utensils',
                    'Biryani Palace': 'fas fa-bowl-rice'
                };
                return icons[restaurant.name] || 'fas fa-utensils';
            };

            const getGradientClass = (name) => {
                const gradients = {
                    'Pizza Palace': 'from-red-400 to-orange-500',
                    'Burger Hub': 'from-yellow-400 to-red-500',
                    'Fresh Market': 'from-green-400 to-blue-500',
                    'Sushi Zen': 'from-purple-400 to-pink-500',
                    'Spice Garden': 'from-orange-400 to-red-600',
                    'Curry House': 'from-yellow-500 to-orange-600',
                    'Tandoor Express': 'from-red-500 to-pink-600',
                    'Biryani Palace': 'from-amber-400 to-orange-500'
                };
                return gradients[name] || 'from-blue-400 to-purple-500';
            };

            return (
                <div
                    className="card-hover bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                    onClick={() => onClick(restaurant)}
                >
                    <div className={`h-48 bg-gradient-to-br ${getGradientClass(restaurant.name)} flex items-center justify-center`}>
                        <i className={`${getIconClass(restaurant.name)} text-6xl text-white`}></i>
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-lg mb-2">{restaurant.name}</h4>
                        <p className="text-gray-600 text-sm mb-2">{restaurant.category}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-green-600 font-semibold">⭐ {restaurant.rating}</span>
                            <span className="text-gray-500 text-sm">{restaurant.deliveryTime}</span>
                        </div>
                    </div>
                </div>
            );
        };
export default RestaurantCard