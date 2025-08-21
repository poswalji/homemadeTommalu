import React from "react";
import { useState,useEffect } from "react";
const handleSave = async () => {
  try {
    const res = await fetch("https://backend-tommalu.onrender.com/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // cookies के लिए
      body: JSON.stringify(editData),
    });

    const data = await res.json();

    if (res.ok) {
      onUpdateProfile(data.user); // parent component में update
      setIsEditing(false);
      alert("Profile updated successfully");
    } else {
      alert(data.message || "Failed to update profile");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

const ProfileModal = ({ isOpen, onClose, user, onUpdateProfile }) => {
            const [isEditing, setIsEditing] = useState(false);
            const [editData, setEditData] = useState({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || ''
            });
            

            useEffect(() => {
                if (user) {
                    setEditData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address
                    });
                }
            }, [user]);

            const handleInputChange = (e) => {
                setEditData({
                    ...editData,
                    [e.target.name]: e.target.value
                });
            };
const handleSave = async () => {
  try {
    const res = await fetch("https://backend-tommalu.onrender.com/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // cookies के लिए
      body: JSON.stringify(editData),
    });

    const data = await res.json();

    if (res.ok) {
      onUpdateProfile(data.user); // parent component में update
      setIsEditing(false);
      alert("Profile updated successfully");
    } else {
      alert(data.message || "Failed to update profile");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};
           
           

            const handleCancel = () => {
                setEditData({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address
                });
                setIsEditing(false);
            };

            if (!isOpen || !user) return null;

            return (
                <div className="fixed inset-0 bg-black/50 z-60   flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-800">My Profile</h3>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            {/* Profile Header */}
                            <div className="flex items-center space-x-6 mb-8">
                                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-gray-800">{user.name}</h4>
                                    <p className="text-gray-600">Member since {user.memberSince}</p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                            Premium Member
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {user.totalOrders} orders completed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{user.totalOrders}</div>
                                    <div className="text-sm text-gray-600">Total Orders</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">$247.50</div>
                                    <div className="text-sm text-gray-600">Total Spent</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">4.9</div>
                                    <div className="text-sm text-gray-600">Avg Rating</div>
                                </div>
                            </div>

                            {/* Profile Information */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-lg font-semibold text-gray-800">Personal Information</h5>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                                        >
                                            <i className="fas fa-edit mr-2"></i>Edit Profile
                                        </button>
                                    ) : (
                                        <div className="space-x-2">
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                <i className="fas fa-check mr-2"></i>Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                <i className="fas fa-times mr-2"></i>Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

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
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                                                {user.name}
                                            </div>
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
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                                                {user.email}
                                            </div>
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
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                                                {user.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Favorite Restaurant
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                                            {user.favoriteRestaurant}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Address
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={editData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-800">
                                            {user.address}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div className="mt-8 pt-6 border-t">
                                <h5 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h5>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center">
                                            <i className="fas fa-key text-gray-600 mr-3"></i>
                                            <span className="font-medium">Change Password</span>
                                        </div>
                                        <i className="fas fa-chevron-right text-gray-400"></i>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center">
                                            <i className="fas fa-bell text-gray-600 mr-3"></i>
                                            <span className="font-medium">Notification Settings</span>
                                        </div>
                                        <i className="fas fa-chevron-right text-gray-400"></i>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center">
                                            <i className="fas fa-credit-card text-gray-600 mr-3"></i>
                                            <span className="font-medium">Payment Methods</span>
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