import React, { useState, useEffect } from "react";

const ProfileModal = ({ isOpen, onClose, user, authService }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [defaultAddress, setDefaultAddress] = useState({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });

      // Find default address
      const userDefaultAddress = user.addresses?.find(addr => addr.isDefault) || {};
      setDefaultAddress({
        label: userDefaultAddress.label || "Home",
        street: userDefaultAddress.street || "",
        city: userDefaultAddress.city || "",
        state: userDefaultAddress.state || "",
        pincode: userDefaultAddress.pincode || "",
        country: userDefaultAddress.country || "India",
        isDefault: true
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAddressChange = (e) => {
    setDefaultAddress({ 
      ...defaultAddress, 
      [e.target.name]: e.target.value 
    });
    setError("");
  };

  // ✅ DEBUGGING: Improved handleSave with better logging
  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("🔄 Starting profile update...");
      console.log("📝 Current user data:", user);
      console.log("✏️ Edit data:", editData);
      console.log("🏠 Address data:", defaultAddress);

      // Prepare data according to schema
      const updateData = {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        addresses: [defaultAddress]
      };

      console.log("📤 Sending update data:", updateData);

      // Use your authService for profile update
      const result = await authService.updateProfile(updateData);

      console.log("📥 API Response:", result);

      if (result.success) {
        console.log("✅ Profile updated successfully");
        setIsEditing(false);
        alert("Profile updated successfully");
        
        // Refresh the page to see changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } else {
        console.error("❌ API returned error:", result.message);
        setError(result.message || "Failed to update profile");
        alert(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      
      // More specific error handling
      if (error.message.includes('token') || error.message.includes('auth')) {
        setError("Your session has expired. Please log in again.");
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError("Network error. Please check your connection.");
      } else {
        setError(error.message || "Something went wrong while updating profile");
      }
      
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    });
    
    // Reset address data
    const userDefaultAddress = user.addresses?.find(addr => addr.isDefault) || {};
    setDefaultAddress({
      label: userDefaultAddress.label || "Home",
      street: userDefaultAddress.street || "",
      city: userDefaultAddress.city || "",
      state: userDefaultAddress.state || "",
      pincode: userDefaultAddress.pincode || "",
      country: userDefaultAddress.country || "India",
      isDefault: true
    });
    
    setIsEditing(false);
    setError("");
  };

  // Format member since date
  const getMemberSince = () => {
    if (!user?.createdAt) return "Recently";
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Get total orders count from virtual field
  const getTotalOrders = () => {
    return user?.orders?.length || 0;
  };

  // Handle password change
  const handleChangePassword = async () => {
    alert("Password change feature coming soon!");
  };

  // Handle manage addresses
  const handleManageAddresses = async () => {
    alert("Address management feature coming soon!");
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">My Profile</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-800">{user.name}</h4>
              <p className="text-gray-600">Member since {getMemberSince()}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === "admin" 
                    ? "bg-red-100 text-red-800" 
                    : user.role === "storeOwner" 
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}>
                  {user.role === "admin" ? "Administrator" : 
                   user.role === "storeOwner" ? "Store Owner" : "Customer"}
                </span>
                <span className="text-sm text-gray-500">
                  {getTotalOrders()} orders completed
                </span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-600">Updating profile...</span>
            </div>
          )}

          {/* Rest of your JSX remains the same */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-semibold text-gray-800">Personal Information</h5>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                  disabled={loading}
                >
                  <i className="fas fa-edit mr-2"></i>Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
                  >
                    <i className="fas fa-check mr-2"></i>
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400"
                  >
                    <i className="fas fa-times mr-2"></i>Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Rest of your form JSX... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{user.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">{user.email}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+91 1234567890"
                    disabled={loading}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                    {user.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800 capitalize">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Delivery Address
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Address fields */}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                  {user.addresses?.find(addr => addr.isDefault) ? (
                    <div>
                      <strong>{user.addresses.find(addr => addr.isDefault).label}: </strong>
                      {user.addresses.find(addr => addr.isDefault).street}, {user.addresses.find(addr => addr.isDefault).city}, {user.addresses.find(addr => addr.isDefault).state} - {user.addresses.find(addr => addr.isDefault).pincode}, {user.addresses.find(addr => addr.isDefault).country}
                    </div>
                  ) : (
                    "No default address set"
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-8 pt-6 border-t">
            <h5 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h5>
            <div className="space-y-3">
              {!user.googleId && (
                <button 
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <i className="fas fa-key text-gray-600 mr-3"></i>
                    <span className="font-medium">Change Password</span>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </button>
              )}
              <button 
                onClick={handleManageAddresses}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt text-gray-600 mr-3"></i>
                  <span className="font-medium">Manage Addresses</span>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;