import React from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import ProfileDropdown from "../profileDropdown/ProfileDropdown";
const MobileMenu = ({ isOpen, onClose, onNavigate, user, isSignedIn,
            onSignIn,
            onLogout,onOpenProfile,
            selectedLocation,
            onLocationChange }) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

            return (
                <>
                    {/* Overlay */}
                    {isOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={onClose}
                        />
                    )}

                    {/* Mobile Side Menu */}
                    <div className={`mobile-menu fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-lg ${isOpen ? 'open' : ''}`}>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-purple-600">Menu</h2>
                                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                          <div className="mb-6 relative">
    {!isSignedIn ? (
      <button
        onClick={() => onSignIn()}
        className="w-full flex items-center justify-center bg-yellow-400 text-purple-800 px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition-colors"
      >
        Sign In
      </button>
    ) : (
      <div className="relative profile-container">
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="w-10 h-10 border-2 bg-opacity-20 rounded-full flex items-center justify-center hover:border-yellow-300 hover:text-yellow-300 transition-colors"
        >
          <i className="fas fa-user"></i>
        </button>
        {isProfileDropdownOpen && (
          <ProfileDropdown
            isOpen={isProfileDropdownOpen}
            onLogout={onLogout}
            onNavigate={onNavigate}
            onOpenProfile={() => {
                onClose()
              onOpenProfile();
              setIsProfileDropdownOpen(false);
            }}
            user={user}
          />
        )}
      </div>
    )}
  </div>


                            {/* Mobile Menu Items */}
                            <nav className="space-y-4">
                                <NavLink
    to="/"
    onClick={onClose}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
        isActive ? "bg-gray-100 text-purple-600" : "hover:bg-gray-100"
      }`
    }
  >
    <i className="fas fa-home text-purple-500 w-5"></i>
    <span className="font-medium">Home</span>
  </NavLink>
                               {isSignedIn && (
    <NavLink
      to="/orders"
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
          isActive ? "bg-gray-100 text-orange-600" : "hover:bg-gray-100"
        }`
      }
    >
      <i className="fas fa-shopping-bag text-orange-500 w-5"></i>
      <span className="font-medium">My Orders</span>
    </NavLink>
  )}
  <NavLink
    to="/food"
    onClick={onClose}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
        isActive ? "bg-gray-100 text-orange-600" : "hover:bg-gray-100"
      }`
    }
  >
    <i className="fas fa-utensils text-orange-500 w-5"></i>
    <span className="font-medium">Food Delivery</span>
  </NavLink>
  <NavLink
    to="/grocery"
    onClick={onClose}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-lg transition-colors w-full text-left ${
        isActive ? "bg-gray-100 text-green-600" : "hover:bg-gray-100"
      }`
    }
  >
    <i className="fas fa-shopping-cart text-green-500 w-5"></i>
    <span className="font-medium">Grocery</span>
  </NavLink>
                                {/* Delivery Locations Section */}
                               {/* Delivery Locations */}
<div className="relative group">
  <button className=" bg-opacity-20 text-yellow border border-yellow-300  rounded px-3 py-2 focus:outline-none hover:bg-opacity-30 transition-colors flex items-center space-x-2">
    <i className="fas fa-map-marker-alt"></i>
    <span>{selectedLocation || 'Detecting Location...'}</span>
    <i className="fas fa-chevron-down text-sm"></i>
  </button>

  {/* Dropdown */}
  <div className="absolute top-full left-0 mt-2 w-80 bg-yellow rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
    <div className="px-4 py-2 border-b">
      <h4 className="font-semibold text-gray-800 flex items-center">
        <i className="fas fa-shipping-fast text-green-500 mr-2"></i>
        Delivery Available In
      </h4>
      <p className="text-sm text-gray-600">Limited locations currently served</p>
    </div>

    <div className="max-h-64 overflow-y-auto">
      {[
        { name: 'Achrol', time: '15-20 min', status: 'active' },
        { name: 'Talamod', time: '20-25 min', status: 'active' },
        { name: 'NIMS University', time: '10-15 min', status: 'active' },
        { name: 'Amity University', time: '12-18 min', status: 'active' },
        { name: 'Chandwaji', time: '25-30 min', status: 'active' },
        { name: 'Nearzone Mall', time: '8-12 min', status: 'active' },
        { name: 'Jaipur City Center', time: 'Coming Soon', status: 'coming' },
        { name: 'Malviya Nagar', time: 'Coming Soon', status: 'coming' }
      ].map((location, index) => (
        <div
          key={index}
          className={`w-full px-4 py-3 text-left flex items-center justify-between 
            ${location.status === 'coming' ? 'opacity-60' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <i className={`fas fa-map-marker-alt ${
              location.status === 'active' ? 'text-green-500' : 'text-gray-400'
            }`}></i>
            <div>
              <div className="font-medium text-gray-800">{location.name}</div>
              <div className={`text-sm ${
                location.status === 'active' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {location.status === 'active' ? `🚚 ${location.time}` : location.time}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="px-4 py-3 border-t bg-gray-50">
      <p className="text-xs text-gray-600 mb-2">
        <i className="fas fa-info-circle mr-1"></i>
        Don't see your area? We're expanding soon!
      </p>
      <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
        Request New Location →
      </button>
    </div>
  </div>
</div>



                                
                            </nav>
                        </div>
                    </div>
                </>
            );
        };
export default MobileMenu