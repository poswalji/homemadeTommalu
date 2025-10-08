import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CheckOut = ({ user, cart, onOrder }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "cash_on_delivery",
    deliveryInstructions: ""
  });

  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();

  // ✅ Backend compatible delivery locations
  const allowedLocations = [
    "Achrol", "Talamod", "NIMS University", "Amity University", 
    "Chandwaji", "Syari", "Udaipur", "Jaipur City Center", "Malviya Nagar"
  ];

  // ✅ Auto-fill user data from backend
  useEffect(() => {
    if (user) {
      const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];
      
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          phone: user.phone || "",
          address: defaultAddress.street || "",
          city: defaultAddress.city || "",
          pincode: defaultAddress.pincode || "",
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          phone: user.phone || "",
        }));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear location error when city changes
    if (e.target.name === 'city') {
      setLocationError("");
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setFormData(prev => ({
      ...prev,
      address: address.street,
      city: address.city,
      pincode: address.pincode,
    }));
  };

  // ✅ Calculate order totals (Backend logic ke hisaab se)
  const calculateOrderTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const deliveryCharge = subtotal >= 100 ? 0 : 25;
    const grandTotal = subtotal + deliveryCharge;

    return { subtotal, deliveryCharge, grandTotal };
  };

  const { subtotal, deliveryCharge, grandTotal } = calculateOrderTotals();

  // ✅ Backend compatible order creation
  const handlePlaceOrder = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert("Please fill all required fields");
      return;
    }

    if (!allowedLocations.includes(formData.city)) {
      setLocationError(
        `Sorry, delivery is available only in: ${allowedLocations.join(", ")}`
      );
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLocationError("");
    setLoading(true);

    try {
      // ✅ Prepare order data for backend
      const orderData = {
        deliveryAddress: {
          label: selectedAddress?.label || "Home",
          street: formData.address,
          city: formData.city,
          state: formData.state || "Rajasthan",
          pincode: formData.pincode,
          country: "India"
        },
        paymentMethod: formData.paymentMethod,
        deliveryInstructions: formData.deliveryInstructions,
        // Items will be handled by backend from cart
      };

      // ✅ Call backend order creation
      if (onOrder) {
        await onOrder(orderData);
        alert("Order Placed Successfully ✅");
        navigate('/orders');
      } else {
        // Fallback: Direct API call
        console.log('Order Data:', orderData);
        alert("Order would be placed with backend integration");
        navigate('/orders');
      }

    } catch (error) {
      console.error('Order placement error:', error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get item display name
  const getItemDisplayName = (item) => {
    if (item.displayName) return item.displayName;
    if (item.selectedWeight) {
      return `${item.name} (${item.selectedWeight.label})`;
    }
    return item.name || "Item";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your order details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Address & Payment */}
            <div className="space-y-6">
              {/* Saved Addresses */}
              {user?.addresses && user.addresses.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <h2 className="text-xl font-bold mb-4">Saved Addresses</h2>
                  <div className="space-y-3">
                    {user.addresses.map((address, index) => (
                      <div
                        key={index}
                        onClick={() => handleAddressSelect(address)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress?._id === address._id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {address.label} {address.isDefault && "(Default)"}
                            </p>
                            <p className="text-sm text-gray-600">{address.street}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.pincode}
                            </p>
                          </div>
                          {selectedAddress?._id === address._id && (
                            <span className="text-purple-500">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address Form */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold mb-4">
                  {user?.addresses ? "Delivery Address" : "Shipping Address"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <textarea
                    name="address"
                    placeholder="Street Address *"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  ></textarea>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                        list="cities"
                      />
                      <datalist id="cities">
                        {allowedLocations.map(location => (
                          <option key={location} value={location} />
                        ))}
                      </datalist>
                    </div>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode *"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <textarea
                    name="deliveryInstructions"
                    placeholder="Delivery Instructions (Optional)"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>

                  {locationError && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <p className="text-red-600 text-sm">{locationError}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Options */}
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === "cash_on_delivery"}
                      onChange={handleChange}
                      className="text-purple-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === "online"}
                      onChange={handleChange}
                      className="text-purple-500"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Online Payment</p>
                      <p className="text-sm text-gray-600">Pay securely with UPI, Card, or Net Banking</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-md sticky top-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={`${item.restaurant?.id}-${item._id || item.id}`} className="flex justify-between items-start pb-4 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {getItemDisplayName(item)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.restaurant?.storeName || item.restaurant?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity || 1} × ₹{item.price || 0}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ₹{((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee:</span>
                    <span>
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>
                  {deliveryCharge === 0 && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      🎉 You saved ₹25 on delivery!
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total:</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#ff6931] hover:bg-orange-600 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </div>
                  ) : (
                    `Place Order - ₹${grandTotal}`
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;