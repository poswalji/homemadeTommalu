import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cartService } from "../../services/api";

const CartPage = ({ cart, onSignIn, onUpdateQuantity, onRemoveItem, user }) => {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [backendCart, setBackendCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [tempName, setTempName] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempPhone, setTempPhone] = useState("");

  const isSignedIn = !!user;

  // ✅ Fetch backend cart if signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchBackendCart();
    }
  }, [isSignedIn]);

  const fetchBackendCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        setBackendCart(response.data);
      }
    } catch (error) {
      console.error("Error fetching backend cart:", error);
      setBackendCart(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Effective cart
  const getEffectiveCart = () => {
    if (isSignedIn && backendCart && backendCart.items && backendCart.items.length > 0) {
      return backendCart;
    }
    return {
      items: cart || [],
      totalAmount: 0,
      deliveryCharge: 0,
      finalAmount: 0,
      storeId: null,
    };
  };

  const effectiveCart = getEffectiveCart();
  const cartItems = effectiveCart.items || [];

  // ✅ Quantity update
  const handleUpdateQuantity = async (restaurantId, itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(restaurantId, itemId);
      return;
    }
    if (onUpdateQuantity) {
      onUpdateQuantity(restaurantId, itemId, newQuantity);
    }
    if (isSignedIn) {
      try {
        setSyncing(true);
        await cartService.updateCartQuantity(itemId, newQuantity);
        await fetchBackendCart();
      } catch (error) {
        console.error("Error updating backend cart:", error);
        alert("Failed to update cart: " + error.message);
      } finally {
        setSyncing(false);
      }
    }
  };

  // ✅ Remove item
  const handleRemoveItem = async (restaurantId, itemId) => {
    if (onRemoveItem) {
      onRemoveItem(restaurantId, itemId);
    }
    if (isSignedIn) {
      try {
        setSyncing(true);
        await cartService.removeFromCart(itemId);
        await fetchBackendCart();
      } catch (error) {
        console.error("Error removing from backend cart:", error);
        alert("Failed to remove item: " + error.message);
      } finally {
        setSyncing(false);
      }
    }
  };

  // ✅ Apply coupon
  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (isSignedIn) {
      try {
        setSyncing(true);
        const response = await cartService.applyDiscount(couponCode);
        if (response.success) {
          setAppliedCoupon({
            code: couponCode.toUpperCase(),
            discountAmount: response.data.discount?.discountAmount,
          });
          setBackendCart(response.data.cart);
          setCouponCode("");
        }
      } catch (error) {
        setCouponError(error.message || "Failed to apply coupon");
      } finally {
        setSyncing(false);
      }
    } else {
      const AVAILABLE_COUPONS = [
        { code: "WELCOME10", type: "percentage", discount: 10, minOrder: 0, maxDiscount: 100 },
        { code: "FIRSTORDER", type: "percentage", discount: 15, minOrder: 200, maxDiscount: 150 },
        { code: "FLAT50", type: "fixed", discount: 50, minOrder: 299, maxDiscount: 50 },
        { code: "SAVE20", type: "percentage", discount: 20, minOrder: 500, maxDiscount: 200 },
      ];

      const coupon = AVAILABLE_COUPONS.find((c) => c.code === couponCode.toUpperCase());

      if (!coupon) {
        setCouponError("Invalid coupon code");
        return;
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      if (subtotal < coupon.minOrder) {
        setCouponError(`Minimum order of ₹${coupon.minOrder} required`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponCode("");
    }
  };

  // ✅ Remove coupon
  const handleRemoveCoupon = async () => {
    if (isSignedIn) {
      try {
        setSyncing(true);
        await cartService.removeDiscount();
        await fetchBackendCart();
      } catch (error) {
        console.error("Error removing discount:", error);
      } finally {
        setSyncing(false);
      }
    }
    setAppliedCoupon(null);
    setCouponError("");
  };

  // ✅ Helpers
  const getItemDisplayName = (item) => item.itemName || item.name || "Item";
  const getItemPrice = (item) => item.price || 0;
  const getItemQuantity = (item) => item.quantity || 1;
  const getItemId = (item) => item.menuItemId || item._id || item.id;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
    0
  );
  const deliveryCharge = effectiveCart.deliveryCharge || (subtotal >= 100 ? 0 : 25);
  const backendDiscount = effectiveCart.discount?.discountAmount || 0;

  let couponDiscount = 0;
  if (appliedCoupon && !isSignedIn) {
    if (appliedCoupon.type === "fixed") {
      couponDiscount = appliedCoupon.discount;
    } else if (appliedCoupon.type === "percentage") {
      couponDiscount = Math.min((subtotal * appliedCoupon.discount) / 100, appliedCoupon.maxDiscount || 100);
    }
  }

  const totalDiscount = backendDiscount + couponDiscount;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - totalDiscount);
  const totalItems = cartItems.reduce((sum, item) => sum + getItemQuantity(item), 0);

  // ✅ WhatsApp Order Function
  const handleWhatsAppOrder = () => {
    const businessNumber = "7742892352"; // <-- Replace with your WhatsApp business number

    const itemsText = cartItems
      .map(
        (item, index) =>
          `${index + 1}. ${getItemDisplayName(item)} x${getItemQuantity(item)} - ₹${
            getItemPrice(item) * getItemQuantity(item)
          }`
      )
      .join("%0A");

    const message = `
🛒 *New Order from Tommalu*%0A
👤 *Name:* ${user?.name || tempName || "Guest"}%0A
🏠 *Address:* ${user?.address || tempAddress || "Not provided"}%0A
📞 *Phone:* ${user?.phone || tempPhone || "Not provided"}%0A
--------------------%0A
${itemsText}%0A
--------------------%0A
Subtotal: ₹${subtotal}%0A
Delivery: ₹${deliveryCharge}%0A
Discount: ₹${totalDiscount}%0A
--------------------%0A
*Total Payable:* ₹${grandTotal}%0A
%0A
Please confirm my order.%0A
`;

    const whatsappURL = `https://wa.me/${businessNumber}?text=${message}`;
    window.open(whatsappURL, "_blank");
  };

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
      <Link to={-1} className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 mb-6">
        <i className="fas fa-arrow-left"></i>
        <span>Continue Shopping</span>
      </Link>

      {syncing && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-600 text-sm">Syncing with server...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🛒 Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <i className="fas fa-shopping-cart text-2xl text-purple-600"></i>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
                <p className="text-gray-600">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} from {cart.storeName || "Store"}
                </p>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some items to start ordering!</p>
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
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image || item.menuItemId?.images?.[0] ? (
                          <img
                            src={item.image || item.menuItemId?.images?.[0]}
                            alt={getItemDisplayName(item)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="flex items-center justify-center h-full">🍔</span>
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
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.restaurant?.id || effectiveCart.storeId,
                                  getItemId(item),
                                  getItemQuantity(item) - 1
                                )
                              }
                              disabled={syncing}
                              className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center"
                            >
                              <i className="fas fa-minus text-sm"></i>
                            </button>
                            <span className="font-bold text-gray-800 text-lg w-12 text-center">
                              {getItemQuantity(item)}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.restaurant?.id || effectiveCart.storeId,
                                  getItemId(item),
                                  getItemQuantity(item) + 1
                                )
                              }
                              disabled={syncing}
                              className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center"
                            >
                              <i className="fas fa-plus text-sm"></i>
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-lg mb-1">
                              ₹{getItemPrice(item) * getItemQuantity(item)}
                            </p>
                            <button
                              onClick={() =>
                                handleRemoveItem(item.restaurant?.id || effectiveCart.storeId, getItemId(item))
                              }
                              disabled={syncing}
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
            )}
          </div>
        </div>

        {/* 💰 Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

            {/* 🏠 User Info Inputs */}
            <div className="space-y-3 mb-6">
              {!user?.name && (
                <input
                  type="text"
                  placeholder="Your Name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}
              {!user?.address && (
                <input
                  type="text"
                  placeholder="Your Address"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}
              {!user?.phone && (
                <input
                  type="text"
                  placeholder="Your Phone Number"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}
            </div>

            {/* 🧾 Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{totalDiscount}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {/* ✅ WhatsApp Button */}
            <button
              onClick={handleWhatsAppOrder}
              disabled={cartItems.length === 0 || syncing}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <i className="fab fa-whatsapp text-lg"></i>
              <span>{syncing ? "Processing..." : "Place Order on WhatsApp"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
