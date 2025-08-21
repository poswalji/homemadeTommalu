 import React from "react";
 const ProfileDropdown = ({ isOpen, onLogout, onNavigate, onOpenProfile, user }) => {
            if (!isOpen) return null;

            return (
                <>
        
                <div className="absolute bg-white  right-0 mt-2 w-64  rounded-lg shadow-lg py-2 z-200">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onOpenProfile}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                        <i className="fas fa-user mr-2"></i>View Profile
                    </button>
                    <button
                        onClick={() => onNavigate('orders')}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                        <i className="fas fa-shopping-bag mr-2"></i>My Orders
                    </button>
                    <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        <i className="fas fa-heart mr-2"></i>Favorites
                    </a>
                    <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                        <i className="fas fa-cog mr-2"></i>Settings
                    </a>
                    <hr className="my-1" />
                    <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
                </>
            );
        };
        export default ProfileDropdown;