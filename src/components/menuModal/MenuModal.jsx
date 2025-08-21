import React from "react";
 const MenuModal = ({ isOpen, restaurant, onClose, onAddToCart }) => {
            if (!isOpen || !restaurant) return null;

            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{restaurant.name}</h3>
                                <p className="text-gray-600">{restaurant.category}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <h4 className="text-lg font-semibold mb-6 text-gray-800">Menu Items</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {restaurant.menuItems.map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-4xl">{item.icon}</div>
                                                <div>
                                                    <h5 className="font-semibold text-gray-800">{item.name}</h5>
                                                    <p className="text-gray-600">{item.description || 'Delicious and fresh'}</p>
                                                    <p className="text-lg font-bold text-green-600">{item.price}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onAddToCart(item, restaurant.name)}
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
export default MenuModal