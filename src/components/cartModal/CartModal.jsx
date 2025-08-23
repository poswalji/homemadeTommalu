import React from "react";
import { useState,useEffect } from "react";
const CartModal = ({ isOpen, onClose, cartItems, onRemoveFromCart, onUpdateQuantity, onCheckout }) => {
            const [couponCode, setCouponCode] = useState('');
            const [appliedCoupon, setAppliedCoupon] = useState(null);
            const [couponError, setCouponError] = useState('');
            
            if (!isOpen) return null;
            

            // Available coupons
            const availableCoupons = {
                'SAVE10': { discount: 10, type: 'percentage', description: '10% off on orders above ₹300' },
                'FLAT50': { discount: 50, type: 'fixed', description: '₹50 off on any order' },
                'FIRST20': { discount: 20, type: 'percentage', description: '20% off for first-time users' },
                'WELCOME15': { discount: 15, type: 'percentage', description: '15% off welcome offer' }
            };

            const getSubtotal = () => {
                return cartItems.reduce((total, item) => {
                    const price = parseFloat(item.price.replace('₹', '').replace('/kg', '').replace('/lb', ''));
                    return total + (price * item.quantity);
                }, 0);
            };

            const getDiscount = () => {
                if (!appliedCoupon) return 0;
                const subtotal = getSubtotal();
                if (appliedCoupon.type === 'percentage') {
                    return (subtotal * appliedCoupon.discount) / 100;
                } else {
                    return appliedCoupon.discount;
                }
            };

            const getTotalPrice = () => {
                const subtotal = getSubtotal();
                const discount = getDiscount();
                return Math.max(0, subtotal - discount).toFixed(2);
            };

            const handleApplyCoupon = () => {
                const coupon = availableCoupons[couponCode.toUpperCase()];
                if (coupon) {
                    const subtotal = getSubtotal();
                    if (couponCode.toUpperCase() === 'SAVE10' && subtotal < 300) {
                        setCouponError('Minimum order value ₹300 required for this coupon');
                        return;
                    }
                    setAppliedCoupon({ ...coupon, code: couponCode.toUpperCase() });
                    setCouponError('');
                    setCouponCode('');
                } else {
                    setCouponError('Invalid coupon code');
                    setAppliedCoupon(null);
                }
            };

            const handleRemoveCoupon = () => {
                setAppliedCoupon(null);
                setCouponError('');
            };

            return (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto scrollbar-hide" >
                    <div className="bg-white mt-100 rounded-xl max-w-2xl w-full  ">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-800">Your Cart</h3>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-8">
                                    <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500 text-lg">Your cart is empty</p>
                                    <p className="text-gray-400">Add some delicious items to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                <p className="text-sm text-gray-600">{item.restaurant}</p>
                                                <p className="text-green-600 font-medium">{item.price}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                >
                                                    <i className="fas fa-minus text-sm"></i>
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                >
                                                    <i className="fas fa-plus text-sm"></i>
                                                </button>
                                                <button
                                                    onClick={() => onRemoveFromCart(item.id)}
                                                    className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2"
                                                >
                                                    <i className="fas fa-trash text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {cartItems.length > 0 && (
                            <div className="border-t p-6">
                                {/* Coupon Code Section */}
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Have a coupon code?</h4>

                                    {!appliedCoupon ? (
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                placeholder="Enter coupon code"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-green-800 font-medium">
                                                        <i className="fas fa-check-circle mr-2"></i>
                                                        {appliedCoupon.code} Applied
                                                    </span>
                                                    <p className="text-green-600 text-sm">{appliedCoupon.description}</p>
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

                                    {couponError && (
                                        <p className="text-red-500 text-sm">{couponError}</p>
                                    )}

                                    {/* Available Coupons */}
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 mb-2">Available coupons:</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-blue-50 p-2 rounded border">
                                                <span className="font-medium text-blue-800">SAVE10</span>
                                                <p className="text-blue-600">10% off above ₹300</p>
                                            </div>
                                            <div className="bg-purple-50 p-2 rounded border">
                                                <span className="font-medium text-purple-800">FLAT50</span>
                                                <p className="text-purple-600">₹50 off any order</p>
                                            </div>
                                            <div className="bg-orange-50 p-2 rounded border">
                                                <span className="font-medium text-orange-800">FIRST20</span>
                                                <p className="text-orange-600">20% off first order</p>
                                            </div>
                                            <div className="bg-green-50 p-2 rounded border">
                                                <span className="font-medium text-green-800">WELCOME15</span>
                                                <p className="text-green-600">15% welcome offer</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Subtotal:</span>
                                        <span>₹{getSubtotal().toFixed(0)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between text-green-600">
                                            <span>Discount ({appliedCoupon.code}):</span>
                                            <span>-₹{getDiscount().toFixed(0)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Delivery Fee:</span>
                                        <span>₹49</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex items-center justify-between text-xl font-bold">
                                        <span>Total:</span>
                                        <span>₹{(parseFloat(getTotalPrice()) + 49).toFixed(0)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onCheckout}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        };
export default CartModal