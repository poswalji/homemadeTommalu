import React from "react";
import ProfileDropdown from "../profileDropdown/ProfileDropdown";

import { useState,useEffect } from "react";
  const Header = ({
            isSignedIn,
            onSignIn,
            onLogout,
            cartCount,
            isMobileMenuOpen,
            onToggleMobileMenu,
            onCartClick,
            searchQuery,
            onSearchChange,
            onNavigate,
            currentPage,
            user,
            onOpenProfile,
            selectedLocation,
            onLocationChange
        }) => {
            const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
            const [language, setLanguage] = useState('EN');

            const toggleProfileDropdown = () => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
            };

            const handleLogout = () => {
                onLogout();
                setIsProfileDropdownOpen(false);
            };

            const handleNavigate = (page) => {
                onNavigate(page);
                setIsProfileDropdownOpen(false);
            };

            const handleOpenProfile = () => {
                onOpenProfile();
                setIsProfileDropdownOpen(false);
            };

            // Close dropdown when clicking outside
            useEffect(() => {
                const handleClickOutside = (event) => {
                    if (!event.target.closest('.profile-container')) {
                        setIsProfileDropdownOpen(false);
                    }
                };

                document.addEventListener('click', handleClickOutside);
                return () => document.removeEventListener('click', handleClickOutside);
            }, []);

            return (
                <header className="gradient-bg text-white shadow-lg sticky top-0 z-30">
                    <div className="container mx-auto px-4">
                        {/* Desktop Header */}
                        <div className="hidden md:flex items-center justify-between py-4">
                            <div className="flex items-center space-x-8">
                                <button onClick={() => onNavigate('home')} className="text-3xl font-bold hover:text-yellow-300 transition-colors">
                                    Tommalu
                                </button>
                                <nav className="flex space-x-6">
                                    <button
                                        onClick={() => onNavigate('home')}
                                        className={`hover:text-yellow-300 transition-colors font-medium ${currentPage === 'home' ? 'text-yellow-300' : ''}`}
                                    >
                                        Home
                                    </button>
                                    <a href="#" className="hover:text-yellow-300 transition-colors font-medium">Food</a>
                                    <a href="#" className="hover:text-yellow-300 transition-colors font-medium">Grocery</a>
                                    {isSignedIn && (
                                        <button
                                            onClick={() => onNavigate('orders')}
                                            className={`hover:text-yellow-300 transition-colors font-medium ${currentPage === 'orders' ? 'text-yellow-300' : ''}`}
                                        >
                                            My Orders
                                        </button>
                                    )}
                                </nav>
                            </div>

                            <div className="flex items-center space-x-6">
                              {/* Search Bar */}
{currentPage === 'home' && (
  <div className="relative">
    <input
      type="text"
      placeholder="Search for food or groceries..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-96 px-4 py-2 pr-12 rounded-full text-white
                 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 
                 transition-all duration-200"
    />
    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 
                       hover:text-yellow-300 transition-colors duration-200">
      <i className="fas fa-search"></i>
    </button>
  </div>
)}


                                {/* Delivery Locations */}
                                <div className="relative group">
                                    <button className=" bg-opacity-20 text-white border border-white border-opacity-30 rounded px-3 py-2 focus:outline-none hover:bg-opacity-30 transition-colors flex items-center space-x-2">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{selectedLocation || 'Delivery Areas'}</span>
                                        <i className="fas fa-chevron-down text-sm"></i>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
                                                <button
                                                    key={index}
                                                    onClick={() => location.status === 'active' && onLocationChange(location.name)}
                                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${location.status === 'coming' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                                                        } ${selectedLocation === location.name ? 'bg-purple-50 border-r-4 border-purple-500' : ''}`}
                                                    disabled={location.status === 'coming'}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <i className={`fas fa-map-marker-alt ${location.status === 'active' ? 'text-green-500' : 'text-gray-400'
                                                            }`}></i>
                                                        <div>
                                                            <div className="font-medium text-gray-800">{location.name}</div>
                                                            <div className={`text-sm ${location.status === 'active' ? 'text-green-600' : 'text-gray-500'
                                                                }`}>
                                                                {location.status === 'active' ? `🚚 ${location.time}` : location.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {location.status === 'active' && selectedLocation === location.name && (
                                                        <i className="fas fa-check text-purple-500"></i>
                                                    )}
                                                </button>
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

                                {/* Language Toggle */}
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className=" bg-opacity-20 hover:border-yellow-300  hover:text-yellow-300 text-white border border-white border-opacity-30 rounded px-3 py-2 focus:outline-none"
                                >
                                    <option value="EN">EN</option>
                                    <option value="HI">हिं</option>
                                   
                                </select>

                                {/* Sign In Button / User Profile */}
                                {!isSignedIn ? (
                                    <button
                                        onClick={onSignIn}
                                        className="bg-yellow-400 text-purple-800 px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition-colors"
                                    >
                                        Sign In
                                    </button>
                                ) : (
                                    <div className="relative profile-container">
                                        <button
                                            onClick={toggleProfileDropdown}
                                            className="w-10 h-10 border-2 bg-opacity-20 rounded-full flex items-center justify-center hover:border-yellow-300 hover:text-yellow-300 transition-colors"
                                        >
                                            <i className="fas fa-user"></i>
                                        </button>
                                        <ProfileDropdown
                                            isOpen={isProfileDropdownOpen}
                                            onLogout={handleLogout}
                                            onNavigate={handleNavigate}
                                            onOpenProfile={handleOpenProfile}
                                            user={user}
                                        />
                                    </div>
                                )}

                                {/* Cart */}
                                <button onClick={onCartClick} className="relative hover:text-yellow-300 transition-colors">
                                    <i className="fas fa-shopping-cart text-xl"></i>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Header */}
                        <div className="md:hidden flex items-center justify-between py-4">
                            <button onClick={onToggleMobileMenu} className="text-white">
                                <i className="fas fa-bars text-xl"></i>
                            </button>
                            <button onClick={() => onNavigate('home')} className="text-2xl font-bold">Tommalu</button>
                            <button onClick={onCartClick} className="relative">
                                <i className="fas fa-shopping-cart text-xl"></i>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar (Below Header) */}
                    {currentPage === 'home' && (
                        <div className="md:hidden bg-white bg-opacity-10 px-4 py-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for food or groceries..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </header>
            );
        }
export default Header;