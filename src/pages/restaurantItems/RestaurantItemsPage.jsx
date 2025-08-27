import React from 'react';
import RestaurantCard from '../../components/restaurantCard/RestaurantCard';
import ItemCard from '../../components/itemsCard/ItemCard';
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";

const RestaurantItemsPage = ({ restaurant, GROCERY_DATA,RESTAURANTS_DATA, onAddToCart }) => {
    const { type, slug } = useParams();

  const createSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  const dataList = type === "restaurant" ? RESTAURANTS_DATA : GROCERY_DATA;

  const selectedData = dataList.find(
    (item) => createSlug(item.name) === slug
  );

  if (!selectedData) {
    return <h2>Not Found</h2>;
  }
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

                    {/* Restaurant Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-4xl flex-shrink-0">
                                {selectedData.image}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedData.name}</h1>
                                <p className="text-gray-600 mb-3">{selectedData.cuisine || selectedData.category}</p>
                                <div className="flex items-center space-x-6 text-sm">
                                    <span className="text-green-600 font-medium">
                                        ⭐ {selectedData.rating}
                                    </span>
                                    <span className="text-gray-500">
                                        🚚 {selectedData.deliveryTime}
                                    </span>
                                    <span className="text-gray-500">
                                        📍 {selectedData.distance}km away
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu ({selectedData.items.length} items)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedData.items.map(item => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                restaurant={selectedData}
                                onAddToCart={onAddToCart}
                            />
                        ))}
                    </div>
                </div>
            );
        };
        export default RestaurantItemsPage;