import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from '../../services/api';

const CartPage = ({ cart,onSignIn, onUpdateQuantity, onRemoveItem, user }) => {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [backendCart, setBackendCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const isSignedIn = !!user;

  // ✅ Backend cart data fetch karo
  useEffect(() => {
    if (isSignedIn) {
      fetchBackendCart();
    }
  }, [isSignedIn]);

  const fetchBackendCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      console.log('🛒 Backend Cart:', response);
      
      if (response.success) {
        setBackendCart(response.data);
      }
    } catch (error) {
      console.error('Error fetching backend cart:', error);
      // If backend fails, fall back to frontend cart
      setBackendCart(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get effective cart (backend priority)
  const getEffectiveCart = () => {
    if (isSignedIn && backendCart && backendCart.items && backendCart.items.length > 0) {
      return backendCart;
    }
    // Fallback to frontend cart structure
    return { 
      items: cart || [], 
      totalAmount: 0, 
      deliveryCharge: 0, 
      finalAmount: 0,
      storeId: null 
    };
  };

  const effectiveCart = getEffectiveCart();
  const cartItems = effectiveCart.items || [];

  // ✅ Enhanced quantity update with backend sync
  const handleUpdateQuantity = async (restaurantId, itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(restaurantId, itemId);
      return;
    }

    // Frontend immediate update
    if (onUpdateQuantity) {
      onUpdateQuantity(restaurantId, itemId, newQuantity);
    }

    // Backend sync if signed in
    if (isSignedIn) {
      try {
        setSyncing(true);
        await cartService.updateCartQuantity(itemId, newQuantity);
        await fetchBackendCart(); // Refresh backend cart
      } catch (error) {
        console.error('Error updating backend cart:', error);
        alert('Failed to update cart: ' + error.message);
      } finally {
        setSyncing(false);
      }
    }
  };

  // ✅ Enhanced remove with backend sync
  const handleRemoveItem = async (restaurantId, itemId) => {
    // Frontend immediate remove
    if (onRemoveItem) {
      onRemoveItem(restaurantId, itemId);
    }

    // Backend sync if signed in
    if (isSignedIn) {
      try {
        setSyncing(true);
        await cartService.removeFromCart(itemId);
        await fetchBackendCart(); // Refresh backend cart
      } catch (error) {
        console.error('Error removing from backend cart:', error);
        alert('Failed to remove item: ' + error.message);
      } finally {
        setSyncing(false);
      }
    }
  };

  // ✅ Backend coupon apply
  const handleApplyCoupon = async () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Backend coupon apply if signed in
    if (isSignedIn) {
      try {
        setSyncing(true);
        const response = await cartService.applyDiscount(couponCode);
        if (response.success) {
          setAppliedCoupon({
            code: couponCode.toUpperCase(),
            discountAmount: response.data.discount?.discountAmount
          });
          setBackendCart(response.data.cart);
          setCouponCode('');
        }
      } catch (error) {
        setCouponError(error.message || 'Failed to apply coupon');
      } finally {
        setSyncing(false);
      }
    } else {
      // Frontend coupon logic for guests
      const AVAILABLE_COUPONS = [
        { code: 'WELCOME10', type: 'percentage', discount: 10, minOrder: 0, maxDiscount: 100 },
        { code: 'FIRSTORDER', type: 'percentage', discount: 15, minOrder: 200, maxDiscount: 150 },
        { code: 'FLAT50', type: 'fixed', discount: 50, minOrder: 299, maxDiscount: 50 },
        { code: 'SAVE20', type: 'percentage', discount: 20, minOrder: 500, maxDiscount: 200 }
      ];

      const coupon = AVAILABLE_COUPONS.find(c => c.code === couponCode.toUpperCase());
      
      if (!coupon) {
        setCouponError('Invalid coupon code');
        return;
      }
      
      const subtotal = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      
      if (subtotal < coupon.minOrder) {
        setCouponError(`Minimum order of ₹${coupon.minOrder} required`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponCode('');
    }
  };

  // ✅ Backend coupon remove
  const handleRemoveCoupon = async () => {
    if (isSignedIn) {
      try {
        setSyncing(true);
        await cartService.removeDiscount();
        await fetchBackendCart();
      } catch (error) {
        console.error('Error removing discount:', error);
        alert('Failed to remove coupon: ' + error.message);
      } finally {
        setSyncing(false);
      }
    }
    setAppliedCoupon(null);
    setCouponError('');
  };

  // ✅ Get item display name (handles both backend and frontend items)
  const getItemDisplayName = (item) => {
    // Backend cart item
    if (item.itemName) return item.itemName;
    // Frontend cart item with weight
    if (item.selectedWeight) {
      return `${item.name} (${item.selectedWeight.label})`;
    }
    // Regular frontend item
    return item.name || "Item";
  };

  // ✅ Get item price
  const getItemPrice = (item) => {
    return item.price || 0;
  };

  // ✅ Get item quantity
  const getItemQuantity = (item) => {
    return item.quantity || 1;
  };

  // ✅ Get item ID
  const getItemId = (item) => {
    return item.menuItemId || item._id || item.id;
  };

  // ✅ Calculate totals
  const subtotal = cartItems.reduce((sum, item) => 
    sum + (getItemPrice(item) * getItemQuantity(item)), 0);
  
  const deliveryCharge = effectiveCart.deliveryCharge || (subtotal >= 100 ? 0 : 25);
  
  // Apply backend discount if available
  const backendDiscount = effectiveCart.discount?.discountAmount || 0;
  
  // Apply frontend coupon discount if available
  let couponDiscount = 0;
  if (appliedCoupon && !isSignedIn) {
    if (appliedCoupon.type === 'fixed') {
      couponDiscount = appliedCoupon.discount;
    } else if (appliedCoupon.type === 'percentage') {
      couponDiscount = Math.min((subtotal * appliedCoupon.discount) / 100, appliedCoupon.maxDiscount || 100);
    }
  }

  const totalDiscount = backendDiscount + couponDiscount;
  const grandTotal = Math.max(0, (subtotal + deliveryCharge) - totalDiscount);

  const totalItems = cartItems.reduce((sum, item) => sum + getItemQuantity(item), 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        to={-1}
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mb-6"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Continue Shopping</span>
      </Link>

      {/* Sync Indicator */}
      {syncing && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-600 text-sm">Syncing with server...</span>
        </div>
      )}

      {/* Backend Cart Indicator */}
      {isSignedIn && backendCart && (
        <div className="mb-4 bg-green-50 p-3 rounded-lg flex items-center space-x-2">
          <i className="fas fa-cloud text-green-600"></i>
          <span className="text-green-600 text-sm">Cart synced with your account</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <i className="fas fa-shopping-cart text-2xl text-purple-600"></i>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
                <p className="text-gray-600">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                  {isSignedIn && " • Synced"}
                </p>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some delicious items to get started!</p>
                <Link 
                  to="/"
                  className="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={getItemId(item)} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                        {item.image || item.menuItemId?.images?.[0] ? (
                          <img 
                            src={item.image || item.menuItemId?.images?.[0]} 
                            alt={getItemDisplayName(item)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">🍕</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-lg mb-1 break-words">
                          {getItemDisplayName(item)}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">₹{getItemPrice(item)} each</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleUpdateQuantity(
                                item.restaurant?.id || effectiveCart.storeId, 
                                getItemId(item), 
                                getItemQuantity(item) - 1
                              )}
                              disabled={syncing}
                              className="w-10 h-10 bg-white hover:bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 shadow-sm disabled:opacity-50"
                            >
                              <i className="fas fa-minus text-sm"></i>
                            </button>
                            <span className="font-bold text-gray-800 text-lg w-12 text-center">
                              {getItemQuantity(item)}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(
                                item.restaurant?.id || effectiveCart.storeId, 
                                getItemId(item), 
                                getItemQuantity(item) + 1
                              )}
                              disabled={syncing}
                              className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-sm disabled:opacity-50"
                            >
                              <i className="fas fa-plus text-sm"></i>
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-lg mb-1">
                              ₹{getItemPrice(item) * getItemQuantity(item)}
                            </p>
                            <button
                              onClick={() => handleRemoveItem(
                                item.restaurant?.id || effectiveCart.storeId, 
                                getItemId(item)
                              )}
                              disabled={syncing}
                              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
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
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            {/* Discount Section */}
            <div className="mb-6">
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={syncing}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={syncing || !couponCode.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              
              {couponError && (
                <p className="text-red-500 text-sm mb-2">{couponError}</p>
              )}
              
              {(appliedCoupon || effectiveCart.discount) && (
                <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-green-800 font-medium">
                      {appliedCoupon?.code || effectiveCart.discount?.code} Applied
                    </p>
                    <p className="text-green-600 text-sm">
                      -₹{totalDiscount} discount
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    disabled={syncing}
                    className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
              
              {totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-₹{totalDiscount}</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Button */}
            {isSignedIn ? (
              <button
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0 || syncing}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={onSignIn}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Sign In to Checkout
                </button>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;