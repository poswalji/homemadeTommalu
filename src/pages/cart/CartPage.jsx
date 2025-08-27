// src/pages/CartPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCallback,useReducer } from "react";

const CartPage = ({ cart, onUpdateQuantity, onRemoveItem, onBack,calculateDeliveryFee,AVAILABLE_COUPONS }) => {
            const [appliedCoupon, setAppliedCoupon] = useState(null);
            const [couponCode, setCouponCode] = useState('');
            const [couponError, setCouponError] = useState('');

            // Group cart items by store
            const itemsByStore = cart.reduce((acc, item) => {
                const storeId = item.restaurant.id;
                if (!acc[storeId]) {
                    acc[storeId] = {
                        restaurant: item.restaurant,
                        items: [],
                        subtotal: 0
                    };
                }
                acc[storeId].items.push(item);
                acc[storeId].subtotal += item.price * item.quantity;
                return acc;
            }, {});

            const stores = Object.values(itemsByStore);
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Calculate delivery fee based on distance
            const totalDeliveryFee = subtotal >= 149 ? 0 : stores.reduce((sum, store) => sum + calculateDeliveryFee(store.restaurant.distance), 0);
            
            // Apply coupon discount
            let couponDiscount = 0;
            if (appliedCoupon) {
                if (appliedCoupon.type === 'fixed') {
                    couponDiscount = appliedCoupon.discount;
                } else if (appliedCoupon.type === 'percentage') {
                    couponDiscount = Math.min((subtotal * appliedCoupon.discount) / 100, 100);
                }
            }
            
            const grandTotal = subtotal + totalDeliveryFee - couponDiscount;

            const handleApplyCoupon = () => {
                setCouponError('');
                const coupon = AVAILABLE_COUPONS.find(c => c.code === couponCode.toUpperCase());
                
                if (!coupon) {
                    setCouponError('Invalid coupon code');
                    return;
                }
                
                if (subtotal < coupon.minOrder) {
                    setCouponError(`Minimum order of ₹${coupon.minOrder} required`);
                    return;
                }
                
                setAppliedCoupon(coupon);
                setCouponCode('');
            };

            const handleRemoveCoupon = () => {
                setAppliedCoupon(null);
                setCouponError('');
            };

            return (
                <div className="container mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Link to={-1}

                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mb-6"
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span>Continue Shopping</span>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <i className="fas fa-shopping-cart text-2xl text-purple-600"></i>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
                                        <p className="text-gray-600">{totalItems} items from {stores.length} store{stores.length > 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                                        <p className="text-gray-600">Add some delicious items to get started!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {stores.map((store) => (
                                            <div key={store.restaurant.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                                {/* Store Header */}
                                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-lg">
                                                                {store.restaurant.image}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-800">{store.restaurant.name}</h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {store.items.length} item{store.items.length > 1 ? 's' : ''} • 
                                                                    <span className="text-green-600 ml-1">⭐ {store.restaurant.rating}</span> • 
                                                                    <span className="text-gray-500 ml-1">📍 {store.restaurant.distance}km</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">Delivery Fee</p>
                                                            <p className="font-bold text-gray-800">
                                                                {subtotal >= 149 ? (
                                                                    <span className="text-green-600">FREE</span>
                                                                ) : (
                                                                    `₹${calculateDeliveryFee(store.restaurant.distance)}`
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Store Items */}
                                                <div className="p-4 space-y-4">
                                                    {store.items.map((item) => (
                                                        <div key={`${item.restaurant.id}-${item.id}`} className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-start space-x-4">
                                                                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                                                                    {item.image}
                                                                </div>
                                                                
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-gray-800 text-lg mb-1 break-words">{item.name}</h4>
                                                                    <p className="text-sm text-gray-600 mb-3">₹{item.price} each</p>
                                                                    
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                            <button
                                                                                onClick={() => onUpdateQuantity(item.restaurant.id, item.id, item.quantity - 1, item.selectedWeight)}
                                                                                className="w-10 h-10 bg-white hover:bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 shadow-sm"
                                                                            >
                                                                                <i className="fas fa-minus text-sm"></i>
                                                                            </button>
                                                                            <span className="font-bold text-gray-800 text-lg w-12 text-center">{item.quantity}</span>
                                                                            <button
                                                                                onClick={() => onUpdateQuantity(item.restaurant.id, item.id, item.quantity + 1, item.selectedWeight)}
                                                                                className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-sm"
                                                                            >
                                                                                <i className="fas fa-plus text-sm"></i>
                                                                            </button>
                                                                        </div>
                                                                        
                                                                        <div className="text-right">
                                                                            <p className="font-bold text-gray-800 text-lg mb-1">₹{item.price * item.quantity}</p>
                                                                            {item.selectedWeight && (
                                                                                <p className="text-xs text-green-600 mb-1">
                                                                                    {item.quantity} × {item.selectedWeight.label} = {(item.selectedWeight.weight * item.quantity).toFixed(2)}kg total
                                                                                </p>
                                                                            )}
                                                                            <button
                                                                                onClick={() => onRemoveItem(item.restaurant.id, item.id, item.selectedWeight)}
                                                                                className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                                                                            >
                                                                                <i className="fas fa-trash text-xs"></i>
                                                                                <span>Remove</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        {cart.length > 0 && (
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                                    
                                    {/* Coupon Section */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-800 mb-3">Apply Coupon</h3>
                                        
                                        {!appliedCoupon ? (
                                            <div className="space-y-3">
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter coupon code"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                    <button
                                                        onClick={handleApplyCoupon}
                                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                                {couponError && (
                                                    <p className="text-red-500 text-sm">{couponError}</p>
                                                )}
                                                
                                                {/* Available Coupons */}
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">Available Coupons:</p>
                                                    {AVAILABLE_COUPONS.map(coupon => (
                                                        <div key={coupon.code} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-semibold text-purple-600">{coupon.code}</p>
                                                                    <p className="text-xs text-gray-600">{coupon.description}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setCouponCode(coupon.code);
                                                                        handleApplyCoupon();
                                                                    }}
                                                                    className="text-purple-600 text-sm hover:text-purple-800"
                                                                >
                                                                    Apply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-green-600">{appliedCoupon.code} Applied!</p>
                                                        <p className="text-sm text-green-700">You saved ₹{couponDiscount}</p>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveCoupon}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bill Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-700">
                                            <span>Items Subtotal:</span>
                                            <span>₹{subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700">
                                            <span>
                                                Delivery Fee:
                                                {stores.length > 1 && subtotal < 149 && (
                                                    <span className="text-xs text-gray-500 block">
                                                        (Avg. {(stores.reduce((sum, store) => sum + store.restaurant.distance, 0) / stores.length).toFixed(1)}km)
                                                    </span>
                                                )}
                                            </span>
                                            <span>
                                                {subtotal >= 149 ? (
                                                    <span className="text-green-600">FREE</span>
                                                ) : (
                                                    `₹${totalDeliveryFee}`
                                                )}
                                            </span>
                                        </div>
                                        {subtotal >= 149 && (
                                            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                                                🎉 You saved ₹{stores.length === 1 ? calculateDeliveryFee(stores[0].restaurant.distance) : calculateDeliveryFee(stores.reduce((sum, store) => sum + store.restaurant.distance, 0) / stores.length)} on delivery!
                                            </div>
                                        )}
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Coupon Discount:</span>
                                                <span>-₹{couponDiscount}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-300 pt-3">
                                            <div className="flex justify-between text-xl font-bold text-gray-800">
                                                <span>Total:</span>
                                                <span>₹{grandTotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Link to='/cart/checkout' className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };


export default CartPage;
