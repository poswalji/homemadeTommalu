// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";

const allowedLocations = ["Achrol", "Talamod","Nims","Amity",'Chandwaji']; // limited delivery locations

const CheckOut = ({ userData, cartItems, onPlaceOrder }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "cod",
  });

  const [locationError, setLocationError] = useState("");

  // Auto-fill user data if available
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.address?.street || "",
        city: userData.address?.city || "",
        pincode: userData.address?.pincode || "",
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = () => {
    if (!allowedLocations.includes(formData.city)) {
      setLocationError(
        `Sorry, delivery is available only in: ${allowedLocations.join(", ")}`
      );
      return;
    }
    setLocationError("");
    // Call backend or parent function
    onPlaceOrder(formData);
    alert("Order Placed Successfully ✅");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
            <textarea
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            ></textarea>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
            </div>
            {locationError && (
              <p className="text-red-500 text-sm">{locationError}</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <p>
                {item.name} x{item.quantity}
              </p>
              <p>₹{item.price * item.quantity}</p>
            </div>
          ))}

          <div className="flex justify-between font-bold border-t pt-2">
            <p>Total</p>
            <p>
              ₹
              {cartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              )}
            </p>
          </div>

          {/* Payment Options */}
          <h3 className="mt-6 mb-2 font-semibold">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={formData.payment === "cod"}
                onChange={handleChange}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={formData.payment === "online"}
                onChange={handleChange}
              />
              Online Payment
            </label>
          </div>

          {/* Place Order */}
          <button
            onClick={handlePlaceOrder}
            className="mt-6 w-full bg-Yellow hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
